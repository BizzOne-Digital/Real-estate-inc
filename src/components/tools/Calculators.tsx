"use client";

import { useId, useMemo, useState } from "react";
import {
  PAYMENT_FREQUENCIES,
  TORONTO_ESTIMATE_LIMIT,
  landTransferTax,
  mortgagePayment,
  type PaymentFrequency,
} from "@/lib/calculators";
import { cn, formatCurrency } from "@/lib/utils";

const inputCls =
  "mt-2 w-full border border-line bg-white px-4 py-3 font-sans text-[15px] text-ink focus:border-navy focus:outline-none";

function MoneyInput({ label, value, onChange, help }: { label: string; value: number; onChange: (v: number) => void; help?: string }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="font-sans text-[12px] uppercase tracking-[0.16em] text-navy">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 mt-1 -translate-y-1/2 font-sans text-muted">$</span>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          value={value ? value.toLocaleString("en-CA") : ""}
          onChange={(e) => onChange(Number(e.target.value.replace(/[^\d]/g, "").slice(0, 11)) || 0)}
          className={cn(inputCls, "pl-8")}
        />
      </div>
      {help && <p className="mt-1.5 font-sans text-xs text-muted">{help}</p>}
    </div>
  );
}

function Row({ label, value, strong, muted }: { label: string; value: string; strong?: boolean; muted?: boolean }) {
  return (
    <div className={cn("flex items-baseline justify-between gap-4 border-b border-white/15 py-3", strong && "border-b-0 pt-5")}>
      <dt className={cn("font-sans text-sm", muted ? "text-white/60" : "text-white/85")}>{label}</dt>
      <dd className={cn("text-right", strong ? "font-display text-[2.2rem] leading-none text-white" : "font-sans text-[15px] text-white")}>
        {value}
      </dd>
    </div>
  );
}

function Toggle({ label, checked, onChange, help }: { label: string; checked: boolean; onChange: (v: boolean) => void; help?: string }) {
  const id = useId();
  return (
    <div className="flex gap-3">
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 h-4 w-4 accent-navy" />
      <label htmlFor={id} className="font-sans text-[14.5px] text-ink">
        {label}
        {help && <span className="block text-xs text-muted">{help}</span>}
      </label>
    </div>
  );
}

export function LandTransferTaxCalculator() {
  const [price, setPrice] = useState(800_000);
  const [toronto, setToronto] = useState(false);
  const [firstTime, setFirstTime] = useState(false);
  const [residential, setResidential] = useState(true);
  const r = useMemo(() => landTransferTax(price, { toronto, firstTimeBuyer: firstTime, residential }), [price, toronto, firstTime, residential]);

  return (
    <section aria-labelledby="ltt-calc" className="grid border border-line bg-white lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6 p-6 sm:p-10">
        <h2 id="ltt-calc" className="font-display text-[2rem] leading-tight text-navy">
          Calculate your land transfer tax
        </h2>
        <MoneyInput label="Purchase price" value={price} onChange={setPrice} />
        <div className="space-y-4">
          <Toggle label="The property is in the City of Toronto" help="Adds the Toronto municipal land transfer tax." checked={toronto} onChange={setToronto} />
          <Toggle label="I am a first-time homebuyer" help="Applies the first-time buyer refund(s) if you are eligible." checked={firstTime} onChange={setFirstTime} />
          <Toggle
            label="Residential home (one or two single family residences)"
            help="Untick for commercial or other property types."
            checked={residential}
            onChange={setResidential}
          />
        </div>
      </div>
      <div className="bg-navy p-6 text-white sm:p-10" aria-live="polite">
        <p className="eyebrow text-white/70">Estimated tax</p>
        <dl className="mt-4">
          <Row label="Ontario land transfer tax" value={formatCurrency(r.ontario, 2)} />
          {r.ontarioRefund > 0 && <Row label="Ontario first-time buyer refund" value={`− ${formatCurrency(r.ontarioRefund, 2)}`} muted />}
          {toronto && (
            <Row label="Toronto municipal land transfer tax" value={r.toronto === null ? "Contact us" : formatCurrency(r.toronto, 2)} />
          )}
          {r.torontoRebate > 0 && <Row label="Toronto first-time buyer rebate" value={`− ${formatCurrency(r.torontoRebate, 2)}`} muted />}
          <Row label="Total payable" value={r.total === null ? "—" : formatCurrency(r.total, 2)} strong />
        </dl>
        {r.torontoOverLimit && (
          <p className="mt-4 font-sans text-sm text-white/80">
            Toronto applies higher luxury rates on purchases above {formatCurrency(TORONTO_ESTIMATE_LIMIT)}. Please contact us for an exact figure.
          </p>
        )}
        <p className="mt-6 font-sans text-xs leading-relaxed text-white/60">
          Estimate only, based on current published rates. Confirm the final amount with your real estate lawyer.
        </p>
      </div>
    </section>
  );
}

