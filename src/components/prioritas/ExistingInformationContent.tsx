/** HTML is imported from the existing BCA pages and sanitized by the migration
 * script to a fixed tag/attribute allowlist before it enters the message files. */
export default function ExistingInformationContent({ html, brand }: { html: string; brand: "prioritas" | "solitaire" }) {
  return <div
    className={`text-size-body-m leading-6 text-neutral-700 xl:text-size-body-l [&_p]:my-3 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-2 [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-size-body-xl [&_h2]:font-semibold [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-size-body-xl [&_h3]:font-semibold [&_h4]:mt-5 [&_h4]:mb-2 [&_h4]:font-semibold [&_a]:break-words [&_a]:underline [&_a]:underline-offset-4 [&_a]:focus-visible:outline-2 [&_table]:min-w-[640px] [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-neutral-300 [&_th]:bg-neutral-200 [&_th]:p-3 [&_th]:text-left [&_td]:border [&_td]:border-neutral-300 [&_td]:p-3 [&_td]:align-top ${brand === "solitaire" ? "[&_a]:text-neutral-900" : "[&_a]:text-pbrown-600"}`}
    dangerouslySetInnerHTML={{ __html: html.replaceAll("/BRAND/", `/${brand}/`).replaceAll("<table>", '<div class="overflow-x-auto"><table>').replaceAll("</table>", "</table></div>") }}
  />;
}
