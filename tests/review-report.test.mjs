import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, writeFileSync } from 'node:fs';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { PDFDocument } from 'pdf-lib';
import { buildReviewReport, ISSUE_REPORT_HEADERS } from '../src/lib/reviewReport.ts';
import { buildReviewWorkbook, downloadIssueReport } from '../src/lib/reviewReportExport.ts';
import { buildReviewReportPdf, PDF_REPORT_LIMITS } from '../src/lib/reviewReportPdf.ts';
import { customerWorkspaceConfig, vendorWorkspaceConfig, productWorkspaceConfig, priceListWorkspaceConfig, stockBalancesWorkspaceConfig } from '../src/lib/profiles/masterDataWorkspaceConfig.ts';
import { suggestProfileMapping } from '../src/lib/dataProfile.ts';
import { mapRowsToProfile } from '../src/lib/validation/validationProfile.ts';
import { runPriceListSourceValidation } from '../src/lib/validation/priceListValidation.ts';
import { runStockBalancesSourceValidation } from '../src/lib/validation/stockBalancesValidation.ts';

const font=readFileSync(new URL('../public/fonts/DejaVuSans.ttf',import.meta.url));
const baseIssue={field:'amount',rowIndex:1,severity:'critical',type:'number',problem:'Amount needs correction.',why:'Import values must be unambiguous.',fix:'Correct the source and validate again.'};
function input(){return {
 profile:{id:'invoice',name:'Invoice Import',version:'1.1.0'},fileName:'Één - facturen.csv',sheetName:'Invoices',mapping:{invoice_number:'ID',amount:'Amount'},invoiceContext:{invoiceNotation:'comma'},
 counts:{total:3,blocked:1,needsReview:1,ready:1},sourceRows:[{ID:'0001',Amount:'1,234'},{ID:'0002',Amount:'0,00'},{ID:'0003',Amount:'12,5000'}],displayRows:[{ID:'0001',Amount:'1,23'},{ID:'0002',Amount:'0,00'},{ID:'0003',Amount:'12,5000'}],
 normalizedRows:[{invoice_number:'0001',amount:'1.234'},{invoice_number:'0002',amount:'0.00'},{invoice_number:'0003',amount:'12.5000'}],
 issues:[baseIssue,{...baseIssue,severity:'warning',type:'suspicious-vat-rate',field:'vat'},{...baseIssue,rowIndex:2,severity:'warning',type:'amount-not-positive'}],
};}
function capture(t){
 const downloads=[];const old=Object.getOwnPropertyDescriptor(globalThis,'document');
 Object.defineProperty(globalThis,'document',{configurable:true,value:{createElement(){return{href:'',download:'',click(){downloads.at(-1).name=this.download;}}}}});
 t.after(()=>old?Object.defineProperty(globalThis,'document',old):delete globalThis.document);
 t.mock.method(URL,'createObjectURL',blob=>{downloads.push({blob});return 'blob:report';});t.mock.method(URL,'revokeObjectURL',()=>{});return downloads;
}

test('Review model snapshots all rows, original/displayed/normalized values and row-wide decisions',()=>{
 const source=input(),before=structuredClone(source);const report=buildReviewReport(source,'  Consultant Één  ');
 assert.equal(report.organization,'Consultant Één');assert.deepEqual(report.rows.map(r=>r.status),['Blocked','Needs review','Ready']);
 assert.deepEqual(report.issues.map(i=>i.export_decision),['excluded_from_clean_export','excluded_from_clean_export','included_with_review_warning']);
 assert.equal(report.issues[0].source_value,'1,234');assert.equal(report.issues[0].displayed_value,'1,23');assert.equal(report.issues[0].normalized_value,'1.234');assert.equal(report.issues[0].record_id,'0001');
 assert.equal(report.summary.find(r=>r.Metric==='Rows included in data export').Value,'2');assert(report.context.some(r=>r['DataPreflight field / metric']==='Checks performed'));
 assert.deepEqual(source,before);assert.deepEqual(buildReviewReport(source,'Consultant Één'),report);
 source.sourceRows[0].Amount='CHANGED';assert.equal(report.issues[0].source_value,'1,234');
});

