import type { ParsedRow } from "@/lib/parseCsv";
import type { MasterDataIssue } from "@/lib/profiles/masterDataWorkspaceConfig";
import { priceListProfile } from "@/lib/profiles/priceListProfile";
import { ReviewRecord } from "@/components/data-preflight/ReviewRecord";

export function PriceListReviewRecord({ row, rowIndex, issues, expanded, onToggle }: {
  row: ParsedRow;
  rowIndex: number;
  issues: MasterDataIssue[];
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <ReviewRecord
      title={row.product_id || "Missing product ID"}
      subtitle={`${row.price_list_id || "Missing price list"} · ${row.currency || "Missing currency"} · ${row.unit || "Missing unit"} · Price ${row.unit_price || "—"}`}
      rowIndex={rowIndex}
      issues={issues}
      expanded={expanded}
      onToggle={onToggle}
      fields={priceListProfile.fields.map(({ key, label }) => ({ label, value: row[key] }))}
    />
  );
}
