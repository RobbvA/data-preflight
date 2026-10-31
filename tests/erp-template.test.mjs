import test from 'node:test';
import assert from 'node:assert/strict';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { customerValidationProfile } from '../src/lib/validation/customerValidation.ts';
import { runValidationProfile } from '../src/lib/validation/validationProfile.ts';
import { applyOdooCustomerTemplate, createOdooCustomerExport, ODOO_CUSTOMER_TEMPLATE as template } from '../src/lib/erpTemplates.ts';
import { createExportDataSet, serializeDataExport } from '../src/lib/dataExport.ts';
import { buildReviewReport } from '../src/lib/reviewReport.ts';

const fixture = [
 {customer_id:'000123',name:'Company A',email:'a@example.com',country:'NL',vat_number:''},
 {customer_id:'LONG_12345678901234567890',name:'Company B',email:'wrong-email',country:'DE',vat_number:'DE123'},
 {customer_id:'003',name:'Unknown country',email:'',country:'ZZ',vat_number:''},
 {customer_id:'bad.id',name:'Unsupported ID',email:'',country:'BE',vat_number:''},
 {customer_id:'005',name:'',email:'',country:'',vat_number:''},
 {customer_id:'006',name:'No optional fields',email:'',country:'',vat_number:''},
];
const run = () => { const base=runValidationProfile(customerValidationProfile,fixture);return {...base,validationResult:applyOdooCustomerTemplate(base.normalizedRows,base.validationResult)}; };
test('Odoo overlay adds blockers without mutating source or weakening existing customer rules',()=>{
 const before=structuredClone(fixture);const base=runValidationProfile(customerValidationProfile,fixture);const original=structuredClone(base.validationResult);
 const result=applyOdooCustomerTemplate(base.normalizedRows,base.validationResult);
 assert.deepEqual(fixture,before);assert.deepEqual(base.validationResult,original);
 assert.deepEqual(result.errorRows.map(r=>r.customer_id),['003','bad.id','005']);
 assert.deepEqual(result.cleanRows.map(r=>r.customer_id),['000123','LONG_12345678901234567890','006']);
 for(const issue of original.issues)assert.ok(result.issues.includes(issue) || result.issues.some(i=>JSON.stringify(i)===JSON.stringify(issue)));
 assert.ok(result.issues.some(i=>i.ruleId==='invalid-email'&&i.severity==='warning'));
 assert.deepEqual(applyOdooCustomerTemplate(base.normalizedRows,base.validationResult),result);
});
test('Odoo CSV and XLSX preserve exact IDs and warnings, reference countries and exclude blocked rows',()=>{
 const {validationResult}=run();const rows=createOdooCustomerExport(validationResult.cleanRows);const data=createExportDataSet(rows);
 assert.deepEqual(data.headers,[...template.headers]);
 assert.deepEqual(rows[0],{id:'datapreflight_customer.customer_000123',name:'Company A',is_company:'True',email:'a@example.com','country_id/id':'base.nl',vat:'',ref:'000123'});
 assert.equal(rows[1].ref,'LONG_12345678901234567890');assert.equal(rows[1].email,'wrong-email');assert.equal(rows[2]['country_id/id'],'');
 const csv=serializeDataExport(data,{format:'csv',csvDelimiter:','});assert.deepEqual(Papa.parse(csv.content.replace(/^\uFEFF/,''),{header:true}).data,rows);
 const file=serializeDataExport(data,{format:'xlsx'});const wb=XLSX.read(file.content,{type:'array',cellFormula:true});
 assert.deepEqual(XLSX.utils.sheet_to_json(wb.Sheets.Data,{raw:true,defval:''}),rows);
 for(const [key,cell] of Object.entries(wb.Sheets.Data))if(!key.startsWith('!')){assert.equal(cell.t,'s');assert.equal(cell.f,undefined);}
 assert.throws(()=>createOdooCustomerExport([fixture[2]]));assert.throws(()=>createOdooCustomerExport([fixture[3]]));assert.throws(()=>createOdooCustomerExport([fixture[4]]));
});
test('Template reports record version, transformation, excluded rows and untested compatibility',()=>{
 const {normalizedRows,validationResult}=run();const mapping=Object.fromEntries(Object.keys(fixture[0]).map(k=>[k,k]));
 const input={profile:customerValidationProfile,fileName:'fixture.csv',mapping,sourceRows:fixture,normalizedRows,issues:validationResult.issues,counts:{total:6,blocked:3,needsReview:1,ready:2},templateContext:{id:template.id,version:template.version}};
 const report=buildReviewReport(input);const text=JSON.stringify(report);
 assert.ok(text.includes(template.id));assert.ok(text.includes('no Odoo trial import'));assert.ok(text.includes('datapreflight_customer'));assert.ok(text.includes('base data'));
 assert.equal(report.rows.filter(r=>r.export_decision==='excluded_from_clean_export').length,3);
 assert.throws(()=>buildReviewReport({...input,templateContext:{id:template.id,version:'wrong'}}));
 const generic=runValidationProfile(customerValidationProfile,fixture);assert.equal(generic.validationResult.errorRows.length,1);
});
test('External IDs are stable and unambiguous; prototype-like unknown country values never resolve',()=>{
 const first=createOdooCustomerExport([fixture[0]])[0];assert.deepEqual(createOdooCustomerExport([fixture[0]])[0],first);
 for(const id of ['a.b','with space','a/b','é',''])assert.throws(()=>createOdooCustomerExport([{...fixture[0],customer_id:id}]));
 for(const country of ['ZZ','constructor','__proto__'])assert.throws(()=>createOdooCustomerExport([{...fixture[0],country}]));
 const duplicate=runValidationProfile(customerValidationProfile,[fixture[0],fixture[0]]);assert.equal(applyOdooCustomerTemplate(duplicate.normalizedRows,duplicate.validationResult).cleanRows.length,0);
});
