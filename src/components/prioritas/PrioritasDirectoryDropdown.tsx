"use client";

import { useEffect, useRef, useState } from "react";

export type PrioritasDirectoryDropdownOption = { value: string; label: string };

type PrioritasDirectoryDropdownProps = {
  id: string;
  label: string;
  value: string;
  options: PrioritasDirectoryDropdownOption[];
  onChange: (value: string) => void;
  widthClassName?: string;
  search?: {
    placeholder: string;
    onChange: (value: string) => void;
  };
};

const CONTROL_CLASS = "flex h-12 items-center rounded-xl border px-4 transition-colors xl:h-14";
const MENU_CLASS = "fixed z-[60] max-h-64 overflow-hidden rounded-xl border border-neutral-300 bg-white shadow-card";
const OPTION_CLASS = "flex h-12 w-full items-center rounded-lg px-3 text-left text-sm leading-5 transition-colors xl:h-14 xl:text-base";

export default function PrioritasDirectoryDropdown({
  id,
  label,
  value,
  options,
  onChange,
  widthClassName = "",
  search,
}: PrioritasDirectoryDropdownProps) {
  const [open, setOpen] = useState(false);
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

  const controlStyle = open ? "border-pgold-500 bg-white" : "border-neutral-300 bg-neutral-200";

  return <div ref={containerRef} className={`relative block w-full ${widthClassName}`}>
    <span className="sr-only">{label}</span>
    <div className={`${CONTROL_CLASS} ${controlStyle}`}>
      {search ? <img src="/assets/promo-page/controls/search.svg" alt="" aria-hidden className="size-[18px] shrink-0" /> : null}
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
        className="h-full min-w-0 flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-neutral-600 xl:text-base"
      /> : <button
        ref={triggerRef}
        type="button"
        aria-label={`${label}: ${selected?.label ?? value}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((current) => !current)}
        className="h-full min-w-0 flex-1 bg-transparent text-left text-sm font-semibold text-neutral-700 outline-none xl:text-base"
      >{selected?.label ?? value}</button>}
      <button
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((current) => !current)}
        className="flex size-5 shrink-0 items-center justify-center text-neutral-700"
      >
        <img src="/assets/promo-page/controls/chevron-down.svg" alt="" aria-hidden className={`h-[8.5px] w-[14.5px] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
    </div>
    {open ? <div style={menuPosition} className={MENU_CLASS}>
      <div id={id} role="listbox" aria-label={label} data-lenis-prevent className="max-h-64 overflow-y-auto overscroll-contain p-2">
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
          className={`${OPTION_CLASS} ${value === option.value ? "font-semibold text-pbrown-700" : "text-neutral-700"} hover:bg-pgold-100 hover:font-semibold hover:text-pbrown-600`}
        ><span className="line-clamp-2">{option.label}</span></button>)}
      </div>
    </div> : null}
  </div>;
}
