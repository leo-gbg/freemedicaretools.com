import type { Metadata } from "next";
import { MedigapPrintDocument } from "@/components/tools/medigap-print-document";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Medigap plan letter comparison — printable PDF",
  description:
    "Printable standardized Medigap (Medicare Supplement) benefit chart for Plans A–N. Save as PDF from your browser.",
  openGraph: {
    title: `Medigap printable comparison · ${BRAND.name}`,
    description:
      "Full Medigap letter chart (A, B, C, D, F, G, K, L, M, N) ready to print or save as PDF.",
  },
};

export default function MedigapPrintPage() {
  return (
    <div className="bg-white">
      <MedigapPrintDocument />
    </div>
  );
}
