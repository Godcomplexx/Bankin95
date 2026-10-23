import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, View } from 'react-native';

import { NavFooter, Window } from '@/components/Window';
import { Display, Inset, PButton, PInput, PText } from '@/components/ui';
import { formatMoney } from '@/domain/money';
import { uid, useStore, type Payment } from '@/state/store';
import { fonts } from '@/theme/tokens';

export default function Payments() {
  const { state, dispatch, t, colors } = useStore();
  const total = state.payments.reduce((s, p) => s + p.amount, 0);
  const [undo, setUndo] = useState<{ p: Payment; index: number } | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const add = () => dispatch({ type: 'addPayment', payment: { id: uid(), name: '', amount: 0 } });
  const remove = (p: Payment) => {
    const index = state.payments.findIndex((x) => x.id === p.id);
    dispatch({ type: 'removePayment', id: p.id });
    setUndo({ p, index });
    if (undoTimer.current) clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => setUndo(null), 5000);
  };
  const next = () => {
    if (state.payments.some((p) => p.amount > 0 && !p.name.trim())) {
      setError(t.nameRequired);
      return;
    }
    setError(null);
    router.push('/calc/calories');
  };

  const field = { fontFamily: fonts.pixel, fontSize: 9, color: colors.text, padding: 10, minHeight: 44 };

  return (
    <Window
      accent="pink"
      title={t.payments}
      subtitle={t.paymentsSub}
      progress={2 / 8}
      footer={<NavFooter next={t.next} accent="pink" onNext={next} />}
    >
      <Display>
        <PText size={8} color={colors.displayGreen}>
          {t.totalPayments}
        </PText>
        <PText size={52} digits color={colors.displayGreen} align="right">
          {formatMoney(total, state.currency)}
        </PText>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <PText size={8} color={colors.displayGold}>
            {t.left}
          </PText>
          <PText size={34} digits color={state.income - total < 0 ? colors.displayRed : colors.displayGold}>
            {formatMoney(state.income - total, state.currency)}
          </PText>
        </View>
      </Display>

      {state.payments.length === 0 ? (
        <View style={{ alignItems: 'center', paddingVertical: 24, gap: 10 }}>
          <PText size={11}>{t.noPayments}</PText>
          <PText size={8} color={colors.textMuted} align="center">
            {t.noPaymentsHint}
          </PText>
        </View>
      ) : (
        state.payments.map((p) => (
          <View key={p.id} style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
            <Inset style={{ flex: 1.3 }}>
              <PInput
                value={p.name}
                onChangeText={(v) => dispatch({ type: 'updatePayment', payment: { ...p, name: v } })}
                placeholder={t.paymentName}
                placeholderTextColor={colors.textMuted}
                maxLength={20}
                accessibilityLabel={t.paymentName}
                style={field}
              />
            </Inset>
            <Inset style={{ flex: 1 }}>
              <PInput
                value={p.amount ? String(p.amount) : ''}
                onChangeText={(v) => dispatch({ type: 'updatePayment', payment: { ...p, amount: Number(v.replace(/\D/g, '').slice(0, 7)) || 0 } })}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                accessibilityLabel={`${p.name || t.paymentName} ${t.amount}`}
                style={[field, { textAlign: 'right' }]}
              />
            </Inset>
            <Pressable onPress={() => remove(p)} accessibilityRole="button" accessibilityLabel={`${t.remove} ${p.name}`} hitSlop={6}>
              <Inset style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
                <PText size={10} color={colors.danger}>
                  X
                </PText>
              </Inset>
            </Pressable>
          </View>
        ))
      )}

      {error ? (
        <PText size={8} color={colors.danger}>
          {error}
        </PText>
      ) : null}

      <PButton label={t.addPayment} onPress={add} height={46} />

      {undo ? (
        <Inset fill={colors.note} style={{ flexDirection: 'row', alignItems: 'center', padding: 8, gap: 8 }}>
          <PText size={8} style={{ flex: 1 }}>
            {t.removed}
          </PText>
          <PButton
            label={t.undo}
            height={44}
            onPress={() => {
              dispatch({ type: 'restorePayment', payment: undo.p, index: undo.index });
              setUndo(null);
            }}
          />
        </Inset>
      ) : null}
    </Window>
  );
}
