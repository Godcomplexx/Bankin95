import { router } from 'expo-router';

import { Keypad } from '@/components/Keypad';
import { NavFooter, Window } from '@/components/Window';
import { Inset, PText } from '@/components/ui';
import { formatMoney } from '@/domain/money';
import { useStore } from '@/state/store';

export default function Income() {
  const { state, set, t, colors } = useStore();
  const valid = state.income > 0;
  return (
    <Window
      accent="blue"
      title={t.incomeQ}
      progress={1 / 8}
      footer={<NavFooter next={t.next} accent="blue" disabled={!valid} onNext={() => router.push('/calc/payments')} onBack={() => router.replace('/menu')} />}
    >
      <Inset style={{ padding: 12, alignItems: 'flex-end' }}>
        <PText size={56} digits>
          {formatMoney(state.income, state.currency)}
        </PText>
      </Inset>
      <Keypad value={state.income} onChange={(v) => set({ income: v })} />
      <PText size={8} color={valid ? colors.textMuted : colors.danger}>
        {valid ? t.incomeHint : t.enterIncome}
      </PText>
    </Window>
  );
}