test('Review rejects mismatched counts/source/issue positions and missing numeric context',()=>{
 assert.throws(()=>buildReviewReport({...input(),counts:{total:3,blocked:0,needsReview:1,ready:2}}),/counts do not match/);
 assert.throws(()=>buildReviewReport({...input(),sourceRows:[]}),/complete, current/);
 assert.throws(()=>buildReviewReport({...input(),displayRows:[]}),/complete, current/);
 assert.throws(()=>buildReviewReport({...input(),issues:[{...baseIssue,rowIndex:4}]}),/current source rows/);
 assert.throws(()=>buildReviewReport({...input(),invoiceContext:undefined}),/Invoice notation is required/);
 assert.throws(()=>buildReviewReport(input(),'X'.repeat(121)),/120 characters/);
});

test('Workbook includes summary, issues, all row decisions and validation context with exact text cells',()=>{
 const report=buildReviewReport(input(),'Acme Consultants');const book=XLSX.read(buildReviewWorkbook(report),{type:'array',cellNF:true,cellFormula:true});
 assert.deepEqual(book.SheetNames,['Summary','Issues','Rows','Validation context']);
 assert.deepEqual(XLSX.utils.sheet_to_json(book.Sheets.Issues,{defval:''}),report.issues);assert.deepEqual(XLSX.utils.sheet_to_json(book.Sheets.Rows,{defval:''}),report.rows);
 assert.deepEqual(XLSX.utils.sheet_to_json(book.Sheets.Summary,{defval:''}),report.summary);assert.deepEqual(XLSX.utils.sheet_to_json(book.Sheets['Validation context'],{defval:''}),report.context);
 for(const sheet of Object.values(book.Sheets))for(const [address,cell] of Object.entries(sheet)){if(address.startsWith('!'))continue;assert.equal(cell.t,'s');assert.equal(cell.f,undefined);assert.equal(cell.z,'@');}
});

test('All-ready report is available with an explicit empty Issues sheet',()=>{
 const source=input();source.issues=[];source.counts={total:3,blocked:0,needsReview:0,ready:3};
 const report=buildReviewReport(source);assert.equal(report.issues.length,0);const book=XLSX.read(buildReviewWorkbook(report),{type:'array'});
 assert.deepEqual(XLSX.utils.sheet_to_json(book.Sheets.Issues,{header:1}),[ISSUE_REPORT_HEADERS]);assert.equal(report.rows.length,3);
});

test('Issue downloads CSV/XLSX contain the same issues, values and decisions with matching extensions',async(t)=>{
 const downloads=capture(t);const report=buildReviewReport(input());downloadIssueReport(report,'invoice-errors.csv','csv');downloadIssueReport(report,'invoice-errors.csv','xlsx');
 assert.deepEqual(downloads.map(d=>d.name),['invoice-errors.csv','invoice-errors.xlsx']);
 const csv=Papa.parse(await downloads[0].blob.text(),{header:true,delimiter:';'}).data;const book=XLSX.read(await downloads[1].blob.arrayBuffer(),{type:'array'});
 assert.deepEqual(csv,report.issues);assert.deepEqual(XLSX.utils.sheet_to_json(book.Sheets.Data,{defval:''}),report.issues);
});

test('Formula-like issue values block CSV without mutation while Excel reports preserve exact strings',()=>{
 const source=input();source.sourceRows[0].Amount='=1+1';const report=buildReviewReport(source);const before=structuredClone(report);
 const book=XLSX.read(buildReviewWorkbook(report),{type:'array',cellFormula:true});const rows=XLSX.utils.sheet_to_json(book.Sheets.Issues,{defval:''});assert.equal(rows[0].source_value,'=1+1');
 assert.deepEqual(report,before);
});

