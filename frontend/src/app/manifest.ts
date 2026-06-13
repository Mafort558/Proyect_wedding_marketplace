import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bodas & Eventos",
    short_name: "Bodas & Eventos",
    description: "Salones, catering y servicios para bodas y todo tipo de eventos, con reserva y seña online",
    start_url: "/",
    display: "standalone",
    background_color: "#faf6f3",
    theme_color: "#b14256",
    lang: "es-AR",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
