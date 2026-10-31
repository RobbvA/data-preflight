/* eslint-disable @typescript-eslint/no-require-imports -- standalone Node CommonJS browser runner */
/* Optional integration runner. Install Playwright separately; build first.
   R04_BASE_URL can target an existing localhost server. No live target by default.
   R04_PLAYWRIGHT_MODULE / R04_CHROMIUM_PATH / R04_CHROMIUM_ARGS support CI browsers.
   R04_OUTPUT_DIR controls internal evidence. No uploads or external service calls. */
const path = require('node:path'), fs = require('node:fs/promises'), assert = require('node:assert/strict'), { spawn } = require('node:child_process');
const project = path.resolve(__dirname, '../..');
const { chromium } = require(process.env.R04_PLAYWRIGHT_MODULE || 'playwright');
const Papa = require('papaparse'), XLSX = require('xlsx'), { PDFDocument } = require('pdf-lib');
const output = process.env.R04_OUTPUT_DIR || path.join(require('node:os').tmpdir(), 'datapreflight-r04-results');
let browser, server, page;
const checks = [], errors = [], unexpected = [], matrix = [];
let phase = 'setup';
const record = text => { checks.push(text); console.log('PASS ' + text); };
const profiles = [
    { id: 'invoice', pick: /Invoice data/, counts: [1, 2, 1], ids: ['INV-2001', 'INV-2002', 'INV-2004'], key: 'invoice_number', labels: ['Invoice Number', 'Company'], numeric: true },
    { id: 'customer', pick: /Customer master data/, counts: [3, 0, 2], ids: ['C-1001', 'C-1003'], key: 'customer_id', labels: ['Customer ID', 'Customer name'] },
    { id: 'vendor', pick: /Vendor master data/, counts: [3, 1, 2], ids: ['001', '003', '005'], key: 'vendor_id', labels: ['Vendor ID', 'Vendor name'] },
    { id: 'product', pick: /Product \/ Material/, counts: [5, 0, 2], ids: ['001', '005'], key: 'product_id', labels: ['Product ID', 'Description'] },
    { id: 'price-list', pick: /Price List/, counts: [8, 1, 2], ids: ['001', '001', '002'], reportIds: ['001 / RETAIL / EUR / EA', '001 / WHOLESALE / EUR / EA', '002 / RETAIL / EUR / EA'], key: 'product_id', labels: ['Product ID', 'Price list'], numeric: true },
    { id: 'stock-balances', pick: /Stock Balances/, counts: [7, 0, 3], ids: ['001', '001', '002'], reportIds: ['001 / WH-A', '001 / WH-B', '002 / WH-A'], key: 'product_id', labels: ['Product ID', 'Warehouse'], numeric: true },
];
async function main() {
    await fs.mkdir(output, { recursive: true });
    let base = process.env.R04_BASE_URL;
    if (!base) {
        const port = await new Promise(resolve => { const s = require('node:net').createServer(); s.listen(0, '127.0.0.1', () => { const n = s.address().port; s.close(() => resolve(n)); }); });
        base = 'http://127.0.0.1:' + port;
        server = spawn(process.execPath, [path.join(project, 'node_modules/next/dist/bin/next'), 'start', '--hostname', '127.0.0.1', '--port', String(port)], { cwd: project, env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' } });
        await new Promise((resolve, reject) => { const timeout = setTimeout(() => reject(Error('Server timeout')), 30000); server.stdout.on('data', d => { if (d.toString().includes('Ready')) {
            clearTimeout(timeout);
            resolve();
        } }); server.stderr.on('data', d => process.stderr.write(d)); server.on('exit', code => reject(Error('Server exited ' + code))); });
    }
    assert(['127.0.0.1', 'localhost', '[::1]'].includes(new URL(base).hostname), 'Use localhost for fixture testing');
    browser = await chromium.launch({ headless: true, executablePath: process.env.R04_CHROMIUM_PATH || undefined, args: JSON.parse(process.env.R04_CHROMIUM_ARGS || '[]') });
    page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
    page.setDefaultTimeout(10000);
    page.on('pageerror', e => errors.push(e.message));
    page.on('request', r => { if ((!r.url().startsWith(base) && !r.url().startsWith('blob:') && !r.url().startsWith('data:')) || r.method() !== 'GET')
        unexpected.push(r.method() + ' ' + r.url()); });
    const summary = () => page.getByLabel('Export summary', { exact: true });
    const action = () => page.getByRole('button', { name: 'Export rows without blockers', exact: true });
    const format = () => page.getByRole('combobox', { name: 'Export format', exact: true });
    const tab = name => page.getByRole('tab', { name, exact: true });
    const point = () => page.getByRole('radio', { name: 'Decimal point (12.50)', exact: true });
    const comma = () => page.getByRole('radio', { name: 'Decimal comma (12,50)', exact: true });
    async function choose(c) { await page.goto(base); await page.getByRole('button', { name: /Validation profile:/ }).click(); await page.getByRole('group', { name: 'Validation profiles', exact: true }).getByRole('button', { name: c.pick }).click(); }
    async function switchTo(c) { await page.getByRole('button', { name: /Validation profile:/ }).click(); await page.getByRole('group', { name: 'Validation profiles', exact: true }).getByRole('button', { name: c.pick }).click(); }
    const upload = (name, buffer) => page.locator('input[type=file]').first().setInputFiles({ name, mimeType: name.endsWith('.csv') ? 'text/csv' : 'application/vnd.ms-excel', buffer: Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer) });
    async function noResults() { assert.equal(await summary().count(), 0); assert.equal(await action().count(), 0); assert.equal(await tab('Reports').count(), 0); }
    async function ready(c) { if (c.numeric) {
        await point().waitFor();
        assert(!await point().isChecked(), 'new source requires a fresh explicit notation');
        await noResults();
        await point().check();
    } await summary().waitFor(); }
    async function download(button, type = 'csv', delimiter = ';') {
        await page.evaluate(() => document.documentElement.style.scrollBehavior = 'auto');
        await button.scrollIntoViewIfNeeded();
        const [d] = await Promise.all([page.waitForEvent('download'), button.click()]);
        const chunks = [];
        for await (const chunk of await d.createReadStream())
            chunks.push(chunk);
        const buffer = Buffer.concat(chunks);
        assert(d.suggestedFilename().endsWith('.' + type));
        if (type === 'xlsx') {
            const book = XLSX.read(buffer, { type: 'buffer', cellNF: true, cellFormula: true });
            for (const sheet of Object.values(book.Sheets))
                for (const [a, cell] of Object.entries(sheet))
                    if (!a.startsWith('!')) {
                        assert.equal(cell.t, 's');
                        assert.equal(cell.f, undefined);
                    }
            return { book, buffer, rows: XLSX.utils.sheet_to_json(book.Sheets.Data || book.Sheets.Rows, { defval: '' }) };
        }
        if (type === 'pdf') {
            const pdf = await PDFDocument.load(buffer);
            return { pages: pdf.getPageCount(), buffer };
        }
        if (type === 'json')
            return { rows: JSON.parse(buffer.toString('utf8')) };
        const parsed = Papa.parse(buffer.toString('utf8').replace(/^\uFEFF/, ''), { header: true, delimiter, skipEmptyLines: true });
        assert.deepEqual(parsed.errors, []);
        return { rows: parsed.data };
    }
    async function exportRows(type = 'csv', delimiter = ';') { await tab('Data export').click(); await format().selectOption(type); if (type === 'csv')
        await page.getByRole('combobox', { name: 'CSV column separator', exact: true }).selectOption(delimiter); return (await download(action(), type, type === 'csv' ? delimiter : '\t')).rows; }
    async function verifyCounts(c) { const group = page.getByRole('group', { name: 'Filter validation results', exact: true }); for (const [i, label] of ['Blocked', 'Needs review', 'Ready'].entries()) {
        const text = await group.getByRole('button', { name: new RegExp(label) }).innerText();
        assert.equal(Number(text.match(/(\d+)\s*$/)[1]), c.counts[i], c.id + ' ' + label);
    } assert.match(await summary().innerText(), new RegExp('^' + c.ids.length + ' rows? will export')); }
    async function verifyRows(c) { const rows = await exportRows(); assert.deepEqual(rows.map(r => r[c.key]), c.ids, c.id + ' exact exported IDs'); return rows; }
    async function fullReport() { await tab('Reports').click(); await page.getByRole('combobox', { name: 'Review report format', exact: true }).selectOption('xlsx'); return (await download(page.getByRole('button', { name: 'Download review report', exact: true }), 'xlsx')).book; }
    function sheet(book, name) { return XLSX.utils.sheet_to_json(book.Sheets[name], { defval: '' }); }
    function metric(rows, name) { return rows.find(r => r['DataPreflight field / metric'] === name)?.['Source column / value']; }
    const fixtureData = JSON.parse(await fs.readFile(path.join(__dirname, 'r04-fixtures.json'), 'utf8'));
    for (const c of process.env.R04_FOCUS ? [] : profiles.filter(p => !process.env.R04_PROFILES || process.env.R04_PROFILES.split(',').includes(p.id))) {
        phase = c.id;
        await choose(c);
        await page.getByRole('button', { name: 'Try example file', exact: true }).click();
        await summary().waitFor();
        await verifyCounts(c);
        const baseline = await verifyRows(c);
        for (const [type, delimiter] of [['csv', ';'], ['csv', ','], ['xlsx'], ['txt'], ['tsv'], ['json']])
            assert.deepEqual(await exportRows(type, delimiter), baseline, c.id + ' ' + type + ' exact values');
        // All category filters are presentation-only, including an empty category.
        for (const name of ['Blocked', 'Needs review', 'Ready']) {
            await page.getByRole('group', { name: 'Filter validation results', exact: true }).getByRole('button', { name: new RegExp(name) }).click();
            assert.deepEqual(await exportRows(), baseline);
        }
        const book = await fullReport(), ctx = sheet(book, 'Validation context'), decisions = sheet(book, 'Rows'), issues = sheet(book, 'Issues'), totals = sheet(book, 'Summary');
        assert.equal(metric(ctx, 'Profile ID'), c.id);
        assert.deepEqual(decisions.filter(r => r.export_decision !== 'excluded_from_clean_export').map(r => r.record_id), c.reportIds || c.ids);
        assert.equal(decisions.length, c.counts.reduce((a, b) => a + b));
        assert.equal(Number(totals.find(r => r.Metric === 'Rows included in data export').Value), baseline.length);
        assert.equal(decisions.filter(r => r.status === 'Blocked').length, c.counts[0]);
        assert.equal(decisions.filter(r => r.status === 'Needs review').length, c.counts[1]);
        assert.equal(decisions.filter(r => r.status === 'Ready').length, c.counts[2]);
        assert(metric(ctx, 'Checks performed'));
        if (c.id === 'product')
            assert.equal(metric(ctx, 'Reference check'), 'Not run');
        for (const [id, label] of [['invoice', 'Amount and VAT notation'], ['price-list', 'Price notation'], ['stock-balances', 'Quantity notation']])
            assert.equal(ctx.some(r => r['DataPreflight field / metric'] === label), c.id === id);
        const issueButton = () => page.getByRole('button', { name: 'Download issue report', exact: true });
        await page.getByRole('combobox', { name: 'Issue report format', exact: true }).selectOption('csv');
        assert.deepEqual((await download(issueButton())).rows, issues);
        await page.getByRole('combobox', { name: 'Issue report format', exact: true }).selectOption('xlsx');
        assert.deepEqual((await download(issueButton(), 'xlsx')).rows, issues);
        await page.getByRole('combobox', { name: 'Review report format', exact: true }).selectOption('pdf');
        const pdf = await download(page.getByRole('button', { name: 'Download review report', exact: true }), 'pdf');
        assert(pdf.pages > 0);
        await page.getByText('Personalize report (optional)', { exact: true }).click();
        await page.getByRole('textbox', { name: 'Report organization', exact: true }).fill('Old ' + c.id);
        const own = fixtureData[c.id];
        await upload('same-source.csv', own);
        await ready(c);
        await verifyCounts(c);
        assert.deepEqual(await verifyRows(c), baseline);
        await tab('Reports').click();
        assert.equal(await page.getByRole('combobox', { name: 'Issue report format', exact: true }).inputValue(), 'csv');
        await page.getByText('Personalize report (optional)', { exact: true }).click();
        assert.equal(await page.getByRole('textbox', { name: 'Report organization', exact: true }).inputValue(), '');
        await tab('Data export').click();
        // Missing and duplicated required mappings remove every result/export; saved mapping recovers it.
        await page.getByRole('button', { name: 'Edit mapping', exact: true }).click();
        const dialog = page.getByRole('dialog');
        await dialog.getByText('Saved mappings', { exact: true }).click();
        await dialog.getByLabel('Mapping name', { exact: true }).fill('R04 ' + c.id);
        await dialog.getByRole('button', { name: 'Save current mapping', exact: true }).click();
        const original = await dialog.getByLabel(c.labels[0], { exact: true }).inputValue(), other = await dialog.getByLabel(c.labels[1], { exact: true }).inputValue();
        await dialog.getByLabel(c.labels[0], { exact: true }).selectOption('');
        await page.keyboard.press('Escape');
        await noResults();
        await page.getByRole('button', { name: 'Complete mapping', exact: true }).click();
        await dialog.getByLabel(c.labels[0], { exact: true }).selectOption(other);
        assert((await dialog.getByText('This column is assigned more than once. Choose a different column.', { exact: true }).count()) >= 2);
        await page.keyboard.press('Escape');
        await noResults();
        await page.getByRole('button', { name: 'Complete mapping', exact: true }).click();
        await dialog.getByText('Saved mappings', { exact: true }).click();
        await dialog.getByLabel('Saved mapping', { exact: true }).selectOption('R04 ' + c.id);
        await dialog.getByRole('button', { name: 'Apply mapping', exact: true }).click();
        assert.equal(await dialog.getByLabel(c.labels[0], { exact: true }).inputValue(), original);
        await page.keyboard.press('Escape');
        await summary().waitFor();
        await verifyRows(c);
        // Same filename replacement does not inherit numerical notation, branding or selected format.
        await upload('same-source.csv', own);
        if (c.numeric) {
            await point().waitFor();
            await noResults();
            await page.getByRole('button', { name: 'Edit mapping', exact: true }).click();
            await dialog.getByText('Saved mappings', { exact: true }).click();
            await dialog.getByLabel('Saved mapping', { exact: true }).selectOption('R04 ' + c.id);
            await dialog.getByRole('button', { name: 'Apply mapping', exact: true }).click();
            await page.keyboard.press('Escape');
            await noResults();
            assert(!await point().isChecked());
            await point().check();
        }
        await summary().waitFor();
        await verifyRows(c);
        for (const bad of [{ name: 'empty.csv', body: '', message: /This file is empty/ }, { name: 'broken.csv', body: 'a,b\n"unclosed,z', message: /Could not read this CSV/ }, { name: 'headers.csv', body: own.split('\n')[0], message: /upload the file again/ }]) {
            await upload(bad.name, bad.body);
            await page.getByRole('alert').filter({ hasText: bad.message }).waitFor();
            await noResults();
        }
        // Own multi-sheet XLSX and XLS use reordered source columns and text IDs.
        for (const type of ['xlsx', 'xls']) {
            const rows = Papa.parse(own, { skipEmptyLines: true }).data.map(r => [...r].reverse());
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['Note'], ['Choose Data']]), 'Notes');
            XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'Data');
            const buffer = XLSX.write(wb, { bookType: type, type: 'buffer' });
            await upload('own.' + type, buffer);
            await page.getByRole('button', { name: 'Data', exact: true }).waitFor();
            await noResults();
            if (type === 'xlsx') {
                await page.getByRole('button', { name: 'Cancel file', exact: true }).click();
                await noResults();
                await upload('own.' + type, buffer);
            }
            await page.getByRole('button', { name: 'Data', exact: true }).click();
            await ready(c);
            await verifyCounts(c);
            assert.deepEqual(await verifyRows(c), baseline);
            const ownBook = await fullReport();
            assert.equal(metric(sheet(ownBook, 'Validation context'), 'Source worksheet'), 'Data');
        }
        // Complete profile switch clears source; cancelling leaves the current run intact.
        await switchTo(profiles[(profiles.indexOf(c) + 1) % profiles.length]);
        await page.getByRole('button', { name: 'Keep current profile', exact: true }).click();
        await page.keyboard.press('Escape');
        await verifyRows(c);
        await switchTo(profiles[(profiles.indexOf(c) + 1) % profiles.length]);
        await page.getByRole('button', { name: 'Clear and switch', exact: true }).click();
        await noResults();
        assert.equal(await point().count(), 0);
        assert.equal(await page.getByRole('group', { name: 'Allowed base units', exact: true }).count(), 0);
        await page.getByRole('button', { name: 'Try example file', exact: true }).click();
        await summary().waitFor();
        const nextBook = await fullReport();
        assert.equal(metric(sheet(nextBook, 'Validation context'), 'Profile ID'), profiles[(profiles.indexOf(c) + 1) % profiles.length].id);
        assert.equal(sheet(nextBook, 'Summary').find(r => r.Metric === 'Organization')?.Value || '', '');
        await page.getByRole('button', { name: 'Reset', exact: true }).click();
        await noResults();
        matrix.push({ profile: c.id, blocked: c.counts[0], review: c.counts[1], ready: c.counts[2], export: baseline.length, issues: issues.length, pdfPages: pdf.pages });
        record(c.id + ': examples; all data formats; issue CSV/XLSX and full XLSX/PDF; own CSV/XLSX/XLS; missing/duplicate/saved mapping; failed replace; worksheet/cancel; profile switch/reset');
    }
    // Exact financial/quantity cells: stored precision, string decimal scale and zero; no display rounding.
    for (const c of process.env.R04_FOCUS ? [] : profiles.filter(p => p.numeric))
        for (const type of ['xlsx', 'xls']) {
            phase = c.id + ' exact ' + type;
            await choose(c);
            const aoa = c.id === 'invoice' ? [['Invoice No', 'Customer', 'Email Address', 'Total', 'VAT Amount'], ['0001', 'Acme', 'finance@example.com', 12.3456, 2.1000], ['0002', 'Acme', 'finance@example.com', '900719925474099312345,1234500', '2,5000']] : c.id === 'price-list' ? [['Product ID', 'Price List', 'Currency', 'Unit', 'Unit Price'], ['0001', 'R', 'EUR', 'EA', 12.3456], ['0002', 'R', 'EUR', 'EA', '900719925474099312345,1234500']] : [['Product ID', 'Warehouse', 'Unit', 'Quantity'], ['0001', 'W', 'EA', 12.3456], ['0002', 'W', 'EA', '900719925474099312345,1234500']];
            const col = c.id === 'invoice' ? 'D' : c.id === 'price-list' ? 'E' : 'D';
            const sh = XLSX.utils.aoa_to_sheet(aoa);
            sh[col + '2'].z = '0.00';
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, sh, 'Exact');
            await upload('exact.' + type, XLSX.write(wb, { bookType: type, type: 'buffer' }));
            await comma().waitFor();
            await comma().check();
            await summary().waitFor();
            const rows = await exportRows('xlsx'), key = c.id === 'invoice' ? 'amount' : c.id === 'price-list' ? 'unit_price' : 'quantity';
            assert.deepEqual(rows.map(r => [r[c.key], r[key]]), [['0001', '12.3456'], ['0002', '900719925474099312345.1234500']]);
            record(phase + ': exact stored numeric cells and text decimal scale retained');
        }
    // Product reference lifecycle and truthful Ready boundary.
    if (!process.env.R04_FOCUS) {
        phase = 'Product reference isolation';
        const product = profiles.find(p => p.id === 'product');
        await choose(product);
        await upload('product.csv', 'Product ID,Description,Base Unit\n0001,Widget,EA');
        await summary().waitFor();
        const unit = () => page.getByRole('group', { name: 'Allowed base units', exact: true });
        assert.match(await unit().innerText(), /Not run.*presence only/);
        await unit().locator('summary').first().click();
        await unit().getByLabel('Upload allowed unit CSV').setInputFiles({ name: 'allowed.csv', mimeType: 'text/csv', buffer: Buffer.from('unit_code\nKG') });
        await summary().filter({ hasText: /^0 rows will export/ }).waitFor();
        assert(await action().isDisabled());
        let book = await fullReport();
        assert.equal(metric(sheet(book, 'Validation context'), 'Reference check'), 'Run');
        await unit().getByLabel('Upload allowed unit CSV').setInputFiles({ name: 'bad.csv', mimeType: 'text/csv', buffer: Buffer.from('wrong\nEA') });
        await unit().getByRole('alert').waitFor();
        await tab('Data export').click();
        assert.equal((await exportRows()).length, 1);
        book = await fullReport();
        assert.equal(metric(sheet(book, 'Validation context'), 'Reference check'), 'Not run');
        await upload('product.csv', 'Product ID,Description,Base Unit\n0002,New,EA');
        await summary().waitFor();
        assert.match(await unit().innerText(), /Not run.*presence only/);
        record(phase + ': active/rejected/replaced references and actual report boundaries');
    }
    // An obsolete Excel read completing after a replacement cannot overwrite any profile's source.
    for (const c of process.env.R04_FOCUS ? [] : profiles) {
        phase = c.id + ' stale read';
        await choose(c);
        await page.evaluate(() => { window.pendingR04 = []; window.originalR04 = File.prototype.arrayBuffer; File.prototype.arrayBuffer = function (...args) { return new Promise((resolve, reject) => window.pendingR04.push(() => window.originalR04.apply(this, args).then(resolve, reject))); }; });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['OLD'], ['obsolete']]), 'Old');
        await upload('obsolete.xlsx', XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));
        await page.getByRole('button', { name: 'Cancel file', exact: true }).waitFor();
        await noResults();
        await page.getByRole('button', { name: 'Cancel file', exact: true }).click();
        await page.evaluate(() => File.prototype.arrayBuffer = window.originalR04);
        await page.getByRole('button', { name: 'Try example file', exact: true }).click();
        await summary().waitFor();
        await page.evaluate(async () => { await Promise.all(window.pendingR04.map(read => read())); });
        await verifyCounts(c);
        await verifyRows(c);
        record(phase + ': late completion cannot restore cancelled source');
    }
    // Boundary runs and direct replacement while the prior Excel file is still loading.
    for (const c of process.env.R04_PROFILES ? [] : profiles) {
        phase = c.id + ' boundaries/replace';
        await choose(c);
        const source = Papa.parse(fixtureData[c.id], { skipEmptyLines: true }).data;
        const good = [source[0], source[1]];
        await upload('ready.csv', Papa.unparse(good));
        await ready(c);
        assert.match(await summary().innerText(), /^1 row will export/);
        let book = await fullReport();
        assert.equal(sheet(book, 'Rows')[0].status, 'Ready');
        assert.equal(sheet(book, 'Issues').length, 0);
        assert(await page.getByRole('button', { name: 'Download issue report', exact: true }).isDisabled());
        const bad = good.map(r => [...r]);
        bad[1][0] = '';
        await upload('blocked.csv', Papa.unparse(bad));
        await ready(c);
        assert.match(await summary().innerText(), /^0 rows will export/);
        await tab('Data export').click();
        for (const type of ['csv', 'xlsx', 'txt', 'tsv', 'json']) {
            await format().selectOption(type);
            assert(await action().isDisabled());
        }
        book = await fullReport();
        assert.equal(sheet(book, 'Rows')[0].export_decision, 'excluded_from_clean_export');
        assert(sheet(book, 'Issues').length > 0);
        await page.evaluate(() => { window.pendingR04 = []; window.originalR04 = File.prototype.arrayBuffer; File.prototype.arrayBuffer = function (...args) { return new Promise((resolve, reject) => window.pendingR04.push(() => window.originalR04.apply(this, args).then(resolve, reject))); }; });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['OLD'], ['obsolete']]), 'Old');
        await upload('obsolete.xlsx', XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));
        await page.getByRole('button', { name: 'Cancel file', exact: true }).waitFor();
        await noResults();
        await page.evaluate(() => File.prototype.arrayBuffer = window.originalR04);
        await upload('replacement.csv', Papa.unparse(good));
        await ready(c);
        await page.evaluate(async () => { await Promise.all(window.pendingR04.map(read => read())); });
        assert.equal((await exportRows())[0][c.key], c.ids[0]);
        book = await fullReport();
        assert.equal(metric(sheet(book, 'Validation context'), 'Source filename'), 'replacement.csv');
        assert.equal(sheet(book, 'Rows').length, 1);
        record(phase + ': all-ready/empty issues; all-blocked disables every data format; direct replacement wins over late Excel completion');
    }
    assert.deepEqual(errors, []);
    assert.deepEqual(unexpected, []);
    await fs.writeFile(path.join(output, process.env.R04_FOCUS ? 'lifecycle-results.json' : 'results.json'), JSON.stringify({ date: '2026-10-31', baseCommit: process.env.R04_BASE_COMMIT || 'unspecified', matrix, checks, errors, unexpected, environment: 'Local production build; automated Chromium integration; not live acceptance' }, null, 2));
    record('Selected integration scenarios passed; no page errors or source-data network requests');
    console.table(matrix);
}
main().catch(async (e) => { console.error('FAIL ' + phase, e); if (page) {
    console.log((await page.locator('body').innerText()).slice(-2400));
    await fs.mkdir(output, { recursive: true });
    await page.screenshot({ path: path.join(output, 'failure.png'), fullPage: true });
} process.exitCode = 1; }).finally(async () => { await browser?.close(); server?.kill(); });
