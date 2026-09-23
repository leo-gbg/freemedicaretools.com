"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  CURRENT_COVERAGE_OPTIONS,
  emptyPrescription,
  emptyProvider,
  emptyWorksheet,
  saveWorksheet,
  type ClientWorksheet,
  type WorksheetPrescription,
  type WorksheetProvider,
} from "@/lib/medicare/client-worksheet";
import { areaClass, btnInk, btnOutline, cardClass, fieldClass } from "@/lib/visual";

const STEPS = ["Contact", "Plan context", "Prescriptions", "Doctors", "Notes"] as const;

export function ClientWorksheetTool() {
  const router = useRouter();
  const [data, setData] = useState<ClientWorksheet>(() => emptyWorksheet());
  const [error, setError] = useState("");
  const [step, setStep] = useState(0);

  function patch(partial: Partial<ClientWorksheet>) {
    setData((prev) => ({ ...prev, ...partial }));
  }

  function updateRx(id: string, partial: Partial<WorksheetPrescription>) {
    setData((prev) => ({
      ...prev,
      prescriptions: prev.prescriptions.map((row) => (row.id === id ? { ...row, ...partial } : row)),
    }));
  }

  function updateProvider(id: string, partial: Partial<WorksheetProvider>) {
    setData((prev) => ({
      ...prev,
      providers: prev.providers.map((row) => (row.id === id ? { ...row, ...partial } : row)),
    }));
  }

  function goToPrint() {
    if (!data.fullName.trim() || !data.phone.trim()) {
      setError("Add at least your full name and phone so your agent can reach you.");
      setStep(0);
      return;
    }
    setError("");
    saveWorksheet({
      ...data,
      completedAt: new Date().toLocaleString("en-US", {
        dateStyle: "long",
        timeStyle: "short",
      }),
    });
    router.push("/tools/client-worksheet/print");
  }

  const checks = [
    { label: "Name", ok: Boolean(data.fullName.trim()) },
    { label: "Phone", ok: Boolean(data.phone.trim()) },
    { label: "ZIP", ok: Boolean(data.zip.trim()) },
    { label: "Current coverage", ok: Boolean(data.currentCoverage) },
    { label: "A prescription", ok: data.prescriptions.some((row) => row.name.trim()) },
    { label: "A doctor", ok: data.providers.some((row) => row.name.trim()) },
    { label: "Notes", ok: Boolean(data.notesForAgent.trim()) },
  ];

  return (
    <div className="grid w-full max-w-full grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="min-w-0 max-w-full">
        <div className="mb-4 w-full max-w-full overflow-x-auto lg:hidden">
        <ol className="flex w-max gap-2 pb-1">
          {STEPS.map((label, index) => (
            <li key={label}>
              <button
                type="button"
                onClick={() => setStep(index)}
                className={`inline-flex min-h-12 items-center rounded-full px-3 text-sm ${
                  index === step ? "bg-[var(--brand-ink)] text-white" : "bg-white text-[var(--brand-ink-soft)]"
                }`}
              >
                {index + 1}. {label}
              </button>
            </li>
          ))}
        </ol>
        </div>

        <div className="grid min-w-0 gap-4 lg:grid-cols-[9rem_minmax(0,1fr)]">
          <ol className="hidden lg:block">
            {STEPS.map((label, index) => (
              <li key={label}>
                <button
                  type="button"
                  onClick={() => setStep(index)}
                  className={`flex min-h-12 w-full items-center gap-2 text-left text-base ${
                    index === step ? "font-medium text-[var(--brand-ink)]" : "text-[var(--brand-text-3)]"
                  }`}
                  aria-current={index === step ? "step" : undefined}
                >
                  <span
                    className={`inline-flex size-7 items-center justify-center rounded-full text-sm ${
                      index === step
                        ? "bg-[var(--brand-teal)] text-white"
                        : "bg-[var(--brand-teal-tint)] text-[var(--brand-teal-deep)]"
                    }`}
                  >
                    {index + 1}
                  </span>
                  {label}
                </button>
              </li>
            ))}
          </ol>

          <div className={`${cardClass} p-5`}>
            {step === 0 && <ContactStep data={data} patch={patch} />}
            {step === 1 && <ContextStep data={data} patch={patch} />}
            {step === 2 && (
              <RxStep
                data={data}
                updateRx={updateRx}
                onAdd={() =>
                  setData((prev) => ({
                    ...prev,
                    prescriptions: [...prev.prescriptions, emptyPrescription()],
                  }))
                }
                onRemove={(id) =>
                  setData((prev) => ({
                    ...prev,
                    prescriptions: prev.prescriptions.filter((row) => row.id !== id),
                  }))
                }
              />
            )}
            {step === 3 && (
              <DoctorStep
                data={data}
                updateProvider={updateProvider}
                onAdd={() =>
                  setData((prev) => ({
                    ...prev,
                    providers: [...prev.providers, emptyProvider()],
                  }))
                }
                onRemove={(id) =>
                  setData((prev) => ({
                    ...prev,
                    providers: prev.providers.filter((row) => row.id !== id),
                  }))
                }
              />
            )}
            {step === 4 && (
              <div className="space-y-3">
                <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--brand-ink)]">
                  Notes for your agent
                </h2>
                <textarea
                  className={areaClass}
                  rows={5}
                  placeholder="Surgeries coming up, preferred language, hearing needs, who should join the consult…"
                  value={data.notesForAgent}
                  onChange={(event) => patch({ notesForAgent: event.target.value })}
                />
              </div>
            )}

            {error && <p className="mt-4 text-base text-[var(--brand-red-text)]">{error}</p>}

            <div className="mt-6 flex flex-wrap gap-3">
              {step > 0 && (
                <button type="button" className={btnOutline} onClick={() => setStep((value) => value - 1)}>
                  Back
                </button>
              )}
              {step < STEPS.length - 1 ? (
                <button type="button" className={btnInk} onClick={() => setStep((value) => value + 1)}>
                  Next
                </button>
              ) : (
                <button type="button" className={btnInk} onClick={goToPrint}>
                  Print worksheet
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="rounded-[24px] bg-[var(--brand-ink)] p-5 text-white">
          <p className="text-sm font-medium tracking-[0.14em] text-[var(--brand-amber)] uppercase">
            Private by design
          </p>
          <p className="mt-2 text-base leading-relaxed text-white/85">
            Nothing you type is posted to a server. A copy stays in this browser tab so the print
            page can open. We do not ask for a Medicare number (MBI) or Social Security number — do
            not type those in the notes. Do not email medications, date of birth, Medicaid, or VA
            details.
          </p>
        </div>
        <div className={`${cardClass} p-5`}>
          <p className="font-[family-name:var(--font-display)] text-xl text-[var(--brand-ink)]">
            Your printout so far
          </p>
          <ul className="mt-3 space-y-2 text-base">
            {checks.map((item) => (
              <li key={item.label} className="flex items-center justify-between gap-3">
                <span className="text-[var(--brand-ink)]">{item.label}</span>
                <span className={item.ok ? "text-[var(--brand-teal-deep)]" : "text-[var(--brand-text-3)]"}>
                  {item.ok ? "Added" : "Empty"}
                </span>
              </li>
            ))}
          </ul>
          <button type="button" className={`${btnInk} mt-4 w-full`} onClick={goToPrint}>
            Print
          </button>
          <p className="mt-3 text-sm text-[var(--brand-text-3)]">
            The email button on the print page does not include this worksheet.
          </p>
        </div>
      </aside>
    </div>
  );
}

