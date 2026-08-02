import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  icon?: string
  variant?: 'primary' | 'secondary'
}

export function Button({
  children,
  icon,
  variant = 'primary',
  className = '',
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'bg-[#17211c] text-white hover:bg-[#26362e]',
    secondary: 'border border-[#c9d8ce] bg-white text-[#17211c] hover:bg-[#eef5ef]',
  }

  return (
    <button
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition ${variants[variant]} ${className}`}
      type="button"
      {...props}
    >
      {icon ? <i className={`bi ${icon}`} aria-hidden="true" /> : null}
      {children}
    </button>
  )
}
