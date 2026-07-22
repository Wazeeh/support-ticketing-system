import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  children: ReactNode;
}

const variantStyles: Record<string, React.CSSProperties> = {
  primary:   { backgroundColor: '#2563eb', color: '#fff', border: 'none' },
  secondary: { backgroundColor: '#f3f4f6', color: '#111827', border: '1px solid #d1d5db' },
  danger:    { backgroundColor: '#dc2626', color: '#fff', border: 'none' },
  ghost:     { backgroundColor: 'transparent', color: '#2563eb', border: 'none' },
};

export function Button({ variant = 'primary', children, style, disabled, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled}
      style={{
        ...variantStyles[variant],
        padding: '8px 16px',
        borderRadius: '6px',
        fontSize: '0.875rem',
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
    >
      {children}
    </button>
  );
}