function ContactStep({
  data,
  patch,
}: {
  data: ClientWorksheet;
  patch: (partial: Partial<ClientWorksheet>) => void;
}) {
  return (
    <div className="space-y-4">
      <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--brand-ink)]">
        Name and contact
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Full legal name *">
          <input className={fieldClass} value={data.fullName} autoComplete="name" onChange={(e) => patch({ fullName: e.target.value })} />
        </Field>
        <Field label="Preferred name">
          <input className={fieldClass} value={data.preferredName} onChange={(e) => patch({ preferredName: e.target.value })} />
        </Field>
        <Field label="Phone *">
          <input className={fieldClass} type="tel" value={data.phone} autoComplete="tel" onChange={(e) => patch({ phone: e.target.value })} />
        </Field>
        <Field label="Email">
          <input className={fieldClass} type="email" value={data.email} autoComplete="email" onChange={(e) => patch({ email: e.target.value })} />
        </Field>
        <Field label="Date of birth">
          <input className={fieldClass} type="date" value={data.dateOfBirth} onChange={(e) => patch({ dateOfBirth: e.target.value })} />
        </Field>
        <Field label="Part B effective date (if known)">
          <input className={fieldClass} type="date" value={data.partBEffective} onChange={(e) => patch({ partBEffective: e.target.value })} />
        </Field>
      </div>
      <Field label="Street address">
        <input className={fieldClass} value={data.addressLine1} autoComplete="address-line1" onChange={(e) => patch({ addressLine1: e.target.value })} />
      </Field>
      <Field label="Apt / suite">
        <input className={fieldClass} value={data.addressLine2} autoComplete="address-line2" onChange={(e) => patch({ addressLine2: e.target.value })} />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="City">
          <input className={fieldClass} value={data.city} autoComplete="address-level2" onChange={(e) => patch({ city: e.target.value })} />
        </Field>
        <Field label="State">
          <input className={fieldClass} value={data.state} autoComplete="address-level1" onChange={(e) => patch({ state: e.target.value })} />
        </Field>
        <Field label="ZIP *">
          <input className={fieldClass} value={data.zip} autoComplete="postal-code" onChange={(e) => patch({ zip: e.target.value })} />
        </Field>
        <Field label="County">
          <input className={fieldClass} value={data.county} onChange={(e) => patch({ county: e.target.value })} />
        </Field>
      </div>
    </div>
  );
}

