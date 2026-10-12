"use client";

import { useId, type CSSProperties, type SVGProps, type ImgHTMLAttributes } from "react";
import library from "./icon-library.json";

type Presentation = { name: string; color: string; width: number; height: number; accent?: string; viewBox?: string };
type Shape = { attributes: Record<string, string>; body: string; width: number; height: number };
type Props = Omit<SVGProps<SVGSVGElement>, "src"> & {
  src?: string;
  alt?: string;
  loading?: ImgHTMLAttributes<HTMLImageElement>["loading"];
  decoding?: ImgHTMLAttributes<HTMLImageElement>["decoding"];
};

/** One shared geometry. Legacy sources retain their component's original presentation. */
export function IconAsset({ src, alt = "", loading, decoding, style, color, ...props }: Props) {
  const id = useId().replaceAll(":", "");
  const legacy = (library.aliases as Record<string, Presentation>)[src ?? ""];
  const name = legacy?.name ?? src?.match(/^\/assets\/icons\/([^/]+)\.svg$/)?.[1];
  const shape = name ? (library.shapes as Record<string, Shape>)[name] : undefined;
  if (!shape) {
    // Some data-driven icon slots also contain branded illustrations.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} loading={loading} decoding={decoding} className={props.className} style={style} width={props.width} height={props.height} aria-hidden={props["aria-hidden"]} />;
  }
  const body = shape.body.replace(/id="([^"]+)"/g, `id="$1-${id}"`).replace(/url\(#([^)]*)\)/g, `url(#$1-${id})`);
  const presentation = { "--icon-accent": legacy?.accent, ...style } as CSSProperties;
  return <svg {...shape.attributes} viewBox={legacy?.viewBox ?? shape.attributes.viewBox} width={legacy?.width ?? shape.width} height={legacy?.height ?? shape.height}
    color={color ?? legacy?.color ?? "var(--color-neutral-800)"} style={presentation}
    aria-hidden={alt ? undefined : true} aria-label={alt || undefined} data-icon={name} {...props}
    dangerouslySetInnerHTML={{ __html: body }} />;
}
