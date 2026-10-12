import { getTranslations } from "next-intl/server";

export async function getInformationPageLinks(brand: "prioritas" | "solitaire", currentSlug: string) {
  const [about, riplay, branch, information] = await Promise.all([
    getTranslations("prioritasAbout"),
    getTranslations("prioritasRiplay"),
    getTranslations("prioritasFindBranch"),
    getTranslations("brandInformation"),
  ]);
  return [
    { slug: "tentang-kami", label: about("title") },
    { slug: "riplay", label: riplay("title") },
    { slug: "ketentuan", label: information("pages.terms.title") },
    { slug: "kebijakan-privasi", label: information("pages.privacy.title") },
    { slug: "hubungi-kami", label: information("pages.contact.title") },
    { slug: "temukan-kami", label: branch("title") },
  ].filter(page => page.slug !== currentSlug).map(page => ({ href: `/${brand}/${page.slug}`, label: page.label }));
}
