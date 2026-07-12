export default function MyBcaSection() {
  return (
    <section className="relative h-[360px] bg-[#6a6a6a]">
      <div className="absolute inset-0 overflow-clip">
        <img
          src="/assets/mybca/bg.png"
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
          src="/assets/mybca/phone-woman.png"
          alt=""
          className="absolute left-[589px] top-0 h-[470px] w-[507px] object-cover"
        />

        <div className="absolute left-0 top-[108px] flex h-[328px] w-[530px] flex-col items-start justify-between rounded-t-3xl border-2 border-white/15 bg-gradient-to-b from-[rgba(18,20,23,0.25)] to-[rgba(18,20,23,0.5)] px-8 pb-10 pt-8 shadow-[-8px_0px_16px_0px_rgba(0,0,0,0.25)] backdrop-blur-[14px]">
          <div className="flex w-full flex-col items-start gap-4 text-white">
            <p className="w-full text-[32px] font-semibold leading-10 tracking-[-0.64px]">
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
    </section>
  );
}
