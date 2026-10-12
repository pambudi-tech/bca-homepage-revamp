export function blueprintRole(node: HTMLElement): string {
  if (node.dataset.blueprintPart) return node.dataset.blueprintPart;
  const tag = node.tagName;
  const css = getComputedStyle(node);
  const source = node.getAttribute("src") ?? "";
  if (node.matches(".glass-panel")) return "contentPanel";
  if (node.matches(".prio-button,.solitaire-button")) return "button";
  if (tag === "INPUT") return "input";
  if (tag === "SELECT") return "select";
  if (tag === "LABEL") return "fieldLabel";
  if (tag === "BUTTON") return node.querySelector(".glass-panel") ? "card" : "button";
  if (/^H[1-6]$/.test(tag)) return "title";
  if (tag === "IMG" || node.matches(".prio-button__icon,.priosoli-chip__icon")) {
    if (/calendar/.test(source)) return "calendarIcon";
    if (/download/.test(source)) return "downloadIcon";
    if (/arrow|chevron|pelajari/.test(source)) return "arrowIcon";
    if (/logo/.test(source) || css.objectFit === "contain") return "logo";
    if (css.objectFit === "cover") return "cover";
    return "icon";
  }
  if (node.matches(".prio-button__label")) return "actionLabel";
  if (node.closest("[role=alert]") || node.className.includes("text-red")) return "errorMessage";
  if (css.textTransform === "uppercase") return "eyebrow";
  if (node.parentElement?.querySelector('img[src*="calendar"]')) return "publicationDate";
  if (node.className.includes("line-clamp") && Number(css.fontWeight) >= 600 && parseFloat(css.fontSize) >= 16) return "title";
  if (node.previousElementSibling?.matches("h1,h2,h3,h4,p")) return "description";
  if (node.closest("a,button")) return "actionLabel";
  return "description";
}
