import { router } from 'expo-router';
import { View } from 'react-native';

import { Window } from '@/components/Window';
import { Display, Inset, PButton, PText, Segments } from '@/components/ui';
import { formatMoney } from '@/domain/money';
import { totalSaved, useStore } from '@/state/store';

export default function Saved() {
  const { state, t, colors } = useStore();
  const m = (v: number) => formatMoney(v, state.currency);
  const goal = state.goals.find((g) => g.id === state.lastGoalId) ?? state.goals[0];
  const left = Math.max(0, (goal?.amount ?? 0) - (goal?.saved ?? 0));
  const pct = goal && goal.amount ? goal.saved / goal.amount : 0;
  return (
    <Window accent="green" title={t.saved} footer={<PButton label={t.done} accent="green" onPress={() => router.replace('/menu')} />}>
      <Display>
        <PText size={8} color={colors.displayGreen}>
          {t.addedToSavings}
        </PText>
        <PText size={56} digits color={colors.displayGreen} align="center">
          {`+${m(state.lastSave)}`}
        </PText>
        <View style={{ height: 2, backgroundColor: colors.displayBorder }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <PText size={8} color={colors.displayGold}>
            {t.newTotal}
          </PText>
          <PText size={36} digits color={colors.displayGold}>
            {m(totalSaved(state))}
          </PText>
        </View>
      </Display>
      {goal ? (
        <Inset style={{ padding: 12, gap: 10 }}>
          <PText size={8}>{`${t.goal}: ${goal.name}`}</PText>
          <Segments value={pct} label="" />
          <PText size={26} digits>
            {left === 0 ? t.goalReached : t.leftToGoal.replace('{v}', m(left))}
          </PText>
        </Inset>
      ) : null}
      <Inset fill={colors.note} style={{ padding: 12 }}>
        <PText size={8}>{t.greatJob}</PText>
      </Inset>
    </Window>
  );
}
