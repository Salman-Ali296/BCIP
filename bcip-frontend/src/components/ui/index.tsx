import type { ButtonHTMLAttributes, ReactNode } from "react";

export const inputCls =
  "w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500";

const variants = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  outline: "border border-slate-300 bg-white hover:bg-slate-50",
  danger: "border border-red-200 bg-white text-red-600 hover:bg-red-50",
};

export function Button({
  variant = "primary",
  className = "",
  ...p
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
}) {
  return (
    <button
      type="button"
      {...p}
      className={`rounded-lg px-4 py-2 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    />
  );
}

export const Card = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={`rounded-xl border border-slate-200 bg-white p-6 ${className}`}
  >
    {children}
  </div>
);

export const Field = ({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) => (
  <label className="block text-sm font-medium">
    <span className="mb-1 block">{label}</span>
    {children}
    {error && (
      <span
        role="alert"
        className="mt-1 block text-xs font-normal text-red-600"
      >
        {error}
      </span>
    )}
  </label>
);
