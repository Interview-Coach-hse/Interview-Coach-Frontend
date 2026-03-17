import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, className, ...props },
  ref,
) {
  return (
    <label className="field">
      {label ? <span className="field-label">{label}</span> : null}
      <textarea ref={ref} className={cn("textarea", error && "input-error", className)} {...props} />
      {error ? <span className="field-error">{error}</span> : null}
    </label>
  );
});
