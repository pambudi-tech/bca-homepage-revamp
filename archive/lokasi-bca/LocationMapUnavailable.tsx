/** Shared map failure surface; documentation uses it without starting WebGL. */
export default function LocationMapUnavailable({ tone, label }: { tone: "prioritas" | "solitaire"; label: string }) {
  return <div className={`flex size-full items-center justify-center px-6 text-center ${tone === "solitaire" ? "bg-neutral-300" : "bg-blue-100"}`}>
    <p className="text-sm text-neutral-700">{label}</p>
  </div>;
}
