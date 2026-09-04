import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  icon?: string;
  variant?: "primary" | "secondary";
};

export function Button({
  children,
  icon,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const variants = {
    primary: "bg-[#12304a] text-white hover:bg-[#1f4b70] shadow-sm",
    secondary:
      "border border-[#c9d8ce] bg-white text-[#12304a] hover:bg-[#eef5ef] shadow-sm",
  };

  return (
    <button
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition ${variants[variant]} ${className}`}
      type="button"
      {...props}
    >
      {icon ? <i className={`bi ${icon}`} aria-hidden="true" /> : null}
      {children}
    </button>
  );
}
