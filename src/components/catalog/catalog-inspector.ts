/** Read the application's loaded CSS. Catalog states reuse these declarations verbatim. */
type Rule = { selector: string; style: CSSStyleDeclaration };
let cache: Rule[] = [];
let sheetCount = 0;
export function applicationRules(): Rule[] {
  if (cache.length && sheetCount === document.styleSheets.length) return cache;
  const result: Rule[] = [];
  const walk = (rules: CSSRuleList, parent = "") => {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSMediaRule && rule.conditionText !== "(hover: hover)" && !matchMedia(rule.conditionText).matches) continue;
      if (rule instanceof CSSSupportsRule && !CSS.supports(rule.conditionText)) continue;
      if (rule instanceof CSSStyleRule) {
        const selector = parent ? rule.selectorText.includes("&") ? rule.selectorText.replaceAll("&", `:is(${parent})`) : `:is(${parent}) ${rule.selectorText}` : rule.selectorText;
        if (rule.style.length) result.push({ selector, style: rule.style });
        if (rule.cssRules) walk(rule.cssRules, selector);
      } else if ("style" in rule && parent) {
        // Native CSS nesting exposes declarations inside @media as
        // CSSNestedDeclarations, rather than a CSSStyleRule.
        const style = rule.style as CSSStyleDeclaration;
        if (style.length) result.push({ selector: parent, style });
      } else if ("cssRules" in rule) walk((rule as CSSGroupingRule).cssRules, parent);
    }
  };
  for (const sheet of Array.from(document.styleSheets)) {
    if ((sheet.ownerNode as HTMLElement | null)?.dataset.catalogStates) continue;
    try { walk(sheet.cssRules); } catch { /* External sheets are not part of the local component styles. */ }
  }
  cache = result;
  sheetCount = document.styleSheets.length;
  return result;
}
export function resetRuleCache() { cache = []; }
export function forcedStateCSS() {
  return applicationRules().filter(({selector}) => /(?<!\\):(hover|focus-visible|focus)(?![-\w])/.test(selector)).map(({selector, style}) => {
    const state = /(?<!\\):hover/.test(selector) ? "hover" : "focus";
    const forced = selector.replace(/(?<!\\):(hover|focus-visible|focus)(?![-\w])/g, ":where(*)");
    return `:where([data-catalog-state="${state}"]) :is(${forced}) { ${style.cssText} }`;
  }).join("\n");
}
export type ElementSpecs = { dimensions: string; typography: string; colors: string; spacing: string; tokens: string; classes: string };
export function inspectElement(element: HTMLElement, textSelector?: string): ElementSpecs {
  const css = getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  const previewScale = Number(element.closest("[data-catalog-preview-scale]")?.getAttribute("data-catalog-preview-scale")) || 1;
  const text = (textSelector ? element.querySelector<HTMLElement>(textSelector) : null) ?? element.querySelector<HTMLElement>("h1,h2,h3,h4,p") ?? element.querySelector<HTMLElement>(".prio-button__label,input,button,label") ?? element;
  const textCss = getComputedStyle(text);
  const tokens = new Set<string>();
  const roles = new Map<string, Set<string>>();
  const surface = element.querySelector<HTMLElement>(".glass-panel") ?? (css.backgroundColor === "rgba(0, 0, 0, 0)" ? element.firstElementChild as HTMLElement | null : null);
  for (const target of [element, text, surface].filter((node): node is HTMLElement => Boolean(node))) {
    const declarations = new Map<string,string>();
    const apply = (style: CSSStyleDeclaration) => {
      // Read authored declarations: CSSOM expands border shorthands into empty
      // longhands when var() is unresolved, and synthesizes misleading shorthands.
      for (const match of style.cssText.matchAll(/(?:^|;)\s*([\w-]+)\s*:\s*([^;]+)/g)) {
        const property = match[1];
        const value = match[2];
        if (property === "border") {
          declarations.delete("border");
          declarations.set("border-color", value);
        } else if (property === "background") {
          declarations.delete("background-color");
          declarations.set("background", value);
        } else declarations.set(property,value);
      }
    };
    const forcedState = target.closest("[data-catalog-state]")?.getAttribute("data-catalog-state");
    for (const rule of applicationRules()) {
      try { if (target.matches(rule.selector)) apply(rule.style); } catch { /* Pseudo-elements cannot be matched against a DOM element. */ }
    }
    if (forcedState) for (const rule of applicationRules()) {
      const pattern = forcedState === "hover" ? /(?<!\\):hover(?![-\w])/g : /(?<!\\):(focus-visible|focus)(?![-\w])/g;
      if (!pattern.test(rule.selector)) continue;
      pattern.lastIndex = 0;
      try { if (target.matches(rule.selector.replace(pattern, ":where(*)"))) apply(rule.style); } catch { /* Unsupported pseudo-elements. */ }
    }
    apply(target.style);
    for (const [property, declaration] of declarations) for (const match of declaration.matchAll(/var\((--(?:color|text|font|shadow|radius|spacing|tracking)[\w-]*)/g)) {
      tokens.add(match[1]);
      const role = property.includes("fill") || property.startsWith("background") ? "Background" : property.includes("ink") || property === "color" ? "Text" : property.includes("border") ? "Border" : property.startsWith("font") || property.startsWith("line") || property.startsWith("letter") ? "Typography" : "Layout / effect";
      if (!roles.has(role)) roles.set(role,new Set());
      roles.get(role)!.add(match[1]);
    }
  }
  return {
    dimensions: `${Math.round(rect.width / previewScale * 10) / 10} × ${Math.round(rect.height / previewScale * 10) / 10} px`,
    typography: `${textCss.fontFamily.split(",")[0]} · ${textCss.fontSize} / ${textCss.lineHeight} · ${textCss.fontWeight}`,
    colors: `background: ${css.backgroundColor}; text: ${textCss.color}; border: ${css.borderColor}`,
    spacing: `padding: ${css.padding}; gap: ${css.gap}; radius: ${css.borderRadius}; border: ${css.borderWidth}`,
    tokens: tokens.size ? [...roles].map(([role, values]) => `${role}: ${[...values].join(" · ")}`).join("\n") : "—",
    classes: `${element.className}${text !== element ? `\n${text.className}` : ""}`,
  };
}
