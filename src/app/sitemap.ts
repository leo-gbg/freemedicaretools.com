import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/brand";
import { TOOLS } from "@/lib/medicare/tools";

export default function sitemap(): MetadataRoute.Sitemap {
  // /classes/slides stays off this list. It is an unlisted attendee page.
  const paths = ["", "/tools", "/classes", "/glossary", "/research", "/privacy", "/terms", ...TOOLS.map((tool) => `/tools/${tool.slug}`)];
  return paths.map((path) => ({
    url: `${BRAND.url}${path}`,
  }));
}
