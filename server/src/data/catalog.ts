// Server-side recipe book and ingredient catalog.
// Prices are ESTIMATES in RUB per unit (kg / L / pcs) used until real store price sources are connected.

export type Lang = 'en' | 'ru';
export type Named = Record<Lang, string>;

export type Ingredient = { id: string; name: Named; unit: Named; priceRub: number; dislikeOption?: boolean };

export type Recipe = {
  id: string;
  name: Named;
  slot: 'breakfast' | 'main';
  kcal: number;
  minutes: number;
  allergens: string[];
  diets: string[]; // diets the recipe fits, besides "all"
  items: Record<string, number>; // ingredient id -> quantity per serving, in the ingredient's unit
  tile: string;
  photo: null | { url: string; author: string; license: string; source: string };
};

const kg: Named = { en: 'kg', ru: 'кг' };
const l: Named = { en: 'L', ru: 'л' };
const pcs: Named = { en: 'pcs', ru: 'шт' };

export const ingredients: Ingredient[] = [
  { id: 'beef', name: { en: 'Beef', ru: 'Говядина' }, unit: kg, priceRub: 780, dislikeOption: true },
  { id: 'chicken', name: { en: 'Chicken', ru: 'Курица' }, unit: kg, priceRub: 340 },
  { id: 'salmon', name: { en: 'Salmon', ru: 'Лосось' }, unit: kg, priceRub: 1600, dislikeOption: true },
  { id: 'buckwheat', name: { en: 'Buckwheat', ru: 'Гречка' }, unit: kg, priceRub: 120 },
  { id: 'pasta', name: { en: 'Pasta', ru: 'Макароны' }, unit: kg, priceRub: 100 },
  { id: 'flour', name: { en: 'Flour', ru: 'Мука' }, unit: kg, priceRub: 70 },
  { id: 'rice', name: { en: 'Rice', ru: 'Рис' }, unit: kg, priceRub: 130 },
  { id: 'oats', name: { en: 'Oats', ru: 'Овсянка' }, unit: kg, priceRub: 95 },
  { id: 'lentils', name: { en: 'Lentils', ru: 'Чечевица' }, unit: kg, priceRub: 190 },
  { id: 'potato', name: { en: 'Potatoes', ru: 'Картофель' }, unit: kg, priceRub: 65 },
  { id: 'vegetables', name: { en: 'Vegetables', ru: 'Овощи' }, unit: kg, priceRub: 120 },
  { id: 'bread', name: { en: 'Bread', ru: 'Хлеб' }, unit: kg, priceRub: 110 },
  { id: 'tofu', name: { en: 'Tofu', ru: 'Тофу' }, unit: kg, priceRub: 520 },
  { id: 'eggs', name: { en: 'Eggs', ru: 'Яйца' }, unit: pcs, priceRub: 12, dislikeOption: true },
  { id: 'milk', name: { en: 'Milk', ru: 'Молоко' }, unit: l, priceRub: 95 },
  { id: 'yogurt', name: { en: 'Yogurt', ru: 'Йогурт' }, unit: kg, priceRub: 170 },
  { id: 'cottage', name: { en: 'Cottage cheese', ru: 'Творог' }, unit: kg, priceRub: 480 },
  { id: 'cheese', name: { en: 'Cheese', ru: 'Сыр' }, unit: kg, priceRub: 900 },
  { id: 'berries', name: { en: 'Berries', ru: 'Ягоды' }, unit: kg, priceRub: 650, dislikeOption: true },
  { id: 'banana', name: { en: 'Bananas', ru: 'Бананы' }, unit: kg, priceRub: 120 },
  { id: 'sesame', name: { en: 'Sesame', ru: 'Кунжут' }, unit: kg, priceRub: 900 },
];

const R = (
  id: string,
  ru: string,
  en: string,
  slot: Recipe['slot'],
  kcal: number,
  minutes: number,
  allergens: string[],
  diets: string[],
  items: Record<string, number>,
  tile: string,
): Recipe => ({ id, name: { ru, en }, slot, kcal, minutes, allergens, diets, items, tile, photo: null });

