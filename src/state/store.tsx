import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import type { Activity, Body, PlanItem, Sex, WeightGoal } from '@/domain/calc';
import type { Currency } from '@/domain/money';
import type { AllergenId, DietId, IngredientId } from '@/domain/recipes';
import { strings, type Lang, type Strings } from '@/i18n/strings';
import { fetchCatalog, readCachedCatalog } from '@/api/catalog';
import type { Place } from '@/api/location';
import { setCatalog } from '@/domain/recipes';
import { palettes, type Palette, type ThemeName } from '@/theme/tokens';

export type Payment = { id: string; name: string; amount: number };
export type Goal = { id: string; name: string; amount: number; months: number; saved: number };
export type HistoryEntry = { date: string; amount: number; goalName?: string };
/** Store chosen for the current grocery list, with the prices it quoted (in the display currency). */
export type Basket = { key: string; storeId: string; storeName: string; distanceM: number; total: number; prices: Record<string, number> };

export type State = {
  hydrated: boolean;
  onboarded: boolean;
  lang: Lang;
  currency: Currency;
  theme: ThemeName | 'system';
  reservePct: number;
  reminders: boolean;
  goals: Goal[];
  activeGoalId: string;
  history: HistoryEntry[];
  // current calculation
  income: number;
  payments: Payment[];
  body: Body;
  weightGoal: WeightGoal;
  mealsPerDay: number;
  allergens: AllergenId[];
  diet: DietId;
  disliked: IngredientId[];
  customAllergens: string[];
  liked: string[];
  skipped: string[];
  never: string[];
  plan: PlanItem[];
  lastCalc: string | null;
  lastSave: number;
  lastGoalId: string;
  location: Place | null;
  basket: Basket | null;
};

export const initialState: State = {
  hydrated: false,
  onboarded: false,
  lang: 'en',
  currency: 'USD',
  theme: 'system',
  reservePct: 10,
  reminders: true,
  goals: [],
  activeGoalId: '',
  history: [],
  income: 0,
  payments: [],
  body: { sex: 'female', age: 28, weightKg: 62, heightCm: 168, activity: 'moderate' },
  weightGoal: 'maintain',
  mealsPerDay: 3,
  allergens: [],
  diet: 'all',
  disliked: [],
  customAllergens: [],
  liked: [],
  skipped: [],
  never: [],
  plan: [],
  lastCalc: null,
  lastSave: 0,
  lastGoalId: '',
  location: null,
  basket: null,
};

type Action =
  | { type: 'hydrate'; state: Partial<State> }
  | { type: 'set'; patch: Partial<State> }
  | { type: 'addPayment'; payment: Payment }
  | { type: 'updatePayment'; payment: Payment }
  | { type: 'removePayment'; id: string }
  | { type: 'restorePayment'; payment: Payment; index: number }
  | { type: 'toggleAllergen'; id: AllergenId }
  | { type: 'vote'; id: string; vote: 'like' | 'skip' | 'never' }
  | { type: 'resetVotes' }
  | { type: 'setServings'; recipeId: string; servings: number }
  | { type: 'addGoal'; goal: Goal; makeActive?: boolean }
  | { type: 'updateGoal'; goal: Goal }
  | { type: 'removeGoal'; id: string }
  | { type: 'setActiveGoal'; id: string }
  | { type: 'commitSave'; amount: number; goalId: string }
  | { type: 'resetAll' };

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'hydrate':
      return { ...s, ...a.state, hydrated: true };
    case 'set':
      return { ...s, ...a.patch };
    case 'addPayment':
      return { ...s, payments: [...s.payments, a.payment] };
    case 'updatePayment':
      return { ...s, payments: s.payments.map((p) => (p.id === a.payment.id ? a.payment : p)) };
    case 'removePayment':
      return { ...s, payments: s.payments.filter((p) => p.id !== a.id) };
    case 'restorePayment': {
      const next = [...s.payments];
      next.splice(a.index, 0, a.payment);
      return { ...s, payments: next };
    }
    case 'toggleAllergen':
      return {
        ...s,
        allergens: s.allergens.includes(a.id) ? s.allergens.filter((x) => x !== a.id) : [...s.allergens, a.id],
      };
    case 'vote': {
      const clean = (l: string[]) => l.filter((x) => x !== a.id);
      return {
        ...s,
        liked: a.vote === 'like' ? [...clean(s.liked), a.id] : clean(s.liked),
        skipped: a.vote === 'skip' ? [...clean(s.skipped), a.id] : clean(s.skipped),
        never: a.vote === 'never' ? [...clean(s.never), a.id] : clean(s.never),
      };
    }
    case 'resetVotes':
      return { ...s, liked: [], skipped: [], never: [] };
    case 'setServings':
      return {
        ...s,
        plan: s.plan.map((p) => (p.recipeId === a.recipeId ? { ...p, servings: Math.max(0, a.servings) } : p)),
      };
    case 'addGoal':
      return {
        ...s,
        goals: [...s.goals, a.goal],
        activeGoalId: a.makeActive || !s.activeGoalId ? a.goal.id : s.activeGoalId,
      };
    case 'updateGoal':
      return { ...s, goals: s.goals.map((g) => (g.id === a.goal.id ? a.goal : g)) };
    case 'removeGoal': {
      const gone = s.goals.find((g) => g.id === a.id);
      const rest = s.goals.filter((g) => g.id !== a.id);
      if (!gone || rest.length === 0) return s; // the last goal cannot be deleted
      // savings are never lost: they move to the main goal (or the first one left)
      const target = rest.find((g) => g.id === s.activeGoalId) ?? rest[0];
      return {
        ...s,
        goals: rest.map((g) => (g.id === target.id ? { ...g, saved: g.saved + gone.saved } : g)),
        activeGoalId: s.activeGoalId === a.id ? target.id : s.activeGoalId,
        lastGoalId: s.lastGoalId === a.id ? target.id : s.lastGoalId,
      };
    }
    case 'setActiveGoal':
      return { ...s, activeGoalId: a.id };
    case 'commitSave': {
      const date = new Date().toISOString().slice(0, 10);
      const goal = s.goals.find((g) => g.id === a.goalId);
      return {
        ...s,
        goals: s.goals.map((g) => (g.id === a.goalId ? { ...g, saved: g.saved + a.amount } : g)),
        lastSave: a.amount,
        lastGoalId: a.goalId,
        lastCalc: date,
        history: [{ date, amount: a.amount, goalName: goal?.name }, ...s.history].slice(0, 24),
      };
    }
    case 'resetAll':
      return { ...initialState, hydrated: true, lang: s.lang, currency: s.currency, theme: s.theme };
  }
}

