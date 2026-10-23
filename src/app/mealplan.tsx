import { router } from 'expo-router';
import { View } from 'react-native';

import { DishTile } from '@/components/DishTile';
import { Window } from '@/components/Window';
import { Inset, PButton, PText } from '@/components/ui';
import { dailyKcal, portionFactor, targetKcal } from '@/domain/calc';
import { getRecipe, type Recipe } from '@/domain/recipes';
import { useStore } from '@/state/store';

/** Build a 7-day grid by cycling planned recipes proportionally to their servings. */
function weekGrid(plan: { recipeId: string; servings: number }[]) {
  const expand = (slot: Recipe['slot']) =>
    plan
      .map((p) => ({ r: getRecipe(p.recipeId), n: p.servings }))
      .filter((x): x is { r: Recipe; n: number } => !!x.r && x.r.slot === slot)
      .flatMap((x) => Array.from({ length: x.n }, () => x.r));
  const b = expand('breakfast');
  const m = expand('main');
  // sample evenly so each dish appears in proportion to its monthly servings
  const sample = (list: Recipe[], i: number, of: number) => (list.length ? list[Math.floor((i * list.length) / of) % list.length] : undefined);
  return Array.from({ length: 7 }, (_, d) => [sample(b, d, 7), sample(m, 2 * d, 14), sample(m, 2 * d + 1, 14)]);
}

export default function MealPlan() {
  const { state, t, colors } = useStore();
  const factor = portionFactor(state.plan, targetKcal(state.body, state.weightGoal));
  const grid = weekGrid(state.plan);
  const today = (new Date().getDay() + 6) % 7;
  return (
    <Window accent="teal" title={t.mealPlan} subtitle={t.mealPlanSub} footer={<PButton label={t.menu} accent="teal" onPress={() => router.replace('/menu')} />}>
      {state.plan.length === 0 ? (
        <PText size={9} color={colors.textMuted}>
          {t.noPlan}
        </PText>
      ) : (
        <>
          <View style={{ flexDirection: 'row', paddingLeft: 50 }}>
            {t.bLunchDinner.map((h) => (
              <PText key={h} size={6} color="#1E5FB0" align="center" style={{ flex: 1 }}>
                {h}
              </PText>
            ))}
          </View>
          {grid.map((row, d) => (
            <Inset key={d} fill={d === today ? colors.successBg : undefined} style={{ flexDirection: 'row', alignItems: 'center', padding: 6 }}>
              <PText size={8} style={{ width: 44 }}>
                {t.days[d]}
              </PText>
              {row.map((r, i) => (
                <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                  {r ? <DishTile recipe={r} size={40} /> : <PText size={8}>-</PText>}
                </View>
              ))}
            </Inset>
          ))}
          <PText size={8}>
            {t.today.replace('{k}', String(dailyKcal(state.plan, factor))).replace('{m}', String(state.mealsPerDay))}
          </PText>
        </>
      )}
    </Window>
  );
}
