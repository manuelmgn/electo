import type { MetadataRoute } from "next";

// Permitimos a indexación das vistas públicas (/, /r/, /f/, /predicions)
// pero non as ligazóns curtas de predicións persoais (/s/) nin as APIs.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/s/", "/api/"],
    },
  };
}
