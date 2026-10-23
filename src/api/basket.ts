import { api } from './client';

export type StoreInfo = { id: string; name: string; chain: string | null; lat: number; lon: number; distanceM: number };
export type Quote = { store: StoreInfo; total: number; lines: { ingredientId: string; qty: number; price: number }[] };
export type BasketResponse = { currency: 'RUB' | 'USD'; priceSource: 'estimate' | 'store'; storesSource: string; quotes: Quote[] };

export function fetchBasket(args: { lat: number; lon: number; currency: 'RUB' | 'USD'; items: { ingredientId: string; qty: number }[] }): Promise<BasketResponse> {
  return api<BasketResponse>('/v1/basket', { method: 'POST', body: { ...args, radius: 3000 }, timeoutMs: 45000 });
}
