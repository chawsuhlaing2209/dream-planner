import type { Option } from "@/components/table/Cell";

/** Budget lines as select options, grouped by category in sheet order. */
export function budgetLineOptions(
  categories: { id: string; name: string; sort: number }[],
  lines: { id: string; name: string; categoryId: string; sort: number }[],
): Option[] {
  return [...categories]
    .sort((a, b) => a.sort - b.sort)
    .flatMap((c) =>
      lines
        .filter((l) => l.categoryId === c.id)
        .sort((a, b) => a.sort - b.sort)
        .map((l) => ({ value: l.id, label: l.name, group: c.name })),
    );
}
