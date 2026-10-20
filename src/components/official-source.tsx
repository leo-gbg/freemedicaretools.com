import { OFFICIAL_SOURCE_SENTENCE, type OfficialLink } from "@/lib/medicare/official";

const linkClass =
  "font-medium text-[var(--brand-teal-deep)] underline underline-offset-4";

export function OfficialSourceNote({
  links = [],
  className = "",
  inverted = false,
}: {
  links?: OfficialLink[];
  className?: string;
  /** Use on a dark surface so the line stays readable. */
  inverted?: boolean;
}) {
  const [before, after] = OFFICIAL_SOURCE_SENTENCE.split("Medicare.gov");
  const text = inverted ? "text-white/75" : "text-[var(--brand-text-3)]";
  const link = inverted
    ? "font-medium text-[var(--brand-amber)] underline underline-offset-4 hover:text-white"
    : linkClass;

  return (
    <p className={`text-sm leading-relaxed ${text} ${className}`}>
      {before}
      <a
        href="https://www.medicare.gov/"
        className={link}
        rel="noopener noreferrer"
        target="_blank"
      >
        Medicare.gov
      </a>
      {after}
      {links.length > 0 && (
        <>
          {" "}
          Related:{" "}
          {links.map((item, index) => (
            <span key={item.href}>
              {index > 0 ? " · " : ""}
              <a
                href={item.href}
                className={link}
                rel="noopener noreferrer"
                target="_blank"
              >
                {item.label}
              </a>
            </span>
          ))}
          .
        </>
      )}
    </p>
  );
}
