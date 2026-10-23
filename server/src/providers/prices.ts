// Price provider. IMPORTANT: no Russian grocery chain offers a public price API, so these are
// ESTIMATES: a base RUB price per ingredient multiplied by a typical price level of the store's chain.
// Every response is labelled priceSource: "estimate". Replace `priceFor` with a real adapter
// (partner API, aggregator, receipts / user-submitted prices) without changing the route contract.

import { ingredients } from '../data/catalog.js';
import type { Store } from './stores.js';

/** Typical shelf-price level relative to the average (1.0). Rough, for ranking stores only. */
const CHAIN_LEVEL: Record<string, number> = {
  metro: 0.92,
  auchan: 0.94,
  lenta: 0.96,
  pyaterochka: 0.97,
  magnit: 1.0,
  okey: 1.01,
  dixy: 1.03,
  spar: 1.05,
  victoria: 1.08,
  perekrestok: 1.12,
  vkusvill: 1.3,
  azbuka: 1.45,
};
const UNKNOWN_LEVEL = 1.06;

const byId = new Map(ingredients.map((i) => [i.id, i]));

export type BasketItem = { ingredientId: string; qty: number };
export type PricedLine = { ingredientId: string; qty: number; price: number };
export type StoreQuote = { store: Store; total: number; lines: PricedLine[] };

export function priceFor(ingredientId: string, store: Store): number | null {
  const ing = byId.get(ingredientId);
  if (!ing) return null;
  const level = store.chain ? (CHAIN_LEVEL[store.chain] ?? UNKNOWN_LEVEL) : UNKNOWN_LEVEL;
  return ing.priceRub * level;
}

export function quoteBasket(items: BasketItem[], stores: Store[], rubPerUnit: number): StoreQuote[] {
  const quotes = stores.map((store) => {
    const lines: PricedLine[] = [];
    let total = 0;
    for (const it of items) {
      const unit = priceFor(it.ingredientId, store);
      if (unit === null) continue;
      const price = (unit * it.qty) / rubPerUnit;
      lines.push({ ingredientId: it.ingredientId, qty: it.qty, price: Math.round(price * 100) / 100 });
      total += price;
    }
    return { store, total: Math.round(total * 100) / 100, lines };
  });
  return quotes.sort((a, b) => a.total - b.total);
}
