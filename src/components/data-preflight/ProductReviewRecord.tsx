import type { ParsedRow } from "@/lib/parseCsv";
import type { MasterDataIssue } from "@/lib/profiles/masterDataWorkspaceConfig";
import { ReviewRecord } from "@/components/data-preflight/ReviewRecord";

export function ProductReviewRecord({ row, rowIndex, issues, expanded, onToggle }: {
  row: ParsedRow;
  rowIndex: number;
  issues: MasterDataIssue[];
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <ReviewRecord
      title={row.product_id || "Row " + rowIndex}
      subtitle={row.description}
      context={row.base_unit}
      rowIndex={rowIndex}
      issues={issues}
      expanded={expanded}
      onToggle={onToggle}
      fields={[
        { label: "Product ID", value: row.product_id },
        { label: "Description", value: row.description },
        { label: "Base unit", value: row.base_unit },
      ]}
    />
  );
}
