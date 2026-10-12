/** Canonical public detail paths; member and Solitaire routes keep their existing URLs. */
export function privilegeDetailBase(basePath: string, section: "signature" | "complimentary" | "lifestyle"): string {
  const segment = section === "lifestyle" ? "lifestyle-privilege" : basePath === "/prioritas" ? section === "signature" ? "signature-privilege" : "complimentary" : "privilege";
  return `${basePath}/${segment}`;
}