function ContextStep({
  data,
  patch,
}: {
  data: ClientWorksheet;
  patch: (partial: Partial<ClientWorksheet>) => void;
}) {
  return (
    <div className="space-y-4">
      <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--brand-ink)]">
        What else changes your plan options?
      </h2>
      <p className="text-base text-[var(--brand-ink-soft)]">
        ZIP, current coverage, pharmacy, travel, tobacco, and extra benefits affect which Advantage,
        Part D, and Medigap plan options your agent can show.
      </p>
      <Field label="Current coverage">
        <select className={fieldClass} value={data.currentCoverage} onChange={(e) => patch({ currentCoverage: e.target.value })}>
          <option value="">Select…</option>
          {CURRENT_COVERAGE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Other coverage notes (employer, COBRA, spouse plan, etc.)">
        <textarea className={areaClass} rows={2} value={data.otherCoverageNotes} onChange={(e) => patch({ otherCoverageNotes: e.target.value })} />
      </Field>
      <Field label="Preferred pharmacy">
        <input className={fieldClass} value={data.preferredPharmacy} onChange={(e) => patch({ preferredPharmacy: e.target.value })} />
      </Field>
      <Field label="Preferred hospital">
        <input className={fieldClass} value={data.preferredHospital} onChange={(e) => patch({ preferredHospital: e.target.value })} />
      </Field>
      <Field label="Comfortable monthly premium budget">
        <input className={fieldClass} placeholder="e.g. under $150 / month total extras" value={data.monthlyPremiumBudget} onChange={(e) => patch({ monthlyPremiumBudget: e.target.value })} />
      </Field>
      <YesNo label="Do you spend 1+ months a year out of state?" value={data.travelsOutOfState} onChange={(v) => patch({ travelsOutOfState: v })} />
      {data.travelsOutOfState && (
        <Field label="Which months / where?">
          <input className={fieldClass} value={data.travelMonths} onChange={(e) => patch({ travelMonths: e.target.value })} />
        </Field>
      )}
      <YesNo label="Tobacco use in the last 12 months?" value={data.tobaccoUse} onChange={(v) => patch({ tobaccoUse: v })} />
      <YesNo label="Are dental, vision, or hearing benefits a high priority?" value={data.wantsDentalVisionHearing} onChange={(v) => patch({ wantsDentalVisionHearing: v })} />
      <YesNo label="Do you also have Medicaid (dual eligible)?" value={data.dualEligibleMedicaid} onChange={(v) => patch({ dualEligibleMedicaid: v })} />
      <YesNo label="Do you have VA benefits?" value={data.hasVaBenefits} onChange={(v) => patch({ hasVaBenefits: v })} />
      <Field label="Caregiver / helper name (optional)">
        <input className={fieldClass} value={data.caregiverName} onChange={(e) => patch({ caregiverName: e.target.value })} />
      </Field>
      <Field label="Caregiver phone">
        <input className={fieldClass} type="tel" value={data.caregiverPhone} onChange={(e) => patch({ caregiverPhone: e.target.value })} />
      </Field>
    </div>
  );
}

