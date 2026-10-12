"use client";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ElementSpecs, SpecProperty } from "./catalog-inspector";

export default function CatalogSpecs({ specs }: { specs: ElementSpecs }) {
  const t = useTranslations("componentCatalog.board.specDetails");
  const board = useTranslations("componentCatalog.board");
  const renderProperty = (property: SpecProperty, index: number) => <div key={`${property.key}-${index}`} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] items-start gap-3 py-2">
    <dt className="text-neutral-700">{t(property.key)}</dt>
    <dd className="min-w-0 flex items-start gap-2 text-neutral-900">
      {property.color !== undefined || property.gradient ? <span aria-hidden className="mt-0.5 size-4 shrink-0 rounded border border-neutral-400 bg-neutral-200" style={{ backgroundColor: property.color, backgroundImage: property.gradient }} /> : null}
      <span className="min-w-0 break-words">
        <span className="block font-medium">{property.token ?? (property.value === "gradient" ? t("gradient") : property.value === "transparent" ? t("transparent") : property.key === "fontFamily" && /bca/i.test(property.value) ? "BCA Sans" : property.key === "fontWeight" && t.has(`weights.${property.value}`) ? `${t(`weights.${property.value}`)} · ${property.value}` : property.value)}</span>
        {property.token ? <span className="mt-0.5 block text-neutral-700">{property.key === "fontFamily" && /bca/i.test(property.value) ? "BCA Sans" : property.value}</span> : null}
      </span>
    </dd>
  </div>;
  return <div className="divide-y divide-neutral-400 px-4 text-size-body-m leading-5">
    {specs.parts.map((part, index) => <details key={`${part.role}-${index}`} open className="group/part py-3">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold text-neutral-900">
        {part.role === "component" ? board("specDetails.wholeComponent") : board(`blueprintRoles.${part.role}`)}
        <ChevronDown aria-hidden className="size-3 shrink-0 text-neutral-700 group-open/part:rotate-180" />
      </summary>
      {part.content ? <p className="mt-1 break-words text-neutral-700">“{part.content}”</p> : null}
      {part.composition ? <p className="mt-2 text-neutral-900">{part.composition.map(value => board.has(`componentVariants.${value}`) ? board(`componentVariants.${value}`) : board(`blueprintRoles.${value}`)).join(" · ")}</p> : null}
      {(["typography","layout","colors"] as const).map(group => part[group].length ? <section key={group} className="mt-3 border-t border-neutral-400 pt-3">
        <h5 className="mb-1 font-medium text-neutral-900">{t(group)}</h5>
        <dl>{part[group].map(renderProperty)}</dl>
      </section> : null)}
    </details>)}
  </div>;
}
