"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export type PrioritasDirectoryDropdownOption = { value: string; label: ReactNode; accessibleLabel?: string; horizontal?: boolean };
export type PrioritasDirectoryDropdownSize = "medium" | "large";

type PrioritasDirectoryDropdownProps = {
  previewOpen?: boolean;
  id: string;
  label: string;
  value: string;
  options: PrioritasDirectoryDropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  widthClassName?: string;
  size?: PrioritasDirectoryDropdownSize;
  xlSize?: "large";
  tone?: "prioritas" | "solitaire";
  optionWeight?: "regular";
  search?: {
    placeholder: string;
    onChange: (value: string) => void;
  };
};

export default function PrioritasDirectoryDropdown({
  previewOpen = false,
  id,
  label,
  value,
  options,
  onChange,
  placeholder,
  widthClassName = "",
  size = "medium",
  xlSize,
  tone = "prioritas",
  optionWeight,
  search,
}: PrioritasDirectoryDropdownProps) {
  const [interactiveOpen, setOpen] = useState(false);
  const open = previewOpen || interactiveOpen;
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;
    const updateMenuPosition = () => {
      const control = containerRef.current;
      if (!control) return;
      const rect = control.getBoundingClientRect();
      setMenuPosition({ top: rect.bottom + 8, left: rect.left, width: rect.width });
    };
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      (search ? inputRef.current : triggerRef.current)?.focus();
    };

    updateMenuPosition();
    window.addEventListener("scroll", updateMenuPosition, true);
    window.addEventListener("resize", updateMenuPosition);
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("scroll", updateMenuPosition, true);
      window.removeEventListener("resize", updateMenuPosition);
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open, search]);

  return <div ref={containerRef} data-open={open} className={`priosoli-dropdown ${tone === "solitaire" ? "priosoli-dropdown--solitaire" : ""} ${optionWeight ? `priosoli-dropdown--options-${optionWeight}` : ""} priosoli-dropdown--${size} ${xlSize ? `priosoli-dropdown--xl-${xlSize}` : ""} w-full ${widthClassName}`}>
    <span className="sr-only">{label}</span>
    <div className="priosoli-dropdown__control">
      {search ? <img src="/assets/promo-page/controls/search.svg" alt="" aria-hidden className="priosoli-dropdown__search-icon" /> : null}
      {search ? <input
        ref={inputRef}
        value={value}
        onChange={(event) => {
          search.onChange(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={search.placeholder}
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={id}
        className="priosoli-dropdown__input"
      /> : <button
        ref={triggerRef}
        type="button"
        aria-label={`${label}: ${selected?.accessibleLabel ?? (value || placeholder || "")}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((current) => !current)}
        className="priosoli-dropdown__trigger"
      ><span className={`flex min-w-0 items-center gap-2 ${!selected && placeholder ? "text-neutral-600" : ""}`}>{selected?.label ?? placeholder ?? value}</span></button>}
      <button
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((current) => !current)}
        className="priosoli-dropdown__toggle"
      >
        <img src="/assets/promo-page/controls/chevron-down.svg" alt="" aria-hidden className="priosoli-dropdown__chevron" />
      </button>
    </div>
    {open ? <div style={previewOpen ? { position: "relative", top: 0, left: 0, width: "100%", marginTop: 8 } : menuPosition} className="priosoli-dropdown__menu">
      <div id={id} role="listbox" aria-label={label} data-lenis-prevent className="priosoli-dropdown__listbox">
        {options.map((option) => <button
          key={option.value}
          type="button"
          role="option"
          aria-selected={value === option.value}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            onChange(option.value);
            setOpen(false);
          }}
          className="priosoli-dropdown__option"
        ><span className={option.horizontal ? "flex min-w-0 items-center gap-2" : "line-clamp-2"}>{option.label}</span></button>)}
      </div>
    </div> : null}
  </div>;
}
