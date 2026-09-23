import Image from "next/image";
import { cn } from "@/lib/utils";

type WordmarkProps = {
  variant?: "color" | "on-dark" | "mono";
  className?: string;
};

const SRC = {
  color: "/brand/wordmark.png",
  "on-dark": "/brand/wordmark-on-dark.png",
  mono: "/brand/wordmark-mono.png",
} as const;

export function Wordmark({ variant = "color", className }: WordmarkProps) {
  return (
    <Image
      src={SRC[variant]}
      alt="FreeMedicareTools"
      width={1410}
      height={322}
      className={cn("h-10 w-auto sm:h-12", className)}
      priority={variant === "color"}
    />
  );
}
