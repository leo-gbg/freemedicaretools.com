import type { Metadata } from "next";
import { ClientWorksheetPrintDocument } from "@/components/tools/client-worksheet-print";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Medicare client worksheet — printable PDF",
  description:
    "Printable Medicare consult worksheet: contact, prescriptions, doctors, and plan-shaping details for your agent.",
  openGraph: {
    title: `Client worksheet · ${BRAND.name}`,
  },
};

export default function ClientWorksheetPrintPage() {
  return (
    <div className="bg-white">
      <ClientWorksheetPrintDocument />
    </div>
  );
}
