import type { ParsedRow } from "@/lib/parseCsv";
import type { MasterDataIssue } from "@/lib/profiles/masterDataWorkspaceConfig";
import { stockBalancesProfile } from "@/lib/profiles/stockBalancesProfile";
import { ReviewRecord } from "@/components/data-preflight/ReviewRecord";

export function StockBalancesReviewRecord({ row, rowIndex, issues, expanded, onToggle }: {
  row: ParsedRow;
  rowIndex: number;
  issues: MasterDataIssue[];
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <ReviewRecord
      title={row.product_id || "Missing product ID"}
      subtitle={`${row.warehouse_id || "Missing warehouse"} · Quantity ${row.quantity || "—"} ${row.unit || "Missing unit"}`}
      rowIndex={rowIndex}
      issues={issues}
      expanded={expanded}
      onToggle={onToggle}
      fields={stockBalancesProfile.fields.map(({ key, label }) => ({ label, value: row[key] }))}
    />
  );
}