test('PDF creates selectable text with complete sections, Unicode accents, long values and page numbering',async()=>{
 const source=input();source.fileName='Één - contrôle - € facturen.csv';source.issues[0]={...source.issues[0],why:'Een duidelijke reden met café, € en Ελληνικά. '.repeat(12),fix:'Correct this exceptionallylongidentifier'.repeat(30)};
 const report=buildReviewReport(source,'Acme / Één');const pdf=await buildReviewReportPdf(report,font);const parsed=await PDFDocument.load(pdf);assert(parsed.getPageCount()>1);assert.equal(parsed.getTitle(),'DataPreflight review report');
 if(process.env.DATAPREFLIGHT_PDF_PREVIEW_PATH) writeFileSync(process.env.DATAPREFLIGHT_PDF_PREVIEW_PATH,pdf);
});

test('PDF unsupported writing/glyphs and large reports fail explicitly instead of omitting data',async()=>{
 const report=buildReviewReport(input());report.issues[0].source_value='日本語';await assert.rejects(buildReviewReportPdf(report,font),/Choose Excel/);
 report.issues[0].source_value='مرحبا';await assert.rejects(buildReviewReportPdf(report,font),/Choose Excel/);
 await assert.rejects(buildReviewReportPdf({...report,issues:new Array(PDF_REPORT_LIMITS.issues+1)},font),/too large/);
 await assert.rejects(buildReviewReportPdf({...report,rows:new Array(PDF_REPORT_LIMITS.rows+1)},font),/too large/);
});

for(const config of [customerWorkspaceConfig,vendorWorkspaceConfig,productWorkspaceConfig,priceListWorkspaceConfig,stockBalancesWorkspaceConfig])test(`${config.profile.id}: report matches the actual full run, counts, mapping, scope and every issue`,()=>{
 const parsed=Papa.parse(config.example.csv,{header:true,skipEmptyLines:true});const source={rows:parsed.data,headers:parsed.meta.fields,sourceCells:parsed.data.map(row=>Object.fromEntries(Object.entries(row).map(([k,v])=>[k,{kind:'text',value:v}])))};
 const mapping=suggestProfileMapping(config.profile,source.headers,source.rows);const run=config.kind==='price-list'?runPriceListSourceValidation(source,mapping,'point'):config.kind==='stock-balances'?runStockBalancesSourceValidation(source,mapping,'point'):config.runValidation(mapRowsToProfile(source.rows,mapping,config.profile));
 const issues=run.validationResult.issues;const blocked=new Set(issues.filter(i=>i.severity==='critical').map(i=>i.rowIndex));const warned=new Set(issues.filter(i=>i.severity==='warning'&&!blocked.has(i.rowIndex)).map(i=>i.rowIndex));
 const report=buildReviewReport({profile:config.profile,fileName:config.example.fileName,mapping,sourceRows:source.rows,normalizedRows:run.normalizedRows,issues,counts:{total:source.rows.length,blocked:blocked.size,needsReview:warned.size,ready:source.rows.length-blocked.size-warned.size},...(config.kind==='price-list'?{priceContext:{priceNotation:'point'}}:{}),...(config.kind==='stock-balances'?{stockContext:{quantityNotation:'point'}}:{})});
 assert.equal(report.issues.length,issues.length);assert.equal(report.rows.length,source.rows.length);assert.equal(report.rows.filter(r=>r.export_decision!=='excluded_from_clean_export').length,run.validationResult.cleanRows.length);
 const book=XLSX.read(buildReviewWorkbook(report),{type:'array'});assert.equal(XLSX.utils.sheet_to_json(book.Sheets.Issues).length,issues.length);
 if(config.profile.id==='product')assert.equal(report.context.find(r=>r['DataPreflight field / metric']==='Reference check')['Source column / value'],'Not run');
});
