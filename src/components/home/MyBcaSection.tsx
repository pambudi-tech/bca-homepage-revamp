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

      {/* ===== Mobile (< xl): phone-woman on top, glass card overlapping below. ===== */}
      <div className="relative overflow-clip bg-[#005caa] xl:hidden">
        {/* Image stage — office backdrop + glow behind the phone-woman cutout. */}
        <div className="relative mx-auto max-w-[440px]">
          {/* Blue-tinted office backdrop, confined to the upper image area. */}
          <div aria-hidden className="absolute inset-x-0 top-0 h-[280px] overflow-clip">
            <img src="/assets/mybca/bg.webp" alt="" className="size-full object-cover" />
            <div className="absolute inset-0 bg-[#005caa] mix-blend-multiply" />
          </div>

          {/* Radial glow halo behind the phone. */}
          <img
            src="/assets/mybca/glow.svg"
            alt=""
            aria-hidden
            className="absolute left-1/2 top-2 h-[240px] w-[360px] max-w-full -translate-x-1/2"
          />

          {/* Phone + woman cutout. */}
          <img
            src="/assets/mybca/phone-woman.webp"
            alt="Aplikasi myBCA di genggaman"
            className="relative z-10 mx-auto block w-[92%] max-w-[360px]"
          />
        </div>

        {/* Glass card — pulled up to overlap the phone-woman's lower edge. */}
        <div className="relative z-20 mx-auto -mt-[76px] max-w-[440px] px-3">
          <div className="flex min-h-[320px] flex-col items-center justify-between gap-6 rounded-t-3xl border-2 border-white/15 bg-gradient-to-b from-[rgba(18,20,23,0.1)] to-[rgba(18,20,23,0.6)] px-6 pb-8 pt-8 text-center shadow-[-8px_0px_16px_0px_rgba(0,0,0,0.25)] backdrop-blur-[14px]">
            <div className="flex flex-col items-center gap-4">
              <p className="text-2xl font-semibold leading-8 tracking-[-0.48px] text-white">
                Semua Kebutuhan Perbankan dalam Satu Genggaman
              </p>
              <p className="max-w-[256px] text-sm leading-5 text-[#d1eaff] opacity-80">
                Dari cek saldo sampai bayar tagihan, semua selesai dalam hitungan detik lewat myBCA.
              </p>
            </div>
            <button className="flex h-10 items-center justify-center gap-1 rounded-full bg-[#005caa] px-5 text-white transition-transform active:scale-95">
              <img src="/assets/mybca/icon-download.svg" alt="" className="size-5" />
              <span className="text-sm font-semibold">Download myBCA</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
