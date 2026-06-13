import Image from "next/image";
import type { ReactNode } from "react";

interface CoverPhotoProps {
  src: string | undefined;
  alt: string;
  badge?: ReactNode;
}

export function CoverPhoto({ src, alt, badge }: CoverPhotoProps) {
  return (
    <div className="relative h-52 w-full overflow-hidden">
      {badge !== undefined && (
        <span className="absolute right-3 top-3 z-10 rounded-full bg-black/55 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
          {badge}
        </span>
      )}
      {src === undefined ? (
        <div className="h-full w-full bg-gradient-to-br from-rose-100 via-stone-100 to-amber-100 transition-transform duration-700 group-hover:scale-105 dark:from-accent/30 dark:via-surface dark:to-gold/20" />
      ) : (
        <Image
          src={src}
          alt={alt}
          width={800}
          height={600}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    </div>
  );
}
