import Image from "next/image";

type Props = {
  className?: string;
  /** Shown to screen readers; link parent may use aria-label instead */
  alt?: string;
  priority?: boolean;
};

/**
 * Raster mark from `/public/logo.png`. Intrinsic ratio preserved via object-contain.
 */
export function BrandLogo({
  className,
  alt = "iCAM Video Telematics",
  priority,
}: Props) {
  return (
    <Image
      src="/logo.png"
      alt={alt}
      width={512}
      height={512}
      priority={priority}
      className={`w-auto object-contain ${className ?? ""}`}
    />
  );
}
