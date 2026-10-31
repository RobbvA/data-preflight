import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { parseExactSourceFile } from '../src/lib/exactDataInput.ts';
import { runInvoiceValidation, runInvoiceSourceValidation } from '../src/lib/validation/invoiceValidation.ts';
import { invoiceValidationProfile as profile } from '../src/lib/profiles/invoiceValidationProfile.ts';
import { normalizeNumber } from '../src/lib/normalization/normalizeNumber.ts';
import { compareDecimals, isAboveThirtyPercent } from '../src/lib/strictDecimalComparison.ts';
import { decodeDecimalText } from '../src/lib/strictDecimal.ts';
import { buildValidationReportRows } from '../src/lib/validationReport.ts';
import { prepareSavedMapping } from '../src/lib/savedMappings.ts';
import { downloadCsv } from '../src/lib/exportData.ts';

const row = (overrides = {}) => ({ invoice_number:'0001',company:'Acme',email:'finance@example.com',amount:'10',vat:'2.10',status:'ready',country:'NL',invoice_date:'2026-06-01',due_date:'2026-06-30',currency:'EUR',...overrides });
const text = value => ({kind:'text',value});
const run = (rows, notation = 'point', cells = {}) => runInvoiceValidation(rows, {
 notation, amountCells:rows.map(r=>text(r.amount)),vatCells:rows.map(r=>text(r.vat)),...cells,
});
const mapping = Object.fromEntries(profile.fields.map(({key})=>[key,key]));
const types = result => result.validationResult.issues.map(issue=>issue.type);
function exactSource(rows) { return { rows,headers:Object.keys(rows[0]),sourceCells:rows.map(r=>Object.fromEntries(Object.entries(r).map(([key,value])=>[key,text(value)]))) }; }
function fileFor(sheet, type='xlsx') {
 const book=XLSX.utils.book_new();XLSX.utils.book_append_sheet(book,sheet,'Invoices');
 return new File([XLSX.write(book,{type:'buffer',bookType:type})],`invoices.${type}`);
}
function fileReader(t) {
 const old=Object.getOwnPropertyDescriptor(globalThis,'FileReader');
 Object.defineProperty(globalThis,'FileReader',{configurable:true,value:class {readAsText(blob){blob.text().then(result=>this.onload({target:{result}}));}}});
 t.after(()=>old?Object.defineProperty(globalThis,'FileReader',old):delete globalThis.FileReader);
}

test('Invoice: interpretation requires notation and complete aligned financial source cells',()=>{
 const rows=[row()];
 for(const notation of [null,undefined,'auto']) assert.equal(runInvoiceValidation(rows,{notation,amountCells:[text('10')],vatCells:[text('2.10')]}).available, false);
 for(const cells of [{amountCells:[]},{vatCells:[]},{amountCells:[undefined]}]) assert.equal(run(rows,'point',cells).reason,'source-context');
 assert.equal(runInvoiceSourceValidation(exactSource(rows),{...mapping,amount:''},'point').reason,'mapping-required');
 assert.equal(runInvoiceSourceValidation(exactSource(rows),{...mapping,vat:'amount'},'point').reason,'mapping-required');
 assert.equal(runInvoiceSourceValidation(exactSource(rows),{...mapping,email:'absent'},'point').reason,'mapping-required');
 const source=exactSource(rows);delete source.sourceCells[0].amount;
 assert.equal(runInvoiceSourceValidation(source,mapping,'point').reason,'source-context');
 assert.equal(normalizeNumber('1.234',null).ok,false);
});

test('Invoice: 1.234 means exact decimal only with point; comma never infers thousands',()=>{
 assert.equal(normalizeNumber('1.234','point').value,'1.234');
 assert.equal(normalizeNumber('1.234','comma').ok,false);
 const point=run([row({amount:'1.234',vat:'0.21'})]);
 assert.equal(point.validationResult.cleanRows[0].amount,'1.234');
 const wrong=run([row({amount:'1.234',vat:'0'})],'comma');
 assert.equal(wrong.validationResult.cleanRows.length,0);assert(types(wrong).includes('number'));
 assert.equal(run([row({amount:'1,234',vat:'0,21'})],'comma').normalizedRows[0].amount,'1.234');
 assert.equal(run([row({amount:'1,234'})]).validationResult.cleanRows.length,0);
});

test('Invoice: rejects grouped/mixed/symbolic/exponent/malformed numbers without silent repair',()=>{
 for(const notation of ['point','comma']) {
  for(const amount of ['1.234,56','1,234.56','1 234','1\u00a0234','1  2','€12','1e3','+1','.5','12.','12,','--2','NaN','Infinity']) {
   const result=run([row({amount,vat:'0'})],notation);
   assert.equal(result.validationResult.cleanRows.length,0,`${notation} ${amount}`);
   assert.deepEqual(types(result),['number']);
  }
 }
});

