import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Catalog } from '@/domain/recipes';
import { api } from './client';

const CACHE_KEY = 'bankin95/catalog/v1';

export async function readCachedCatalog(): Promise<Catalog | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as Catalog) : null;
  } catch {
    return null;
  }
}

/** Download the recipe book and ingredient catalog; keeps a copy for the next start. */
export async function fetchCatalog(): Promise<Catalog> {
  const c = await api<Catalog>('/v1/catalog');
  AsyncStorage.setItem(CACHE_KEY, JSON.stringify(c)).catch(() => {});
  return c;
}
