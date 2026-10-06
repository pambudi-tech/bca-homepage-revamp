import type { Metadata } from "next";
import { generateMetadata as generatePrioritasMetadata } from "../../../../prioritas/member/lifestyle-privilege/[benefitId]/page";

// The content is shared until the Solitaire member details are tailored.
export { default } from "../../../../prioritas/member/lifestyle-privilege/[benefitId]/page";

export async function generateMetadata(props: { params: Promise<{ locale: string; benefitId: string }> }): Promise<Metadata> {
  const metadata = await generatePrioritasMetadata(props);
  return {
    ...metadata,
    title: typeof metadata.title === "string" ? metadata.title.replace("BCA Prioritas", "BCA Solitaire") : metadata.title,
  };
}
