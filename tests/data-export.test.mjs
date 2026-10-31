import assert from 'node:assert/strict';
import test from 'node:test';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { DATA_EXPORT_FORMATS, createExportDataSet, serializeDataExport, hasSpreadsheetFormulaText } from '../src/lib/dataExport.ts';
import { runInvoiceValidation } from '../src/lib/validation/invoiceValidation.ts';
import { downloadDataExport, downloadCsv, downloadErrorCsv } from '../src/lib/exportData.ts';
import { customerWorkspaceConfig, vendorWorkspaceConfig, productWorkspaceConfig, priceListWorkspaceConfig, stockBalancesWorkspaceConfig } from '../src/lib/profiles/masterDataWorkspaceConfig.ts';
import { suggestProfileMapping } from '../src/lib/dataProfile.ts';
import { mapRowsToProfile } from '../src/lib/validation/validationProfile.ts';
import { runPriceListSourceValidation } from '../src/lib/validation/priceListValidation.ts';
import { runStockBalancesSourceValidation } from '../src/lib/validation/stockBalancesValidation.ts';

const sample=[{id:'000123',amount:'900719925474099312345.1234500',date:'2026-06-01',note:'Acme; "North", Rotterdam\nSecond\tline',empty:'',normalized_invoice_key:'internal'}, {id:'000124',amount:'-12.5000',date:'',note:'Één 日本語 😀',extra:'new column'}];
const options=[{format:'csv',csvDelimiter:';'},{format:'csv',csvDelimiter:','},{format:'xlsx'},{format:'txt'},{format:'tsv'},{format:'json'}];
function parse(file,option){
 if(option.format==='xlsx')return XLSX.utils.sheet_to_json(XLSX.read(file.content,{type:'array',cellNF:true}).Sheets.Data,{header:1,defval:'',raw:true});
 if(option.format==='json'){
  const rows=JSON.parse(file.content);return [Object.keys(rows[0]),...rows.map(row=>Object.values(row))];
 }
 const result=Papa.parse(file.content.replace(/^\uFEFF/,''),{delimiter:option.format==='csv'?option.csvDelimiter:'\t',skipEmptyLines:false});assert.deepEqual(result.errors,[]);return result.data;
}
function capture(t){
 const downloads=[],urls=[];const old=Object.getOwnPropertyDescriptor(globalThis,'document');
 Object.defineProperty(globalThis,'document',{configurable:true,value:{createElement(){return {href:'',download:'',click(){downloads.at(-1).name=this.download;}}}}});
 t.after(()=>old?Object.defineProperty(globalThis,'document',old):delete globalThis.document);
 t.mock.method(URL,'createObjectURL',blob=>{downloads.push({blob});return 'blob:'+downloads.length;});t.mock.method(URL,'revokeObjectURL',url=>urls.push(url));
 return {downloads,urls};
}

test('Export dataset is stable, fills missing cells, omits internal columns and never mutates source',()=>{
 const before=structuredClone(sample);const data=createExportDataSet(sample);
 assert.deepEqual(data.headers,['id','amount','date','note','empty','extra']);assert.equal(data.rows[0][5],'');assert.equal(data.rows[1][4],'');assert.deepEqual(sample,before);
 assert.deepEqual(createExportDataSet(sample),data);assert.deepEqual(DATA_EXPORT_FORMATS.map(x=>x.value),['csv','xlsx','txt','tsv','json']);
});
for(const option of options)test(`Export ${option.format}/${option.csvDelimiter??''}: exact values, IDs, scale, Unicode, multiline and stable column order`,()=>{
 const data=createExportDataSet(sample);const before=structuredClone(data);const file=serializeDataExport(data,option);
 assert.equal(file.extension,option.format);assert.deepEqual(parse(file,option),[data.headers,...data.rows]);assert.deepEqual(data,before);
 const repeated=serializeDataExport(data,option);assert.deepEqual(parse(repeated,option),parse(file,option));
 if(option.format!=='xlsx')assert.equal(file.content,repeated.content);
});