test('Invoice: trim only, text scale/leading zeros/long precision survive, no mutation',()=>{
 const rows=[row({amount:' 000900719925474099312345.00000000001 ',vat:' 0.00000000001 '})];
 const before=structuredClone(rows);const result=run(rows);
 assert.equal(result.normalizedRows[0].amount,'000900719925474099312345.00000000001');
 assert.equal(result.normalizedRows[0].invoice_number,'0001');
 assert.deepEqual(rows,before);assert.deepEqual(run(rows),result);assert.equal(result.validationResult.cleanRows.length,1);
});

test('Invoice: amount and VAT remain required; negative/zero business warnings retain severity',()=>{
 const missing=run([row({amount:'',vat:''})]);
 assert.deepEqual(missing.validationResult.issues.map(i=>[i.field,i.type,i.severity]),[['amount','required','critical'],['vat','required','critical']]);
 const zero=run([row({amount:'-0.00',vat:'-0.000'})]);
 assert.equal(zero.normalizedRows[0].amount,'0.00');assert.equal(zero.normalizedRows[0].vat,'0.000');
 assert.deepEqual(types(zero),['amount-not-positive']);assert.equal(zero.validationResult.cleanRows.length,1);
 const negative=run([row({amount:'-10',vat:'-2'})]);
 assert.deepEqual(types(negative),['amount-not-positive','vat-negative']);
 assert(negative.validationResult.issues.every(i=>i.severity==='warning'));assert.equal(negative.validationResult.cleanRows.length,1);
});

test('Invoice: exact VAT comparisons catch boundaries hidden by floating-point rounding',()=>{
 const same=run([row({amount:'1.00000000000000000000000000000',vat:'1.00000000000000000000000000001'})]);
 assert(types(same).includes('vat-higher-than-amount'));
 const above=run([row({amount:'1',vat:'0.30000000000000000000000000001'})]);
 assert(types(above).includes('suspicious-vat-rate'));
 const equal=run([row({amount:'1',vat:'0.30000000000000000000000000000'})]);
 assert.equal(types(equal).length,0);
 const below=run([row({amount:'1',vat:'0.29999999999999999999999999999'})]);
 assert.equal(types(below).length,0);
 for(const [a,b,expected] of [['001.00','1',0],['-100','-2',-1],['0','-0',0],['0.00001','0',1],['1000','999.999',1]]) assert.equal(compareDecimals(decodeDecimalText(a,'point'),decodeDecimalText(b,'point')),expected);
 assert.equal(isAboveThirtyPercent(decodeDecimalText('3','point'),decodeDecimalText('10','point')),false);
});

test('Invoice: invalid financial values never cause invented financial business warnings',()=>{
 for(const values of [{amount:'bad',vat:'200'},{amount:'100',vat:'bad'},{amount:'1.234',vat:'20'}]) {
  const result=run([row(values)],values.amount==='1.234'?'comma':'point');
  assert.deepEqual(types(result),['number']);
 }
});

test('Invoice: every unsupported financial cell type is blocked, including uncached formulas',()=>{
 for(const kind of ['formula','date','boolean','error','percentage']) {
  const result=run([row()], 'point',{amountCells:[{kind,value:''}]});
  assert.equal(result.validationResult.cleanRows.length,0);assert.deepEqual(types(result),['number']);
 }
 const unsafe=run([row()],'point',{amountCells:[{kind:'number',value:Number.MAX_SAFE_INTEGER+1}]});
 assert.deepEqual(types(unsafe),['number']);
});

for(const type of ['xlsx','xls']) test(`Invoice ${type}: stored financial values, formatted identifiers and dates coexist`,async()=>{
 const sheet=XLSX.utils.json_to_sheet([row()]);
 sheet.A2={t:'n',v:1,z:'0000'};
 sheet.D2={t:'n',v:12.3456,z:'"€"0.00'};
 sheet.E2={t:'s',v:'2,5000'};
 sheet.H2={t:'n',v:46174,z:'yyyy-mm-dd'}; // 2026-06-01
 const parsed=await parseExactSourceFile(fileFor(sheet,type));
 const before=structuredClone(parsed);const result=runInvoiceSourceValidation(parsed,mapping,'comma');
 assert.equal(result.available,true);assert.equal(result.validationResult.cleanRows.length,1);
 const record=result.normalizedRows[0];
 assert.equal(record.invoice_number,'0001');assert.equal(record.amount,'12.3456');assert.equal(record.vat,'2.5000');
 assert.equal(record.invoice_date,'2026-06-01');assert.deepEqual(parsed,before);
});

