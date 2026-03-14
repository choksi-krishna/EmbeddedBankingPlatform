import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  children: ReactNode;
};

export function Button({
  className,
  variant = "primary",
  children,
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      "bg-ink text-white hover:bg-ink/90 disabled:bg-ink/60",
    secondary:
      "bg-tide text-white hover:bg-tide/90 disabled:bg-tide/60",
    ghost:
      "border border-[rgba(17,24,39,0.08)] bg-white/78 text-ink hover:bg-white disabled:text-slate-400",
    danger:
      "bg-rose text-white hover:bg-rose/90 disabled:bg-rose/60",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
