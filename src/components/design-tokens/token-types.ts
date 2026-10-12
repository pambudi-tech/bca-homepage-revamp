export const tokenSections = ['colors', 'typography', 'spacing', 'radius', 'effects', 'breakpoints', 'motion'] as const;
export const visibleTokenSections = ['colors', 'typography', 'effects', 'breakpoints'] as const;
export type TokenSection = typeof tokenSections[number];
export type TokenSource = 'project' | 'tailwind' | 'recipe' | 'figma';
export const colorCategories = {
  main: ['neutral', 'pbrown', 'pgold', 'blue', 'cyan'],
  semantic: ['green', 'yellow', 'red'],
  accent: ['bermuda', 'brown', 'muddy', 'orange', 'purple', 'tosca', 'teal'],
} as const;

export type TokenUsage = {
  name: string;
  rules: { sourcePath: string; scope: string; value: string }[];
};

export type DesignToken = {
  name: string;
  value: string;
  resolved: string;
  source: TokenSource;
  sourcePath?: string;
  group: string;
  utility: string;
  colorUsages?: TokenUsage[];
  typographyUsages?: TokenUsage[];
  pixels?: number;
  lineHeight?: string;
  tracking?: string;
  weight?: string;
  trim?: boolean;
  implementationValue?: string;
  implementationName?: string;
  comparisonName?: string;
  aliasOf?: string;
  aliases?: string[];
  differences?: { field: 'value' | 'fontSize' | 'lineHeight' | 'tracking' | 'weight' | 'trim'; reference: string; current: string }[];
  implementationStatus?: 'match' | 'different' | 'missing';
};

export type TokenData = {
  glassExample: { id: string; image: string; title: string };
  sections: Record<TokenSection, DesignToken[]>;
  spacingUnit: string;
  tabletMin: number;
  desktopMin: number;
};
