"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AgencyLink, PoweredBy } from "@/components/powered-by";
import { buttonVariants } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";
import {
  loadWorksheet,
  worksheetToCrmJson,
  type ClientWorksheet,
} from "@/lib/medicare/client-worksheet";
import { cn } from "@/lib/utils";

function yn(v: boolean | null): string {
  if (v === true) return "Yes";
  if (v === false) return "No";
  return "—";
}

export function ClientWorksheetPrintDocument() {
  const [data, setData] = useState<ClientWorksheet | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setData(loadWorksheet());
      setReady(true);
    });
    document.body.classList.add("client-worksheet-print-page");
    return () => {
      cancelled = true;
      document.body.classList.remove("client-worksheet-print-page");
    };
  }, []);

  const mailtoHref = useMemo(() => {
    const subject = encodeURIComponent("Medicare consult worksheet");
    const body = encodeURIComponent(
      [
        "Hello,",
        "",
        "I used the FreeMedicareTools worksheet and saved a PDF on my own device.",
        "This message does not include my worksheet.",
        "I will not put medications, date of birth, Medicaid, VA benefits, or similar details in email.",
        "",
        `Sent via ${BRAND.domain}`,
      ].join("\n")
    );
    return `mailto:${BRAND.email}?subject=${subject}&body=${body}`;
  }, []);

  function downloadJson() {
    if (!data) return;
    const blob = new Blob([worksheetToCrmJson(data)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `medicare-worksheet-${(data.fullName || "client").replace(/\s+/g, "-").toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!ready) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-sm text-[var(--brand-ink-soft)]">
        Loading worksheet…
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-[var(--brand-ink)]">No worksheet found in this browser session.</p>
        <Link
          href="/tools/client-worksheet"
          className="mt-4 inline-block text-[var(--brand-teal)] hover:underline"
        >
          ← Fill out the worksheet
        </Link>
      </div>
    );
  }

  const rxs = data.prescriptions.filter((r) => r.name.trim());
  const docs = data.providers.filter((p) => p.name.trim() || p.practice.trim());

  return (
    <div className="client-worksheet-print-root mx-auto max-w-[8.5in] bg-white px-4 py-8 text-[var(--brand-ink)] sm:px-6">
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/tools/client-worksheet"
          className="text-sm text-[var(--brand-teal)] hover:text-[var(--brand-teal-deep)]"
        >
          ← Edit worksheet
        </Link>
        <div className="flex max-w-xl flex-col items-stretch gap-2 sm:items-end">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-[var(--brand-teal)] text-white hover:bg-[var(--brand-teal-deep)]"
              )}
            >
              Print / Save as PDF
            </button>
            <a
              href={mailtoHref}
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "border-[var(--brand-line)]"
              )}
            >
              Email to agent
            </a>
            <button
              type="button"
              onClick={downloadJson}
              className={cn(buttonVariants({ size: "lg", variant: "ghost" }))}
            >
              Download CRM JSON
            </button>
          </div>
          <p className="text-xs text-[var(--brand-ink-soft)] sm:text-right">
            The email does not include your worksheet. Do not add medications, date of birth,
            Medicaid, VA benefits, or similar details to the message. The JSON file stays on your
            device.
          </p>
        </div>
      </div>

      <header className="border-b border-[var(--brand-line)] pb-4">
        <p className="text-xs tracking-[0.16em] text-[var(--brand-teal)] uppercase">
          {BRAND.domain}
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl tracking-tight">
          Medicare client consult worksheet
        </h1>
        <p className="mt-2 text-sm text-[var(--brand-ink-soft)]">
          Bring this to your appointment with{" "}
          <AgencyLink className="font-medium" />. Prepared {data.completedAt}.
        </p>
        <p className="mt-1 text-xs text-[var(--brand-ink-soft)]">
          <PoweredBy />
        </p>
      </header>

      <section className="mt-5">
        <h2 className="text-sm font-semibold tracking-wide text-[var(--brand-teal)] uppercase">
          Contact
        </h2>
        <dl className="mt-2 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          <Row label="Full name" value={data.fullName} />
          <Row label="Preferred name" value={data.preferredName} />
          <Row label="Phone" value={data.phone} />
          <Row label="Email" value={data.email} />
          <Row label="Date of birth" value={data.dateOfBirth} />
          <Row label="Part B effective" value={data.partBEffective} />
          <Row
            label="Address"
            value={[data.addressLine1, data.addressLine2].filter(Boolean).join(", ")}
            wide
          />
          <Row
            label="City / State / ZIP"
            value={[data.city, data.state, data.zip].filter(Boolean).join(", ")}
          />
          <Row label="County" value={data.county} />
        </dl>
      </section>

      <section className="mt-6">
        <h2 className="text-sm font-semibold tracking-wide text-[var(--brand-teal)] uppercase">
          Plan-shaping details
        </h2>
        <dl className="mt-2 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          <Row label="Current coverage" value={data.currentCoverage} wide />
          <Row label="Other coverage notes" value={data.otherCoverageNotes} wide />
          <Row label="Preferred pharmacy" value={data.preferredPharmacy} />
          <Row label="Preferred hospital" value={data.preferredHospital} />
          <Row
            label="Travels out of state"
            value={`${yn(data.travelsOutOfState)}${data.travelMonths ? ` — ${data.travelMonths}` : ""}`}
          />
          <Row label="Tobacco use" value={yn(data.tobaccoUse)} />
          <Row label="Dental / vision / hearing priority" value={yn(data.wantsDentalVisionHearing)} />
          <Row label="Premium budget" value={data.monthlyPremiumBudget} />
          <Row label="Medicaid dual eligible" value={yn(data.dualEligibleMedicaid)} />
          <Row label="VA benefits" value={yn(data.hasVaBenefits)} />
          <Row
            label="Caregiver"
            value={[data.caregiverName, data.caregiverPhone].filter(Boolean).join(" · ")}
            wide
          />
        </dl>
      </section>

      <section className="mt-6">
        <h2 className="text-sm font-semibold tracking-wide text-[var(--brand-teal)] uppercase">
          Prescriptions
        </h2>
        {rxs.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--brand-ink-soft)]">None listed.</p>
        ) : (
          <table className="mt-2 w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--brand-line)] bg-[var(--brand-mist)]/80">
                <th className="px-2 py-2 font-medium">Drug</th>
                <th className="px-2 py-2 font-medium">Dosage</th>
                <th className="px-2 py-2 font-medium">Frequency</th>
                <th className="px-2 py-2 font-medium">Generics OK?</th>
              </tr>
            </thead>
            <tbody>
              {rxs.map((rx) => (
                <tr key={rx.id} className="border-b border-[var(--brand-line)]/70">
                  <td className="px-2 py-2">{rx.name}</td>
                  <td className="px-2 py-2">{rx.dosage || "—"}</td>
                  <td className="px-2 py-2">{rx.frequency || "—"}</td>
                  <td className="px-2 py-2">{rx.genericsOk ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="mt-6">
        <h2 className="text-sm font-semibold tracking-wide text-[var(--brand-teal)] uppercase">
          Doctors & specialists
        </h2>
        {docs.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--brand-ink-soft)]">None listed.</p>
        ) : (
          <table className="mt-2 w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--brand-line)] bg-[var(--brand-mist)]/80">
                <th className="px-2 py-2 font-medium">Provider</th>
                <th className="px-2 py-2 font-medium">Practice</th>
                <th className="px-2 py-2 font-medium">Type</th>
                <th className="px-2 py-2 font-medium">Must keep?</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((p) => (
                <tr key={p.id} className="border-b border-[var(--brand-line)]/70">
                  <td className="px-2 py-2">
                    <div>{p.name || "—"}</div>
                    {p.address ? (
                      <div className="text-xs text-[var(--brand-ink-soft)]">{p.address}</div>
                    ) : null}
                  </td>
                  <td className="px-2 py-2">{p.practice || "—"}</td>
                  <td className="px-2 py-2">{p.specialistType || "—"}</td>
                  <td className="px-2 py-2">{yn(p.mustKeep)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {data.notesForAgent.trim() ? (
        <section className="mt-6">
          <h2 className="text-sm font-semibold tracking-wide text-[var(--brand-teal)] uppercase">
            Notes for agent
          </h2>
          <p className="mt-2 whitespace-pre-wrap text-sm">{data.notesForAgent}</p>
        </section>
      ) : null}

      <footer className="mt-8 border-t border-[var(--brand-line)] pt-3 text-[8pt] text-[var(--brand-ink-soft)]">
        Educational worksheet only—not Medicare, CMS, or Social Security advice. Not affiliated with
        the U.S. government. Do not write Medicare Beneficiary Identifier or SSN on copies you email.
        {BRAND.domain} · <PoweredBy className="inline" linkClassName="text-[var(--brand-ink-soft)]" />.
      </footer>
    </div>
  );
}

function Row({
  label,
  value,
  wide,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <dt className="text-xs text-[var(--brand-ink-soft)]">{label}</dt>
      <dd className="font-medium">{value?.trim() ? value : "—"}</dd>
    </div>
  );
}
