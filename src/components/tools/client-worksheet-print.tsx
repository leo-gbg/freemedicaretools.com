"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PoweredBy } from "@/components/powered-by";
import { Wordmark } from "@/components/wordmark";
import { buttonVariants } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";
import {
  loadWorksheet,
  worksheetToCrmJson,
  type ClientWorksheet,
  type WorksheetPrescription,
  type WorksheetProvider,
} from "@/lib/medicare/client-worksheet";
import { PHONE_PLACEHOLDER } from "@/lib/visual";
import { cn } from "@/lib/utils";

const BRING = ["Medicare card", "Pill bottles or label photos", "Current plan cards", "Annual Notice of Change"];

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
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `medicare-worksheet-${(data.fullName || "client").replace(/\s+/g, "-").toLowerCase()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  if (!ready) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-base text-[var(--brand-ink-soft)]">
        Loading worksheet…
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-[var(--brand-ink)]">No worksheet found in this browser session.</p>
        <Link href="/tools/client-worksheet" className="mt-4 inline-flex min-h-12 items-center text-[var(--brand-teal-deep)]">
          ← Fill out the worksheet
        </Link>
      </div>
    );
  }

  const rxs = data.prescriptions.filter((row) => row.name.trim());
  const docs = data.providers.filter((row) => row.name.trim() || row.practice.trim());
  const genericCount = rxs.filter((row) => row.genericsOk).length;
  const mustKeep = docs.filter((row) => row.mustKeep === true).length;
  const prepared = data.completedAt || "—";

  return (
    <div className="client-worksheet-print-root bg-[#e7eeeb] px-4 py-6 print:bg-white print:p-0">
      <div className="no-print mx-auto mb-6 flex max-w-[8.5in] flex-wrap items-center justify-between gap-3">
        <Link href="/tools/client-worksheet" className="inline-flex min-h-12 items-center text-[var(--brand-teal-deep)]">
          ← Edit worksheet
        </Link>
        <div className="flex max-w-xl flex-col items-stretch gap-2 sm:items-end">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className={cn(buttonVariants({ size: "lg" }), "bg-[var(--brand-ink)] text-white hover:bg-[#163544]")}
            >
              Print / Save as PDF
            </button>
            <a href={mailtoHref} className={cn(buttonVariants({ size: "lg", variant: "outline" }))}>
              Email to agent
            </a>
            <button type="button" onClick={downloadJson} className={cn(buttonVariants({ size: "lg", variant: "ghost" }))}>
              Download CRM JSON
            </button>
          </div>
          <p className="text-sm text-[var(--brand-ink-soft)] sm:text-right">
            The email does not include your worksheet. Do not add medications, date of birth, Medicaid,
            VA benefits, or similar details to the message. The JSON file stays on your device.
          </p>
        </div>
      </div>

      <div className="mx-auto flex w-[8.5in] flex-col gap-8 print:gap-0">
        <PageOne data={data} prepared={prepared} rxCount={rxs.length} genericCount={genericCount} docCount={docs.length} mustKeep={mustKeep} />
        <PageTwo data={data} prepared={prepared} rxs={rxs} docs={docs} genericCount={genericCount} mustKeep={mustKeep} />
      </div>
    </div>
  );
}

function PageOne({
  data,
  prepared,
  rxCount,
  genericCount,
  docCount,
  mustKeep,
}: {
  data: ClientWorksheet;
  prepared: string;
  rxCount: number;
  genericCount: number;
  docCount: number;
  mustKeep: number;
}) {
  const goesBy = data.preferredName.trim();
  return (
    <article className="worksheet-sheet flex h-[11in] w-[8.5in] flex-col overflow-hidden bg-white px-[0.48in] py-[0.42in] text-[var(--brand-ink)] shadow-[0_12px_40px_-24px_rgba(12,36,48,0.45)] print:shadow-none">
      <SheetHeader prepared={prepared} page={1} />
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-[1.7rem] leading-tight">
        {data.fullName.trim() || "Name"}
      </h1>
      <p className="mt-1 text-[13px] text-[var(--brand-ink-soft)]">
        {goesBy ? `Goes by ${goesBy} · ` : ""}
        Bring this page to your consult, or email it ahead.
      </p>

      <div className="mt-3 grid grid-cols-4 gap-2">
        <Summary label="Coverage now" value={data.currentCoverage || "—"} detail={data.otherCoverageNotes} />
        <Summary
          label="Location"
          value={data.zip || "—"}
          detail={[data.county, data.state].filter(Boolean).join(", ")}
        />
        <Summary label="Prescriptions" value={String(rxCount)} detail={`${genericCount} generic OK`} />
        <Summary label="Must-keep doctors" value={`${mustKeep} of ${docCount}`} detail="See page 2" />
      </div>

      <Section n={1} title="Name & contact">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-[13px]">
          <Field label="Full legal name" value={data.fullName} />
          <Field label="Preferred name" value={data.preferredName} />
          <Field label="Phone" value={data.phone} />
          <Field label="Email" value={data.email} />
          <Field label="Date of birth" value={data.dateOfBirth} />
          <Field label="Part B effective date" value={data.partBEffective} />
          <Field label="Street address" value={[data.addressLine1, data.addressLine2].filter(Boolean).join(", ")} />
          <Field label="County" value={data.county} />
          <Field label="City" value={data.city} />
          <Field label="State / ZIP" value={[data.state, data.zip].filter(Boolean).join(" ")} />
        </dl>
      </Section>

      <Section n={2} title="What shapes your plan options" note="These change which plans fit">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-[13px]">
          <Field label="Current coverage" value={data.currentCoverage} />
          <Field label="Preferred pharmacy" value={data.preferredPharmacy} />
          <Field label="Preferred hospital" value={data.preferredHospital} />
          <Field label="Monthly premium budget" value={data.monthlyPremiumBudget} />
          <Field label="Coverage notes" value={data.otherCoverageNotes} wide />
          <Field label="Caregiver / helper" value={data.caregiverName} />
          <Field label="Caregiver phone" value={data.caregiverPhone} />
        </dl>
        <ul className="mt-3 grid grid-cols-5 gap-2 text-[11px] leading-snug">
          <YesNo label="Out of state 1+ months a year" value={data.travelsOutOfState} extra={data.travelMonths} />
          <YesNo label="Tobacco in the last 12 months" value={data.tobaccoUse} />
          <YesNo label="Dental, vision, or hearing is a priority" value={data.wantsDentalVisionHearing} />
          <YesNo label="Also has Medicaid" value={data.dualEligibleMedicaid} />
          <YesNo label="Has VA benefits" value={data.hasVaBenefits} />
        </ul>
      </Section>

      <footer className="mt-auto border-t border-[var(--brand-line)] pt-2 text-[10px] leading-snug text-[var(--brand-text-3)]">
        Made in your browser at {BRAND.domain}. Nothing you typed was sent to or stored by the site.
        Educational use only, not affiliated with the U.S. government, CMS, or Medicare.
      </footer>
    </article>
  );
}

function PageTwo({
  data,
  prepared,
  rxs,
  docs,
  genericCount,
  mustKeep,
}: {
  data: ClientWorksheet;
  prepared: string;
  rxs: WorksheetPrescription[];
  docs: WorksheetProvider[];
  genericCount: number;
  mustKeep: number;
}) {
  const rxRows = rowsWithBlank(rxs, rxs.length + docs.length);
  const docRows = rowsWithBlank(docs, rxs.length + docs.length);

  return (
    <article className="worksheet-sheet flex h-[11in] w-[8.5in] flex-col overflow-hidden bg-white px-[0.48in] py-[0.42in] text-[var(--brand-ink)] shadow-[0_12px_40px_-24px_rgba(12,36,48,0.45)] print:shadow-none">
      <SheetHeader prepared={prepared} page={2} />

      <div className="mt-3 flex min-h-0 flex-1 flex-col">
        <section className="contents">
          <SectionHeading n={3} title="Prescriptions" meta={`${rxs.length} medication${rxs.length === 1 ? "" : "s"} · ${genericCount} generic OK`} />
          <div className="mt-1 grid shrink-0 grid-cols-[1.5rem_1.4fr_0.7fr_0.9fr_0.8fr] gap-2 border-b border-[var(--brand-line)] pb-1 text-[10px] font-medium tracking-[0.08em] text-[var(--brand-text-3)] uppercase">
            <span>#</span>
            <span>Drug name</span>
            <span>Dosage</span>
            <span>How often</span>
            <span>Generic</span>
          </div>
          {rxRows.map((row, index) => (
            <div
              key={row?.id ?? "rx-blank"}
              className="grid min-h-0 grid-cols-[1.5rem_1.4fr_0.7fr_0.9fr_0.8fr] items-center gap-2 overflow-hidden border-b border-[var(--brand-line)]/80 text-[14px] leading-tight"
              style={rowFlex}
            >
              <span className="text-[var(--brand-text-3)]">{index + 1}</span>
              <span className="truncate">{row?.name || ""}</span>
              <span className="truncate">{row?.dosage || ""}</span>
              <span className="truncate">{row?.frequency || ""}</span>
              <span className="truncate">{row ? (row.genericsOk ? "Generic OK" : "Brand only") : ""}</span>
            </div>
          ))}
        </section>

        <section className="contents">
          <div className="mt-3 shrink-0">
            <SectionHeading
              n={4}
              title="Doctors & specialists"
              meta={`${docs.length} provider${docs.length === 1 ? "" : "s"} · ${mustKeep} must keep`}
            />
          </div>
          <div className="mt-1 grid shrink-0 grid-cols-[1.2fr_1.1fr_0.8fr_0.7fr_0.7fr] gap-2 border-b border-[var(--brand-line)] pb-1 text-[10px] font-medium tracking-[0.08em] text-[var(--brand-text-3)] uppercase">
            <span>Doctor</span>
            <span>Practice / clinic</span>
            <span>Specialty</span>
            <span>City</span>
            <span>Keep?</span>
          </div>
          {docRows.map((row) => (
            <div
              key={row?.id ?? "doc-blank"}
              className="grid min-h-0 grid-cols-[1.2fr_1.1fr_0.8fr_0.7fr_0.7fr] items-center gap-2 overflow-hidden border-b border-[var(--brand-line)]/80 text-[14px] leading-tight"
              style={rowFlex}
            >
              <span className="truncate">{row?.name || ""}</span>
              <span className="truncate">{row?.practice || ""}</span>
              <span className="truncate">{row?.specialistType || ""}</span>
              <span className="truncate">{row?.address || ""}</span>
              <span>
                {row?.mustKeep === true && (
                  <span className="rounded-full bg-[var(--brand-amber-tint)] px-2 py-0.5 text-[11px] font-medium text-[var(--brand-amber-text)]">
                    Must keep
                  </span>
                )}
                {row?.mustKeep === false && (
                  <span className="rounded-full bg-[var(--brand-surface)] px-2 py-0.5 text-[11px] text-[var(--brand-text-3)]">
                    Flexible
                  </span>
                )}
              </span>
            </div>
          ))}
        </section>
      </div>

      <section className="mt-3 shrink-0">
        <SectionHeading n={5} title="Notes for your agent" />
        <p className="mt-1 max-h-[0.95in] overflow-hidden text-[13px] leading-snug whitespace-pre-wrap">
          {data.notesForAgent.trim() || " "}
        </p>
      </section>

      <div className="mt-3 grid shrink-0 grid-cols-2 gap-4">
        <section>
          <h3 className="text-[11px] font-medium tracking-[0.12em] text-[var(--brand-ink)] uppercase">
            Bring to your consult
          </h3>
          <ul className="mt-2 space-y-1.5 text-[13px]">
            {BRING.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="inline-block size-3.5 rounded-[3px] border border-[var(--brand-ink)]" />
                {item}
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-xl border-2 border-[var(--brand-ink)] px-3 py-2.5">
          <h3 className="text-[11px] font-medium tracking-[0.12em] uppercase">Your Consult</h3>
          <p className="mt-3 text-[13px]">Date & time</p>
          <div className="mt-5 border-b border-[var(--brand-ink)]" />
          <p className="mt-3 text-[13px]">Book or call: {PHONE_PLACEHOLDER}</p>
        </section>
      </div>

      <footer className="mt-3 shrink-0 border-t border-[var(--brand-line)] pt-2 text-[10px] leading-snug text-[var(--brand-text-3)]">
        Never write your Medicare number or Social Security number on this form. Made in your browser
        at {BRAND.domain}. Nothing you typed was sent to or stored by the site. Educational use only,
        not affiliated with the U.S. government, CMS, or Medicare.
      </footer>
    </article>
  );
}

const rowFlex: React.CSSProperties = {
  flex: "1 1 0",
  maxHeight: "0.4in",
};

function rowsWithBlank<T>(rows: T[], totalFilled: number): Array<T | null> {
  if (rows.length === 0) return [null];
  if (totalFilled <= 6) return [...rows, null];
  return rows;
}

function SheetHeader({ prepared, page }: { prepared: string; page: 1 | 2 }) {
  return (
    <header className="flex shrink-0 items-start justify-between gap-4 border-b border-[var(--brand-ink)] pb-2">
      <div>
        <Wordmark className="h-8 sm:h-8" />
        <p className="mt-1 text-[11px] text-[var(--brand-ink-soft)]">
          <PoweredBy />
        </p>
      </div>
      <p className="text-right text-[12px] leading-snug">
        <span className="block font-medium">Medicare Consult Worksheet</span>
        <span className="text-[var(--brand-text-3)]">
          Prepared {prepared} · Page {page} of 2
        </span>
      </p>
    </header>
  );
}

function Summary({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="rounded-lg bg-[var(--brand-surface)] px-2 py-1.5">
      <p className="text-[10px] font-medium tracking-[0.08em] text-[var(--brand-text-3)] uppercase">{label}</p>
      <p className="truncate text-[13px] font-medium">{value}</p>
      {detail ? <p className="truncate text-[11px] text-[var(--brand-ink-soft)]">{detail}</p> : null}
    </div>
  );
}

function Section({
  n,
  title,
  note,
  children,
}: {
  n: number;
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-4 shrink-0">
      <SectionHeading n={n} title={title} meta={note} />
      <div className="mt-2">{children}</div>
    </section>
  );
}

function SectionHeading({ n, title, meta }: { n: number; title: string; meta?: string }) {
  return (
    <div className="flex shrink-0 items-baseline justify-between gap-3">
      <h2 className="flex items-center gap-2 font-[family-name:var(--font-display)] text-[1.15rem] leading-none">
        <span className="inline-flex size-6 items-center justify-center rounded-full bg-[var(--brand-ink)] text-[12px] text-white">
          {n}
        </span>
        {title}
      </h2>
      {meta ? <p className="text-[12px] text-[var(--brand-text-3)]">{meta}</p> : null}
    </div>
  );
}

function Field({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={wide ? "col-span-2" : undefined}>
      <dt className="text-[10px] tracking-[0.06em] text-[var(--brand-text-3)] uppercase">{label}</dt>
      <dd className="min-h-[1.1em] border-b border-[var(--brand-line)] font-medium">{value.trim() || " "}</dd>
    </div>
  );
}

function YesNo({ label, value, extra }: { label: string; value: boolean | null; extra?: string }) {
  return (
    <li>
      <p>{label}</p>
      <p className="mt-1 flex gap-2">
        <span>Yes {value === true ? "☑" : "☐"}</span>
        <span>No {value === false ? "☑" : "☐"}</span>
      </p>
      {extra && value === true ? <p className="mt-0.5 truncate">{extra}</p> : null}
    </li>
  );
}
