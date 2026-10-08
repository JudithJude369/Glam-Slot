import Image from "next/image";

// Staff and service photos come from the database, where photo_url can be a
// local path (/images/sofia.jpg) or an external URL the owner pastes into
// Settings. next/image optimises local paths and refuses anything else with
// 400 "url parameter is not allowed", which broke the About page's team
// avatars when an external link was saved. Local paths use next/image for the
// fill/sizes behaviour the designs rely on; external URLs are emitted as a
// plain img, since there is nothing to optimise and the source controls its own
// dimensions anyway.
export function PublicImage({
  src,
  alt,
  fill,
  sizes,
  priority,
  width,
  height,
  className,
  style,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  width?: number | `${number}`;
  height?: number | `${number}`;
  className?: string;
  alt: string;
}) {
  if (src.startsWith("/")) {
    return (
      <Image
        src={src}
        alt={alt}
        fill={fill}
        sizes={sizes}
        priority={priority}
        width={width}
        height={height}
        className={className}
        style={style}
        {...props}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={
        fill
          ? { ...style, position: "absolute", inset: 0, width: "100%", height: "100%" }
          : style
      }
      {...props}
    />
  );
}