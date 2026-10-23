import { getRubPerUsd } from './recipes';

export type Currency = 'USD' | 'RUB';

/** Converts a USD amount to the display currency using the rate supplied by the server catalog. */
export function fromUsd(usd: number, currency: Currency): number {
  return currency === 'USD' ? usd : usd * getRubPerUsd();
}

function group(n: number, sep: string): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, sep);
}

/** Format a whole-unit amount: $1,200 / 1 200 ₽. Negative values get a leading minus. */
export function formatMoney(amount: number, currency: Currency): string {
  const neg = amount < 0;
  const v = Math.round(Math.abs(amount));
  const body = currency === 'USD' ? `$${group(v, ',')}` : `${group(v, ' ')} ₽`;
  return neg ? `-${body}` : body;
}

/** Format with cents for small per-serving prices. */
export function formatPrice(amount: number, currency: Currency): string {
  if (currency === 'RUB') return formatMoney(amount, currency);
  return `$${amount.toFixed(2)}`;
}

export const MAX_DIGITS = 7;

/** Append a digit to a keypad value, capped at MAX_DIGITS. */
export function pressDigit(value: number, digit: number): number {
  const s = value === 0 ? String(digit) : `${value}${digit}`;
  return s.length > MAX_DIGITS ? value : Number(s);
}

export function backspace(value: number): number {
  const s = String(value).slice(0, -1);
  return s.length ? Number(s) : 0;
}
