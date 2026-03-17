import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, className, ...props },
  ref,
) {
  return (
    <label className="field">
      {label ? <span className="field-label">{label}</span> : null}
      <input ref={ref} className={cn("input", error && "input-error", className)} {...props} />
      {error ? <span className="field-error">{error}</span> : null}
    </label>
  );
});
