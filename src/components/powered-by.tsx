import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

type PoweredByProps = {
  className?: string;
  linkClassName?: string;
  /** Prefixed line, e.g. default "Powered by" */
  prefix?: string;
};

/** “Powered by Guardian Benefits Group” with agency site link. */
export function PoweredBy({
  className,
  linkClassName,
  prefix = "Powered by",
}: PoweredByProps) {
  return (
    <span className={className}>
      {prefix}{" "}
      <a
        href={BRAND.agencyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "text-[var(--brand-teal)] underline-offset-2 hover:underline",
          linkClassName
        )}
      >
        {BRAND.poweredBy}
      </a>
    </span>
  );
}

/** Standalone agency name link (when “Powered by” prefix is not wanted). */
export function AgencyLink({ className }: { className?: string }) {
  return (
    <a
      href={BRAND.agencyUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "text-[var(--brand-teal)] underline-offset-2 hover:underline",
        className
      )}
    >
      {BRAND.poweredBy}
    </a>
  );
}
