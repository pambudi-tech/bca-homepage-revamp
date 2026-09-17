export type ComparisonTab = "benefits" | "features" | "fees" | "requirements" | "limit" | "payments";

export type ComparisonPoint = {
  label: string;
  description?: string;
  bullets?: string[];
};

export type ComparisonGroup = {
  title: string;
  points: ComparisonPoint[];
};

export type ComparisonSection = {
  key: ComparisonTab;
  groups: ComparisonGroup[];
};

export function splitComparisonSections(rawSections: ComparisonSection[]) {
  return rawSections.flatMap((section) => {
    if (section.key !== "requirements" || section.groups.length < 3) return [section];
    return [
      { key: "requirements" as const, groups: [section.groups[0]] },
      { key: "limit" as const, groups: [{ title: "", points: section.groups[1].points }] },
      { key: "payments" as const, groups: [{ title: "", points: section.groups[2].points }] },
    ];
  });
}
