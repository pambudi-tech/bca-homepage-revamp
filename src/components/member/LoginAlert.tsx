export default function LoginAlert({
  message,
  visible,
}: {
  message: string;
  visible: boolean;
}) {
  return (
    <div role="alert" aria-hidden={!visible} className={`absolute bottom-[calc(100%+1rem)] left-1/2 z-10 flex min-h-14 w-fit max-w-full -translate-x-1/2 items-start gap-3 rounded-xl bg-red-100 p-4 text-sm leading-5 text-red-600 transition-opacity duration-300 ease-out motion-reduce:transition-none lg:bottom-[calc(100%+2.5rem)] ${visible ? "opacity-100" : "pointer-events-none opacity-0"}`}>
      <img aria-hidden src="/assets/member-login/close.svg" alt="" className="size-6 shrink-0" />
      <span className="w-fit pt-0.5">{message}</span>
    </div>
  );
}
