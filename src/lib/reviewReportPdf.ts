import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import type { ReviewReport } from "@/lib/reviewReport";

export const PDF_REPORT_LIMITS = { issues: 500, rows: 5000, pages: 200, characters: 1_000_000 } as const;

function printable(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\t/g, "\\t").replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, (character) => `\\u${character.charCodeAt(0).toString(16).padStart(4, "0")}`);
}

function linesFor(text: string, font: PDFFont, size: number, width: number): string[] {
  const lines: string[] = [];
  for (const paragraph of printable(text).split("\n")) {
    let line = "";
    for (const word of paragraph.split(/( +)/)) {
      if (font.widthOfTextAtSize(line + word, size) <= width) { line += word; continue; }
      if (line.trim()) { lines.push(line.trimEnd()); line = ""; }
      for (const character of word.trimStart()) {
        if (line && font.widthOfTextAtSize(line + character, size) > width) { lines.push(line); line = ""; }
        line += character;
      }
    }
    lines.push(line.trimEnd());
  }
  return lines;
}

/** Browser-local, selectable text PDF. Unsupported content fails explicitly; never substitute glyphs. */
export async function buildReviewReportPdf(report: ReviewReport, fontBytes: Uint8Array | ArrayBuffer): Promise<Uint8Array> {
  if (report.issues.length > PDF_REPORT_LIMITS.issues || report.rows.length > PDF_REPORT_LIMITS.rows || JSON.stringify(report).length > PDF_REPORT_LIMITS.characters) {
    throw new Error("This report is too large for PDF. Choose Excel to include the complete report.");
  }
  const document = await PDFDocument.create();
  document.registerFontkit(fontkit);
  const font = await document.embedFont(fontBytes, { subset: true });
  const supported = new Set(font.getCharacterSet());
  const content = printable(JSON.stringify(report));
  if (/[\u0590-\u08ff\u200e-\u202e\u2066-\u2069]/u.test(content) || [...content].some((character) => !supported.has(character.codePointAt(0)!))) {
    throw new Error("Some report characters or writing directions are not supported by the PDF font. Choose Excel to preserve all source text.");
  }
  document.setTitle("DataPreflight review report");
  document.setAuthor(report.organization || "DataPreflight");
  document.setProducer("DataPreflight");
  const margin = 42, width = 595.28, height = 841.89, bodyWidth = width - margin * 2;
  const ink = rgb(0.12, 0.12, 0.13), muted = rgb(0.35, 0.35, 0.38), copper = rgb(0.55, 0.29, 0.12);
  let page: PDFPage;
  let y = 0;
  let section = "Summary";
  let continued = "";
  function newPage() {
    if (document.getPageCount() >= PDF_REPORT_LIMITS.pages) throw new Error("This report exceeds the PDF page limit. Choose Excel; no issues have been omitted.");
    page = document.addPage([width, height]);
    page.drawText("DataPreflight / Review report", { x: margin, y: height - 45, size: 15, font, color: copper });
    page.drawText(`${report.profile.name} / v${report.profile.version}`, { x: margin, y: height - 64, size: 9, font, color: muted });
    page.drawLine({ start: { x: margin, y: height - 75 }, end: { x: width - margin, y: height - 75 }, thickness: 0.6, color: rgb(0.83, 0.80, 0.76) });
    const context = section + (continued ? ` / ${continued}` : "");
    const topLines = linesFor(context, font, 8, bodyWidth);
    y = height - 91;
    for (const line of topLines) { page.drawText(line, { x: margin, y, size: 8, font, color: muted }); y -= 11; }
    y -= 8;
  }
  function ensure(space: number) { if (y - space < 44) newPage(); }
  function paragraph(text: string, size = 9.5, color = ink) {
    for (const line of linesFor(text || "(empty)", font, size, bodyWidth)) {
      ensure(size + 5);
      page.drawText(line, { x: margin, y, size, font, color });
      y -= size + 4;
    }
  }
  function field(label: string, value: string) {
    ensure(33);
    paragraph(label, 8, copper);
    paragraph(value);
    y -= 5;
  }
  function heading(title: string) { ensure(35); paragraph(title, 13, copper); y -= 6; }
  newPage();
  heading("Validation summary");
  for (const row of report.summary) field(row.Metric, row.Value);
  section = "Issues"; continued = ""; y -= 12; ensure(100); heading(`Issues (${report.issues.length})`);
  if (!report.issues.length) paragraph("No issues were found by the implemented profile checks.");
  for (const issue of report.issues) {
    continued = `Data row ${issue.row} / ${issue.field}`;
    ensure(140);
    heading(`Data row ${issue.row} / ${issue.row_status}`);
    field("Record", issue.record_id);
    field("Field / source column", `${issue.field} / ${issue.source_column}`);
    field("Parsed source value", issue.source_value);
    if (issue.displayed_value !== issue.source_value) field("Displayed source value", issue.displayed_value);
    field("Normalized value", issue.normalized_value);
    field("Problem", issue.problem);
    field("Why it matters", issue.why_it_matters);
    field("Suggested fix", issue.suggested_fix);
    field("Severity / rule", `${issue.severity} / ${issue.rule}`);
    if (issue.category || issue.risk) field("Category / risk", `${issue.category || "(not specified)"} / ${issue.risk || "(not specified)"}`);
    field("Data export decision", issue.export_decision);
    y -= 8;
  }
  section = "Row decisions"; continued = ""; y -= 12; ensure(100); heading("All parsed rows");
  paragraph("Data row / record / status / data export decision", 8, muted); y -= 6;
  for (const row of report.rows) { paragraph(`${row.row} / ${row.record_id} / ${row.status} / ${row.export_decision}`); y -= 4; }
  section = "Validation context"; continued = ""; y -= 12; ensure(100); heading("Applied checks and context");
  for (const row of report.context) field(`${row.Section} / ${row["DataPreflight field / metric"]}`, row["Source column / value"]);
  const pages = document.getPages();
  for (let index = 0; index < pages.length; index++) {
    pages[index].drawText(`DataPreflight / Page ${index + 1} of ${pages.length}`, { x: margin, y: 24, size: 8, font, color: muted });
  }
  return document.save();
}

let fontRequest: Promise<ArrayBuffer> | null = null;
export function loadReportFont(): Promise<ArrayBuffer> {
  if (!fontRequest) {
    fontRequest = fetch("/fonts/DejaVuSans.ttf").then((response) => {
      if (!response.ok) throw new Error("The local PDF font could not be loaded. Retry or choose Excel.");
      return response.arrayBuffer();
    }).catch((error) => { fontRequest = null; throw error; });
  }
  return fontRequest;
}
