"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "bca-cookie-consent";

/** The optional categories. Cookie wajib/esensial isn't here — it can't be
    turned off, so there is nothing to store about it. */
type Prefs = {
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
};

const ALL_OFF: Prefs = { functional: false, analytics: false, marketing: false };
const ALL_ON: Prefs = { functional: true, analytics: true, marketing: true };

const CATEGORIES: { key: keyof Prefs | "essential"; label: string; desc: string }[] = [
  {
    key: "essential",
    label: "Wajib",
    desc: "Menjaga sesi login, keamanan, dan fungsi dasar situs. Tidak dapat dinonaktifkan.",
  },
  {
    key: "functional",
    label: "Fungsional",
    desc: "Mengingat preferensi Anda, seperti bahasa dan kurs yang terakhir dilihat.",
  },
  {
    key: "analytics",
    label: "Analitik",
    desc: "Membantu kami memahami halaman mana yang paling sering digunakan.",
  },
  {
    key: "marketing",
    label: "Pemasaran",
    desc: "Menyesuaikan promo dan iklan BCA yang Anda lihat di situs lain.",
  },
];

function hasDecided(): boolean {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved !== null && saved !== "";
  } catch {
    // Private mode / storage disabled — treat as "belum memilih" but never throw.
    return false;
  }
}

export default function CookieBanner() {
  // `mounted` gates the whole thing so the server never renders a banner that
  // a returning visitor would see flash before localStorage says "sudah".
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(ALL_OFF);

  useEffect(() => {
    if (hasDecided()) return;
    setMounted(true);
    // Let the hero settle first — the preloader curtain is still lifting at t=0.
    const id = setTimeout(() => setShown(true), 1200);
    return () => clearTimeout(id);
  }, []);

  if (!mounted) return null;

  const save = (value: Prefs) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch {
      // Nothing persisted — the banner still closes for this session.
    }
    setShown(false);
    // Unmount only after the slide-out finishes.
    setTimeout(() => setMounted(false), 300);
  };

  const toggle = (key: keyof Prefs) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const primaryLabel = settingsOpen ? "Simpan Pilihan" : "Terima Semua";
  const onPrimary = () => save(settingsOpen ? prefs : ALL_ON);

  return (
    <aside
      role="dialog"
      aria-live="polite"
      aria-label="Pemberitahuan cookie"
      className={`fixed inset-x-0 bottom-0 z-[60] transition-all duration-300 ease-out sm:inset-x-auto sm:bottom-6 sm:left-6 sm:w-[calc(100%-3rem)] sm:max-w-[420px] ${
        shown
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-full opacity-0 sm:translate-y-4"
      }`}
    >
      {/* Mobile: bottom sheet flush with the bottom edge (rounded top corners,
          safe-area padding for the home indicator). No grab handle — the sheet
          isn't draggable, so the affordance would promise a gesture that
          doesn't exist. sm+ turns it back into the
          floating card that sits clear of the centered "Kembali ke atas" pill. */}
      <div className="rounded-t-3xl border border-b-0 border-neutral-300 bg-neutral-100/95 px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-5 shadow-[0_-8px_40px_rgba(0,33,61,0.18)] backdrop-blur-md sm:rounded-2xl sm:border-b sm:p-6 sm:shadow-[0_12px_40px_rgba(0,33,61,0.18)]">
        {settingsOpen ? (
          <div>
            <h2 className="text-base font-bold leading-6 text-neutral-800">
              Pengaturan Cookie
            </h2>
            {/* Caps the list on short screens so the buttons stay reachable. */}
            <div className="mt-3 max-h-[45vh] space-y-3 overflow-y-auto pr-1">
              {CATEGORIES.map((cat) => {
                const locked = cat.key === "essential";
                const on = locked || prefs[cat.key as keyof Prefs];
                return (
                  <div key={cat.key} className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold leading-5 text-neutral-800">
                        {cat.label}
                      </p>
                      <p className="mt-0.5 text-xs leading-4 text-neutral-700">{cat.desc}</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={on}
                      aria-label={cat.label}
                      disabled={locked}
                      onClick={() => !locked && toggle(cat.key as keyof Prefs)}
                      className={`mt-0.5 flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200 ${
                        on ? "bg-cyan-500" : "bg-neutral-500"
                      } ${locked ? "cursor-not-allowed opacity-50" : ""}`}
                    >
                      <span
                        className={`size-5 rounded-full bg-neutral-100 transition-transform duration-200 ${
                          on ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <span
              aria-hidden
              className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-200 text-lg"
            >
              🍪
            </span>
            <div>
              <h2 className="text-base font-bold leading-6 text-neutral-800">
                Kami menggunakan cookie
              </h2>
              <p className="mt-1.5 text-sm leading-5 text-neutral-700">
                Cookie membantu kami menjaga keamanan situs, mengingat preferensi Anda, dan
                menyajikan konten yang lebih relevan. Anda dapat mengubah pilihan ini kapan saja.
              </p>
              <a
                href="https://www.bca.co.id/id/Syarat-dan-Ketentuan/SK-cookies"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-sm font-semibold text-blue-500 underline underline-offset-2 transition-colors hover:text-blue-400"
              >
                Pelajari Kebijakan Cookie
              </a>
            </div>
          </div>
        )}

        {/* Always side by side, primary on the right. h-12 / text-base pill —
            same size as the other mobile CTAs (MyBcaSection, hero search) so
            the sheet doesn't read as lighter. Padding stays px-4 until sm so
            "Atur Preferensi" still fits on a 375px screen without wrapping. */}
        <div className="mt-5 flex flex-row gap-2.5 sm:gap-2">
          <button
            type="button"
            onClick={() => (settingsOpen ? save(ALL_OFF) : setSettingsOpen(true))}
            className="flex h-12 flex-1 items-center justify-center whitespace-nowrap rounded-full border border-neutral-400 bg-neutral-100 px-4 text-base font-semibold text-neutral-700 transition-[border-color,color,transform] duration-200 active:scale-95 sm:px-6 sm:text-sm sm:active:scale-100 sm:hover:border-neutral-600 sm:hover:text-neutral-800"
          >
            {settingsOpen ? "Tolak Semua" : "Atur Preferensi"}
          </button>
          <button
            type="button"
            onClick={onPrimary}
            className="flex h-12 flex-1 items-center justify-center whitespace-nowrap rounded-full bg-blue-500 px-4 text-base font-semibold text-neutral-100 transition-[background-color,transform] duration-200 active:scale-95 sm:px-6 sm:text-sm sm:active:scale-100 sm:hover:bg-blue-400"
          >
            {primaryLabel}
          </button>
        </div>
      </div>
    </aside>
  );
}
