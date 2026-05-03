"use client";

import { useMemo, useState } from "react";
import { parseCsvFile, type CsvRow } from "@/lib/parseCsv";

export function CsvUploader() {
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const parsedRows = await parseCsvFile(file);
    const detectedHeaders = Object.keys(parsedRows[0] ?? {});

    setRows(parsedRows);
    setHeaders(detectedHeaders);
    setSelectedFields(detectedHeaders);
  }

  function toggleField(field: string) {
    setSelectedFields((currentFields) => {
      if (currentFields.includes(field)) {
        return currentFields.filter((item) => item !== field);
      }

      return [...currentFields, field];
    });
  }

  const selectedRows = useMemo(() => {
    return rows.map((row) => {
      const selectedRow: CsvRow = {};

      selectedFields.forEach((field) => {
        selectedRow[field] = row[field] ?? "";
      });

      return selectedRow;
    });
  }, [rows, selectedFields]);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-5xl space-y-8">
        <section>
          <h1 className="text-3xl font-bold">DataPreflight</h1>
          <p className="mt-2 text-slate-400">
            Upload a CSV file, detect fields, and choose what should continue
            through the pipeline.
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

        {headers.length > 0 && (
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Detected fields</h2>
            <p className="mt-1 text-sm text-slate-400">
              Select which fields should be included in the output.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {headers.map((header) => (
                <label
                  key={header}
                  className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950 p-3 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={selectedFields.includes(header)}
                    onChange={() => toggleField(header)}
                  />
                  <span>{header}</span>
                </label>
              ))}
            </div>
          </section>
        )}

        {selectedRows.length > 0 && (
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Selected data preview</h2>
            <p className="mt-1 text-sm text-slate-400">
              Total rows: {selectedRows.length} | Selected fields:{" "}
              {selectedFields.length}
            </p>

            <pre className="mt-4 max-h-[500px] overflow-auto rounded-lg bg-slate-950 p-4 text-sm text-slate-300">
              {JSON.stringify(selectedRows, null, 2)}
            </pre>
          </section>
        )}
      </div>
    </main>
  );
}
