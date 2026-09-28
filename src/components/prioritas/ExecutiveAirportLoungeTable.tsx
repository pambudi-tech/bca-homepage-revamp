"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type LoungeLocation = { city: string; airport: string; lounge: string };

const solitaireLocations: LoungeLocation[] = [
  { city: "Jakarta", airport: "Terminal 3 Ultimate Soekarno Hatta (Penerbangan International, depan gate 7)", lounge: "Saphire Plaza Premium Lounge" },
  { city: "Medan", airport: "Kualanamu (Penerbangan Domestik)", lounge: "Jakarta" },
  { city: "Medan", airport: "Kualanamu (Penerbangan International)", lounge: "Jakarta" },
];

const sharedLocations: LoungeLocation[] = [
  { city: "Ambon", airport: "Pattimura", lounge: "Concordia Lounge" },
  { city: "Balikpapan", airport: "Sultan Aji Muhammad Sulaiman Sepinggan", lounge: "Blue Sky Premier Lounge" },
  { city: "Banjarmasin", airport: "Syamsudin Noor", lounge: "Sapphire Lounge" },
  { city: "Batam", airport: "Hang Nadim", lounge: "Blue Sky Premier Lounge" },
  { city: "Denpasar", airport: "I Gusti Ngurah Rai (Penerbangan Domestik)", lounge: "Prayana Lounge" },
  { city: "Jakarta", airport: "Terminal 3 Ultimate Soekarno Hatta (Penerbangan Domestik, depan gate 13 & 18)", lounge: "Blue Sky Temporary Lounge" },
  { city: "Jambi", airport: "Sultan Thaha Syaifuddin", lounge: "Sapphire Lounge" },
  { city: "Jayapura", airport: "Sentani", lounge: "Matos Executive Lounge" },
  { city: "Kulonprogo", airport: "YIA - Yogyakarta International Airport (Penerbangan Domestik)", lounge: "Concordia Lounge" },
  { city: "Kupang", airport: "El Tari (Penerbangan Domestik)", lounge: "Concordia Lounge" },
  { city: "Lombok", airport: "Zainuddin Abdul Madjid", lounge: "Concordia Lounge" },
  { city: "Makassar", airport: "Sultan Hasanuddin", lounge: "Prayana Lounge" },
  { city: "Malang", airport: "Abdul Rachman Saleh", lounge: "East Java Lounge" },
  { city: "Manado", airport: "Sam Ratulangi (Penerbangan Domestik)", lounge: "Concordia Lounge" },
  { city: "Medan", airport: "Kualanamu", lounge: "Subway" },
  { city: "Padang", airport: "Minangkabau", lounge: "Banua Lounge" },
  { city: "Palembang", airport: "Sultan Mahmud Badaruddin II", lounge: "Blue Sky Premier Lounge" },
  { city: "Pangkal Pinang", airport: "Depati Amir", lounge: "Sapphire Lounge" },
  { city: "Pekanbaru", airport: "Sultan Syarif Kasim II", lounge: "Platinum Executive Lounge" },
  { city: "Pontianak", airport: "Supadio", lounge: "Blue Sky Premier Lounge" },
  { city: "Samarinda", airport: "Aji Pangeran Tumenggung Pranoto", lounge: "Blue Sky Premier Lounge" },
  { city: "Semarang", airport: "Jenderal Ahmad Yani", lounge: "Concordia Lounge" },
  { city: "Solo", airport: "Adi Soemarmo", lounge: "Concordia Lounge" },
  { city: "Surabaya", airport: "Terminal 1 Juanda (Penerbangan Domestik)", lounge: "Blue Sky Premier Lounge" },
  { city: "Surabaya", airport: "Terminal 2 Juanda (Penerbangan Internasional)", lounge: "Prayana Executive Lounge" },
];

function LocationRows({ locations }: { locations: LoungeLocation[] }) {
  return locations.map((location, index) => (
    <tr key={`${location.city}-${location.airport}-${location.lounge}`} className="bg-neutral-100 text-neutral-800">
      <td className="break-words border-b border-neutral-300 px-1 py-2 text-center align-top text-sm leading-5 sm:px-3 sm:py-3">{index + 1}</td>
      <td className="break-words border-b border-neutral-300 px-1 py-2 align-top text-sm leading-5 sm:px-4 sm:py-3">{location.city}</td>
      <td className="break-words border-b border-neutral-300 px-1 py-2 align-top text-sm leading-5 sm:px-4 sm:py-3">{location.airport}</td>
      <td className="break-words border-b border-neutral-300 px-1 py-2 align-top text-sm leading-5 sm:px-4 sm:py-3">{location.lounge}</td>
    </tr>
  ));
}

export default function ExecutiveAirportLoungeTable() {
  const t = useTranslations("lifestylePrivilegeDetail.loungeTable");
  const [sortDirection, setSortDirection] = useState<"ascending" | "descending" | null>(null);
  const sortLocations = (locations: LoungeLocation[]) => sortDirection
    ? [...locations].sort((a, b) => (sortDirection === "ascending" ? 1 : -1) * a.city.localeCompare(b.city, "id"))
    : locations;

  return (
    <div className="w-full max-w-full overflow-x-hidden rounded-xl border border-neutral-300">
      <table className="w-full min-w-0 table-fixed border-separate border-spacing-0 text-sm leading-5">
        <colgroup>
          <col className="w-[9%] sm:w-[8%]" />
          <col className="w-[19%] sm:w-[26%]" />
          <col className="w-[34%] sm:w-[33%]" />
          <col className="w-[38%] sm:w-[33%]" />
        </colgroup>
        <thead className="bg-blue-200 text-blue-600">
          <tr>
            <th scope="col" className="h-12 border-b border-neutral-300 px-1 text-center font-semibold sm:px-3">{t("number")}</th>
            <th scope="col" aria-sort={sortDirection ?? "none"} className="h-12 border-b border-neutral-300 text-left font-semibold">
              <button type="button" onClick={() => setSortDirection(sortDirection === "ascending" ? "descending" : "ascending")} className="flex h-12 w-full items-center gap-1 px-1 text-left sm:gap-1 sm:px-4">
                {t("name")}<img src="/assets/prioritas/detail/lounge-table-sort.svg" alt="" width="20" height="20" className="size-4 shrink-0 sm:size-5" />
              </button>
            </th>
            <th scope="col" className="h-12 border-b border-neutral-300 px-1 text-left font-semibold sm:px-4">{t("airport")}</th>
            <th scope="col" className="h-12 border-b border-neutral-300 px-1 text-left font-semibold sm:px-4">{t("lounge")}</th>
          </tr>
        </thead>
        <tbody>
          <tr><th scope="rowgroup" colSpan={4} className="min-h-12 border-b border-neutral-300 bg-neutral-800 px-2 py-3 text-center font-semibold text-neutral-100 sm:px-4">{t("solitaireOnly")}</th></tr>
          <LocationRows locations={sortLocations(solitaireLocations)} />
          <tr><th scope="rowgroup" colSpan={4} className="min-h-12 border-b border-neutral-300 bg-neutral-400 px-2 py-3 text-center font-semibold text-neutral-800 sm:px-4">{t("solitaireAndPrioritas")}</th></tr>
          <LocationRows locations={sortLocations(sharedLocations)} />
        </tbody>
      </table>
    </div>
  );
}
