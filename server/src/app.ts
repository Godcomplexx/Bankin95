import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { allergens, CATALOG_VERSION, DEFAULT_RUB_PER_USD, diets, ingredients, recipes } from './data/catalog.js';
import { quoteBasket, type BasketItem } from './providers/prices.js';
import { nearbyStores } from './providers/stores.js';

export type Env = { Bindings: { RUB_PER_USD?: string } };

const num = (v: unknown, d: number) => (v === undefined || v === '' || Number.isNaN(Number(v)) ? d : Number(v));
const validCoord = (lat: number, lon: number) => Math.abs(lat) <= 90 && Math.abs(lon) <= 180 && !(lat === 0 && lon === 0);
const clampRadius = (r: number) => Math.min(5000, Math.max(300, r));

export function createApp() {
  const app = new Hono<Env>();
  app.use('*', cors());

  const rate = (c: { env?: { RUB_PER_USD?: string } }) => num(c.env?.RUB_PER_USD, DEFAULT_RUB_PER_USD);

  app.get('/health', (c) => c.json({ ok: true, version: CATALOG_VERSION }));

  /** Whole recipe book + ingredient catalog in one request (small enough for the app to cache). */
  app.get('/v1/catalog', (c) =>
    c.json({ version: CATALOG_VERSION, rubPerUsd: rate(c), priceSource: 'estimate', allergens, diets, ingredients, recipes }),
  );

  app.get('/v1/stores', async (c) => {
    const lat = num(c.req.query('lat'), NaN);
    const lon = num(c.req.query('lon'), NaN);
    if (!validCoord(lat, lon)) return c.json({ error: 'lat and lon are required' }, 400);
    try {
      const { stores, source } = await nearbyStores(lat, lon, clampRadius(num(c.req.query('radius'), 2000)));
      return c.json({ stores, source });
    } catch {
      return c.json({ error: 'stores_unavailable' }, 502);
    }
  });

  /** Price a grocery basket in the stores around the user and rank them cheapest-first. */
  app.post('/v1/basket', async (c) => {
    const body = (await c.req.json().catch(() => null)) as { lat?: number; lon?: number; radius?: number; currency?: 'RUB' | 'USD'; items?: BasketItem[] } | null;
    const lat = body?.lat;
    const lon = body?.lon;
    const currency = body?.currency === 'USD' ? 'USD' : 'RUB';
    if (typeof lat !== 'number' || typeof lon !== 'number' || !validCoord(lat, lon)) return c.json({ error: 'lat and lon are required' }, 400);
    const items = body?.items;
    if (!Array.isArray(items) || items.length === 0 || items.length > 60) return c.json({ error: 'items must be 1..60 entries' }, 400);
    const clean = items.filter((i) => typeof i.ingredientId === 'string' && Number.isFinite(i.qty) && i.qty > 0);
    try {
      const { stores, source } = await nearbyStores(lat, lon, clampRadius(body?.radius ?? 2000));
      if (stores.length === 0) return c.json({ currency, priceSource: 'estimate', storesSource: source, quotes: [] });
      const quotes = quoteBasket(clean, stores.slice(0, 15), currency === 'USD' ? rate(c) : 1);
      return c.json({ currency, priceSource: 'estimate', storesSource: source, quotes });
    } catch {
      return c.json({ error: 'stores_unavailable' }, 502);
    }
  });

  return app;
}
