import { router } from 'expo-router';

import { Window } from '@/components/Window';
import { Display, PButton, PText, ValueRow } from '@/components/ui';
import { formatMoney } from '@/domain/money';
import { totalSaved, useStore } from '@/state/store';

export default function History() {
  const { state, t, colors } = useStore();
  return (
    <Window accent="pink" title={t.history} footer={<PButton label={t.menu} accent="pink" onPress={() => router.replace('/menu')} />}>
      <Display>
        <PText size={8} color={colors.displayGreen}>
          {t.inSavings}
        </PText>
        <PText size={48} digits color={colors.displayGreen} align="right">
          {formatMoney(totalSaved(state), state.currency)}
        </PText>
      </Display>
      {state.history.length === 0 ? (
        <PText size={9} color={colors.textMuted}>
          {t.historyEmpty}
        </PText>
      ) : (
        state.history.map((h, i) => <ValueRow key={`${h.date}-${i}`} label={h.goalName ? `${h.date}  ${h.goalName}` : h.date} value={`+${formatMoney(h.amount, state.currency)}`} />)
      )}
    </Window>
  );
}
