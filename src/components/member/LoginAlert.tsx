import { IconAsset } from "@/components/icons/IconAsset";

export default function LoginAlert({
  message,
  visible,
  variant = "danger",
  placement = "floating",
}: {
  message: string;
  visible: boolean;
  variant?: "info" | "warning" | "danger" | "success";
  placement?: "floating" | "inline";
}) {
  const colors = {info:"bg-blue-100 text-blue-700",warning:"bg-yellow-100 text-yellow-800",danger:"bg-red-100 text-red-600",success:"bg-green-100 text-green-700"};
  const icon = variant === "info" ? "info" : variant === "warning" ? "warning-outline" : "check-circle";
  return (
    <div role={variant === "info" || variant === "success" ? "status" : "alert"} aria-hidden={!visible} className={`${placement === "floating" ? "absolute bottom-[calc(100%+1rem)] lg:bottom-[calc(100%+2.5rem)] left-1/2 z-10 w-fit -translate-x-1/2" : "relative w-full"} flex min-h-14 max-w-full items-start gap-3 rounded-xl ${colors[variant]} p-4 text-size-body-m leading-5 transition-opacity duration-300 ease-out motion-reduce:transition-none ${visible ? "opacity-100" : "pointer-events-none opacity-0"}`}>
      {variant === "danger" ? <IconAsset aria-hidden src="/assets/member-login/close.svg" alt="" className="size-6 shrink-0" /> : <IconAsset src={`/assets/icons/${icon}.svg`} color="currentColor" aria-hidden className="size-6 shrink-0" />}
      <span className="min-w-0 pt-0.5">{message}</span>
    </div>
  );
}
