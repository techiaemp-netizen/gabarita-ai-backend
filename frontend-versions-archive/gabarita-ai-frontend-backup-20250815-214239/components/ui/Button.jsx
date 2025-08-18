"use client";

/**
 * A lightweight button component inspired by shadcn/ui.
 *
 * The variant prop determines the colour scheme and can be
 * customised as needed. Additional Tailwind classes can be passed
 * via the className prop.
 */
export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const base =
    'inline-flex items-center justify-center px-4 py-2 rounded-md font-medium transition-colors focus:outline-none';
  const variants = {
    primary: 'bg-primary text-white hover:bg-blue-500',
    secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    outline: 'border border-primary text-primary hover:bg-accent',
  };
  return (
    <button className={`${base} ${variants[variant] || ''} ${className}`} {...props}>
      {children}
    </button>
  );
}
