import type { PropsWithChildren } from "react";
import { cn } from "@/shared/lib/cn";

export function Card({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return <section className={cn("card", className)}>{children}</section>;
}
