const root = "/assets/prioritas/banking-solution";
const banking = "/assets/prioritas/banking";

export const bankingPrivilegeItems = [
  { id: "jcb-black", key: "jcb", image: `${root}/jcb-welcome-bonus.webp` },
  { id: "kkb", key: "vehicle", image: `${banking}/privilege-vehicle.webp` },
  { id: "layanan-cabang", key: "branch", image: `${banking}/privilege-branch.webp` },
  { id: "asuransi", key: "insurance", image: `${root}/insurance.webp` },
  { id: "biaya-transaksi", key: "fees", image: `${root}/special-transaction-fees.webp` },
  { id: "fitur-transaksi", key: "transaction", image: `${banking}/privilege-transaction.webp` },
  { id: "media-informasi", key: "media", image: `${root}/information-media.webp` },
  { id: "personal-banker", key: "advisor", image: `${root}/branch-service-advisor.webp` },
  { id: "young-community", key: "family", image: `${root}/branch-service-family.webp` },
  { id: "contact-center", key: "contact", image: `${root}/contact-center.webp` },
  { id: "kartu-kredit", key: "credit", image: `${banking}/privilege-credit.webp` },
  { id: "kpr", key: "home", image: `${banking}/privilege-home.webp` },
  { id: "ksm", key: "motorcycle", image: `${root}/motorcycle-loan.webp` },
  { id: "merchant-edc", key: "merchant", image: `${root}/merchant-edc.webp` },
  { id: "safe-deposit-box", key: "deposit", image: `${banking}/privilege-deposit.webp` },
  { id: "valuta-asing", key: "forex", image: `${root}/foreign-exchange.webp` },
] as const;

export function getBankingPrivilegeItem(id: string) {
  return bankingPrivilegeItems.find((item) => item.id === id);
}
