import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/brand";
import { TOOLS } from "@/lib/medicare/tools";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", "/tools", "/glossary", "/research", "/privacy", "/terms", ...TOOLS.map((tool) => `/tools/${tool.slug}`)];
  return paths.map((path) => ({
    url: `${BRAND.url}${path}`,
  }));
}
