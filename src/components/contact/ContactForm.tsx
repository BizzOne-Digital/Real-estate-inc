"use client";

import { useActionState, useEffect, useRef } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { submitInquiry, type InquiryState } from "@/app/actions/inquiry";
import { ThinArrow } from "@/components/ui/Icons";
import { INQUIRY_INTERESTS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const initial: InquiryState = { status: "idle", message: "" };

const inputCls =
  "mt-2 w-full border border-line bg-white px-4 py-3 font-sans text-[15px] text-ink placeholder:text-muted/70 focus:border-navy focus:outline-none aria-[invalid=true]:border-red-700";

export function ContactForm({
  condos,
  defaultCondo,
  defaultInterest,
  successMessage,
}: {
  condos: { name: string; slug: string }[];
  defaultCondo: string;
  defaultInterest: string;
  successMessage: string;
}) {
  const [state, action, pending] = useActionState(submitInquiry, initial);
  const statusRef = useRef<HTMLDivElement>(null);
  const v = state.values ?? {};
  const err = state.fieldErrors ?? {};

  useEffect(() => {
    if (state.status !== "idle") statusRef.current?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <div ref={statusRef} tabIndex={-1} role="status" className="border border-line bg-white p-8 text-center focus:outline-none sm:p-12">
        <CheckCircle2 aria-hidden strokeWidth={1} className="mx-auto h-12 w-12 text-navy" />
        <h2 className="mt-5 font-display text-3xl text-navy">Message sent</h2>
        <p className="mx-auto mt-3 max-w-md text-ink/80">{state.message || successMessage}</p>
      </div>
    );
  }

  return (
    <form action={action} noValidate className="space-y-6" aria-describedby="form-status">
      <div id="form-status" ref={statusRef} tabIndex={-1} aria-live="assertive" className="focus:outline-none">
        {state.status === "error" && (
          <p className="border border-red-200 bg-red-50 px-4 py-3 font-sans text-sm text-red-800">{state.message}</p>
        )}
      </div>

      <div className="hidden" aria-hidden>
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Name" name="name" error={err.name} required>
          <input id="name" name="name" autoComplete="name" required maxLength={120} defaultValue={v.name} aria-invalid={!!err.name} aria-describedby={err.name ? "name-error" : undefined} className={inputCls} />
        </Field>
        <Field label="Email" name="email" error={err.email} required>
          <input id="email" name="email" type="email" autoComplete="email" required maxLength={200} defaultValue={v.email} aria-invalid={!!err.email} aria-describedby={err.email ? "email-error" : undefined} className={inputCls} />
        </Field>
        <Field label="Phone" name="phone" error={err.phone} optional>
          <input id="phone" name="phone" type="tel" autoComplete="tel" maxLength={40} defaultValue={v.phone} aria-invalid={!!err.phone} aria-describedby={err.phone ? "phone-error" : undefined} className={inputCls} />
        </Field>
        <Field label="I need help with" name="interest" error={err.interest} required>
          <select id="interest" name="interest" required defaultValue={v.interest ?? defaultInterest} aria-invalid={!!err.interest} className={inputCls}>
            {INQUIRY_INTERESTS.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {condos.length > 0 && (
        <Field label="Condo building" name="condo" error={err.condo} optional>
          <select id="condo" name="condo" defaultValue={v.condo ?? defaultCondo} className={inputCls}>
            <option value="">No specific building</option>
            {condos.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
      )}

      <Field label="Property address or MLS® number" name="reference" error={err.reference} optional>
        <input id="reference" name="reference" maxLength={200} defaultValue={v.reference} placeholder="e.g. 123 Main St, Mississauga or W1234567" className={inputCls} />
      </Field>

      <Field label="Message" name="message" error={err.message} required>
        <textarea id="message" name="message" rows={6} required maxLength={5000} defaultValue={v.message} aria-invalid={!!err.message} aria-describedby={err.message ? "message-error" : undefined} className={cn(inputCls, "resize-y")} />
      </Field>

      <button type="submit" disabled={pending} className="btn-navy group w-full justify-center disabled:opacity-60 sm:w-auto">
        {pending ? (
          <>
            <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> Sending…
          </>
        ) : (
          <>
            Send Message <ThinArrow className="btn-arrow" />
          </>
        )}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  error,
  required,
  optional,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="font-sans text-[12px] uppercase tracking-[0.16em] text-navy">
        {label}
        {required && <span aria-hidden> *</span>}
        {optional && <span className="ml-2 normal-case tracking-normal text-muted">(optional)</span>}
      </label>
      {children}
      {error && (
        <p id={`${name}-error`} className="mt-1.5 font-sans text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