function RxStep({
  data,
  updateRx,
  onAdd,
  onRemove,
}: {
  data: ClientWorksheet;
  updateRx: (id: string, partial: Partial<WorksheetPrescription>) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--brand-ink)]">Prescriptions</h2>
        <button type="button" className={btnOutline} onClick={onAdd}>
          Add prescription
        </button>
      </div>
      <ul className="space-y-4">
        {data.prescriptions.map((rx, index) => (
          <li key={rx.id} className="rounded-2xl bg-[var(--brand-surface)] p-4">
            <p className="text-sm font-medium text-[var(--brand-teal-deep)]">Prescription {index + 1}</p>
            <div className="mt-3 grid gap-3">
              <Field label="Drug name">
                <input className={fieldClass} value={rx.name} onChange={(e) => updateRx(rx.id, { name: e.target.value })} />
              </Field>
              <Field label="Dosage">
                <input className={fieldClass} placeholder="e.g. 20 mg" value={rx.dosage} onChange={(e) => updateRx(rx.id, { dosage: e.target.value })} />
              </Field>
              <Field label="Frequency">
                <input className={fieldClass} placeholder="e.g. once daily" value={rx.frequency} onChange={(e) => updateRx(rx.id, { frequency: e.target.value })} />
              </Field>
            </div>
            <label className="mt-3 flex min-h-12 items-center gap-2 text-base">
              <input type="checkbox" className="size-7 accent-[var(--brand-teal)]" checked={rx.genericsOk} onChange={(e) => updateRx(rx.id, { genericsOk: e.target.checked })} />
              Generics are OK for this medication
            </label>
            {data.prescriptions.length > 1 && (
              <button type="button" className="mt-2 min-h-12 text-base text-[var(--brand-ink-soft)] underline" onClick={() => onRemove(rx.id)}>
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function DoctorStep({
  data,
  updateProvider,
  onAdd,
  onRemove,
}: {
  data: ClientWorksheet;
  updateProvider: (id: string, partial: Partial<WorksheetProvider>) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--brand-ink)]">Doctors and specialists</h2>
        <button type="button" className={btnOutline} onClick={onAdd}>
          Add provider
        </button>
      </div>
      <ul className="space-y-4">
        {data.providers.map((provider, index) => (
          <li key={provider.id} className="rounded-2xl bg-[var(--brand-surface)] p-4">
            <p className="text-sm font-medium text-[var(--brand-teal-deep)]">Provider {index + 1}</p>
            <div className="mt-3 grid gap-3">
              <Field label="Doctor / provider name">
                <input className={fieldClass} value={provider.name} onChange={(e) => updateProvider(provider.id, { name: e.target.value })} />
              </Field>
              <Field label="Practice / clinic name">
                <input className={fieldClass} value={provider.practice} onChange={(e) => updateProvider(provider.id, { practice: e.target.value })} />
              </Field>
              <Field label="Specialist type (or PCP)">
                <input className={fieldClass} placeholder="e.g. PCP, cardiology" value={provider.specialistType} onChange={(e) => updateProvider(provider.id, { specialistType: e.target.value })} />
              </Field>
              <Field label="Address / city">
                <input className={fieldClass} value={provider.address} onChange={(e) => updateProvider(provider.id, { address: e.target.value })} />
              </Field>
            </div>
            <fieldset className="mt-3">
              <legend className="text-base font-medium">Do you absolutely need to keep this provider?</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                <label className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-[var(--brand-input)] bg-white px-3">
                  <input type="radio" className="size-6" name={`must-keep-${provider.id}`} checked={provider.mustKeep === true} onChange={() => updateProvider(provider.id, { mustKeep: true })} />
                  Must keep
                </label>
                <label className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-[var(--brand-input)] bg-white px-3">
                  <input type="radio" className="size-6" name={`must-keep-${provider.id}`} checked={provider.mustKeep === false} onChange={() => updateProvider(provider.id, { mustKeep: false })} />
                  Flexible
                </label>
              </div>
            </fieldset>
            {data.providers.length > 1 && (
              <button type="button" className="mt-2 min-h-12 text-base text-[var(--brand-ink-soft)] underline" onClick={() => onRemove(provider.id)}>
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5 text-base">
      <span className="font-medium text-[var(--brand-ink)]">{label}</span>
      {children}
    </label>
  );
}

function YesNo({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean | null;
  onChange: (value: boolean) => void;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-base font-medium text-[var(--brand-ink)]">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {[true, false].map((choice) => (
          <label
            key={String(choice)}
            className={`inline-flex min-h-12 items-center gap-2 rounded-xl border px-4 ${
              value === choice ? "border-[var(--brand-ink)] bg-[var(--brand-ink)] text-white" : "border-[var(--brand-input)] bg-white"
            }`}
          >
            <input type="radio" className="size-6" checked={value === choice} onChange={() => onChange(choice)} />
            {choice ? "Yes" : "No"}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
