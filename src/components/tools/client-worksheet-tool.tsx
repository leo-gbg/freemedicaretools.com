"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
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

const fieldClass =
  "flex h-9 w-full rounded-lg border border-input bg-white px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";
const areaClass =
  "w-full rounded-lg border border-input bg-white px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function ClientWorksheetTool() {
  const router = useRouter();
  const [data, setData] = useState<ClientWorksheet>(() => emptyWorksheet());
  const [error, setError] = useState("");

  function patch(partial: Partial<ClientWorksheet>) {
    setData((prev) => ({ ...prev, ...partial }));
  }

  function updateRx(id: string, partial: Partial<WorksheetPrescription>) {
    setData((prev) => ({
      ...prev,
      prescriptions: prev.prescriptions.map((r) =>
        r.id === id ? { ...r, ...partial } : r
      ),
    }));
  }

  function updateProvider(id: string, partial: Partial<WorksheetProvider>) {
    setData((prev) => ({
      ...prev,
      providers: prev.providers.map((p) => (p.id === id ? { ...p, ...partial } : p)),
    }));
  }

  function goToPrint() {
    if (!data.fullName.trim() || !data.phone.trim()) {
      setError("Add at least your full name and phone so your agent can reach you.");
      return;
    }
    setError("");
    const payload: ClientWorksheet = {
      ...data,
      completedAt: new Date().toLocaleString("en-US", {
        dateStyle: "long",
        timeStyle: "short",
      }),
    };
    saveWorksheet(payload);
    router.push("/tools/client-worksheet/print");
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-[var(--brand-line)] bg-white/70 p-5 text-sm leading-relaxed text-[var(--brand-ink-soft)]">
        <p>
          Fill this worksheet, then print or save a PDF to bring with you. Answers about ZIP,
          doctors, drugs, and travel are for that printout only.
        </p>
        <p className="mt-2">
          <strong>Privacy:</strong> nothing you type is posted to a server. A copy is kept only in
          this browser tab so the print page can open. We do not ask for a Medicare number (MBI) or
          Social Security number — do not type those in the notes. If you email anyone, do not put
          medications, date of birth, Medicaid, VA benefits, or other health details in the message.
          Attach a PDF you saved yourself only if you choose to.
        </p>
      </div>

      <section className="space-y-4 rounded-2xl border border-[var(--brand-line)] bg-white/70 p-5">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--brand-ink)]">
          1 · Name & contact
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Full legal name *">
            <input
              className={fieldClass}
              value={data.fullName}
              onChange={(e) => patch({ fullName: e.target.value })}
              autoComplete="name"
            />
          </Field>
          <Field label="Preferred name">
            <input
              className={fieldClass}
              value={data.preferredName}
              onChange={(e) => patch({ preferredName: e.target.value })}
            />
          </Field>
          <Field label="Phone *">
            <input
              className={fieldClass}
              type="tel"
              value={data.phone}
              onChange={(e) => patch({ phone: e.target.value })}
              autoComplete="tel"
            />
          </Field>
          <Field label="Email">
            <input
              className={fieldClass}
              type="email"
              value={data.email}
              onChange={(e) => patch({ email: e.target.value })}
              autoComplete="email"
            />
          </Field>
          <Field label="Date of birth">
            <input
              className={fieldClass}
              type="date"
              value={data.dateOfBirth}
              onChange={(e) => patch({ dateOfBirth: e.target.value })}
            />
          </Field>
          <Field label="Part B effective date (if known)">
            <input
              className={fieldClass}
              type="date"
              value={data.partBEffective}
              onChange={(e) => patch({ partBEffective: e.target.value })}
            />
          </Field>
        </div>
        <div className="grid gap-3">
          <Field label="Street address">
            <input
              className={fieldClass}
              value={data.addressLine1}
              onChange={(e) => patch({ addressLine1: e.target.value })}
              autoComplete="address-line1"
            />
          </Field>
          <Field label="Apt / suite">
            <input
              className={fieldClass}
              value={data.addressLine2}
              onChange={(e) => patch({ addressLine2: e.target.value })}
              autoComplete="address-line2"
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-4">
            <Field label="City">
              <input
                className={fieldClass}
                value={data.city}
                onChange={(e) => patch({ city: e.target.value })}
                autoComplete="address-level2"
              />
            </Field>
            <Field label="State">
              <input
                className={fieldClass}
                value={data.state}
                onChange={(e) => patch({ state: e.target.value })}
                autoComplete="address-level1"
              />
            </Field>
            <Field label="ZIP *">
              <input
                className={fieldClass}
                value={data.zip}
                onChange={(e) => patch({ zip: e.target.value })}
                autoComplete="postal-code"
              />
            </Field>
            <Field label="County">
              <input
                className={fieldClass}
                value={data.county}
                onChange={(e) => patch({ county: e.target.value })}
              />
            </Field>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-[var(--brand-line)] bg-white/70 p-5">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--brand-ink)]">
          2 · What else changes your plan options?
        </h2>
        <p className="text-sm text-[var(--brand-ink-soft)]">
          ZIP/county, current coverage, pharmacy, travel, tobacco, and extra benefits (dental /
          vision / hearing) all affect which Advantage, Part D, and Medigap quotes your agent can
          show.
        </p>
        <Field label="Current coverage">
          <select
            className={fieldClass}
            value={data.currentCoverage}
            onChange={(e) => patch({ currentCoverage: e.target.value })}
          >
            <option value="">Select…</option>
            {CURRENT_COVERAGE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Other coverage notes (employer, COBRA, spouse plan, etc.)">
          <textarea
            className={areaClass}
            rows={2}
            value={data.otherCoverageNotes}
            onChange={(e) => patch({ otherCoverageNotes: e.target.value })}
          />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Preferred pharmacy (name / chain / location)">
            <input
              className={fieldClass}
              value={data.preferredPharmacy}
              onChange={(e) => patch({ preferredPharmacy: e.target.value })}
            />
          </Field>
          <Field label="Preferred hospital">
            <input
              className={fieldClass}
              value={data.preferredHospital}
              onChange={(e) => patch({ preferredHospital: e.target.value })}
            />
          </Field>
          <Field label="Comfortable monthly premium budget">
            <input
              className={fieldClass}
              placeholder="e.g. under $150 / month total extras"
              value={data.monthlyPremiumBudget}
              onChange={(e) => patch({ monthlyPremiumBudget: e.target.value })}
            />
          </Field>
        </div>
        <YesNo
          label="Do you spend 1+ months a year out of state (snowbird / travel)?"
          value={data.travelsOutOfState}
          onChange={(v) => patch({ travelsOutOfState: v })}
        />
        {data.travelsOutOfState && (
          <Field label="Which months / where?">
            <input
              className={fieldClass}
              value={data.travelMonths}
              onChange={(e) => patch({ travelMonths: e.target.value })}
            />
          </Field>
        )}
        <YesNo
          label="Tobacco use in the last 12 months? (can affect Medigap rates in some states)"
          value={data.tobaccoUse}
          onChange={(v) => patch({ tobaccoUse: v })}
        />
        <YesNo
          label="Are dental, vision, or hearing benefits a high priority?"
          value={data.wantsDentalVisionHearing}
          onChange={(v) => patch({ wantsDentalVisionHearing: v })}
        />
        <YesNo
          label="Do you also have Medicaid (dual eligible)?"
          value={data.dualEligibleMedicaid}
          onChange={(v) => patch({ dualEligibleMedicaid: v })}
        />
        <YesNo
          label="Do you have VA benefits?"
          value={data.hasVaBenefits}
          onChange={(v) => patch({ hasVaBenefits: v })}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Caregiver / helper name (optional)">
            <input
              className={fieldClass}
              value={data.caregiverName}
              onChange={(e) => patch({ caregiverName: e.target.value })}
            />
          </Field>
          <Field label="Caregiver phone">
            <input
              className={fieldClass}
              type="tel"
              value={data.caregiverPhone}
              onChange={(e) => patch({ caregiverPhone: e.target.value })}
            />
          </Field>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-[var(--brand-line)] bg-white/70 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--brand-ink)]">
            3 · Prescriptions
          </h2>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setData((prev) => ({
                ...prev,
                prescriptions: [...prev.prescriptions, emptyPrescription()],
              }))
            }
          >
            Add prescription
          </Button>
        </div>
        <p className="text-sm text-[var(--brand-ink-soft)]">
          List every medication you take regularly. Check “generics OK” if a generic substitute is
          acceptable—this often opens lower Part D costs.
        </p>
        <ul className="space-y-4">
          {data.prescriptions.map((rx, i) => (
            <li
              key={rx.id}
              className="rounded-xl border border-[var(--brand-line)] bg-[var(--brand-mist)]/40 p-4"
            >
              <p className="mb-3 text-xs tracking-[0.12em] text-[var(--brand-teal)] uppercase">
                Prescription {i + 1}
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Drug name">
                  <input
                    className={fieldClass}
                    value={rx.name}
                    onChange={(e) => updateRx(rx.id, { name: e.target.value })}
                  />
                </Field>
                <Field label="Dosage">
                  <input
                    className={fieldClass}
                    placeholder="e.g. 20 mg"
                    value={rx.dosage}
                    onChange={(e) => updateRx(rx.id, { dosage: e.target.value })}
                  />
                </Field>
                <Field label="Frequency">
                  <input
                    className={fieldClass}
                    placeholder="e.g. once daily"
                    value={rx.frequency}
                    onChange={(e) => updateRx(rx.id, { frequency: e.target.value })}
                  />
                </Field>
              </div>
              <label className="mt-3 flex items-center gap-2 text-sm text-[var(--brand-ink)]">
                <input
                  type="checkbox"
                  checked={rx.genericsOk}
                  onChange={(e) => updateRx(rx.id, { genericsOk: e.target.checked })}
                />
                Generics are OK for this medication
              </label>
              {data.prescriptions.length > 1 && (
                <button
                  type="button"
                  className="mt-2 text-sm text-[var(--brand-ink-soft)] underline-offset-2 hover:underline"
                  onClick={() =>
                    setData((prev) => ({
                      ...prev,
                      prescriptions: prev.prescriptions.filter((r) => r.id !== rx.id),
                    }))
                  }
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4 rounded-2xl border border-[var(--brand-line)] bg-white/70 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--brand-ink)]">
            4 · Doctors & specialists
          </h2>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setData((prev) => ({
                ...prev,
                providers: [...prev.providers, emptyProvider()],
              }))
            }
          >
            Add provider
          </Button>
        </div>
        <p className="text-sm text-[var(--brand-ink-soft)]">
          Include primary care and specialists. Mark “must keep” if you will not switch providers—even
          if it narrows plan choices.
        </p>
        <ul className="space-y-4">
          {data.providers.map((p, i) => (
            <li
              key={p.id}
              className="rounded-xl border border-[var(--brand-line)] bg-[var(--brand-mist)]/40 p-4"
            >
              <p className="mb-3 text-xs tracking-[0.12em] text-[var(--brand-teal)] uppercase">
                Provider {i + 1}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Doctor / provider name">
                  <input
                    className={fieldClass}
                    value={p.name}
                    onChange={(e) => updateProvider(p.id, { name: e.target.value })}
                  />
                </Field>
                <Field label="Practice / clinic name">
                  <input
                    className={fieldClass}
                    value={p.practice}
                    onChange={(e) => updateProvider(p.id, { practice: e.target.value })}
                  />
                </Field>
                <Field label="Specialist type (or PCP)">
                  <input
                    className={fieldClass}
                    placeholder="e.g. PCP, cardiology, oncology"
                    value={p.specialistType}
                    onChange={(e) => updateProvider(p.id, { specialistType: e.target.value })}
                  />
                </Field>
                <Field label="Address / city">
                  <input
                    className={fieldClass}
                    value={p.address}
                    onChange={(e) => updateProvider(p.id, { address: e.target.value })}
                  />
                </Field>
              </div>
              <fieldset className="mt-3">
                <legend className="text-sm font-medium text-[var(--brand-ink)]">
                  Do you absolutely need to keep this provider?
                </legend>
                <div className="mt-2 flex flex-wrap gap-4 text-sm">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`must-keep-${p.id}`}
                      checked={p.mustKeep === true}
                      onChange={() => updateProvider(p.id, { mustKeep: true })}
                    />
                    Yes — must keep
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`must-keep-${p.id}`}
                      checked={p.mustKeep === false}
                      onChange={() => updateProvider(p.id, { mustKeep: false })}
                    />
                    Flexible if a better plan fits
                  </label>
                </div>
              </fieldset>
              {data.providers.length > 1 && (
                <button
                  type="button"
                  className="mt-2 text-sm text-[var(--brand-ink-soft)] underline-offset-2 hover:underline"
                  onClick={() =>
                    setData((prev) => ({
                      ...prev,
                      providers: prev.providers.filter((x) => x.id !== p.id),
                    }))
                  }
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3 rounded-2xl border border-[var(--brand-line)] bg-white/70 p-5">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--brand-ink)]">
          5 · Notes for your agent
        </h2>
        <textarea
          className={areaClass}
          rows={4}
          placeholder="Surgeries coming up, preferred language, hearing needs, who should be on the call…"
          value={data.notesForAgent}
          onChange={(e) => patch({ notesForAgent: e.target.value })}
        />
      </section>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          className="bg-[var(--brand-teal)] text-white hover:bg-[var(--brand-teal-deep)]"
          onClick={goToPrint}
        >
          Create printable PDF worksheet
        </Button>
      </div>
      <p className="text-xs text-[var(--brand-ink-soft)]">
        Next screen: Print / Save as PDF. The email button does not include this worksheet. Nothing
        is uploaded from this browser.
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5 text-sm">
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
  onChange: (v: boolean) => void;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-[var(--brand-ink)]">{label}</legend>
      <div className="flex gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input type="radio" checked={value === true} onChange={() => onChange(true)} />
          Yes
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" checked={value === false} onChange={() => onChange(false)} />
          No
        </label>
      </div>
    </fieldset>
  );
}
