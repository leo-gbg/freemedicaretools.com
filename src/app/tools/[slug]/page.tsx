import { notFound } from "next/navigation";
import { ToolShell } from "@/components/tool-shell";
import { AepChecklistTool } from "@/components/tools/aep-checklist-tool";
import { IepTimelineTool } from "@/components/tools/iep-timeline-tool";
import { IrmaaCheckerTool } from "@/components/tools/irmaa-checker-tool";
import { ClientWorksheetTool } from "@/components/tools/client-worksheet-tool";
import { MedSuppCompareTool } from "@/components/tools/med-supp-compare-tool";
import { PathQuizTool } from "@/components/tools/path-quiz-tool";
import { PenaltyEstimatorTool } from "@/components/tools/penalty-estimator-tool";
import { PeriodFinderTool } from "@/components/tools/period-finder-tool";
import { WorkingPast65Tool } from "@/components/tools/working-past-65-tool";
import { getTool, TOOLS } from "@/lib/medicare/tools";

export function generateStaticParams() {
  return TOOLS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) return { title: "Tool" };
  return { title: tool.title, description: tool.blurb };
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) notFound();

  return (
    <ToolShell tool={tool}>
      {slug === "iep-timeline" && <IepTimelineTool />}
      {slug === "penalty-estimator" && <PenaltyEstimatorTool />}
      {slug === "period-finder" && <PeriodFinderTool />}
      {slug === "path-quiz" && <PathQuizTool />}
      {slug === "med-supp-compare" && <MedSuppCompareTool />}
      {slug === "client-worksheet" && <ClientWorksheetTool />}
      {slug === "irmaa-checker" && <IrmaaCheckerTool />}
      {slug === "working-past-65" && <WorkingPast65Tool />}
      {slug === "aep-checklist" && <AepChecklistTool />}
    </ToolShell>
  );
}
