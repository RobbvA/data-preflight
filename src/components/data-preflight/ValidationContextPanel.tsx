"use client";

import { UNIT_REFERENCE_VERSION, type UnitReference } from "@/lib/unitReference";
import { downloadCsv } from "@/lib/exportData";
import { buildValidationReportRows, type InvoiceValidationContext, type PriceValidationContext, type StockValidationContext } from "@/lib/validationReport";

type ValidationContextPanelProps<TField extends string> = {
  profile: { id: string; name: string; version: string };
  fileName: string;
  sheetName?: string;
  unitReference?: UnitReference | null;
  invoiceContext?: InvoiceValidationContext;
  priceContext?: PriceValidationContext;
  stockContext?: StockValidationContext;
  mapping: Readonly<Record<TField, string>>;
  counts: {
    total: number;
    blocked: number;
    needsReview: number;
    ready: number;
  };
};

export function ValidationContextPanel<TField extends string>({
  profile,
  fileName,
  sheetName,
  mapping,
  counts,
  unitReference,
  invoiceContext,
  priceContext,
  stockContext,
}: ValidationContextPanelProps<TField>) {
  const appliedMapping: Record<string, string> = Object.fromEntries(
    (Object.entries(mapping) as Array<[string, string]>).sort(
      ([first], [second]) => first.localeCompare(second),
    ),
  );

  function downloadReport() {
    downloadCsv(
      "validation-report.csv",
      buildValidationReportRows({
        profile,
        fileName,
        sheetName,
        mapping,
        counts,
        unitReference,
        invoiceContext,
        priceContext,
        stockContext,
      }),
    );
  }

  return (
    <section
      aria-label="Applied validation context"
      className="mt-5 rounded-xl border border-white/10 bg-[var(--surface-deep)] p-4"
    >
      <details className="text-xs">
        <summary className="cursor-pointer text-sm font-medium text-[var(--text-primary)]">
          Validation details · {profile.name} v{profile.version}
        </summary>

        <dl className="mt-4 grid gap-3 border-t border-white/10 pt-4 sm:grid-cols-2">
          <div>
            <dt className="text-[var(--text-muted)]">Profile ID and version</dt>
            <dd className="mt-1 text-[var(--text-primary)]">
              {profile.id} · v{profile.version}
            </dd>
          </div>

          <div className="min-w-0">
            <dt className="text-[var(--text-muted)]">Source file</dt>
            <dd className="mt-1 break-all text-[var(--text-primary)]">
              {fileName}
            </dd>
          </div>

          {sheetName && (
            <div className="min-w-0">
              <dt className="text-[var(--text-muted)]">Source worksheet</dt>
              <dd className="mt-1 break-all text-[var(--text-primary)]">
                {sheetName}
              </dd>
            </div>
          )}

          <div className="sm:col-span-2">
            <dt className="text-[var(--text-muted)]">Validation result</dt>
            <dd className="mt-1 text-[var(--text-primary)]">
              {counts.total} rows · {counts.blocked} blocked ·{" "}
              {counts.needsReview} need review · {counts.ready} ready
            </dd>
          </div>

          {profile.id === "invoice" && invoiceContext && (
            <div className="sm:col-span-2">
              <dt className="text-[var(--text-muted)]">Amount and VAT notation</dt>
              <dd className="mt-1 text-[var(--text-primary)]">{invoiceContext.invoiceNotation === "point" ? "Decimal point (12.50)" : "Decimal comma (12,50)"}</dd>
              <p className="mt-2 leading-5 text-[var(--text-secondary)]">Amounts and VAT use the chosen text notation; Excel numbers use stored values. Financial comparisons are exact. Tax correctness, live ERP references and target-ERP acceptance are not verified.</p>
            </div>
          )}
          {profile.id === "price-list" && priceContext && (
            <div className="sm:col-span-2">
              <dt className="text-[var(--text-muted)]">Price notation</dt>
              <dd className="mt-1 text-[var(--text-primary)]">{priceContext.priceNotation === "point" ? "Decimal point (12.50)" : "Decimal comma (12,50)"}</dd>
              <p className="mt-2 leading-5 text-[var(--text-secondary)]">Text uses the chosen notation; Excel numbers use stored values without display rounding. ERP code existence, tiers, validity periods and discounts are not checked.</p>
            </div>
          )}
          {profile.id === "stock-balances" && stockContext && (
            <div className="sm:col-span-2">
              <dt className="text-[var(--text-muted)]">Quantity notation</dt>
              <dd className="mt-1 text-[var(--text-primary)]">{stockContext.quantityNotation === "point" ? "Decimal point (12.50)" : "Decimal comma (12,50)"}</dd>
              <p className="mt-2 leading-5 text-[var(--text-secondary)]">One absolute balance per product and warehouse in one snapshot. Zero stock is valid. No stock movements, unit conversion or comparison with previous files. Snapshot date, ERP code existence and actual stock are not verified.</p>
            </div>
          )}
          {profile.id === "product" && (
            <div className="min-w-0 sm:col-span-2">
              <dt className="text-[var(--text-muted)]">Base-unit reference check · v{UNIT_REFERENCE_VERSION}</dt>
              <dd className="mt-1 break-words text-[var(--text-primary)]">
                {unitReference ? `Run · ${unitReference.fileName} · ${unitReference.allowedUnits.length} unique units: ${unitReference.allowedUnits.join(", ")}` : "Not run — no allowed-unit list active."}
              </dd>
            </div>
          )}

          <div className="sm:col-span-2">
            <dt className="font-medium text-[var(--text-secondary)]">
              Applied field mapping
            </dt>
            <dd>
              <dl className="mt-2 grid gap-2 sm:grid-cols-2">
                {Object.entries(appliedMapping).map(([field, header]) => (
                  <div key={field} className="min-w-0">
                    <dt className="text-[var(--text-muted)]">{field}</dt>
                    <dd className="break-all text-[var(--text-primary)]">
                      {header || "Not mapped"}
                    </dd>
                  </div>
                ))}
              </dl>
            </dd>
          </div>
        </dl>

        <button
          type="button"
          onClick={downloadReport}
          className="mt-4 rounded-lg border border-white/15 bg-[var(--surface-raised)] px-3 py-2 text-xs font-medium text-[var(--text-primary)] transition hover:border-[var(--brand-accent)]"
        >
          Download validation report CSV
        </button>
      </details>
    </section>
  );
}