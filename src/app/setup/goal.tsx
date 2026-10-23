import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { NavFooter, Window } from '@/components/Window';
import { Chip, Inset, PInput, PText } from '@/components/ui';
import { formatMoney, fromUsd } from '@/domain/money';
import { uid, useStore } from '@/state/store';
import { fonts } from '@/theme/tokens';

type Preset = 'vacation' | 'emergency' | 'laptop' | 'custom';
const PRESET_USD: Record<Exclude<Preset, 'custom'>, { usd: number; months: number }> = {
  vacation: { usd: 8000, months: 12 },
  emergency: { usd: 5000, months: 12 },
  laptop: { usd: 1500, months: 6 },
};
const MONTHS = [3, 6, 12, 24];

export default function GoalSetup() {
  const { state, set, dispatch, t, colors } = useStore();
  const names: Record<Preset, string> = {
    vacation: t.presetVacation,
    emergency: t.presetEmergency,
    laptop: t.presetLaptop,
    custom: '',
  };
  const [preset, setPreset] = useState<Preset>('vacation');
  const [name, setName] = useState(names.vacation);
  const [amount, setAmount] = useState(Math.round(fromUsd(PRESET_USD.vacation.usd, state.currency)));
  const [months, setMonths] = useState(12);

  const pick = (p: Preset) => {
    setPreset(p);
    if (p === 'custom') {
      setName('');
      setAmount(0);
      setMonths(6);
    } else {
      setName(names[p]);
      setAmount(Math.round(fromUsd(PRESET_USD[p].usd, state.currency)));
      setMonths(PRESET_USD[p].months);
    }
  };

  const valid = name.trim().length > 0 && amount > 0;
  const inputStyle = { fontFamily: fonts.pixel, fontSize: 10, color: colors.text, padding: 12, minHeight: 44 };

  return (
    <Window
      accent="blue"
      title={t.goalHead}
      subtitle={t.goalSub}
      onClose={() => {}}
      footer={
        <NavFooter
          next={t.finish}
          accent="blue"
          disabled={!valid}
          onNext={() => {
            dispatch({ type: 'addGoal', goal: { id: uid(), name: name.trim(), amount, months, saved: 0 }, makeActive: true });
            set({ onboarded: true });
            router.replace('/menu');
          }}
        />
      }
    >
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {(['vacation', 'emergency', 'laptop', 'custom'] as Preset[]).map((p) => (
          <Chip
            key={p}
            label={p === 'custom' ? t.presetCustom : names[p]}
            selected={preset === p}
            onPress={() => pick(p)}
            style={{ width: '48.5%' }}
          />
        ))}
      </View>

      <PText size={8}>{t.goalName}</PText>
      <Inset>
        <PInput
          value={name}
          onChangeText={(v) => {
            setName(v);
            setPreset(preset === 'custom' ? 'custom' : preset);
          }}
          placeholder={t.typeGoal}
          placeholderTextColor={colors.textMuted}
          maxLength={28}
          accessibilityLabel={t.goalName}
          style={inputStyle}
        />
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
          style={inputStyle}
        />
      </Inset>

      <PText size={8}>{t.deadline}</PText>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {MONTHS.map((m) => (
          <Chip key={m} label={`${m} ${t.months}`} selected={months === m} onPress={() => setMonths(m)} style={{ flex: 1 }} />
        ))}
      </View>

      <Inset fill={colors.note} style={{ padding: 12 }}>
        <PText size={8}>
          {amount > 0
            ? t.perMonthAbout.replace('{v}', formatMoney(Math.ceil(amount / months), state.currency))
            : t.enterAmount}
        </PText>
      </Inset>
      <PText size={7} color={colors.textMuted}>
        {t.step2}
      </PText>
    </Window>
  );
}