export const recipes: Recipe[] = [
  R('buckwheat-meat', 'Гречка с мясом', 'Buckwheat with meat', 'main', 520, 30, [], ['halal'], { buckwheat: 0.08, beef: 0.12, vegetables: 0.05 }, '#8A5A2B'),
  R('pasta-primavera', 'Паста с овощами', 'Pasta primavera', 'main', 480, 25, ['gluten', 'lactose'], ['vegetarian', 'halal'], { pasta: 0.1, vegetables: 0.15, cheese: 0.02 }, '#5E8F3A'),
  R('chicken-soup', 'Куриный суп', 'Chicken soup', 'main', 310, 45, ['celery', 'gluten'], ['halal'], { chicken: 0.1, vegetables: 0.15, pasta: 0.02 }, '#C9A23A'),
  R('veg-omelette', 'Овощной омлет', 'Vegetable omelette', 'breakfast', 290, 15, ['eggs', 'lactose'], ['vegetarian', 'halal'], { eggs: 3, milk: 0.05, vegetables: 0.08 }, '#D8B640'),
  R('grilled-salmon', 'Лосось на гриле с рисом', 'Grilled salmon with rice', 'main', 560, 25, ['fish'], ['halal'], { salmon: 0.15, rice: 0.06, vegetables: 0.1 }, '#D86A4A'),
  R('pancakes-berries', 'Блинчики с ягодами', 'Pancakes with berries', 'breakfast', 420, 20, ['gluten', 'eggs', 'lactose'], ['vegetarian', 'halal'], { flour: 0.07, eggs: 1, milk: 0.15, berries: 0.06 }, '#B23A5C'),
  R('oatmeal-banana', 'Овсянка с бананом', 'Oatmeal with banana', 'breakfast', 350, 10, ['gluten'], ['vegetarian', 'vegan', 'halal'], { oats: 0.06, banana: 0.12 }, '#C8A878'),
  R('rice-chicken', 'Рис с курицей и кунжутом', 'Rice with chicken and sesame', 'main', 550, 35, ['sesame', 'soy'], ['halal'], { rice: 0.09, chicken: 0.13, vegetables: 0.08, sesame: 0.005 }, '#7A6A4A'),
  R('veg-stew', 'Овощное рагу', 'Vegetable stew', 'main', 330, 40, [], ['vegetarian', 'vegan', 'halal'], { vegetables: 0.35, rice: 0.04 }, '#3F7A3A'),
  R('syrniki', 'Сырники', 'Cottage cheese pancakes', 'breakfast', 380, 25, ['eggs', 'gluten', 'lactose'], ['vegetarian', 'halal'], { cottage: 0.15, eggs: 1, flour: 0.03 }, '#D9A441'),
  R('borscht', 'Борщ', 'Borscht', 'main', 320, 60, [], ['halal'], { beef: 0.08, vegetables: 0.3, potato: 0.1 }, '#A8323E'),
  R('plov', 'Плов', 'Plov', 'main', 620, 60, [], ['halal'], { rice: 0.1, beef: 0.1, vegetables: 0.08 }, '#B8862F'),
  R('lentil-soup', 'Чечевичный суп', 'Lentil soup', 'main', 290, 35, ['celery'], ['vegetarian', 'vegan', 'halal'], { lentils: 0.07, vegetables: 0.2, potato: 0.08 }, '#B5651D'),
  R('baked-chicken', 'Курица с картофелем', 'Baked chicken with potatoes', 'main', 540, 50, [], ['halal'], { chicken: 0.2, potato: 0.25 }, '#C98A3A'),
  R('buckwheat-milk', 'Гречневая каша с молоком', 'Buckwheat milk porridge', 'breakfast', 300, 20, ['lactose'], ['vegetarian', 'halal'], { buckwheat: 0.06, milk: 0.2 }, '#9A6B3A'),
  R('eggs-toast', 'Яичница с тостом', 'Fried eggs with toast', 'breakfast', 330, 10, ['eggs', 'gluten'], ['vegetarian', 'halal'], { eggs: 2, bread: 0.06 }, '#E0B94A'),
  R('cabbage-rolls', 'Голубцы', 'Cabbage rolls', 'main', 410, 70, [], ['halal'], { beef: 0.1, rice: 0.04, vegetables: 0.2 }, '#8FA05A'),
  R('mash-cutlet', 'Котлета с пюре', 'Cutlet with mashed potatoes', 'main', 560, 45, ['eggs', 'lactose'], ['halal'], { beef: 0.1, potato: 0.25, milk: 0.05, eggs: 0.5 }, '#C9AE7A'),
  R('yogurt-fruit', 'Йогурт с бананом и овсянкой', 'Yogurt with banana and oats', 'breakfast', 250, 5, ['lactose', 'gluten'], ['vegetarian', 'halal'], { yogurt: 0.15, banana: 0.1, oats: 0.03 }, '#E8D9B0'),
  R('egg-salad', 'Овощной салат с яйцом', 'Vegetable salad with egg', 'main', 220, 15, ['eggs'], ['vegetarian', 'halal'], { vegetables: 0.25, eggs: 1 }, '#6FA04A'),
  R('tofu-stirfry', 'Тофу с рисом и овощами', 'Tofu stir-fry with rice', 'main', 450, 25, ['soy'], ['vegetarian', 'vegan', 'halal'], { tofu: 0.15, rice: 0.07, vegetables: 0.15 }, '#C7B26A'),
];

export const allergens = [
  { id: 'gluten', name: { en: 'Gluten', ru: 'Глютен' }, searchOnly: false },
  { id: 'lactose', name: { en: 'Lactose', ru: 'Лактоза' }, searchOnly: false },
  { id: 'nuts', name: { en: 'Nuts', ru: 'Орехи' }, searchOnly: false },
  { id: 'eggs', name: { en: 'Eggs', ru: 'Яйца' }, searchOnly: false },
  { id: 'fish', name: { en: 'Fish', ru: 'Рыба' }, searchOnly: false },
  { id: 'shellfish', name: { en: 'Shellfish', ru: 'Моллюски' }, searchOnly: false },
  { id: 'soy', name: { en: 'Soy', ru: 'Соя' }, searchOnly: false },
  { id: 'peanuts', name: { en: 'Peanuts', ru: 'Арахис' }, searchOnly: false },
  { id: 'sesame', name: { en: 'Sesame', ru: 'Кунжут' }, searchOnly: true },
  { id: 'celery', name: { en: 'Celery', ru: 'Сельдерей' }, searchOnly: true },
];

export const diets = [
  { id: 'all', name: { en: 'Everything', ru: 'Всё' } },
  { id: 'vegetarian', name: { en: 'Vegetarian', ru: 'Вегетарианство' } },
  { id: 'vegan', name: { en: 'Vegan', ru: 'Веган' } },
  { id: 'halal', name: { en: 'Halal', ru: 'Халяль' } },
];

/** Default exchange rate; can be overridden with the RUB_PER_USD variable. */
export const DEFAULT_RUB_PER_USD = 90;
export const CATALOG_VERSION = '2026-10-22.1';
