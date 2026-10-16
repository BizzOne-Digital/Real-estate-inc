"use client";

import { useId } from "react";

export function TextField({
  label,
  value,
  onChange,
  max,
  required,
  help,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  max?: number;
  required?: boolean;
  help?: string;
  type?: string;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
        {required && " *"}
      </label>
      <input id={id} type={type} value={value} maxLength={max} required={required} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="field-input" />
      {help && <p className="mt-1 text-xs text-gray-500">{help}</p>}
    </div>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  max,
  rows = 3,
  required,
  help,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  max?: number;
  rows?: number;
  required?: boolean;
  help?: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
        {required && " *"}
      </label>
      <textarea id={id} rows={rows} value={value} maxLength={max} required={required} onChange={(e) => onChange(e.target.value)} className="field-input" />
      {help && <p className="mt-1 text-xs text-gray-500">{help}</p>}
    </div>
  );
}

export function FormSection({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="admin-card p-5">
      <h2 className="font-semibold">{title}</h2>
      {description && <p className="mt-0.5 text-sm text-gray-500">{description}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}
