import { router, type Href } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Window } from '@/components/Window';
import { Bevel, Display, Inset, PText, Segments } from '@/components/ui';
import { formatMoney } from '@/domain/money';
import { activeGoal, totalSaved, useStore } from '@/state/store';

export default function Menu() {
  const { state, t, colors } = useStore();
  const goal = activeGoal(state);
  const pct = goal && goal.amount ? goal.saved / goal.amount : 0;
  const others = Math.max(0, state.goals.length - 1);
  const items: { label: string; href: Href; first?: boolean }[] = [
    { label: t.newCalc, href: '/calc/income', first: true },
    { label: t.mealPlan, href: '/mealplan' },
    { label: t.history, href: '/history' },
    { label: t.goals, href: '/goals' as Href },
    { label: t.settings, href: '/settings' },
  ];
  return (
    <Window accent="teal" title={t.mySavings} onClose={() => {}}>
      <Segments value={pct} label={`${t.goal} ${Math.round(pct * 100)}%`} />
      <Display>
        <PText size={8} color={colors.displayGreen}>
          {t.inSavings}
        </PText>
        <PText size={64} digits color={colors.displayGreen} align="right">
          {formatMoney(totalSaved(state), state.currency)}
        </PText>
        <View style={{ height: 2, backgroundColor: colors.displayBorder }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <PText size={8} color={colors.displayGold} numberOfLines={1} style={{ flex: 1 }}>
            {goal?.name ? `${t.goal}: ${goal.name}` : t.goal}
          </PText>
          <PText size={30} digits color={colors.displayGold}>
            {formatMoney(goal?.amount ?? 0, state.currency)}
          </PText>
        </View>
        {others > 0 ? (
          <PText size={7} color={colors.displayGreen} align="right">
            {t.moreGoals.replace('{n}', String(others))}
          </PText>
        ) : null}
      </Display>

      <Bevel style={{ padding: 4, gap: 2 }}>
        {items.map((it) => (
          <Pressable key={it.label} onPress={() => router.push(it.href)} accessibilityRole="button" accessibilityLabel={it.label}>
            {({ pressed }) => (
              <View style={{ minHeight: 52, justifyContent: 'center', paddingHorizontal: 14, backgroundColor: pressed || it.first ? '#1D727A' : 'transparent' }}>
                <PText size={10} color={pressed || it.first ? '#FFFFFF' : colors.text}>
                  {it.label}
                </PText>
              </View>
            )}
          </Pressable>
        ))}
      </Bevel>

      <Inset style={{ padding: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
        <PText size={7}>{t.lastCalc.replace('{d}', state.lastCalc ?? t.never)}</PText>
        <PText size={7}>v0.1</PText>
      </Inset>
    </Window>
  );
}
