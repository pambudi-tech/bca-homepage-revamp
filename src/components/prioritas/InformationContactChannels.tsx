"use client";

import { useRef, useState } from "react";
import { Phone, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PrioritasButton, prioritasButtonClassName, solitaireButtonClassName } from "./PrioritasButton";
import ExistingInformationContent from "./ExistingInformationContent";

type Channel = "phone" | "twitter";
export default function InformationContactChannels({ brand, previewDisclosure = false }: { brand: "prioritas" | "solitaire"; previewDisclosure?: boolean }) {
  const t = useTranslations("brandInformation.contactChannels");
  const dialog = useRef<HTMLDialogElement>(null);
  const [channel, setChannel] = useState<Channel>("phone");
  const buttonClass = brand === "solitaire" ? solitaireButtonClassName : prioritasButtonClassName;
  function open(value: Channel) {
    setChannel(value);
    dialog.current?.showModal();
  }
  return <>
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
      {([
        { id: "phone", Icon: Phone, value: "1500222" },
        { id: "twitter", Icon: MapPin, value: "@HaloBCA" },
        { id: "branch", Icon: MapPin, value: t("branch") },
      ] as const).map(({ id, Icon, value }) => <section key={id} aria-labelledby={`contact-${id}-title`} className="flex min-w-0 flex-col items-start rounded-2xl bg-white p-6 xl:p-8">
        <span className={`mb-6 flex size-12 items-center justify-center rounded-full ${brand === "solitaire" ? "bg-neutral-200 text-neutral-800" : "bg-pgold-100 text-pbrown-600"}`}>{id === "twitter" ? <span aria-hidden="true" className="size-6 bg-current [mask-image:url('/assets/footer/x.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]" /> : <Icon aria-hidden="true" className="size-6" />}</span>
        <h2 id={`contact-${id}-title`} className="text-size-body-l font-semibold text-neutral-700">{t(`${id}Title`)}</h2>
        <p className={`mt-2 break-words text-heading ${brand === "solitaire" ? "text-neutral-800" : "text-pbrown-600"}`}>{value}</p>
        <p className="mb-6 mt-3 text-size-body-m leading-6 text-neutral-600">{t(`${id}Description`)}</p>
        <div className="mt-auto">
          {id === "branch"
            ? <Link href={`/${brand}/temukan-kami`} className={buttonClass({ variant: "secondary" })}>{t("branchAction")}</Link>
            : <PrioritasButton tone={brand} variant="secondary" onClick={() => open(id)}>{t(`${id}Action`)}</PrioritasButton>}
        </div>
      </section>)}
    </div>
    {previewDisclosure ? <div className="absolute inset-0 z-10 flex items-center justify-center bg-neutral-900/50 p-4"><section aria-labelledby="information-preview-channel-title" className="w-full max-w-xl rounded-2xl border border-neutral-300 bg-white p-6 text-neutral-900 shadow-card">
      <h2 id="information-preview-channel-title" className="mb-4 text-size-body-xl font-semibold">{t(channel)}</h2>
      <ExistingInformationContent html={t.raw(`${channel}Notice`) as string} brand={brand} />
      <div className="mt-6 flex flex-wrap justify-end gap-3"><PrioritasButton tone={brand} variant="secondary">{t("cancel")}</PrioritasButton><PrioritasButton tone={brand}>{t("continue")}</PrioritasButton></div>
    </section></div> : null}
    <dialog ref={dialog} aria-labelledby="information-channel-title" className="m-auto w-full max-w-xl rounded-2xl border border-neutral-300 bg-white p-6 text-neutral-900 shadow-card backdrop:bg-neutral-900/50">
      <h2 id="information-channel-title" className="mb-4 text-size-body-xl font-semibold">{t(channel)}</h2>
      <ExistingInformationContent html={t.raw(`${channel}Notice`) as string} brand={brand} />
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <PrioritasButton tone={brand} variant="secondary" onClick={() => dialog.current?.close()}>{t("cancel")}</PrioritasButton>
        <a href={channel === "phone" ? "tel:1500222" : "https://x.com/HaloBCA"} target={channel === "twitter" ? "_blank" : undefined} rel={channel === "twitter" ? "noopener noreferrer" : undefined} className={buttonClass()} onClick={() => dialog.current?.close()}>{t("continue")}</a>
      </div>
    </dialog>
  </>;
}
