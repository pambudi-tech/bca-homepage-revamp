import { blueprintRole } from "./blueprint-parts";
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
export type SpecProperty = { key: string; value: string; token?: string; color?: string; gradient?: string };
export type PartSpecs = { role: string; content?: string; composition?: string[]; typography: SpecProperty[]; layout: SpecProperty[]; colors: SpecProperty[] };
export type ElementSpecs = { dimensions: string; parts: PartSpecs[] };

/** Reuse each node declaration scan within one inspection pass. */
let inspectionDeclarations: Map<HTMLElement, Map<string, string>> | undefined;
/** Read declarations on this node only. Child tokens belong to their own properties. */
function declarationsFor(target: HTMLElement, pseudo = "") {
  const cached = pseudo ? undefined : inspectionDeclarations?.get(target);
  if (cached) return cached;
  const result = new Map<string, string>();
  const apply = (style: CSSStyleDeclaration) => {
    for (const match of style.cssText.matchAll(/(?:^|;)\s*([\w-]+)\s*:\s*([^;]+)/g)) result.set(match[1], match[2]);
  };
  const selectorFor = (selector: string) => pseudo ? selector.includes(pseudo) ? selector.replaceAll(pseudo, "") : null : selector;
  for (const rule of applicationRules()) {
    const selector = selectorFor(rule.selector);
    try { if (selector && target.matches(selector)) apply(rule.style); } catch { /* Skip unsupported selectors. */ }
  }
  const state = target.closest("[data-catalog-state]")?.getAttribute("data-catalog-state");
  if (state) for (const rule of applicationRules()) {
    const pattern = state === "hover" ? /(?<!\\):hover(?![-\w])/g : /(?<!\\):(focus-visible|focus)(?![-\w])/g;
    if (!pattern.test(rule.selector)) continue;
    pattern.lastIndex = 0;
    const selector = selectorFor(rule.selector);
    try { if (selector && target.matches(selector.replace(pattern, ":where(*)"))) apply(rule.style); } catch { /* Skip unsupported selectors. */ }
  }
  if (!pseudo) apply(target.style);
  if (!pseudo) inspectionDeclarations?.set(target, result);
  return result;
}
function propertyToken(node: HTMLElement, property: string, inherited = false, pseudo = ""): string | undefined {
  for (let target: HTMLElement | null = node; target; target = inherited ? target.parentElement : null) {
    const declarations = declarationsFor(target, target === node ? pseudo : "");
    const value = declarations.get(property);
    if (!value) continue;
    const tokens = [...value.matchAll(/var\((--(?:color|text|font|radius|spacing|shadow)[\w-]*)/g)].map(match => match[1]);
    if (tokens.length) return tokens.map(token => token.replace(/^--(?:color-)?/, "")).join(" · ");
    // A literal override must not inherit an unrelated token.
    if (value !== "inherit") return undefined;
  }
}
function normalizedColor(value: string) {
  // Preserve authored RGB channels without canvas alpha premultiplication rounding.
  const rgb = value.match(/^rgba?\(\s*([\d.]+)[, ]+([\d.]+)[, ]+([\d.]+)(?:\s*[,/]\s*([\d.]+))?\s*\)$/);
  if (rgb) {
    const hex = `#${rgb.slice(1, 4).map(channel => Math.round(Number(channel)).toString(16).padStart(2, "0")).join("")}`;
    const alpha = rgb[4] === undefined ? 1 : Number(rgb[4]);
    return alpha === 1 ? hex : `${hex} · ${Math.round(alpha * 100)}%`;
  }
  const context = document.createElement("canvas").getContext("2d");
  if (!context) return value;
  context.canvas.width = context.canvas.height = 1;
  context.fillStyle = value;
  context.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
  const hex = `#${[r, g, b].map(channel => channel.toString(16).padStart(2, "0")).join("")}`;
  return a === 255 ? hex : `${hex} · ${Math.round(a / 255 * 100)}%`;
}
function colorProperty(key: string, node: HTMLElement, property: string, pseudo = ""): SpecProperty {
  const value = getComputedStyle(node, pseudo || null).getPropertyValue(property);
  if (value === "rgba(0, 0, 0, 0)" || value === "transparent") return { key, value: "transparent", color: "transparent" };
  const normalized = normalizedColor(value);
  let token = propertyToken(node, property, property === "color", pseudo);
  if (!token) {
    const names = new Set(applicationRules().flatMap(rule => [...rule.style.cssText.matchAll(/(--color-[\w-]+)\s*:/g)].map(match => match[1])));
    const computed = getComputedStyle(node);
    token = [...names].find(name => { const candidate = computed.getPropertyValue(name).trim(); return candidate && normalizedColor(candidate) === normalized; })?.replace("--color-", "");
  }
  return { key, value: normalized, color: value, token };
}
function inspectPart(element: HTMLElement, hasText: boolean): Omit<PartSpecs, "role"> {
  const css = getComputedStyle(element);
  const text = element;
  const textCss = getComputedStyle(text);
  const typography: SpecProperty[] = [
    {key:"fontFamily", value:textCss.fontFamily.split(",")[0].replaceAll('"', ""), token:propertyToken(text,"font-family",true)},
    {key:"fontSize",value:textCss.fontSize,token:propertyToken(text,"font-size",true)},
    {key:"lineHeight",value:textCss.lineHeight,token:propertyToken(text,"line-height",true)},
    {key:"fontWeight",value:textCss.fontWeight,token:propertyToken(text,"font-weight",true)},
  ];
  if (parseFloat(textCss.letterSpacing)) typography.push({key:"letterSpacing",value:textCss.letterSpacing,token:propertyToken(text,"letter-spacing",true)});
  const layout: SpecProperty[] = [];
  const padding = [css.paddingTop, css.paddingRight, css.paddingBottom, css.paddingLeft];
  if (padding.some(value => parseFloat(value))) {
    if (padding[0] === padding[2] && padding[1] === padding[3]) {
      if (parseFloat(padding[1])) layout.push({key:"paddingHorizontal",value:padding[1]});
      if (parseFloat(padding[0])) layout.push({key:"paddingVertical",value:padding[0]});
    } else ["paddingTop","paddingRight","paddingBottom","paddingLeft"].forEach((key,i)=>layout.push({key,value:padding[i]}));
  }
  if (parseFloat(css.rowGap) && css.rowGap === css.columnGap) layout.push({key:"gap",value:css.rowGap,token:propertyToken(element,"gap")});
  else {
  if (parseFloat(css.rowGap)) layout.push({key:"rowGap",value:css.rowGap,token:propertyToken(element,"row-gap") ?? propertyToken(element,"gap")});
  if (parseFloat(css.columnGap)) layout.push({key:"columnGap",value:css.columnGap,token:propertyToken(element,"column-gap") ?? propertyToken(element,"gap")});
  }
  if (parseFloat(css.borderRadius)) layout.push({key:"radius",value:css.borderRadius,token:propertyToken(element,"border-radius")});
  const border = [css.borderTopWidth,css.borderRightWidth,css.borderBottomWidth,css.borderLeftWidth];
  const hasBorder = border.some(value=>parseFloat(value));
  if (hasBorder) layout.push({key:"borderWidth",value:css.borderWidth});
  if (Number(css.opacity) < 1) layout.push({key:"opacity",value:`${Math.round(Number(css.opacity)*100)}%`});
  const colors = [colorProperty("background",element,"background-color")];
  if (hasText) colors.push(colorProperty("text",text,"color"));
  if (css.backgroundImage !== "none") colors.unshift({key:"backgroundFill",value:"gradient",gradient:css.backgroundImage,token:propertyToken(element,"background-image") ?? propertyToken(element,"background")});
  if (hasBorder) colors.push(colorProperty("border",element,"border-color"));
  // Glass panels paint their border with a masked gradient, so borderWidth alone is incomplete.
  for (const pseudo of ["::before", "::after"]) {
    const surface = getComputedStyle(element, pseudo);
    if (surface.content === "none" || surface.content === "normal" || surface.display === "none" || surface.visibility === "hidden" || Number(surface.opacity) === 0) continue;
    const widths = [surface.borderTopWidth, surface.borderRightWidth, surface.borderBottomWidth, surface.borderLeftWidth];
    if (widths.some(value => parseFloat(value))) {
      layout.push({key:"decorativeBorderWidth",value:surface.borderWidth,token:propertyToken(element,"border-width",false,pseudo)});
      colors.push(colorProperty("decorativeBorder",element,"border-color",pseudo));
    }
    const maskedRing = /exclude|xor/.test(`${surface.maskComposite} ${surface.getPropertyValue("-webkit-mask-composite")}`);
    const thickness = Math.max(...[surface.paddingTop,surface.paddingRight,surface.paddingBottom,surface.paddingLeft].map(value => parseFloat(value) || 0));
    if (maskedRing && thickness) {
      layout.push({key:"decorativeBorderWidth",value:`${thickness}px`,token:propertyToken(element,"padding",false,pseudo)});
      if (surface.backgroundImage !== "none") colors.push({key:"decorativeBorder",value:"gradient",gradient:surface.backgroundImage,token:propertyToken(element,"background",false,pseudo) ?? propertyToken(element,"background-image",false,pseudo)});
      else colors.push(colorProperty("decorativeBorder",element,"background-color",pseudo));
    }
  }
  // Tailwind rings are zero-blur box shadows. Keep blurred elevation shadows out of border specs.
  const shadows = css.boxShadow.split(/,(?![^()]*\))/);
  for (const shadow of shadows) {
    const color = shadow.match(/(?:rgba?|oklab|oklch|color)\([^)]*\)/)?.[0];
    const lengths = shadow.replace(/(?:rgba?|oklab|oklch|color)\([^)]*\)/g, "").match(/-?[\d.]+px/g)?.map(parseFloat) ?? [];
    if (!color || lengths.length < 4 || lengths[0] !== 0 || lengths[1] !== 0 || lengths[2] !== 0 || lengths[3] <= 0) continue;
    if (normalizedColor(color).endsWith("· 0%")) continue;
    layout.push({key:"ringWidth",value:`${lengths[3]}px`});
    colors.push({key:"ringColor",value:normalizedColor(color),color,token:propertyToken(element,shadow.includes("inset") ? "--tw-inset-ring-color" : "--tw-ring-color") ?? propertyToken(element,"--tw-ring-color") ?? propertyToken(element,"--tw-inset-ring-color")});
  }
  if (css.outlineStyle !== "none" && parseFloat(css.outlineWidth)) {
    layout.push({key:"outlineWidth",value:css.outlineWidth});
    colors.push(colorProperty("outlineColor",element,"outline-color"));
  }
  const indicator = element.querySelector<HTMLElement>("span.absolute.bottom-0.h-1");
  if (indicator) colors.push(colorProperty("indicator",indicator,"background-color"));
  return {typography: hasText ? typography : [],layout,colors};
}

