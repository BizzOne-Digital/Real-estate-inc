// Pure calculation helpers for the public calculators. Estimates only.

type Bracket = [upTo: number, rate: number];

/** Ontario LTT for a land with one or two single family residences. */
const ONTARIO_RESIDENTIAL: Bracket[] = [
  [55_000, 0.005],
  [250_000, 0.01],
  [400_000, 0.015],
  [2_000_000, 0.02],
  [Infinity, 0.025],
];
/** Ontario LTT for other property (commercial, more than two residences). */
const ONTARIO_OTHER: Bracket[] = [
  [55_000, 0.005],
  [250_000, 0.01],
  [400_000, 0.015],
  [Infinity, 0.02],
];

export const ONTARIO_FTHB_MAX_REFUND = 4_000;
export const TORONTO_FTHB_MAX_REBATE = 4_475;
/** Toronto added higher luxury rates above this price; we do not estimate those. */
export const TORONTO_ESTIMATE_LIMIT = 3_000_000;

function tiered(price: number, brackets: Bracket[]): number {
  let tax = 0;
  let lower = 0;
  for (const [upTo, rate] of brackets) {
    if (price <= lower) break;
    tax += (Math.min(price, upTo) - lower) * rate;
    lower = upTo;
  }
  return Math.round(tax * 100) / 100;
}

export interface LttResult {
  ontario: number;
  ontarioRefund: number;
  toronto: number | null;
  torontoRebate: number;
  torontoOverLimit: boolean;
  total: number | null;
}

export function landTransferTax(
  price: number,
  opts: { toronto: boolean; firstTimeBuyer: boolean; residential: boolean },
): LttResult {
  const p = Math.max(0, price || 0);
  const ontario = tiered(p, opts.residential ? ONTARIO_RESIDENTIAL : ONTARIO_OTHER);
  const ontarioRefund = opts.firstTimeBuyer && opts.residential ? Math.min(ontario, ONTARIO_FTHB_MAX_REFUND) : 0;

  let toronto: number | null = 0;
  let torontoRebate = 0;
  const torontoOverLimit = opts.toronto && p > TORONTO_ESTIMATE_LIMIT;
  if (opts.toronto) {
    if (torontoOverLimit) {
      toronto = null;
    } else {
      // Municipal brackets mirror the provincial ones up to $3M.
      toronto = tiered(p, opts.residential ? ONTARIO_RESIDENTIAL : ONTARIO_OTHER);
      torontoRebate = opts.firstTimeBuyer && opts.residential ? Math.min(toronto, TORONTO_FTHB_MAX_REBATE) : 0;
    }
  }
  const total = toronto === null ? null : ontario - ontarioRefund + toronto - torontoRebate;
  return { ontario, ontarioRefund, toronto, torontoRebate, torontoOverLimit, total };
}

export const PAYMENT_FREQUENCIES = {
  monthly: { label: "Monthly", perYear: 12 },
  "semi-monthly": { label: "Semi-monthly", perYear: 24 },
  "bi-weekly": { label: "Bi-weekly", perYear: 26 },
  "accelerated-bi-weekly": { label: "Accelerated bi-weekly", perYear: 26 },
  weekly: { label: "Weekly", perYear: 52 },
  "accelerated-weekly": { label: "Accelerated weekly", perYear: 52 },
} as const;
export type PaymentFrequency = keyof typeof PAYMENT_FREQUENCIES;

/** Canadian fixed-rate mortgages compound semi-annually. */
function periodicRate(annualRatePct: number, periodsPerYear: number): number {
  return Math.pow(1 + annualRatePct / 100 / 2, 2 / periodsPerYear) - 1;
}

function payment(principal: number, rate: number, n: number): number {
  if (n <= 0) return 0;
  if (rate === 0) return principal / n;
  return (principal * rate) / (1 - Math.pow(1 + rate, -n));
}

/** CMHC-style mortgage default insurance premium (share of the loan) for a given down payment ratio. */
export function insurancePremiumRate(downRatio: number): number {
  if (downRatio >= 0.2) return 0;
  if (downRatio >= 0.15) return 0.028;
  if (downRatio >= 0.1) return 0.031;
  return 0.04;
}

/** Minimum down payment: 5% of the first $500,000 and 10% above it; 20% at $1.5M or more. */
export function minimumDownPayment(price: number): number {
  if (price >= 1_500_000) return price * 0.2;
  if (price <= 500_000) return price * 0.05;
  return 25_000 + (price - 500_000) * 0.1;
}

export interface MortgageResult {
  downPayment: number;
  minDown: number;
  belowMinimum: boolean;
  insurance: number;
  principal: number;
  payment: number;
  totalInterest: number;
  periodsPerYear: number;
}

export function mortgagePayment(input: {
  price: number;
  downPayment: number;
  ratePct: number;
  years: number;
  frequency: PaymentFrequency;
}): MortgageResult {
  const price = Math.max(0, input.price || 0);
  const down = Math.min(Math.max(0, input.downPayment || 0), price);
  const minDown = minimumDownPayment(price);
  const base = price - down;
  const ratio = price > 0 ? down / price : 0;
  const insurance = price < 1_500_000 && ratio < 0.2 ? Math.round(base * insurancePremiumRate(ratio)) : 0;
  const principal = base + insurance;
  const rate = Math.max(0, input.ratePct || 0);
  const years = Math.min(Math.max(1, input.years || 25), 40);

  const freq = PAYMENT_FREQUENCIES[input.frequency] ?? PAYMENT_FREQUENCIES.monthly;
  let pay: number;
  let perYear: number = freq.perYear;
  if (input.frequency === "accelerated-bi-weekly" || input.frequency === "accelerated-weekly") {
    const monthly = payment(principal, periodicRate(rate, 12), years * 12);
    pay = input.frequency === "accelerated-bi-weekly" ? monthly / 2 : monthly / 4;
  } else {
    pay = payment(principal, periodicRate(rate, perYear), years * perYear);
  }

  // Total interest over the full amortization (accelerated schedules finish early).
  let balance = principal;
  let interest = 0;
  const r = periodicRate(rate, perYear);
  for (let i = 0; i < years * perYear && balance > 0.005; i++) {
    const int = balance * r;
    interest += int;
    balance = balance + int - pay;
  }
  if (!Number.isFinite(pay)) pay = 0;
  perYear = freq.perYear;

  return {
    downPayment: down,
    minDown,
    belowMinimum: price > 0 && down < minDown - 0.5,
    insurance,
    principal,
    payment: Math.round(pay * 100) / 100,
    totalInterest: Math.round(interest),
    periodsPerYear: perYear,
  };
}
