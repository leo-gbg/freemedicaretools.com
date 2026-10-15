import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/brand";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Print routes only. Do not Disallow /classes/slides: that line would
      // publish the unlisted path. The page sends noindex, nofollow and is
      // left out of the sitemap.
      disallow: ["/tools/client-worksheet/print", "/tools/med-supp-compare/print"],
    },
    sitemap: `${BRAND.url}/sitemap.xml`,
    host: BRAND.url,
  };
}
