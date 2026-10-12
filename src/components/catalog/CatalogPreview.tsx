"use client";

import { privilegeDetailBase } from "@/lib/privilege-paths";

import { useContext, useEffect, useRef, useState, type CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { LogOut, X } from "lucide-react";
import { PrioritasButton, PrioritasButtonIcon } from "@/components/prioritas/PrioritasButton";
import PrioritasDirectoryDropdown from "@/components/prioritas/PrioritasDirectoryDropdown";
import CategoryChip from "@/components/prioritas/CategoryChip";
import { TabButton } from "@/components/ui/Tab";
import LoginAlert from "@/components/member/LoginAlert";
import TextField from "@/components/ui/TextField";
import SignatureDirectoryCard from "@/components/prioritas/SignatureDirectoryCard";
import MagazineCard from "@/components/prioritas/MagazineCard";
import magazineIssues from "@/components/prioritas/magazine-issues.json";
import { signatureCards } from "@/components/prioritas/signature-card-data";
import ContentCard from "@/components/prioritas/ContentCard";
import { BankingPrivilegeCard, WealthCard } from "@/components/prioritas/BankingSolutionSection";
import PrivilegeSection, { type PrivilegeSectionCopy } from "@/components/prioritas/PrivilegeSection";
import { DetailRow } from "@/components/prioritas/PrioritasDetailExperience";
import { PrioritasDirectoryPagination } from "@/components/prioritas/PrioritasDirectory";
import { EVENT_PROMO_SAMPLES } from "@/components/prioritas/event-data";
import { getPrivilegePromos } from "@/lib/partner-privileges";
import { resolveFallbackPromos, getPromoBadge } from "@/components/home/promo-data";
import { insightAssets } from "@/components/prioritas/wealth-insight-assets";
import { ProductAccordion } from "@/components/home/ProductSection";
import { Input } from "./ui/input";
import CatalogOptions from "./CatalogOptions";
import Specimen from "./Specimen";
import { CatalogBlueprintContext, CatalogFieldToneContext, CatalogEdgeCaseContext, CatalogFeaturedKindContext } from "./CatalogView";
import { forcedStateCSS, resetRuleCache } from "./catalog-inspector";
import { CatalogStageContent } from "./CatalogStage";
import CatalogViewportStyles from "./CatalogViewportStyles";
import { PreviewViewportContext, PreviewFrozenContext } from "@/lib/PreviewViewport";
import type { KursEntry } from "@/lib/kurs";
import type { CatalogItem } from "./catalog-data";

const states = ["default", "hover", "pressed", "focus", "disabled"] as const;
const sizes = ["small", "medium", "large"] as const;
const referenceDate = new Date("2026-10-09T12:00:00+07:00");
const screenItems = new Set(["hero", "navbar", "section-nav", "directory-panel", "privilege-accordion", "privilege-feature", "featured-event", "event-overlap", "kurs-carousel", "floating-action", "search-overlay", "contact-footer"]);

export function CatalogStates() {
  const ref = useRef<HTMLStyleElement>(null);
  useEffect(() => {
    const update = () => { resetRuleCache(); if (ref.current) ref.current.textContent = forcedStateCSS(); };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return <style ref={ref} data-catalog-states="true" />;
}

function LiveFrame({ id, brand, rates, eventBackdrops }: { id: string; brand: "prioritas" | "solitaire"; rates: KursEntry[]; eventBackdrops: Record<string,string> }) {
  const p = useTranslations("prioritasHero");
  const blueprint = useContext(CatalogBlueprintContext);
  const edgeCase = useContext(CatalogEdgeCaseContext);
  const t = useTranslations("componentCatalog.board");
  const c = useTranslations("componentCatalog");
  const [device, setDevice] = useState<"mobile" | "desktop">("desktop");
  const [width, setWidth] = useState(1440);
  const [featuredKind, setFeaturedKind] = useState<"default" | "ads">("default");
  const [subnav, setSubnav] = useState<"without" | "with">("without");
  const [zoom, setZoom] = useState<"fit" | "actual">("fit");
  const canvas = useRef<HTMLDivElement>(null);
  const [availableWidth, setAvailableWidth] = useState(0);
  const content = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(900);
  useEffect(() => {
    const element = content.current;
    if (!element) return;
    const observer = new ResizeObserver(() => setContentHeight(element.offsetHeight));
    observer.observe(element);
    setContentHeight(element.offsetHeight);
    return () => observer.disconnect();
  }, [id]);
  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const observer = new ResizeObserver(() => setAvailableWidth(element.clientWidth));
    observer.observe(element);
    setAvailableWidth(element.clientWidth);
    return () => observer.disconnect();
  }, []);
  const scale = zoom === "fit" && availableWidth ? Math.min(1, availableWidth / width) : 1;
  return <div className="mt-6 space-y-4">
    <div className="flex flex-wrap items-end gap-6 border-b border-neutral-400 pb-5">
      {id === "featured-event" ? <CatalogOptions label={c("docs.variant")} value={featuredKind} onChange={setFeaturedKind} options={[{value:"default",label:t("default")},{value:"ads",label:t("ads")}]} /> : null}
      {id === "navbar" ? <CatalogOptions label={t("subnav")} value={subnav} onChange={setSubnav} options={[{value:"without",label:t("withoutSubnav")},{value:"with",label:t("withSubnav")}]} /> : null}
      <CatalogOptions label={t("viewport")} value={device} onChange={value => {setDevice(value); setWidth(value === "mobile" ? 390 : 1440);}} options={(["mobile","desktop"] as const).map(value=>({value,label:c(value)}))}/>
      <label className="space-y-2 text-size-body-m text-neutral-700"><span className="block">{t("previewWidth")}</span><div className="flex items-center gap-3"><input aria-label={t("previewWidth")} type="range" min={320} max={1920} step={1} value={width} onChange={event=>setWidth(Number(event.target.value))} className="w-36 accent-neutral-900"/><Input aria-label={t("previewWidth")} type="number" min={320} max={1920} value={width} onChange={event=>{const value=Number(event.target.value); if (value >= 320 && value <= 1920) setWidth(value);}} className="w-24"/><span>px</span></div></label>
      <CatalogOptions label={t("previewScale")} value={zoom} onChange={setZoom} options={[{value:"fit",label:t("fitPreview")},{value:"actual",label:"100%"}]}/>
      <span className="pb-2 text-size-body-m text-neutral-700">{Math.round(scale * 100)}%</span>
    </div>
    <div ref={canvas} className="overflow-x-auto rounded-xl border border-neutral-400 bg-neutral-200" data-lenis-prevent>
      <>
        <CatalogStates />
        <Specimen fullBleed label={t("interactive")} selector={id === "navbar" || id === "section-nav" ? "nav" : id === "search-overlay" ? ".fade-overlay" : id === "floating-action" ? "button" : "[data-accordion-preview]"}>
          <div className="relative mx-auto" style={{width:width * scale,height:contentHeight * scale}}>
          <CatalogFeaturedKindContext.Provider value={featuredKind}><PreviewViewportContext.Provider value={width}><PreviewFrozenContext.Provider value={blueprint || edgeCase}><CatalogViewportStyles width={width} screen={id}/><div ref={content} data-catalog-screen={id} data-catalog-preview-scale={scale} style={{width,transform:`scale(${scale})`,transformOrigin:"top left"}} className="absolute left-0 top-0">
          <div data-accordion-preview className={`relative mx-auto w-full ${id === "privilege-feature" || id === "privilege-accordion" || id === "event-overlap" ? `max-w-[1280px] ${width >= 1280 ? "" : "px-4"}` : ""}`}>
            {id !== "privilege-feature" && id !== "privilege-accordion" ? <CatalogStageContent key={String(edgeCase)} id={id} brand={brand} rates={rates} backdrops={eventBackdrops} withSubnav={subnav === "with"}/> : id === "privilege-feature" ? <PrivilegeSection previewViewport={width >= 1280 ? "desktop" : "mobile"} copy={{eyebrow:p("privilege.eyebrow"),heading:p("privilege.heading"),viewMore:p("privilege.viewMore"),cards:(["lounge","health","event"] as const).map(key=>({title:edgeCase ? t("edgeSamples.featureTitle") : p(`privilege.cards.${key}.title`),alt:p(`privilege.cards.${key}.alt`),action:p(`privilege.cards.${key}.action`)})) as PrivilegeSectionCopy["cards"]}}/> : <ProductAccordion autoplay={!blueprint} layout="solitaire" controls previewViewport={width >= 1280 ? "desktop" : "mobile"} items={["lounge","health","event"].map(key=>({key,title:p(`privilege.cards.${key}.title` as Parameters<typeof p>[0]),description:"",action:p(`privilege.cards.${key}.action` as Parameters<typeof p>[0]),href:"/solitaire/privilege",image:`/assets/solitaire/privilege/${key}-source.png`}))} defaultKey="lounge" />}
          </div>
          </div>
        </PreviewFrozenContext.Provider></PreviewViewportContext.Provider></CatalogFeaturedKindContext.Provider>
          </div>
        </Specimen>
      </>
    </div>
  </div>;
}

function ResponsiveCardPreview({id,brand}: {id: "privilege-card" | "magazine-card"; brand: "prioritas" | "solitaire"}) {
  const t = useTranslations("componentCatalog");
  const b = useTranslations("componentCatalog.board");
  const sig = useTranslations("signaturePrivilege");
  const magazine = useTranslations("magazineIndex");
  const [device,setDevice] = useState<"desktop" | "mobile">("desktop");
  const edgeCase = useContext(CatalogEdgeCaseContext);
  const card = signatureCards[0];
  const promo = getPrivilegePromos("signature").find(item => item.id === card.id);
  const issue = magazineIssues[0];
  const width = id === "privilege-card" ? device === "mobile" ? 280 : (1280 - 48) / 3 : device === "mobile" ? 171 : 296;
  return <div className="mt-6 space-y-6">
    <CatalogStates />
    <div className="border-b border-neutral-400 pb-5"><CatalogOptions label={b("viewport")} value={device} onChange={setDevice} options={(["mobile","desktop"] as const).map(value=>({value,label:t(value)}))}/></div>
    <div className="grid gap-5 xl:grid-cols-2">{(["default","hover"] as const).map(state => <Specimen blueprintDuplicate={state === "hover" && id !== "magazine-card"} key={`${device}-${state}`} label={b(state)} state={state === "hover" ? "hover" : undefined} width={width} selector="a" textSelector={id === "privilege-card" ? "h2" : "p"}>
      {id === "privilege-card" ? <SignatureDirectoryCard href={`${privilegeDetailBase(`/${brand}`, "signature")}/${card.id}`} image={`/assets/prioritas/signature-privilege/${card.image}`} title={edgeCase ? b("edgeSamples.privilegeTitle") : promo?.title ?? sig("tabs.signature")} tone={brand} active previewViewport={device} /> : <MagazineCard title={issue.title} action={magazine("readNow")} image={issue.image} imageAlt={magazine("coverAlt",{title:issue.title})} href={`/member/login?from=${brand}&magazine=${encodeURIComponent(issue.slug)}`} className="aspect-[3/4] w-full" usePrioritasButtonLibrary tone={brand} previewViewport={device} />}
    </Specimen>)}</div>
  </div>;
}

export default function CatalogPreview({ item, brand, wealthBackdrops, rates, eventBackdrops }: { item: CatalogItem; brand: "prioritas" | "solitaire"; wealthBackdrops: Record<string, string>; rates: KursEntry[]; eventBackdrops: Record<string,string> }) {
  const t = useTranslations("componentCatalog");
  const b = useTranslations("componentCatalog.board");
  const blueprint = useContext(CatalogBlueprintContext);
  const edgeCase = useContext(CatalogEdgeCaseContext);
  const audit = useTranslations("buttonAudit");
  const account = useTranslations("accountMenu");
  const p = useTranslations("prioritasHero");
  const sig = useTranslations("signaturePrivilege");
  const promoT = useTranslations("promo");
  const detail = useTranslations("lifestylePrivilegeDetail");
  const wealth = useTranslations("bankingSolutionIndex");
  const [value, setValue] = useState("beauty");
  const [active, setActive] = useState(0);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [buttonKind, setButtonKind] = useState<"button" | "icon" | "text">("button");
  const [buttonSurface, setButtonSurface] = useState<"default" | "inverse">("default");
  const [buttonSize, setButtonSize] = useState<typeof sizes[number]>("medium");
  const [dropdownKind, setDropdownKind] = useState<"category" | "search">("category");
  const [controlSize, setControlSize] = useState<"medium" | "large">("medium");
  const fieldTone = useContext(CatalogFieldToneContext);
  const [tabVariant, setTabVariant] = useState<"underline" | "curved">("underline");
  const [tabSurfaceVariant, setTabSurfaceVariant] = useState<"default" | "inverse">("inverse");
  const [wealthGroup, setWealthGroup] = useState<"house" | "market">("house");
  const [accordionDevice, setAccordionDevice] = useState<"mobile" | "desktop">("desktop");
  const [bankingDevice, setBankingDevice] = useState<"mobile" | "desktop">("desktop");
  const [contentDevice, setContentDevice] = useState<"desktop" | "mobile">("desktop");
  const [cardVariant, setCardVariant] = useState<"complimentary" | "lifestyle" | "event" | "promo">("complimentary");
  const [ribbonContext, setRibbonContext] = useState<"none" | "birthday" | "popular" | "almostEnd">("none");
  const [eventCase, setEventCase] = useState<"single" | "period" | "crossMonth" | "expired">("single");
  const [buttonVariant, setButtonVariant] = useState<"primary" | "secondary" | "danger">("primary");
  const availableButtonVariants = buttonKind === "text" ? ["primary"] as const : buttonSurface === "inverse" ? ["primary", "secondary"] as const : ["primary", "secondary", "danger"] as const;
  const chosenButtonVariant = availableButtonVariants.some(value => value === buttonVariant) ? buttonVariant : "primary";
  const buttonLabel = chosenButtonVariant === "danger" ? account("confirmLogout") : chosenButtonVariant === "secondary" ? account("cancel") : b("buttonLabel");
  const buttonIcon = chosenButtonVariant === "danger" ? <LogOut aria-hidden className="size-5" /> : chosenButtonVariant === "secondary" ? <X aria-hidden className="size-5" /> : <PrioritasButtonIcon src="/assets/cycle1/pelajari-icon.svg" />;
  const solitaire = brand === "solitaire";
  const stateLabel = (state: string) => state === "focus" ? b("focus") : audit(state as Parameters<typeof audit>[0]);
  const options = ["beauty", "culinary", "travel"].map(key => ({value:key,label:edgeCase ? b(`edgeSamples.dropdown.${key}`) : sig(`categories.${key}` as Parameters<typeof sig>[0])}));
  const pair = (render: (hover: boolean) => React.ReactNode, width = 360, selector?: string) => <div className="grid gap-5 xl:grid-cols-2">{[false,true].map(hover => <Specimen blueprintDuplicate={hover} key={String(hover)} label={stateLabel(hover ? "hover" : "default")} state={hover ? "hover" : undefined} width={width} selector={selector}>{render(hover)}</Specimen>)}</div>;
  const controls = (...children: React.ReactNode[]) => <div className="flex flex-wrap gap-6 border-b border-neutral-400 pb-5">{children.map((child, index) => child ? <div key={index}>{child}</div> : null)}</div>;
  const sizeOptions = (["medium", "large"] as const).map(value => ({value, label:audit(value)}));
  const sizeControl = <CatalogOptions label={t("docs.size")} value={controlSize} onChange={setControlSize} options={sizeOptions} />;
  // Match PrioritasPageHeader, member headers and PrioritasIndexTabs surfaces.
  const tabSurface = tabVariant === "curved" ? solitaire ? "bg-neutral-900" : "bg-pbrown-700" : tabSurfaceVariant === "default" ? solitaire ? "bg-neutral-100" : "bg-pgold-100" : solitaire ? "bg-neutral-900" : "bg-pbrown-600";
  const tabRailStyle = { "--prioritas-index-tab-surface": solitaire ? "var(--color-neutral-200)" : "var(--color-pgold-200)" } as CSSProperties;
  const renderTab = (selected: boolean) => tabVariant === "curved" ? <TabButton variant="curved" size="medium" tone={brand} active={selected}>{sig("tabs.signature")}</TabButton> : <TabButton variant="underline" size={controlSize} tone={tabSurfaceVariant === "default" ? solitaire ? "solitaireMember" : "prioritasMember" : brand} active={selected}>{sig("tabs.signature")}</TabButton>;
  let board: React.ReactNode;

  if (item.id === "privilege-card" || item.id === "magazine-card") return <ResponsiveCardPreview id={item.id} brand={brand} />;
  if (screenItems.has(item.id)) return <LiveFrame id={item.id} brand={brand} rates={rates} eventBackdrops={eventBackdrops} />;
  switch (item.id) {
    case "button":
      board = <div className="space-y-8">
        {controls(
          <CatalogOptions key="kind" label={t("docs.kind")} value={buttonKind} onChange={setButtonKind} options={(["button","icon","text"] as const).map(value => ({value,label:audit(value)}))} />,
          <CatalogOptions key="variant" label={t("docs.variant")} value={chosenButtonVariant} onChange={setButtonVariant} options={availableButtonVariants.map(value => ({value,label:value === "danger" ? b("danger") : audit(value)}))} />,
          <CatalogOptions key="size" label={t("docs.size")} value={buttonSize} onChange={setButtonSize} options={sizes.map(value => ({value,label:audit(value)}))} />,
          <CatalogOptions key="surface" label={t("docs.surface")} value={buttonSurface} onChange={setButtonSurface} options={(["default","inverse"] as const).map(value => ({value,label:audit(value)}))} />
        )}
        {[chosenButtonVariant].map(variant => <section key={variant}>
          <h4 className="mb-3 text-size-body-m font-medium">{variant === "danger" ? b("danger") : audit(variant)}</h4>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{(blueprint ? states.slice(0, 1) : states).map(state => <Specimen key={`${state}-${buttonKind}-${buttonSize}-${buttonSurface}`} label={stateLabel(state)} state={state === "focus" ? "focus" : undefined} dark={buttonSurface === "inverse"} tone={brand}><PrioritasButton tone={brand} kind={buttonKind} variant={variant} surface={buttonSurface} size={buttonSize} previewState={state === "disabled" || state === "focus" ? undefined : state} disabled={state === "disabled"} aria-label={buttonKind === "icon" ? buttonLabel : undefined} trailingIcon={buttonKind !== "icon" && chosenButtonVariant === "primary" ? buttonIcon : undefined}>{buttonKind === "icon" ? buttonIcon : buttonLabel}</PrioritasButton></Specimen>)}</div>
        </section>)}
        <Specimen blueprintDuplicate key={`interactive-${chosenButtonVariant}-${buttonKind}-${buttonSize}-${buttonSurface}`} label={b("interactive")} dark={buttonSurface === "inverse"} tone={brand}><PrioritasButton tone={brand} kind={buttonKind} variant={chosenButtonVariant} size={buttonSize} surface={buttonSurface} aria-label={buttonKind === "icon" ? buttonLabel : undefined} trailingIcon={buttonKind !== "icon" && chosenButtonVariant === "primary" ? buttonIcon : undefined}>{buttonKind === "icon" ? buttonIcon : buttonLabel}</PrioritasButton></Specimen>
      </div>;
      break;
    case "dropdown":
      board = <div className="space-y-6">{controls(<CatalogOptions label={t("docs.kind")} value={dropdownKind} onChange={setDropdownKind} options={(["category","search"] as const).map(value=>({value,label:b(value)}))}/>,sizeControl)}<div className="grid gap-5 xl:grid-cols-2">{[false,true].map(expanded => <Specimen key={`${dropdownKind}-${controlSize}-${expanded}`} label={expanded ? b("open") : stateLabel("default")} width={320} selector=".priosoli-dropdown__control"><PrioritasDirectoryDropdown id={`catalog-${controlSize}-${expanded}`} label={b(dropdownKind)} value={value} onChange={setValue} options={options} size={controlSize} tone={brand} previewOpen={expanded} search={dropdownKind === "search" ? {placeholder:t("sample.search"),onChange:setValue} : undefined} /></Specimen>)}</div></div>;
      break;
    case "category-chip":
      board = <div className="space-y-6">{controls(sizeControl)}<div className="grid gap-5 xl:grid-cols-3">{["default","hover","selected"].map(state => <Specimen blueprintDuplicate={state !== "default"} key={`${controlSize}-${state}`} label={state === "selected" ? b("selected") : stateLabel(state)} state={state === "hover" ? "hover" : undefined}><CategoryChip tone={brand} size={controlSize} icon="/assets/prioritas/privilege/categories/beauty.svg" aria-pressed={state === "selected"}>{sig("categories.beauty")}</CategoryChip></Specimen>)}<Specimen blueprintDuplicate key={`interactive-${controlSize}`} label={b("interactive")}><CategoryChip tone={brand} size={controlSize} icon="/assets/prioritas/privilege/categories/beauty.svg" aria-pressed={active === 1} onClick={()=>setActive(active ? 0:1)}>{sig("categories.beauty")}</CategoryChip></Specimen></div></div>;
      break;
    case "tab":
      board = <div className="space-y-6">{controls(
        <CatalogOptions key="variant" label={t("docs.kind")} value={tabVariant} onChange={setTabVariant} options={(["underline", "curved"] as const).map(value => ({value,label:t(`docs.${value}`)}))} />,
        tabVariant === "underline" ? <CatalogOptions key="surface" label={t("docs.surface")} value={tabSurfaceVariant} onChange={setTabSurfaceVariant} options={(["default", "inverse"] as const).map(value => ({value,label:audit(value)}))} /> : null,
        tabVariant === "underline" ? sizeControl : <CatalogOptions key="size" label={t("docs.size")} value="medium" onChange={()=>{}} options={[{value:"medium",label:audit("medium")}]} />
      )}<div className="grid gap-5 xl:grid-cols-3">{["default","hover","selected"].map(state => <Specimen blueprintDuplicate={state !== "default"} key={`${tabVariant}-${tabSurfaceVariant}-${controlSize}-${state}`} label={state === "selected" ? b("selected") : stateLabel(state)} state={state === "hover" ? "hover" : undefined} surfaceClassName={tabSurface} selector="button">{tabVariant === "curved" ? <div style={tabRailStyle} className={`tab-curved-list flex ${tabSurface}`}>{renderTab(state === "selected")}</div> : renderTab(state === "selected")}</Specimen>)}</div><Specimen key={`interactive-${tabVariant}-${tabSurfaceVariant}-${controlSize}`} label={b("interactive")} surfaceClassName={tabSurface}><div style={tabVariant === "curved" ? tabRailStyle : undefined} className={tabVariant === "curved" ? `tab-curved-list flex ${tabSurface}` : "flex"}>{["signature","lifestyle","event","promo"].map((key,i)=> tabVariant === "curved" ? <TabButton key={key} variant="curved" size="medium" tone={brand} active={active===i} onClick={()=>setActive(i)}>{sig(`tabs.${key}` as Parameters<typeof sig>[0])}</TabButton> : <TabButton key={key} variant="underline" size={controlSize} tone={tabSurfaceVariant === "default" ? solitaire ? "solitaireMember" : "prioritasMember" : brand} active={active===i} onClick={()=>setActive(i)}>{sig(`tabs.${key}` as Parameters<typeof sig>[0])}</TabButton>)}</div></Specimen></div>;
      break;
    case "text-field":
      board = <div className="space-y-6"><div className="grid gap-5 xl:grid-cols-2">{["default","focus","filled","error","disabled"].map(state => <Specimen blueprintDuplicate={state === "focus" || state === "filled" || state === "disabled"} key={`${fieldTone}-${state}`} label={b(state as Parameters<typeof b>[0])} state={state === "focus" ? "focus" : undefined} width={320} selector="input"><TextField fieldSize="large" tone={fieldTone} label={t("sample.field")} placeholder={t("sample.placeholder")} defaultValue={state === "filled" ? "bca.member" : ""} error={state === "error" ? b("fieldError") : undefined} disabled={state === "disabled"} /></Specimen>)}</div></div>;
      break;
    case "alert-feedback":
      board = <div className="grid gap-5 xl:grid-cols-2">{(["info","warning","danger","success"] as const).map(variant => <Specimen key={variant} label={b(`alertVariants.${variant}`)} width={360} selector="[role=alert],[role=status]"><LoginAlert variant={variant} placement="inline" message={b(`alertMessages.${variant}`)} visible /></Specimen>)}</div>;
      break;
    case "content-card": {
      const complimentary = getPrivilegePromos("complimentary");
      const lifestyle = getPrivilegePromos("lifestyle");
      const regularComplimentary = complimentary.find(item => !item.birthdayGift) ?? complimentary[0];
      const birthdayGiftComplimentary = complimentary.find(item => item.birthdayGift) ?? regularComplimentary;
      const promos = resolveFallbackPromos(referenceDate);
      const promoBadge = ribbonContext === "popular" || ribbonContext === "almostEnd" ? ribbonContext : "default";
      const promo = promos.find(item => getPromoBadge(item, referenceDate).key === promoBadge)!;
      const eventExamples = [
        { key: "single", item: EVENT_PROMO_SAMPLES.find(item => item.id === "louis-vuitton-private-shopping")! },
        { key: "period", item: EVENT_PROMO_SAMPLES.find(item => item.id === "art-jakarta-gardens")! },
        { key: "crossMonth", item: EVENT_PROMO_SAMPLES.find(item => item.id === "ican-education-expo")! },
        { key: "expired", item: EVENT_PROMO_SAMPLES.find(item => item.id === "lino-sons-fan-painting")! },
      ] as const;
      const event = eventExamples.find(example => example.key === eventCase)!.item;
      const sample = <T extends {title: string; brand: string; logo: string}>(item: T): T => edgeCase ? {...item, title:b("edgeSamples.cardTitle"), brand:b("edgeSamples.brand"), logo:""} : item;
      const previewDevice = cardVariant === "event" ? contentDevice : "desktop";
      const needsRibbonContext = cardVariant === "complimentary" || cardVariant === "promo";
      const ribbonOptions = cardVariant === "complimentary"
        ? [{value:"none" as const,label:b("noRibbon")},{value:"birthday" as const,label:sig("complimentary.birthday")}]
        : [{value:"none" as const,label:b("noRibbon")},{value:"popular" as const,label:promoT("badge.popular")},{value:"almostEnd" as const,label:promoT("badge.almostEnd")}];
      board = <div className="space-y-6">
        {controls(
          <CatalogOptions label={t("docs.variant")} value={cardVariant} onChange={value => {setCardVariant(value); setRibbonContext("none");}} options={(["complimentary","lifestyle","event","promo"] as const).map(value=>({value,label:b(value)}))} />,
          cardVariant === "event" ? <CatalogOptions label={b("eventCase")} value={eventCase} onChange={setEventCase} options={eventExamples.map(({key})=>({value:key,label:b(key)}))} /> : null,
          needsRibbonContext ? <CatalogOptions label={b("ribbonContext")} value={ribbonContext} onChange={setRibbonContext} options={ribbonOptions} /> : null,
          cardVariant === "event" ? <CatalogOptions label={b("viewport")} value={contentDevice} onChange={setContentDevice} options={(["mobile","desktop"] as const).map(value=>({value,label:t(value)}))}/> : null
        )}
        <div key={`${cardVariant}-${ribbonContext}-${eventCase}-${previewDevice}`}>{pair(() =>
          cardVariant === "event" ? <ContentCard variant="event" item={sample(event)} now={referenceDate} solitaire={solitaire} previewViewport={previewDevice} /> :
          cardVariant === "complimentary" ? <ContentCard variant="complimentary" item={sample(ribbonContext === "birthday" ? birthdayGiftComplimentary : regularComplimentary)} now={referenceDate} solitaire={solitaire} previewViewport={previewDevice} /> :
          cardVariant === "lifestyle" ? <ContentCard variant="lifestyle" item={sample(lifestyle[0])} now={referenceDate} solitaire={solitaire} previewViewport={previewDevice} /> :
          <ContentCard variant="promo" item={sample(promo)} now={referenceDate} solitaire={solitaire} previewViewport={previewDevice} />,
        previewDevice === "mobile" ? 390 - 32 : (1280 - 48 - 48) / 3,".content-card > div")}</div>
      </div>;
      break;
    }
    case "privilege-card": board = null; break;
    case "banking-privilege-card": board = <div className="space-y-6">{controls(<CatalogOptions label={b("viewport")} value={bankingDevice} onChange={setBankingDevice} options={(["mobile","desktop"] as const).map(value=>({value,label:t(value)}))}/>)}{pair(() => <BankingPrivilegeCard card={{title:edgeCase ? b("edgeSamples.bankingTitle") : p("bankingSolution.cards.branch.title"),alt:p("bankingSolution.cards.branch.alt"),image:"/assets/prioritas/banking/privilege-branch.webp",href:`/${brand}/banking-solution/privilege/layanan-cabang`}} action={p("bankingSolution.action")} tone={brand} previewViewport={bankingDevice} />,bankingDevice === "mobile" ? 280 : (1280 - 48) / 3,"article")}</div>; break;
    case "wealth-insight-card": {
      const asset = insightAssets[wealthGroup][0];
      board = <div className="space-y-6">{controls(<CatalogOptions label={t("docs.variant")} value={wealthGroup} onChange={setWealthGroup} options={(["house","market"] as const).map(value=>({value,label:wealth(`groups.${value}`)}))}/>)}{pair(() => <WealthCard tone={brand} card={{eyebrow:wealth(`groups.${wealthGroup}`),title:edgeCase ? b("edgeSamples.wealthTitle") : wealth(`insight.${asset.key}.title`),metadata:[{icon:"/assets/prioritas/banking/calendar.svg",label:wealth(`insight.${asset.key}.date`)}],action:wealth("downloadAction"),href:wealthGroup === "house" ? "https://prioritas.bca.co.id/en/Wealth-Management/Market-Insight/House-View-Report" : "https://prioritas.bca.co.id/en/Wealth-Management/Market-Insight/Weekly-Market-Overview",actionIcon:asset.actionIcon,backdrop:wealthBackdrops[asset.key],image:asset.image,imageAlt:wealth(`insight.${asset.key}.alt`)}} />)}</div>;
      break;
    }
    case "magazine-card": board = null; break;
    case "pagination": board = <div className="space-y-5">{[1,4,10].map(n=><Specimen key={n} label={`${t("sample.page")} ${n}`}><PrioritasDirectoryPagination page={n} total={90} pageSize={9} onPageChange={setPage} tone={brand} /></Specimen>)}<Specimen blueprintDuplicate label={b("interactive")}><PrioritasDirectoryPagination page={page} total={90} pageSize={9} onPageChange={setPage} tone={brand}/></Specimen></div>; break;
    case "detail-accordion": {
      const content = <ul className="list-disc space-y-1 pl-5">{(detail.raw("terms.items") as string[]).map(term => <li key={term}>{term}</li>)}</ul>;
      const accordionWidth = accordionDevice === "mobile" ? 390 - 32 : (1280 - 24) / 2;
      board = <div className="space-y-6">
        {controls(<CatalogOptions label={b("viewport")} value={accordionDevice} onChange={setAccordionDevice} options={(["mobile", "desktop"] as const).map(value => ({value, label:t(value)}))} />)}
        {[false, true].map(expanded => <Specimen key={`${accordionDevice}-${expanded}`} label={b(expanded ? "open" : "closed")} width={accordionWidth} selector="section">
          <DetailRow title={detail("terms.title")} open={expanded} onToggle={()=>{}} solitaire={solitaire} previewViewport={accordionDevice}>{content}</DetailRow>
        </Specimen>)}
        <Specimen blueprintDuplicate key={`interactive-${accordionDevice}`} label={b("interactive")} width={accordionWidth} selector="section">
          <DetailRow title={detail("terms.title")} open={open} onToggle={()=>setOpen(!open)} solitaire={solitaire} previewViewport={accordionDevice}>{content}</DetailRow>
        </Specimen>
      </div>;
      break;
    }

    default: board = null;
  }
  return <div className="mt-6"><CatalogStates />{board}</div>;
}
