import { basketKey, computeResult, groceryList, portionFactor, targetKcal, type Result } from '@/domain/calc';
import { fromUsd } from '@/domain/money';
import { useStore } from './store';

/** Current month result derived from the store. Uses the chosen store's quote when it matches the current list. */
export function useResult(): Result {
  const { state } = useStore();
  const factor = portionFactor(state.plan, targetKcal(state.body, state.weightGoal));
  const lines = groceryList(state.plan, factor);
  const estimate = Math.round(fromUsd(lines.reduce((s, g) => s + g.usd, 0), state.currency));
  const quoted = state.basket && state.basket.key === basketKey(lines, state.currency) ? Math.round(state.basket.total) : null;
  const payments = state.payments.reduce((s, p) => s + p.amount, 0);
  return computeResult(state.income, payments, quoted ?? estimate, state.reservePct);
}