/** Keep each measured property attached to its actual, named DOM part. */
export function inspectElement(element: HTMLElement, textSelector?: string): ElementSpecs {
  inspectionDeclarations = new Map();
  const rect = element.getBoundingClientRect();
  const scale = Number(element.closest("[data-catalog-preview-scale]")?.getAttribute("data-catalog-preview-scale")) || 1;
  const nodes = new Set([element, ...element.querySelectorAll<HTMLElement>("[data-blueprint-part],[data-blueprint-component],h1,h2,h3,h4,h5,h6,p,label,input,select,button,a,.glass-panel,.soft-light-border,.prio-button__label,.prio-button,.solitaire-button")]);
  if (textSelector) element.querySelectorAll<HTMLElement>(textSelector).forEach(node => nodes.add(node));
  const parts: PartSpecs[] = [];
  for (const node of nodes) {
    const bounds = node.getBoundingClientRect();
    const css = getComputedStyle(node);
    if (!bounds.width || !bounds.height || css.visibility === "hidden" || css.opacity === "0") continue;
    const composite = node.closest<HTMLElement>(".prio-button,.solitaire-button,[data-blueprint-component]");
    if (composite && composite !== element && composite !== node) continue;
    const content = (node.getAttribute("aria-label") || node.getAttribute("alt") || (node instanceof HTMLInputElement ? node.value || node.placeholder : node.textContent) || "").trim().replace(/\s+/g, " ");
    if (composite === node && node !== element) {
      const brand = node.classList.contains("solitaire-button") || node.dataset.blueprintTone?.includes("solitaire") ? "solitaire" : node.dataset.blueprintTone?.includes("prioritas") || node.classList.contains("prio-button") ? "prioritas" : "default";
      const recipe = node.dataset.blueprintComponent === "tab" ? ["tab", node.dataset.blueprintVariant!, node.dataset.blueprintSize!, brand] : ["button", brand, ...Array.from(node.classList).filter(name => /^(prio-button|solitaire-button)--/.test(name)).map(name => name.split("--")[1]).filter(value => value !== "button")];
      parts.push({role: node.dataset.blueprintComponent === "tab" ? "tab" : "button", content, composition: recipe.filter(Boolean), typography: [], layout: [], colors: []});
      continue;
    }
    // Container text is not a typography sample: measure the leaf carrying it.
    const hasText = Boolean(content) && (node.matches("input,select") || !node.querySelector("h1,h2,h3,h4,h5,h6,p,label,input,select,button,a,.prio-button__label") && Array.from(node.childNodes).some(child => child.nodeType === Node.TEXT_NODE && child.textContent?.trim()));
    const isPanel = node.matches(".glass-panel,.soft-light-border");
    if (node !== element && !hasText && !isPanel && !node.dataset.blueprintPart) continue;
    parts.push({role: node === element ? "component" : blueprintRole(node), content: hasText ? content : undefined, ...inspectPart(node, hasText)});
  }
  inspectionDeclarations = undefined;
  return {dimensions: `${Math.round(rect.width/scale)} × ${Math.round(rect.height/scale)} px`, parts};
}

