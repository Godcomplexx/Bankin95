import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';

import { NavFooter, Window } from '@/components/Window';
import { Chip, Inset, PButton, PInput, PText } from '@/components/ui';
import { formatMoney } from '@/domain/money';
import { uid, useStore } from '@/state/store';
import { fonts } from '@/theme/tokens';

export default function GoalEditor() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, dispatch, t, colors } = useStore();
  const existing = state.goals.find((g) => g.id === id);
  const isNew = !existing;
  const [name, setName] = useState(existing?.name ?? '');
  const [amount, setAmount] = useState(existing?.amount ?? 0);
  const [months, setMonths] = useState(existing?.months ?? 12);
  const main = existing ? existing.id === state.activeGoalId : state.goals.length === 0;
  const [makeMain, setMakeMain] = useState(main);
  const valid = name.trim().length > 0 && amount > 0;
  const m = (v: number) => formatMoney(v, state.currency);
  const input = { fontFamily: fonts.pixel, fontSize: 10, color: colors.text, padding: 12, minHeight: 44 };

  const save = () => {
    const goal = { id: existing?.id ?? uid(), name: name.trim(), amount, months, saved: existing?.saved ?? 0 };
    if (isNew) dispatch({ type: 'addGoal', goal, makeActive: makeMain });
    else {
      dispatch({ type: 'updateGoal', goal });
      if (makeMain) dispatch({ type: 'setActiveGoal', id: goal.id });
    }
    router.back();
  };

  const remove = () => {
    if (!existing) return;
    Alert.alert(t.deleteGoalTitle, t.deleteGoalText.replace('{v}', m(existing.saved)), [
      { text: t.cancel, style: 'cancel' },
      {
        text: t.deleteGoal,
        style: 'destructive',
        onPress: () => {
          dispatch({ type: 'removeGoal', id: existing.id });
          router.back();
        },
      },
    ]);
  };

  const left = Math.max(0, amount - (existing?.saved ?? 0));
  return (
    <Window accent="green" title={isNew ? t.newGoalTitle : t.editGoal} footer={<NavFooter next={t.save} accent="green" disabled={!valid} onNext={save} />}>
      <PText size={8}>{t.goalName}</PText>
      <Inset>
        <PInput value={name} onChangeText={setName} maxLength={28} placeholder={t.typeGoal} placeholderTextColor={colors.textMuted} accessibilityLabel={t.goalName} style={input} />
      </Inset>
      <PText size={8}>{t.amount}</PText>
      <Inset>
        <PInput
          value={amount ? String(amount) : ''}
          onChangeText={(v) => setAmount(Number(v.replace(/\D/g, '').slice(0, 7)) || 0)}
          keyboardType="number-pad"
          placeholder="0"
          placeholderTextColor={colors.textMuted}
          accessibilityLabel={t.amount}
          style={input}
        />
      </Inset>
      <PText size={8}>{t.deadline}</PText>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {[3, 6, 12, 24].map((mo) => (
          <Chip key={mo} label={`${mo} ${t.months}`} selected={months === mo} onPress={() => setMonths(mo)} style={{ flex: 1 }} />
        ))}
      </View>
      <Chip label={main ? t.isMain : t.makeMain} selected={makeMain} onPress={() => !main && setMakeMain(!makeMain)} />
      <Inset fill={colors.note} style={{ padding: 12 }}>
        <PText size={8}>{amount > 0 ? t.perMonthAbout.replace('{v}', m(Math.ceil(left / months))) : t.enterAmount}</PText>
      </Inset>
      {!isNew ? (
        state.goals.length > 1 ? (
          <PButton label={t.deleteGoal} accent="red" onPress={remove} height={46} />
        ) : (
          <PText size={7} color={colors.textMuted}>
            {t.lastGoalNote}
          </PText>
        )
      ) : null}
    </Window>
  );
}
