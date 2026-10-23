// Finds supermarkets near a coordinate. Primary source: OpenStreetMap via Overpass (several mirrors).
// Fallback: Photon (also OSM data). Results are cached because both services are shared, rate-limited resources.

export type Store = {
  id: string;
  name: string;
  chain: string | null;
  lat: number;
  lon: number;
  distanceM: number;
};

const UA = 'Bankin95/0.1 (savings app prototype)';
const MIRRORS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
];

/** Normalise a brand/name to a known chain key (RU + EN spellings). */
const CHAINS: [RegExp, string][] = [
  [/пят[её]рочка|pyaterochka|5ka/i, 'pyaterochka'],
  [/магнит|magnit/i, 'magnit'],
  [/перекр[её]сток|perekrestok/i, 'perekrestok'],
  [/лента|lenta/i, 'lenta'],
  [/дикси|dixy/i, 'dixy'],
  [/вкусвилл|vkusvill/i, 'vkusvill'],
  [/ашан|auchan/i, 'auchan'],
  [/окей|o'?key/i, 'okey'],
  [/metro|метро/i, 'metro'],
  [/spar|спар/i, 'spar'],
  [/victoria|виктория/i, 'victoria'],
  [/азбука вкуса|azbuka/i, 'azbuka'],
];

export function chainOf(name: string | undefined, brand: string | undefined): string | null {
  const text = `${brand ?? ''} ${name ?? ''}`;
  for (const [re, key] of CHAINS) if (re.test(text)) return key;
  return null;
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const rad = (d: number) => (d * Math.PI) / 180;
  const a = Math.sin(rad(lat2 - lat1) / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lon2 - lon1) / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(a)));
}

async function overpassOne(url: string, q: string, lat: number, lon: number): Promise<Store[]> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'User-Agent': UA, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(q)}`,
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  const json = (await res.json()) as { elements: { id: number; type: string; lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> }[] };
  return json.elements
    .map((e) => {
      const la = e.lat ?? e.center?.lat;
      const lo = e.lon ?? e.center?.lon;
      if (la === undefined || lo === undefined) return null;
      const name = e.tags?.['name:ru'] ?? e.tags?.name ?? e.tags?.brand ?? 'Магазин';
      return { id: `${e.type}/${e.id}`, name, chain: chainOf(e.tags?.name, e.tags?.brand), lat: la, lon: lo, distanceM: haversine(lat, lon, la, lo) } satisfies Store;
    })
    .filter((s): s is Store => s !== null);
}

/** Ask all mirrors at once; the first successful answer wins (public mirrors are often at capacity). */
async function viaOverpass(lat: number, lon: number, radius: number): Promise<Store[]> {
  const q = `[out:json][timeout:20];(nwr[shop=supermarket](around:${radius},${lat},${lon});nwr[shop=convenience](around:${radius},${lat},${lon}););out center 60;`;
  try {
    return await Promise.any(MIRRORS.map((u) => overpassOne(u, q, lat, lon)));
  } catch (err) {
    const first = (err as AggregateError).errors?.[0] as Error | undefined;
    throw new Error(`Overpass unavailable: ${first?.message ?? 'all mirrors failed'}`);
  }
}

const PHOTON_QUERIES = ['Пятёрочка', 'Магнит', 'Перекрёсток', 'Лента', 'Дикси', 'ВкусВилл', 'Ашан'];

/** Fallback: Photon geocoder searched by chain name around the user (it has no "everything nearby" query). */
async function viaPhoton(lat: number, lon: number, radius: number): Promise<Store[]> {
  const one = async (qName: string): Promise<Store[]> => {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(qName)}&lat=${lat}&lon=${lon}&limit=30&osm_tag=shop:supermarket&location_bias_scale=0.5`;
    const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`Photon HTTP ${res.status}`);
    const json = (await res.json()) as { features: { geometry: { coordinates: [number, number] }; properties: { osm_id: number; osm_type: string; name?: string } }[] };
    return json.features.map((f) => {
      const [lo, la] = f.geometry.coordinates;
      const name = f.properties.name ?? qName;
      return { id: `${f.properties.osm_type}/${f.properties.osm_id}`, name, chain: chainOf(name, undefined), lat: la, lon: lo, distanceM: haversine(lat, lon, la, lo) } satisfies Store;
    });
  };
  const settled = await Promise.allSettled(PHOTON_QUERIES.map(one));
  const ok = settled.filter((r): r is PromiseFulfilledResult<Store[]> => r.status === 'fulfilled');
  if (ok.length === 0) throw new Error('Photon unavailable');
  const seen = new Map<string, Store>();
  for (const r of ok) for (const st of r.value) if (st.distanceM <= radius) seen.set(st.id, st);
  return [...seen.values()];
}

const cache = new Map<string, { at: number; stores: Store[] }>();
const TTL = 6 * 60 * 60 * 1000;

export async function nearbyStores(lat: number, lon: number, radius = 2000): Promise<{ stores: Store[]; source: 'overpass' | 'photon' | 'cache' }> {
  // round to ~110 m so nearby phones share a cache entry
  const key = `${lat.toFixed(3)},${lon.toFixed(3)},${radius}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return { stores: hit.stores, source: 'cache' };

  let stores: Store[];
  let source: 'overpass' | 'photon' = 'overpass';
  try {
    stores = await viaOverpass(lat, lon, radius);
  } catch {
    stores = await viaPhoton(lat, lon, radius);
    source = 'photon';
  }
  stores.sort((a, b) => a.distanceM - b.distanceM);
  cache.set(key, { at: Date.now(), stores });
  return { stores, source };
}
