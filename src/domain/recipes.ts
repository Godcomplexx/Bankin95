import type { Lang } from '@/i18n/strings';

// Recipe book and ingredient catalog come from the server (see src/api/catalog.ts).
// This module holds the loaded catalog in memory so domain functions stay synchronous.

export type AllergenId = string;
export type DietId = string;
export type IngredientId = string;
export type MealSlot = 'breakfast' | 'main';

type Named = Record<Lang, string>;

export type Allergen = { id: AllergenId; name: Named; searchOnly: boolean };
export type Diet = { id: DietId; name: Named };
export type Ingredient = { id: IngredientId; name: Named; unit: Named; priceRub: number; dislikeOption?: boolean };

export type Photo = { url: string; author: string; license: string; source: string };

export type Recipe = {
  id: string;
  name: Named;
  slot: MealSlot;
  kcal: number;
  minutes: number;
  allergens: AllergenId[];
  diets: DietId[];
  /** Quantity of each ingredient per serving, in the ingredient's unit. */
  items: Record<IngredientId, number>;
  tile: string;
  photo: Photo | null;
};

export type Catalog = {
  version: string;
  rubPerUsd: number;
  allergens: Allergen[];
  diets: Diet[];
  ingredients: Ingredient[];
  recipes: Recipe[];
};

const EMPTY: Catalog = { version: '', rubPerUsd: 90, allergens: [], diets: [], ingredients: [], recipes: [] };
let current: Catalog = EMPTY;

export function setCatalog(c: Catalog): void {
  current = c;
}
export const getCatalog = (): Catalog => current;
export const getRecipes = (): Recipe[] => current.recipes;
export const getAllergens = (): Allergen[] => current.allergens;
export const getDiets = (): Diet[] => current.diets;
export const getIngredientList = (): Ingredient[] => current.ingredients;
export const getRubPerUsd = (): number => current.rubPerUsd;

export function getIngredient(id: IngredientId): Ingredient | undefined {
  return current.ingredients.find((i) => i.id === id);
}
export function getRecipe(id: string): Recipe | undefined {
  return current.recipes.find((r) => r.id === id);
}

/** Price per unit in USD, derived from the server's RUB price. */
export function usdPerUnit(id: IngredientId): number {
  const ing = getIngredient(id);
  return ing ? ing.priceRub / current.rubPerUsd : 0;
}

export function recipeCostUsd(r: Recipe): number {
  return Object.entries(r.items).reduce((sum, [id, qty]) => sum + qty * usdPerUnit(id), 0);
}

export function filterRecipes(opts: { allergens: AllergenId[]; diet: DietId; dislikedIngredients: IngredientId[] }): Recipe[] {
  return current.recipes.filter(
    (r) =>
      !r.allergens.some((a) => opts.allergens.includes(a)) &&
      (opts.diet === 'all' || r.diets.includes(opts.diet)) &&
      !Object.keys(r.items).some((i) => opts.dislikedIngredients.includes(i)),
  );
}
