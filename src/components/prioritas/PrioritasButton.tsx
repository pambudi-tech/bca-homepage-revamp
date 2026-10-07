import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

export type PrioritasButtonKind = "button" | "icon" | "text";
export type PrioritasButtonVariant = "primary" | "secondary" | "danger";
export type PrioritasButtonSurface = "default" | "inverse";
export type PrioritasButtonSize = "small" | "medium" | "large";
export type PrioritasButtonPreviewState = "default" | "hover" | "pressed";

type ClassOptions = {
  kind?: PrioritasButtonKind;
  variant?: PrioritasButtonVariant;
  surface?: PrioritasButtonSurface;
  size?: PrioritasButtonSize;
  className?: string;
};

function buttonClassName(prefix: "prio-button" | "solitaire-button", {
  kind = "button",
  variant = "primary",
  surface = "default",
  size = "medium",
  className,
}: ClassOptions = {}) {
  return [prefix, `${prefix}--${kind}`, `${prefix}--${variant}`, `${prefix}--${surface}`, `${prefix}--${size}`, className].filter(Boolean).join(" ");
}

/** Use this class recipe on either a button or an internal Link. */
export function prioritasButtonClassName({
  kind = "button",
  variant = "primary",
  surface = "default",
  size = "medium",
  className,
}: ClassOptions = {}) {
  return buttonClassName("prio-button", { kind, variant, surface, size, className });
}

/** Solitaire uses the same button geometry as Prioritas with its own Figma color states. */
export function solitaireButtonClassName(options: ClassOptions = {}) {
  return buttonClassName("solitaire-button", options);
}

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & ClassOptions & {
  tone?: "prioritas" | "solitaire";
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  previewState?: PrioritasButtonPreviewState;
};

export function PrioritasButton({
  kind = "button",
  tone = "prioritas",
  variant = "primary",
  surface = "default",
  size = "medium",
  className,
  leadingIcon,
  trailingIcon,
  previewState,
  children,
  type = "button",
  ...props
}: Props) {
  return (
    <button
      {...props}
      type={type}
      data-preview-state={previewState}
      className={(tone === "solitaire" ? solitaireButtonClassName : prioritasButtonClassName)({ kind, variant, surface, size, className })}
    >
      {leadingIcon}
      {kind === "icon" ? children : <span className="prio-button__label">{children}</span>}
      {trailingIcon}
    </button>
  );
}

/** The Figma icon slot is 20px; its placeholder is used on the library page. */
export function PrioritasButtonIcon({ src }: { src?: string }) {
  const iconStyle = src ? { maskImage: `url(${src})`, WebkitMaskImage: `url(${src})` } as CSSProperties : undefined;
  return <span aria-hidden="true" className={src ? "prio-button__icon prio-button__icon--asset" : "prio-button__icon"} style={iconStyle} />;
}