export function sizingBehavior(element: HTMLElement, axis: "width" | "height", boundary: HTMLElement): "fixed" | "dynamic" | "content" {
  let node: HTMLElement | null = element;
  while (node && node !== boundary) {
    let value = "";
    for (const rule of applicationRules()) {
      try { if (node.matches(rule.selector)) value = rule.style.getPropertyValue(axis) || rule.style.getPropertyValue(axis === "width" ? "inline-size" : "block-size") || value; } catch { /* Pseudo-elements do not represent a measured element. */ }
    }
    value = node.style.getPropertyValue(axis) || value;
    if (/^(auto|fit-content|max-content|min-content)$/.test(value)) return "content";
    if (value.includes("%") || (!value && getComputedStyle(node).position === "absolute" && getComputedStyle(node)[axis === "width" ? "left" : "top"] !== "auto" && getComputedStyle(node)[axis === "width" ? "right" : "bottom"] !== "auto")) {
      node = node.parentElement;
      continue;
    }
    if (/[sdl]?v[whib]|cq[whib]|stretch/.test(value)) return "dynamic";
    if (value) return "fixed";
    if (axis === "height" && getComputedStyle(node).aspectRatio !== "auto") return "dynamic";
    return axis === "height" || /^(inline|inline-flex|inline-block)$/.test(getComputedStyle(node).display) ? "content" : "dynamic";
  }
  return "dynamic";
}
