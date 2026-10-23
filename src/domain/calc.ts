import { getIngredient, getRecipe, getRecipes, recipeCostUsd, usdPerUnit, type IngredientId, type Recipe } from './recipes';

export type Sex = 'female' | 'male';
export type Activity = 'low' | 'moderate' | 'high';
export type WeightGoal = 'lose' | 'maintain' | 'gain';

export type Body = { sex: Sex; age: number; weightKg: number; heightCm: number; activity: Activity };

const ACTIVITY: Record<Activity, number> = { low: 1.375, moderate: 1.55, high: 1.725 };
export const GOAL_DELTA: Record<WeightGoal, number> = { lose: -400, maintain: 0, gain: 300 };

/** Mifflin-St Jeor maintenance calories, rounded to 10 kcal. */
export function maintenanceKcal(b: Body): number {
  const bmr = 10 * b.weightKg + 6.25 * b.heightCm - 5 * b.age + (b.sex === 'male' ? 5 : -161);
  return Math.round((bmr * ACTIVITY[b.activity]) / 10) * 10;
}

export function targetKcal(b: Body, goal: WeightGoal): number {
  return maintenanceKcal(b) + GOAL_DELTA[goal];
}

export type PlanItem = { recipeId: string; servings: number };

export const DAYS_IN_MONTH = 30;

/**
 * Spread liked recipes over the month: one breakfast a day (if any breakfast is liked
 * and meals/day >= 3), the rest are mains. Servings are split evenly, remainder to the first items.
 */
export function buildPlan(likedIds: string[], mealsPerDay: number): PlanItem[] {
  const liked = getRecipes().filter((r) => likedIds.includes(r.id));
  const b = liked.filter((r) => r.slot === 'breakfast');
  const m = liked.filter((r) => r.slot === 'main');
  const total = mealsPerDay * DAYS_IN_MONTH;
  const breakfastServings = b.length && m.length && mealsPerDay >= 3 ? DAYS_IN_MONTH : b.length && !m.length ? total : 0;
  const mainServings = total - breakfastServings;
  const split = (list: Recipe[], n: number): PlanItem[] =>
    list.map((r, i) => ({ recipeId: r.id, servings: Math.floor(n / list.length) + (i < n % list.length ? 1 : 0) }));
  return [...split(b, breakfastServings), ...split(m, m.length ? mainServings : 0)].filter((p) => p.servings > 0);
}

/** Portion size multiplier so the plan matches the calorie target (clamped to keep portions realistic). */
export function portionFactor(plan: PlanItem[], kcalTarget: number): number {
  const servings = plan.reduce((s, p) => s + p.servings, 0);
  if (!servings) return 1;
  const kcal = plan.reduce((s, p) => s + p.servings * (getRecipe(p.recipeId)?.kcal ?? 0), 0);
  const perDay = kcal / DAYS_IN_MONTH;
  return Math.min(1.8, Math.max(0.6, kcalTarget / perDay));
}

export function dailyKcal(plan: PlanItem[], factor: number): number {
  const kcal = plan.reduce((s, p) => s + p.servings * (getRecipe(p.recipeId)?.kcal ?? 0), 0);
  return Math.round((kcal * factor) / DAYS_IN_MONTH / 10) * 10;
}

export function servingCostUsd(recipeId: string, factor: number): number {
  const r = getRecipe(recipeId);
  return r ? recipeCostUsd(r) * factor : 0;
}

export type GroceryLine = { id: IngredientId; qty: number; usd: number };

export function groceryList(plan: PlanItem[], factor: number): GroceryLine[] {
  const acc = new Map<IngredientId, number>();
  for (const p of plan) {
    const r = getRecipe(p.recipeId);
    if (!r) continue;
    for (const [id, q] of Object.entries(r.items)) {
      const key: IngredientId = id;
      acc.set(key, (acc.get(key) ?? 0) + q * p.servings * factor);
    }
  }
  return [...acc.entries()]
    .filter(([id]) => getIngredient(id))
    .map(([id, qty]) => ({ id, qty, usd: qty * usdPerUnit(id) }))
    .sort((a, b) => b.usd - a.usd);
}

export type Result = {
  income: number;
  payments: number;
  groceries: number;
  remainder: number;
  reserve: number;
  save: number;
  over: boolean;
};

/** Safe maximum = income - payments - groceries - reserve (reserve is % of income). */
export function computeResult(income: number, payments: number, groceries: number, reservePct: number): Result {
  const remainder = income - payments - groceries;
  const reserve = remainder > 0 ? Math.round((income * reservePct) / 100) : 0;
  const save = Math.max(0, remainder - reserve);
  return { income, payments, groceries, remainder, reserve, save, over: remainder - reserve <= 0 };
}

/** Identifies a grocery list + currency so a stored store quote can be matched to it. */
export function basketKey(lines: GroceryLine[], currency: string): string {
  return currency + ':' + lines.map((l) => `${l.id}=${l.qty.toFixed(2)}`).sort().join(',');
}
