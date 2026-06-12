import Image from "next/image";

interface CoverPhotoProps {
  src: string | undefined;
  alt: string;
}

export function CoverPhoto({ src, alt }: CoverPhotoProps) {
  if (src === undefined) {
    return <div className="h-44 w-full rounded-t-lg bg-gradient-to-br from-zinc-200 to-zinc-300" />;
  }
  return <Image src={src} alt={alt} width={800} height={600} className="h-44 w-full rounded-t-lg object-cover" />;
}
