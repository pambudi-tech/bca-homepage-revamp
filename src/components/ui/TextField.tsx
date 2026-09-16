"use client";

import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
  type SelectHTMLAttributes,
} from "react";

export default function TextField({
  label,
  hideLabel = false,
  error,
  as = "input",
  options,
  leadingIcon,
  inputRef,
  className = "",
  ...props
}: {
  label: string;
  hideLabel?: boolean;
  error?: string;
  as?: "input" | "select";
  options?: string[];
  leadingIcon?: ReactNode;
  inputRef?: Ref<HTMLInputElement>;
} & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  const errorId = `${id}-error`;
  const box = [
    "h-12 w-full rounded-xl border bg-neutral-200 px-3.5 text-sm leading-5 text-neutral-700",
    "outline-none transition-colors placeholder:text-neutral-600",
    "disabled:text-neutral-500",
    leadingIcon ? "pl-11" : "",
    error ? "border-red-500" : "border-neutral-300 focus:border-cyan-400",
    className,
  ].join(" ");

  return (
    <div className="flex w-full flex-col gap-2">
      <label
        htmlFor={id}
        className={hideLabel ? "sr-only" : "text-sm font-bold leading-5 text-neutral-800"}
      >
        {label}
      </label>
      {as === "select" ? (
        <div className="relative w-full">
          <select
            id={id}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            className={`${box} appearance-none pr-10 ${props.value ? "" : "text-neutral-600"}`}
            {...(props as SelectHTMLAttributes<HTMLSelectElement>)}
          >
            <option value="">{props.placeholder}</option>
            {options?.map((option) => (
              <option key={option} value={option} className="text-neutral-700">
                {option}
              </option>
            ))}
          </select>
          <svg
            viewBox="0 0 12 8"
            aria-hidden
            className="pointer-events-none absolute right-3.5 top-1/2 w-3 -translate-y-1/2 text-neutral-600"
          >
            <path d="M1 1.5 6 6.5l5-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      ) : (
        <div className="relative w-full">
          {leadingIcon ? (
            <span className="pointer-events-none absolute left-3.5 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center" aria-hidden>
              {leadingIcon}
            </span>
          ) : null}
          <input
            ref={inputRef}
            id={id}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            className={box}
            {...props}
          />
        </div>
      )}
      {error ? (
        <p id={errorId} className="text-xs leading-[18px] text-red-500">
          {error}
        </p>
      ) : null}
    </div>
  );
}
