import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  fullWidth?: boolean;
  icon?: ReactNode;
}

const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-primary text-white hover:bg-primary-accent active:bg-primary-forest',
  secondary: 'bg-primary-mint text-primary-forest hover:bg-primary-pale',
  ghost: 'bg-transparent text-primary hover:bg-primary-pale',
  danger: 'bg-alert text-white hover:bg-red-600',
};

export default function Button({
  children,
  variant = 'primary',
  fullWidth,
  icon,
  className = '',
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      className={[
        'min-h-12 min-w-12 px-4 py-3 rounded-xl font-semibold text-base transition-colors',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'flex items-center justify-center gap-2',
        variants[variant],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
    >
      {icon}
      {children}
    </button>
  );
}
