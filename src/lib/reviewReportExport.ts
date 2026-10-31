import * as XLSX from "xlsx";
import { createExportDataSet, createTextWorksheet } from "@/lib/dataExport";
import { downloadDataExport, downloadExportFile } from "@/lib/exportData";
import { ISSUE_REPORT_HEADERS, type ReviewReport } from "@/lib/reviewReport";

export function downloadIssueReport(report: ReviewReport, fileName: string, format: "csv" | "xlsx") {
  downloadDataExport(fileName, report.issues, { format });
}

export function buildReviewWorkbook(report: ReviewReport): ArrayBuffer {
  const book = XLSX.utils.book_new();
  const sections = [
    { name: "Summary", data: createExportDataSet(report.summary) },
    { name: "Issues", data: report.issues.length ? createExportDataSet(report.issues) : { headers: ISSUE_REPORT_HEADERS, rows: [] } },
    { name: "Rows", data: createExportDataSet(report.rows) },
    { name: "Validation context", data: createExportDataSet(report.context) },
  ];
  for (const section of sections) {
    const sheet = createTextWorksheet(section.data);
    sheet["!autofilter"] = { ref: sheet["!ref"] ?? "A1:A1" };
    sheet["!cols"] = section.data.headers.map((header) => ({ wch: /value|problem|why|fix/i.test(header) ? 45 : 24 }));
    XLSX.utils.book_append_sheet(book, sheet, section.name);
  }
  return XLSX.write(book, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
}

export function downloadReviewWorkbook(report: ReviewReport) {
  downloadExportFile(`${report.profile.id}-review-report.xlsx`, buildReviewWorkbook(report), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
}
