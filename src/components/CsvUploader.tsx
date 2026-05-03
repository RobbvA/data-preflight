"use client";

import { useState } from "react";
import { parseCsvFile, type CsvRow } from "@/lib/parseCsv";

export function CsvUploader() {
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [fileName, setFileName] = useState("");

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const parsedRows = await parseCsvFile(file);
    setRows(parsedRows);
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-5xl space-y-8">
        <section>
          <h1 className="text-3xl font-bold">DataPreflight</h1>
          <p className="mt-2 text-slate-400">
            Upload a CSV file and inspect the parsed data before validation.
          </p>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <label className="block text-sm font-medium text-slate-300">
            Upload CSV
          </label>

          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="mt-4 block w-full text-sm text-slate-300"
          />

          {fileName && (
            <p className="mt-3 text-sm text-slate-400">
              Selected file: {fileName}
            </p>
          )}
        </section>

        {rows.length > 0 && (
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Parsed rows</h2>
            <p className="mt-1 text-sm text-slate-400">
              Total rows: {rows.length}
            </p>

            <pre className="mt-4 max-h-[500px] overflow-auto rounded-lg bg-slate-950 p-4 text-sm text-slate-300">
              {JSON.stringify(rows, null, 2)}
            </pre>
          </section>
        )}
      </div>
    </main>
  );
}
