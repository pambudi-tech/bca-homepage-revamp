"use client";
import { useEffect, useRef } from "react";
import { resetRuleCache } from "./catalog-inspector";

function virtualMedia(query: string, width: number) {
  const pixels = (value: string, unit: string) => Number(value) * (unit === "rem" || unit === "em" ? 16 : 1);
  const test = (value: boolean) => value ? "(min-width: 0px)" : "(max-width: -1px)";
  const evaluated = query.replace(/\(\s*(min|max)-width\s*:\s*([\d.]+)(px|rem|em)\s*\)/g, (_, edge, value, unit) => test(edge === "min" ? width >= pixels(value, unit) : width <= pixels(value, unit)))
    .replace(/\(\s*width\s*(>=|<=|>|<|=)\s*([\d.]+)(px|rem|em)\s*\)/g, (_, op, value, unit) => { const limit = pixels(value, unit); return test(op === ">=" ? width >= limit : op === "<=" ? width <= limit : op === ">" ? width > limit : op === "<" ? width < limit : width === limit); });
  return matchMedia(evaluated).matches;
}
export default function CatalogViewportStyles({ width, screen }: { width: number; screen: string }) {
  const ref = useRef<HTMLStyleElement>(null);
  useEffect(() => {
    const output: string[] = [];
    const resets: string[] = [];
    const emit = (selector: string, style: CSSStyleDeclaration, active: boolean) => {
      const declarations = active ? style.cssText : Array.from(style).map(property => `${property}: revert;`).join(" ");
      (active ? output : resets).push(`:where([data-catalog-screen="${screen}"]) :is(${selector}) { ${declarations} }`);
    };
    const walk = (rules: CSSRuleList, parent = "", active = true) => {
      for (const rule of Array.from(rules)) {
        if (rule instanceof CSSMediaRule) {
          if (/width/.test(rule.conditionText)) walk(rule.cssRules, parent, active && virtualMedia(rule.conditionText, width));
          else if (matchMedia(rule.conditionText).matches) walk(rule.cssRules, parent, active);
          continue;
        }
        if (rule instanceof CSSSupportsRule && !CSS.supports(rule.conditionText)) continue;
        if (rule instanceof CSSStyleRule) {
          const selector = parent ? rule.selectorText.includes("&") ? rule.selectorText.replaceAll("&", `:is(${parent})`) : `:is(${parent}) ${rule.selectorText}` : rule.selectorText;
          if (rule.style.length) emit(selector, rule.style, active);
          if (rule.cssRules) walk(rule.cssRules, selector, active);
        } else if ("style" in rule && parent) emit(parent, rule.style as CSSStyleDeclaration, active);
        else if ("cssRules" in rule) walk((rule as CSSGroupingRule).cssRules, parent, active);
      }
    };
    for (const sheet of Array.from(document.styleSheets)) {
      const owner = sheet.ownerNode as HTMLElement | null;
      if (owner?.hasAttribute("data-catalog-viewport-styles") || owner?.hasAttribute("data-catalog-states")) continue;
      try { walk(sheet.cssRules); } catch { /* Cross-origin styles are outside the component stylesheet. */ }
    }
    if (ref.current) ref.current.textContent = [...resets, ...output].join("\n") + `\n[data-catalog-screen="${screen}"] [data-reveal] {opacity:1;transform:none}`;
    resetRuleCache();
  }, [width, screen]);
  return <style ref={ref} data-catalog-viewport-styles />;
}