test('XLSX: all cells are explicit text, including formula-like text, negative decimals and long precision',()=>{
 const rows=[{id:'0001',text:'=HYPERLINK("https://example.com","click")',amount:'-12.5000',long:'12345678901234567890.0000001',date:'2026-01-01'},{id:'@test',text:'+SUM(1,2)',amount:'0.00',long:'1e3',date:''}];
 const file=serializeDataExport(createExportDataSet(rows),{format:'xlsx'});const book=XLSX.read(file.content,{type:'array',cellNF:true,cellFormula:true});
 assert.deepEqual(XLSX.utils.sheet_to_json(book.Sheets.Data,{defval:'',raw:true}),rows);
 for(const [address,cell] of Object.entries(book.Sheets.Data)){if(address.startsWith('!'))continue;assert.equal(cell.t,'s');assert.equal(cell.f,undefined);assert.equal(cell.z,'@');}
});

test('Delimited exports reject executable-looking text without changing it; XLSX and JSON remain available',()=>{
 for(const text of ['=1+1',' +SUM(1,2)','-1+2','@SUM(1)','\t=1+1','\r=1','\n=1','＝1+1','－1+1']){
  const data=createExportDataSet([{id:'001',text}]);assert(hasSpreadsheetFormulaText(data));
  for(const option of options.filter(o=>!['xlsx','json'].includes(o.format)))assert.throws(()=>serializeDataExport(data,option),/spreadsheet formula/);
  assert.equal(JSON.parse(serializeDataExport(data,{format:'json'}).content)[0].text,text);
  assert.equal(parse(serializeDataExport(data,{format:'xlsx'}),{format:'xlsx'})[1][1],text);
 }
 for(const value of ['-0','-12.5000','0001','100','text = 1','a\tb','line\nsecond'])assert.equal(hasSpreadsheetFormulaText(createExportDataSet([{value}])),false);
 assert(hasSpreadsheetFormulaText(createExportDataSet([{'=header':'safe'}])));
});

test('JSON keeps values as strings and handles unusual object keys without changing schema',()=>{
 const row=Object.fromEntries([['__proto__','0001'],['constructor','2.5000'],['空','true']]);
 const parsed=JSON.parse(serializeDataExport(createExportDataSet([row]),{format:'json'}).content);
 assert.deepEqual(Object.keys(parsed[0]),['__proto__','constructor','空']);assert.equal(parsed[0].__proto__,'0001');assert.equal(typeof parsed[0].constructor,'string');
});

test('Excel limits and unknown options fail explicitly; empty datasets produce no output',()=>{
 assert.throws(()=>serializeDataExport({headers:['v'],rows:[['a'.repeat(32768)]]},{format:'xlsx'}),/cell text limit/);
 assert.throws(()=>serializeDataExport({headers:Array(16385).fill('h'),rows:[[]]},{format:'xlsx'}),/sheet limits/);
 assert.throws(()=>serializeDataExport({headers:['v'],rows:new Array(1048576)},{format:'xlsx'}),/sheet limits/);
 assert.throws(()=>serializeDataExport(createExportDataSet([{v:'x'}]),{format:'xml'}),/supported export format/);
 assert.throws(()=>serializeDataExport(createExportDataSet([{v:'x'}]),{format:'csv',csvDelimiter:'|'}),/comma or semicolon/);
 for(const option of options)assert.equal(serializeDataExport(createExportDataSet([]),option),null);
});

test('Actual downloads use matching extension and MIME, clean up URLs and guard empty/unsafe collections',async(t)=>{
 const {downloads,urls}=capture(t);
 for(const option of options)downloadDataExport('clean-data.csv',sample,option);
 assert.deepEqual(downloads.map(d=>d.name),['clean-data.csv','clean-data.csv','clean-data.xlsx','clean-data.txt','clean-data.tsv','clean-data.json']);
 for(let i=0;i<options.length;i++){
  const option=options[i],download=downloads[i];
  assert.equal(download.blob.type,serializeDataExport(createExportDataSet(sample),option).mimeType);
  const content=option.format==='xlsx'?await download.blob.arrayBuffer():Buffer.from(await download.blob.arrayBuffer()).toString('utf8');
  assert.deepEqual(parse({content},option),[createExportDataSet(sample).headers,...createExportDataSet(sample).rows]);
 }
 assert.equal(urls.length,options.length);downloadDataExport('empty.csv',[],{format:'xlsx'});assert.equal(downloads.length,options.length);
 assert.throws(()=>downloadCsv('unsafe.csv',[{v:'=1'}]),/spreadsheet formula/);assert.equal(downloads.length,options.length);
});