export function MortgageCalculator() {
  const [price, setPrice] = useState(800_000);
  const [down, setDown] = useState(160_000);
  const [rate, setRate] = useState("4.5");
  const [years, setYears] = useState(25);
  const [freq, setFreq] = useState<PaymentFrequency>("monthly");
  const rateId = useId();
  const yearsId = useId();
  const freqId = useId();
  const r = useMemo(
    () => mortgagePayment({ price, downPayment: down, ratePct: Number(rate) || 0, years, frequency: freq }),
    [price, down, rate, years, freq],
  );
  const downPct = price > 0 ? (down / price) * 100 : 0;

  return (
    <section aria-labelledby="mortgage-calc" className="grid border border-line bg-white lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6 p-6 sm:p-10">
        <h2 id="mortgage-calc" className="font-display text-[2rem] leading-tight text-navy">
          Mortgage payment calculator
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <MoneyInput label="Purchase price" value={price} onChange={setPrice} />
          <MoneyInput label="Down payment" value={down} onChange={setDown} help={`${downPct.toFixed(1)}% of the purchase price`} />
          <div>
            <label htmlFor={rateId} className="font-sans text-[12px] uppercase tracking-[0.16em] text-navy">
              Interest rate (%)
            </label>
            <input
              id={rateId}
              type="number"
              min={0}
              max={25}
              step={0.01}
              inputMode="decimal"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor={yearsId} className="font-sans text-[12px] uppercase tracking-[0.16em] text-navy">
              Amortization
            </label>
            <select id={yearsId} value={years} onChange={(e) => setYears(Number(e.target.value))} className={inputCls}>
              {[15, 20, 25, 30].map((y) => (
                <option key={y} value={y}>
                  {y} years
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor={freqId} className="font-sans text-[12px] uppercase tracking-[0.16em] text-navy">
              Payment frequency
            </label>
            <select id={freqId} value={freq} onChange={(e) => setFreq(e.target.value as PaymentFrequency)} className={inputCls}>
              {Object.entries(PAYMENT_FREQUENCIES).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="bg-navy p-6 text-white sm:p-10" aria-live="polite">
        <p className="eyebrow text-white/70">Estimated payment</p>
        <dl className="mt-4">
          <Row label="Down payment" value={formatCurrency(r.downPayment)} />
          {r.insurance > 0 && <Row label="Mortgage default insurance (est.)" value={formatCurrency(r.insurance)} muted />}
          <Row label="Mortgage amount" value={formatCurrency(r.principal)} />
          <Row label="Total interest over amortization" value={formatCurrency(r.totalInterest)} muted />
          <Row label={`${PAYMENT_FREQUENCIES[freq].label} payment`} value={formatCurrency(r.payment, 2)} strong />
        </dl>
        {r.belowMinimum && (
          <p className="mt-4 font-sans text-sm text-amber-200">
            The minimum down payment for this price is about {formatCurrency(r.minDown)}.
          </p>
        )}
        <p className="mt-6 font-sans text-xs leading-relaxed text-white/60">
          Estimate only. Assumes a fixed rate compounded semi-annually. Insurance premiums, rates and qualification rules vary by lender.
        </p>
      </div>
    </section>
  );
}
