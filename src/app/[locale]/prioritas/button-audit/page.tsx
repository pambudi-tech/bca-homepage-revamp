import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  PrioritasButton,
  PrioritasButtonIcon,
  prioritasButtonClassName,
  type PrioritasButtonKind,
  type PrioritasButtonSurface,
  type PrioritasButtonVariant,
  type PrioritasButtonSize,
} from "@/components/prioritas/PrioritasButton";

const sizes: PrioritasButtonSize[] = ["small", "medium", "large"];
const states = ["default", "hover", "pressed", "disabled"] as const;

function MatrixPanel({
  kind,
  surface,
  labels,
}: {
  kind: PrioritasButtonKind;
  surface: PrioritasButtonSurface;
  labels: Record<string, string>;
}) {
  const variants: PrioritasButtonVariant[] = kind === "text" ? ["primary"] : ["primary", "secondary"];

  return (
    <section className={`prio-library-panel prio-library-panel--${kind} prio-library-panel--${surface}`} aria-label={`${labels[kind]} ${labels[surface]}`}>
      <div className="prio-library-panel__caption"><span>{labels[surface]}</span></div>
      <div className="prio-library-panel__size-labels">
        {sizes.map((size) => <span key={size}>{labels[size]}</span>)}
      </div>
      {variants.map((variant) => (
        <div key={variant} className="prio-library-panel__group" aria-label={labels[variant]}>
          {states.map((state) => (
            <div key={state} className="prio-library-panel__row" aria-label={`${labels[variant]} ${labels[state]}`}>
              {sizes.map((size) => (
                <PrioritasButton
                  key={size}
                  kind={kind}
                  variant={variant}
                  surface={surface}
                  size={size}
                  previewState={state === "disabled" ? undefined : state}
                  disabled={state === "disabled"}
                  aria-label={kind === "icon" ? `${labels[variant]} ${labels[size]} ${labels[state]}` : undefined}
                  leadingIcon={kind === "icon" ? undefined : <PrioritasButtonIcon />}
                  trailingIcon={kind === "icon" ? undefined : <PrioritasButtonIcon />}
                >
                  {kind === "icon" ? <PrioritasButtonIcon /> : labels.label}
                </PrioritasButton>
              ))}
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}

export default async function ButtonLibraryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("buttonAudit");
  const labels = Object.fromEntries([
    "button", "icon", "text", "default", "inverse", "primary", "secondary", "small", "medium", "large", "hover", "pressed", "disabled", "label",
  ].map((key) => [key, t(key as Parameters<typeof t>[0])]));

  return (
    <main id="main-content" className="prio-library-page">
      <header className="prio-library-header">
        <p>{t("component")}</p>
        <h1>{t("title")}</h1>
      </header>
      <div className="prio-library-scroll">
        <div className="prio-library-board">
          <div className="prio-library-headings">
            <span aria-hidden="true" />
            <h2>{t("button")}</h2>
            <h2>{t("icon")}</h2>
            <h2>{t("text")}</h2>
          </div>
          <div className="prio-library-matrix">
            <aside className="prio-library-rail" aria-label={t("states")}>
              <span className="prio-library-rail__primary">{t("primary")}</span>
              {states.map((state, index) => <span key={`primary-${state}`} style={{ top: 138 + index * 80 }}>{t(state)}</span>)}
              <span className="prio-library-rail__secondary">{t("secondary")}</span>
              {states.map((state, index) => <span key={`secondary-${state}`} style={{ top: 538 + index * 80 }}>{t(state)}</span>)}
            </aside>
            <MatrixPanel kind="button" surface="default" labels={labels} />
            <MatrixPanel kind="button" surface="inverse" labels={labels} />
            <MatrixPanel kind="icon" surface="default" labels={labels} />
            <MatrixPanel kind="icon" surface="inverse" labels={labels} />
            <MatrixPanel kind="text" surface="default" labels={labels} />
            <MatrixPanel kind="text" surface="inverse" labels={labels} />
          </div>
        </div>
      </div>
      <div className="prio-library-usage">
        <p>{t("usage")}</p>
        <code>{prioritasButtonClassName({ variant: "primary", size: "medium" })}</code>
      </div>
    </main>
  );
}
