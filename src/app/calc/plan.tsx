import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { DishTile } from '@/components/DishTile';
import { NavFooter, Window } from '@/components/Window';
import { Display, Inset, PButton, PText } from '@/components/ui';
import { dailyKcal, groceryList, portionFactor, servingCostUsd, targetKcal } from '@/domain/calc';
import { formatMoney, formatPrice, fromUsd } from '@/domain/money';
import { getRecipe } from '@/domain/recipes';
import { useStore } from '@/state/store';

function Stepper({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  const { colors } = useStore();
  const btn = (txt: string, delta: number) => (
    <Pressable onPress={() => onChange(Math.max(0, value + delta))} accessibilityRole="button" accessibilityLabel={`${label} ${txt}`} hitSlop={4}>
      {({ pressed }) => (
        <Inset fill={pressed ? colors.shadow : colors.surface} style={{ width: 40, height: 44, alignItems: 'center', justifyContent: 'center' }}>
          <PText size={12}>{txt}</PText>
        </Inset>
      )}
    </Pressable>
  );
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      {btn('-', -1)}
      <Inset style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
        <PText size={26} digits>
          {value}
        </PText>
      </Inset>
      {btn('+', 1)}
    </View>
  );
}

export default function Plan() {
  const { state, dispatch, t, colors } = useStore();
  const factor = portionFactor(state.plan, targetKcal(state.body, state.weightGoal));
  const totalUsd = groceryList(state.plan, factor).reduce((s, g) => s + g.usd, 0);
  const servings = state.plan.reduce((s, p) => s + p.servings, 0);
  const kcal = dailyKcal(state.plan, factor);
  const lang = state.lang;

  return (
    <Window
      accent="green"
      title={t.monthMeals}
      subtitle={t.monthSub}
      progress={6 / 8}
      footer={<NavFooter next={t.next} accent="green" disabled={servings === 0} onNext={() => router.push('/calc/groceries')} />}
    >
      <Display>
        <PText size={8} color={colors.displayGreen}>
          {t.foodMonth}
        </PText>
        <PText size={52} digits color={colors.displayGreen} align="right">
          {formatMoney(fromUsd(totalUsd, state.currency), state.currency)}
        </PText>
        <PText size={7} color={colors.displayGold}>
          {t.servingsLine.replace('{n}', String(servings)).replace('{k}', String(kcal))}
        </PText>
      </Display>

      {state.plan.map((p) => {
        const r = getRecipe(p.recipeId);
        if (!r) return null;
        const price = fromUsd(servingCostUsd(r.id, factor), state.currency);
        return (
          <Inset key={p.recipeId} style={{ flexDirection: 'row', alignItems: 'center', padding: 8, gap: 10 }}>
            <DishTile recipe={r} />
            <View style={{ flex: 1, gap: 6 }}>
              <PText size={8} numberOfLines={2}>
                {r.name[lang]}
              </PText>
              <PText size={7} color={colors.textMuted}>
                {`${r.slot === 'breakfast' ? t.breakfast : t.main} - ${formatPrice(price, state.currency)}`}
              </PText>
            </View>
            <Stepper value={p.servings} label={r.name[lang]} onChange={(v) => dispatch({ type: 'setServings', recipeId: r.id, servings: v })} />
          </Inset>
        );
      })}

      <PButton label={t.moreDishes} onPress={() => router.back()} height={46} />
    </Window>
  );
}
