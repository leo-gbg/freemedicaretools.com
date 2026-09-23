import type { Metadata } from "next";
import { Figtree, Newsreader } from "next/font/google";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { BRAND } from "@/lib/brand";
import "./globals.css";

const display = Newsreader({
  variable: "--font-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const body = Figtree({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.url),
  title: {
    default: `${BRAND.name} — ${BRAND.tagline}`,
    template: `%s · ${BRAND.name}`,
  },
  description:
    "Free Medicare tools for people turning 65 and current enrollees: IEP timelines, late penalties, IRMAA, path quiz, AEP checklist, and more — at FreeMedicareTools.com.",
  applicationName: BRAND.name,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-[family-name:var(--font-body)]">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