test('Issue CSV export decision is based on the entire row, not just one issue severity',async(t)=>{
 const {downloads}=capture(t);const issue={field:'vat',risk:'tax_risk',category:'tax',type:'number',problem:'Invalid VAT',why:'Import risk',fix:'Correct value'};
 downloadErrorCsv('issues.csv',[{...issue,rowIndex:1,severity:'critical'},{...issue,rowIndex:1,severity:'warning'},{...issue,rowIndex:2,severity:'warning'}]);
 const rows=Papa.parse(await downloads[0].blob.text(),{header:true,delimiter:';'}).data;
 assert.deepEqual(rows.map(r=>r.export_decision),['excluded_from_clean_export','excluded_from_clean_export','included_with_review_warning']);
});

for(const config of [customerWorkspaceConfig,vendorWorkspaceConfig,productWorkspaceConfig,priceListWorkspaceConfig,stockBalancesWorkspaceConfig])test(`${config.profile.id}: every format exports the same complete set of rows without blockers`,()=>{
 const result=Papa.parse(config.example.csv,{header:true,skipEmptyLines:true});const source={rows:result.data,headers:result.meta.fields,sourceCells:result.data.map(row=>Object.fromEntries(Object.entries(row).map(([k,v])=>[k,{kind:'text',value:v}])))};
 const mapping=suggestProfileMapping(config.profile,source.headers,source.rows);
 const run=config.kind==='price-list'?runPriceListSourceValidation(source,mapping,'point'):config.kind==='stock-balances'?runStockBalancesSourceValidation(source,mapping,'point'):config.runValidation(mapRowsToProfile(source.rows,mapping,config.profile));
 const data=createExportDataSet(run.validationResult.cleanRows);assert(data.rows.length>0);assert(run.validationResult.errorRows.length>0);
 for(const option of options)assert.deepEqual(parse(serializeDataExport(data,option),option),[data.headers,...data.rows]);
 if(config.kind==='price-list')assert.deepEqual(data.rows.map(row=>row.at(-1)),['12.50','10.00','0']);
 if(config.kind==='stock-balances')assert.deepEqual(data.rows.map(row=>row.at(-1)),['10','5.50','0']);
});

test('1000 exported rows keep all values and counts across every writer',()=>{
 const rows=Array.from({length:1000},(_,i)=>({id:String(i).padStart(6,'0'),amount:`${i}.0000000000000001`,name:`Rij ${i}`}));const data=createExportDataSet(rows);
 for(const option of options){const parsed=parse(serializeDataExport(data,option),option);assert.equal(parsed.length,1001);assert.deepEqual(parsed[1],['000000','0.0000000000000001','Rij 0']);assert.deepEqual(parsed.at(-1),['000999','999.0000000000000001','Rij 999']);}
});


test('Invoice: every writer retains exact financial values and warning-only rows, excludes blockers',()=>{
 const base={company:'Acme',email:'finance@example.com',status:'ready',country:'NL',currency:'EUR',invoice_date:'2026-06-01',due_date:'2026-06-30'};
 const rows=[{...base,invoice_number:'0001',amount:'900719925474099312345.1234500',vat:'2.5000'},{...base,invoice_number:'0002',amount:'-12.5000',vat:'0'},{...base,invoice_number:'BLOCKED',amount:'1.234,56',vat:'0'}];
 const run=runInvoiceValidation(rows,{notation:'point',amountCells:rows.map(r=>({kind:'text',value:r.amount})),vatCells:rows.map(r=>({kind:'text',value:r.vat}))});
 assert.equal(run.validationResult.cleanRows.length,2);assert.equal(run.validationResult.errorRows.length,1);
 const data=createExportDataSet(run.validationResult.cleanRows);
 for(const option of options){const parsed=parse(serializeDataExport(data,option),option);assert.deepEqual(parsed,[data.headers,...data.rows]);assert.equal(parsed[1][data.headers.indexOf('amount')],'900719925474099312345.1234500');assert.equal(parsed[2][data.headers.indexOf('amount')],'-12.5000');assert(!JSON.stringify(parsed).includes('BLOCKED'));}
});
