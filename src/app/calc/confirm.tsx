import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Keypad } from '@/components/Keypad';
import { NavFooter, Window } from '@/components/Window';
import { Chip, Display, Inset, PText } from '@/components/ui';
import { formatMoney } from '@/domain/money';
import { useStore } from '@/state/store';
import { useResult } from '@/state/useResult';

export default function Confirm() {
  const { state, dispatch, t, colors } = useStore();
  const r = useResult();
  const [amount, setAmount] = useState(r.save);
  const [goalId, setGoalId] = useState(state.activeGoalId || state.goals[0]?.id || '');
  return (
    <Window
      accent="red"
      title={t.confirmTitle}
      subtitle={t.confirmSub}
      footer={
        <NavFooter
          next={t.confirm}
          accent="red"
          disabled={amount <= 0 || !goalId}
          onNext={() => {
            dispatch({ type: 'commitSave', amount, goalId });
            router.replace('/calc/saved');
          }}
        />
      }
    >
      <Display>
        <PText size={8} color={colors.displayGold}>
          {t.canSave}
        </PText>
        <PText size={40} digits color={colors.displayGreen} align="right">
          {formatMoney(r.save, state.currency)}
        </PText>
      </Display>
      <Inset style={{ padding: 10, alignItems: 'flex-end' }}>
        <PText size={48} digits>
          {formatMoney(amount, state.currency)}
        </PText>
      </Inset>
      {state.goals.length > 1 ? (
        <>
          <PText size={8}>{t.saveTo}</PText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {state.goals.map((g) => (
              <Chip key={g.id} label={g.name} selected={goalId === g.id} onPress={() => setGoalId(g.id)} style={{ width: '48.5%' }} />
            ))}
          </View>
        </>
      ) : null}
      <Keypad value={amount} onChange={setAmount} />
    </Window>
  );
}
