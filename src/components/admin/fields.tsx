"use client";

import { useId } from "react";
import { Plus, Trash2 } from "lucide-react";

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
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  max?: number;
  rows?: number;
  required?: boolean;
  help?: string;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
        {required && " *"}
      </label>
      <textarea id={id} rows={rows} value={value} maxLength={max} required={required} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="field-input" />
      {help && <p className="mt-1 text-xs text-gray-500">{help}</p>}
    </div>
  );
}

/** Edits a string array as one item per line. */
export function LinesField({
  label,
  value,
  onChange,
  rows = 5,
  help = "One item per line.",
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  rows?: number;
  help?: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        value={value.join("\n")}
        onChange={(e) => onChange(e.target.value.split("\n").map((s) => s.replace(/^\s*[-•]\s*/, "")))}
        onBlur={() => onChange(value.map((s) => s.trim()).filter(Boolean))}
        className="field-input"
      />
      {help && <p className="mt-1 text-xs text-gray-500">{help}</p>}
    </div>
  );
}

export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-navy" />
      {label}
    </label>
  );
}

/** Repeatable list of items with add, remove and reorder controls. */
export function ListEditor<T extends object>({
  items,
  onChange,
  max,
  blank,
  addLabel,
  render,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  max: number;
  blank: T;
  addLabel: string;
  render: (item: T, update: (patch: Partial<T>) => void, index: number) => React.ReactNode;
}) {
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="space-y-3 rounded border border-gray-100 bg-gray-50/50 p-3">
          {render(item, (patch) => onChange(items.map((x, j) => (j === i ? { ...x, ...patch } : x))), i)}
          <div className="flex gap-2">
            <button type="button" className="admin-btn-ghost" disabled={i === 0} onClick={() => move(i, -1)}>
              Up
            </button>
            <button type="button" className="admin-btn-ghost" disabled={i === items.length - 1} onClick={() => move(i, 1)}>
              Down
            </button>
            <button type="button" className="admin-btn-ghost text-red-700" onClick={() => onChange(items.filter((_, j) => j !== i))}>
              <Trash2 aria-hidden className="h-4 w-4" /> Remove
            </button>
          </div>
        </div>
      ))}
      {items.length < max && (
        <button type="button" className="admin-btn-ghost" onClick={() => onChange([...items, structuredClone(blank)])}>
          <Plus aria-hidden className="h-4 w-4" /> {addLabel}
        </button>
      )}
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

export const RICH_TEXT_HELP = "Leave a blank line between paragraphs. Start a line with “## ” for a heading or “- ” for a bullet point. Wrap text in **double asterisks** for bold.";
