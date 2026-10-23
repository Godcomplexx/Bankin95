import { router, type Href } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Window } from '@/components/Window';
import { Display, Inset, PButton, PText, Segments } from '@/components/ui';
import { formatMoney } from '@/domain/money';
import { totalSaved, useStore } from '@/state/store';

export default function Goals() {
  const { state, t, colors } = useStore();
  const m = (v: number) => formatMoney(v, state.currency);
  return (
    <Window
      accent="green"
      title={t.goals}
      footer={
        <View style={{ gap: 8 }}>
          <PButton label={t.newGoal} onPress={() => router.push('/goals/new' as Href)} height={46} />
          <PButton label={t.menu} accent="green" onPress={() => router.replace('/menu')} />
        </View>
      }
    >
      <Display>
        <PText size={8} color={colors.displayGreen}>
          {t.goalsTotal}
        </PText>
        <PText size={48} digits color={colors.displayGreen} align="right">
          {m(totalSaved(state))}
        </PText>
      </Display>

      {state.goals.map((g) => {
        const pct = g.amount ? g.saved / g.amount : 0;
        const main = g.id === state.activeGoalId;
        return (
          <Pressable
            key={g.id}
            onPress={() => router.push(`/goals/${g.id}` as Href)}
            accessibilityRole="button"
            accessibilityLabel={`${g.name}, ${t.goalSaved.replace('{a}', m(g.saved)).replace('{b}', m(g.amount))}`}
          >
            <Inset style={{ padding: 12, gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <PText size={10} style={{ flex: 1 }} numberOfLines={1}>
                  {g.name}
                </PText>
                {main ? (
                  <PText size={7} color="#FFFFFF" style={{ backgroundColor: '#2C7356', paddingHorizontal: 6, paddingVertical: 3 }}>
                    {t.mainGoal}
                  </PText>
                ) : null}
              </View>
              <Segments value={pct} label={`${Math.round(pct * 100)}%`} />
              <PText size={8} color={colors.textMuted}>
                {t.goalSaved.replace('{a}', m(g.saved)).replace('{b}', m(g.amount))}
              </PText>
            </Inset>
          </Pressable>
        );
      })}
    </Window>
  );
}
