import { cn } from "@/shared/lib/cn";

export function Badge({
  children,
  tone = "default",
}: {
  children: string;
  tone?: "default" | "success" | "warning" | "danger" | "accent";
}) {
  return <span className={cn("badge", `badge-${tone}`)}>{children}</span>;
}
