import { Link } from "@/i18n/navigation";
import { prioritasButtonClassName } from "@/components/prioritas/PrioritasButton";

export type MagazineCardProps = {
  title: string;
  action: string;
  image: string;
  imageAlt: string;
  href: string;
  className?: string;
  usePrioritasButtonLibrary?: boolean;
};

export default function MagazineCard({ title, action, image, imageAlt, href, className = "", usePrioritasButtonLibrary = false }: MagazineCardProps) {
  const classes = `group relative block overflow-hidden rounded-xl ${className}`;
  const content = <>
    <img src={image} alt={imageAlt} loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
    <div className="pointer-events-none absolute inset-0 backdrop-blur-[0.1px] transition-[backdrop-filter] duration-500 ease-out group-hover:backdrop-blur-[8px] group-focus-visible:backdrop-blur-[8px] motion-reduce:transition-none [mask-image:linear-gradient(to_top,black_0%,black_25%,transparent_85%,transparent_100%)] [mask-repeat:no-repeat] [mask-size:100%_100%] [-webkit-mask-image:linear-gradient(to_top,black_0%,black_25%,transparent_85%,transparent_100%)]" />
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-pbrown-800/25 to-pbrown-800/95 opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none [mask-image:linear-gradient(to_top,black_0%,black_25%,transparent_85%,transparent_100%)] [mask-repeat:no-repeat] [mask-size:100%_100%] [-webkit-mask-image:linear-gradient(to_top,black_0%,black_25%,transparent_85%,transparent_100%)]" />
    <div className="pointer-events-none absolute inset-x-6 bottom-8 flex flex-col items-center gap-6 text-center opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none">
      <p className="w-full text-base font-semibold leading-[1.3] text-neutral-100 md:text-lg">{title}</p>
      <span className={usePrioritasButtonLibrary ? prioritasButtonClassName({ kind: "text", surface: "inverse", size: "large" }) : "flex items-center justify-center text-sm font-semibold leading-5 text-pgold-300 underline-offset-4 hover:text-pgold-100 hover:underline md:text-base"}>{action}</span>
    </div>
  </>;

  return href.startsWith("https://")
    ? <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>{content}</a>
    : <Link href={href} className={classes}>{content}</Link>;
}
