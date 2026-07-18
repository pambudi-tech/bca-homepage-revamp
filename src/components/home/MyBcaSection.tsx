export default function MyBcaSection() {
  return (
    <section className="relative">
      {/* ===== Desktop (>= xl): card left, phone-woman right, side by side. ===== */}
      <div className="relative hidden h-[360px] bg-[#6a6a6a] xl:block">
        <div className="absolute inset-0 overflow-clip">
          <img
            src="/assets/mybca/bg.webp"
            alt=""
            className="absolute inset-0 size-full object-cover"
          />
        </div>

        <div className="absolute left-1/2 top-[-76px] h-[470px] w-[1080px] -translate-x-1/2">
          <img
            src="/assets/mybca/glow.svg"
            alt=""
            className="absolute left-[514px] top-[76px] h-[360px] w-[782px]"
          />
          <img
            src="/assets/mybca/phone-woman.webp"
            alt=""
            className="absolute left-[589px] top-0 h-[470px] w-[507px] object-cover"
          />

          <div className="absolute left-0 top-[108px] flex h-[328px] w-[530px] flex-col items-start justify-between rounded-t-3xl border-2 border-white/15 bg-gradient-to-b from-[rgba(18,20,23,0.25)] to-[rgba(18,20,23,0.5)] px-8 pb-10 pt-6 shadow-[-8px_0px_16px_0px_rgba(0,0,0,0.25)] backdrop-blur-[14px]">
            <div className="flex w-full flex-col items-start gap-4 text-white">
              <p className="w-full text-[28px] font-semibold leading-10 tracking-[-0.64px]">
                Semua Kebutuhan Perbankan dalam Satu Genggaman
              </p>
              <p className="w-full text-lg leading-[26px] opacity-80">
                Dari cek saldo sampai bayar tagihan, semua selesai dalam hitungan detik lewat myBCA.
              </p>
            </div>
            <button className="flex h-12 items-center justify-center gap-1 rounded-full bg-[#005caa] px-6 text-white">
              <img src="/assets/mybca/icon-download.svg" alt="" className="size-5" />
              <span className="text-base font-semibold">Download Sekarang</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===== Mobile (< xl): phone-woman on top, glass card overlapping below.
           Geometry follows the 392-wide Figma frame: the blue backdrop starts 20px
           down so the phone-woman breaks out into the section above it, the office
           photo runs 401px tall behind everything, and the glass card is flush with
           the section bottom, overlapping the stage by 69px (17.6% of the width). ===== */}
      <div className="relative overflow-clip xl:hidden">
        {/* Full-bleed backdrop: solid blue from y=20 down, office photo on top of it. */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 top-5 bg-[#005caa]">
          <div className="absolute inset-x-0 top-0 h-[401px] overflow-clip">
            <img src="/assets/mybca/bg.webp" alt="" className="size-full object-cover" />
            <div className="absolute inset-0 bg-[#005caa] mix-blend-multiply" />
          </div>

          {/* Radial glow halo, sitting slightly right of centre behind the woman. */}
          <img
            src="/assets/mybca/glow-mobile.svg"
            alt=""
            className="absolute inset-x-0 top-0 h-[401px] w-full"
          />

          {/* Dissolves the office photo into solid blue before its hard bottom edge. */}
          <div className="absolute inset-x-0 top-[285px] h-[116px] bg-gradient-to-b from-[rgba(0,92,170,0)] to-[#005caa]" />
        </div>

        <div className="relative mx-auto w-full max-w-[440px]">
          {/* Stage keeps the Figma 392x412 ratio so the overlap below scales with it. */}
          <div className="relative aspect-[392/412]">
            <img
              src="/assets/mybca/phone-woman.webp"
              alt="Aplikasi myBCA di genggaman"
              className="absolute left-[51.02%] top-0 w-[91.84%] -translate-x-1/2"
            />
          </div>

          {/* Glass card — pulled up to overlap the phone-woman's lower edge. */}
          <div className="relative -mt-[17.6%] px-2.5">
            {/* Fill + outline reuse the product-card glass treatment: flat black 30%
                over a saturating backdrop filter, with `hero-search` painting the 2px
                top-lit gradient outline. */}
            <div
              className="hero-search relative flex min-h-[320px] flex-col items-center justify-between overflow-clip rounded-t-3xl px-6 py-8 text-center shadow-[-8px_0px_16px_0px_rgba(0,0,0,0.25)]"
              style={{
                backgroundColor: "rgba(0,0,0,0.3)",
                backdropFilter: "blur(16px) saturate(1.25) brightness(1.02) contrast(1.02)",
                WebkitBackdropFilter: "blur(16px) saturate(1.25) brightness(1.02) contrast(1.02)",
                isolation: "isolate",
              }}
            >
              {/* Capped at the Figma text width so the heading keeps its 3-line wrap
                  and the card's justify-between rhythm holds above 392px. */}
              <div className="flex w-full max-w-80 flex-col items-center gap-4">
                <p className="text-2xl font-semibold leading-8 tracking-[-0.48px] text-white">
                  Semua Kebutuhan Perbankan dalam Satu Genggaman
                </p>
                <p className="w-64 max-w-full text-sm leading-5 text-[#d1eaff] opacity-80">
                  Dari cek saldo sampai bayar tagihan, semua selesai dalam hitungan detik lewat
                  myBCA.
                </p>
              </div>
              <button className="flex h-10 items-center justify-center gap-1 rounded-full bg-[#005caa] px-5 text-white transition-transform active:scale-95">
                <img src="/assets/mybca/icon-download.svg" alt="" className="size-5" />
                <span className="text-sm font-semibold leading-[14px]">Download myBCA</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
