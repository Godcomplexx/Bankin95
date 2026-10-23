import { router } from 'expo-router';
import { View } from 'react-native';

import { Window } from '@/components/Window';
import { Display, PButton, PText, ValueRow } from '@/components/ui';
import { formatMoney } from '@/domain/money';
import { useStore } from '@/state/store';
import { useResult } from '@/state/useResult';

export default function ResultScreen() {
  const { state, t, colors } = useStore();
  const r = useResult();
  const m = (v: number) => formatMoney(v, state.currency);
  return (
    <Window
      accent="red"
      title={t.safeMax}
      footer={
        <View style={{ gap: 8 }}>
          {r.over ? (
            <PButton label={t.editPayments} onPress={() => router.push('/calc/payments')} height={46} />
          ) : (
            <PButton label={t.breakdown} onPress={() => router.push('/calc/breakdown')} height={46} />
          )}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <PButton label={t.back} onPress={() => router.back()} style={{ flex: 1 }} />
            <PButton label={t.confirm} accent="red" disabled={r.over} onPress={() => router.push('/calc/confirm')} style={{ flex: 1.7 }} />
          </View>
        </View>
      }
    >
      <Display style={{ alignItems: 'center' }}>
        <PText size={8} color={r.over ? colors.displayRed : colors.displayGold}>
          {r.over ? t.notEnough : t.canSave}
        </PText>
        <PText size={72} digits color={r.over ? colors.displayRed : colors.displayGreen}>
          {m(r.save)}
        </PText>
      </Display>
      <ValueRow label={t.income} value={m(r.income)} />
      <ValueRow label={t.minusPayments} value={m(r.payments)} onPress={() => router.push('/calc/payments')} />
      <ValueRow label={t.minusGroceries} value={m(r.groceries)} onPress={() => router.push('/calc/groceries')} />
      <ValueRow label={t.remainder} value={m(r.remainder)} valueColor={r.remainder < 0 ? colors.danger : undefined} />
      <ValueRow label={t.minusReserve.replace('{p}', String(state.reservePct))} value={m(r.reserve)} />
      <ValueRow label={t.eqSave} value={m(r.save)} fill={r.over ? colors.dangerBg : colors.successBg} valueColor={r.over ? colors.danger : '#000000'} />
      <PText size={8} color={r.over ? colors.danger : colors.textMuted}>
        {r.over ? t.overNote : t.reserveNote}
      </PText>
    </Window>
  );
}
