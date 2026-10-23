import { router } from 'expo-router';
import { View } from 'react-native';

import { NavFooter, Window } from '@/components/Window';
import { Inset, PText, ValueRow } from '@/components/ui';
import { formatMoney } from '@/domain/money';
import { useStore } from '@/state/store';
import { useResult } from '@/state/useResult';
import { accents } from '@/theme/tokens';

export default function Breakdown() {
  const { state, t, colors } = useStore();
  const r = useResult();
  const m = (v: number) => formatMoney(v, state.currency);
  const parts = [
    { label: t.payments, v: r.payments, c: accents.pink },
    { label: t.groceries, v: r.groceries, c: '#D8B640' },
    { label: t.reserve, v: r.reserve, c: accents.green },
    { label: t.savings, v: r.save, c: accents.blue },
  ];
  const sum = parts.reduce((s, p) => s + p.v, 0) || 1;
  return (
    <Window accent="purple" title={t.whereMoney} footer={<NavFooter next={t.menu} accent="purple" onNext={() => router.replace('/menu')} />}>
      <Inset style={{ flexDirection: 'row', height: 44 }}>
        {parts.map((p) => (
          <View key={p.label} style={{ flex: Math.max(0.0001, p.v / sum), backgroundColor: p.c }} />
        ))}
      </Inset>
      {parts.map((p) => (
        <View key={p.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 16, height: 16, backgroundColor: p.c, borderWidth: 2, borderColor: '#000' }} />
          <View style={{ flex: 1 }}>
            <ValueRow label={p.label} value={m(p.v)} />
          </View>
        </View>
      ))}
      <Inset fill={colors.note} style={{ padding: 12, gap: 8 }}>
        <PText size={8} color={colors.danger}>
          {t.advice}
        </PText>
        <PText size={8}>{t.adviceText.replace('{s}', m(r.save)).replace('{r}', m(r.reserve))}</PText>
      </Inset>
    </Window>
  );
}