const STORAGE_KEY = 'bankin95/state/v1';

/** Upgrade data saved by the single-goal version (goal + savedTotal) to the goals list. */
function migrate(raw: Record<string, unknown>): Partial<State> {
  const old = raw as Partial<State> & { goal?: Omit<Goal, 'id' | 'saved'>; savedTotal?: number };
  if (!old.goals && old.goal && old.goal.name) {
    const id = 'g-' + Math.random().toString(36).slice(2, 8);
    const { goal, savedTotal, ...rest } = old;
    return { ...rest, goals: [{ ...goal, id, saved: savedTotal ?? 0 }], activeGoalId: id } as Partial<State>;
  }
  const { goal: _g, savedTotal: _s, ...rest } = old;
  return rest as Partial<State>;
}

export const totalSaved = (s: State): number => s.goals.reduce((sum, g) => sum + g.saved, 0);
export const activeGoal = (s: State): Goal | undefined => s.goals.find((g) => g.id === s.activeGoalId) ?? s.goals[0];

type Ctx = {
  state: State;
  dispatch: (a: Action) => void;
  set: (patch: Partial<State>) => void;
  t: Strings;
  colors: Palette;
  themeName: ThemeName;
  catalogStatus: 'loading' | 'ready' | 'error';
  reloadCatalog: () => void;
};

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const system = useColorScheme();
  const loaded = useRef(false);
  const [catalogStatus, setCatalogStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [catalogTick, setCatalogTick] = useState(0);
  const hasCatalog = useRef(false);

  const reloadCatalog = useCallback(() => {
    setCatalogStatus((st) => (hasCatalog.current ? st : 'loading'));
    fetchCatalog()
      .then((c) => {
        setCatalog(c);
        hasCatalog.current = true;
        setCatalogStatus('ready');
        setCatalogTick((t) => t + 1);
      })
      .catch(() => setCatalogStatus(hasCatalog.current ? 'ready' : 'error'));
  }, []);

  useEffect(() => {
    readCachedCatalog().then((c) => {
      if (c) {
        setCatalog(c);
        hasCatalog.current = true;
        setCatalogStatus('ready');
        setCatalogTick((t) => t + 1);
      }
      reloadCatalog();
    });
  }, [reloadCatalog]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => dispatch({ type: 'hydrate', state: raw ? migrate(JSON.parse(raw) as Record<string, unknown>) : {} }))
      .catch(() => dispatch({ type: 'hydrate', state: {} }))
      .finally(() => {
        loaded.current = true;
      });
  }, []);

  useEffect(() => {
    if (!loaded.current || !state.hydrated) return;
    const { hydrated: _h, ...persist } = state;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(persist)).catch(() => {});
  }, [state]);

  const value = useMemo<Ctx>(() => {
    const themeName: ThemeName = state.theme === 'system' ? (system === 'dark' ? 'dark' : 'light') : state.theme;
    return {
      state,
      dispatch,
      set: (patch) => dispatch({ type: 'set', patch }),
      t: strings[state.lang],
      colors: palettes[themeName],
      themeName,
      catalogStatus,
      reloadCatalog,
    };
    // catalogTick makes consumers re-render when a fresh catalog arrives
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, system, catalogStatus, reloadCatalog, catalogTick]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Ctx {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}

export const uid = () => Math.random().toString(36).slice(2, 10);

export type { Sex, Activity, WeightGoal };