test('Invoice XLSX: cached formula financial cells are rejected despite valid display values',async()=>{
 const sheet=XLSX.utils.json_to_sheet([row()]);sheet.D2={t:'n',f:'1+1',v:2};
 const parsed=await parseExactSourceFile(fileFor(sheet));
 const result=runInvoiceSourceValidation(parsed,mapping,'point');assert.deepEqual(types(result),['number']);
});

test('Invoice: mapping follows reordered Excel source columns and does not reuse stale cell positions',async()=>{
 const sheet=XLSX.utils.aoa_to_sheet([['Gross','Tax','ID','Company','Email'],[12.3456,'2,50','009','Acme','finance@example.com']]);sheet.A2.z='0.00';
 const parsed=await parseExactSourceFile(fileFor(sheet));
 const m=Object.fromEntries(profile.fields.map(({key})=>[key,'']));
 Object.assign(m,{amount:'Gross',vat:'Tax',invoice_number:'ID',company:'Company',email:'Email'});
 const result=runInvoiceSourceValidation(parsed,m,'comma');assert.equal(result.normalizedRows[0].amount,'12.3456');
 assert.equal(result.normalizedRows[0].vat,'2.50');assert.equal(result.validationResult.cleanRows.length,1);
 const swapped=runInvoiceSourceValidation(parsed,{...m,amount:'Tax',vat:'Gross'},'comma');
 assert.equal(swapped.normalizedRows[0].amount,'2.50');assert.equal(swapped.normalizedRows[0].vat,'12.3456');
 assert(types(swapped).includes('vat-higher-than-amount'));
});

test('Invoice: legacy saved mapping signals profile version change and cannot provide notation',()=>{
 const source=exactSource([row()]);const saved={name:'Legacy invoice',profileId:'invoice',profileVersion:'1.0.2',headers:source.headers,mapping};
 const prepared=prepareSavedMapping(saved,profile,source.headers);
 assert.equal(profile.version,'1.1.0');assert.equal(prepared.versionChanged,true);assert.equal(prepared.status.mappingReady,true);
 assert.equal(runInvoiceSourceValidation(source,prepared.mapping,null).reason,'notation-required');
});

test('Invoice: example and real CSV download agree; blocked rows excluded, warnings remain',async(t)=>{
 fileReader(t);
 const file=new File([readFileSync(new URL('../public/demo-data/messy-export.csv',import.meta.url))],'messy-export.csv',{type:'text/csv'});
 const source=await parseExactSourceFile(file);
 const m={invoice_number:'Invoice No',company:'Customer',email:'Email Address',amount:'Total',vat:'VAT Amount',status:'State',country:'Country',invoice_date:'Invoice Date',due_date:'Due Date',currency:'Currency'};
 const result=runInvoiceSourceValidation(source,m,'point');
 const issues=result.validationResult.issues;
 assert.equal(new Set(issues.filter(i=>i.severity==='critical').map(i=>i.rowIndex)).size,1);
 assert.equal(result.validationResult.cleanRows.length,3);assert.equal(issues.length,3);
 assert.deepEqual(result.validationResult.cleanRows.map(r=>r.invoice_number),['INV-2001','INV-2002','INV-2004']);
 const downloads=[];const old=Object.getOwnPropertyDescriptor(globalThis,'document');
 Object.defineProperty(globalThis,'document',{configurable:true,value:{createElement:()=>({click(){}})}});
 t.after(()=>old?Object.defineProperty(globalThis,'document',old):delete globalThis.document);
 t.mock.method(URL,'createObjectURL',blob=>{downloads.push(blob);return 'blob:invoice';});t.mock.method(URL,'revokeObjectURL',()=>{});
 downloadCsv('invoice.csv',result.validationResult.cleanRows);
 const csv=await downloads[0].text();const exported=Papa.parse(csv,{header:true,delimiter:';'}).data;
 assert.equal(exported.length,3);assert.equal(exported[0].amount,'1200');assert.equal(exported[2].amount,'-300');
 assert(!csv.includes('normalized_invoice_key'));assert(!csv.includes('INV-2003'));
});

test('Invoice: validation report requires active notation and contains exactness/limitations',()=>{
 const input={profile,fileName:'own.csv',mapping,counts:{total:1,blocked:0,needsReview:0,ready:1}};
 assert.throws(()=>buildValidationReportRows(input),/Invoice notation is required/);
 const report=buildValidationReportRows({...input,invoiceContext:{invoiceNotation:'comma'}});
 assert(report.some(r=>r['DataPreflight field / metric']==='Amount and VAT notation'&&r['Source column / value']==='Decimal comma (12,50)'));
 assert(report.some(r=>r['Source column / value'].includes('Exact decimal comparisons')));
 assert(!JSON.stringify(report).includes('Quantity notation'));
});
