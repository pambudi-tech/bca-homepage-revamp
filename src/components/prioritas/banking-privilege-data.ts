const root = "/assets/prioritas/banking-solution";
const banking = "/assets/prioritas/banking";

export const bankingPrivilegeItems = [
  { id: "jcb-black", key: "jcb", image: `${root}/jcb-welcome-bonus.png` },
  { id: "kkb", key: "vehicle", image: `${banking}/privilege-vehicle.png` },
  { id: "layanan-cabang", key: "branch", image: `${banking}/privilege-branch.png` },
  { id: "asuransi", key: "insurance", image: `${root}/insurance.png` },
  { id: "biaya-transaksi", key: "fees", image: `${root}/special-transaction-fees.png` },
  { id: "fitur-transaksi", key: "transaction", image: `${banking}/privilege-transaction.png` },
  { id: "media-informasi", key: "media", image: `${root}/information-media.jpg` },
  { id: "personal-banker", key: "advisor", image: `${root}/branch-service-advisor.png` },
  { id: "young-community", key: "family", image: `${root}/branch-service-family.png` },
  { id: "contact-center", key: "contact", image: `${root}/contact-center.png` },
  { id: "kartu-kredit", key: "credit", image: `${banking}/privilege-credit.png` },
  { id: "kpr", key: "home", image: `${banking}/privilege-home.png` },
  { id: "ksm", key: "motorcycle", image: `${root}/motorcycle-loan.png` },
  { id: "merchant-edc", key: "merchant", image: `${root}/merchant-edc.png` },
  { id: "safe-deposit-box", key: "deposit", image: `${banking}/privilege-deposit.png` },
  { id: "valuta-asing", key: "forex", image: `${root}/foreign-exchange.png` },
] as const;

export function getBankingPrivilegeItem(id: string) {
  return bankingPrivilegeItems.find((item) => item.id === id);
}
