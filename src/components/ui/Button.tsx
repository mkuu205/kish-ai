import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cn } from "@/utils/cn";

export type ButtonVariant = "primary" | "ghost" | "danger";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "ghost", type = "button", ...props },
  ref,
) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 disabled:pointer-events-none disabled:opacity-45";

  const styles: Record<ButtonVariant, string> = {
    primary:
      "bg-gradient-to-br from-cyan-400 to-cyan-600 font-semibold text-black shadow-[0_0_18px_rgba(34,211,238,0.35)] hover:shadow-[0_0_28px_rgba(34,211,238,0.55)] hover:-translate-y-0.5",
    ghost:
      "border border-white/10 bg-transparent text-slate-300 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300",
    danger: "border border-red-500/25 bg-red-500/10 text-red-300 hover:bg-red-500/15",
  };

  return <button ref={ref} type={type} className={cn(base, styles[variant], className)} {...props} />;
});
