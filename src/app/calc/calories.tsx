import { router } from 'expo-router';
import { View } from 'react-native';

import { NavFooter, Window } from '@/components/Window';
import { Chip, Display, Inset, PInput, PText } from '@/components/ui';
import { GOAL_DELTA, maintenanceKcal, type Activity, type WeightGoal } from '@/domain/calc';
import { useStore } from '@/state/store';
import { fonts } from '@/theme/tokens';

function NumField({ label, value, unit, onChange, min, max }: { label: string; value: number; unit: string; onChange: (v: number) => void; min: number; max: number }) {
  const { colors } = useStore();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <PText size={9} style={{ flex: 1 }}>
        {label}
      </PText>
      <Inset style={{ width: 150, flexDirection: 'row', alignItems: 'center' }}>
        <PInput
          value={value ? String(value) : ''}
          onChangeText={(v) => onChange(Math.min(max, Number(v.replace(/\D/g, '').slice(0, 3)) || 0))}
          onEndEditing={() => onChange(Math.min(max, Math.max(min, value)))}
          keyboardType="number-pad"
          accessibilityLabel={label}
          style={{ flexGrow: 1, flexBasis: 0, width: 0, fontFamily: fonts.pixel, fontSize: 10, color: colors.text, padding: 10, minHeight: 44, textAlign: 'right' }}
        />
        <PText size={8} color={colors.textMuted} style={{ paddingRight: 10 }}>
          {unit}
        </PText>
      </Inset>
    </View>
  );
}

const num = (v: number, lang: 'en' | 'ru') => (lang === 'en' ? v.toLocaleString('en-US') : String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ' '));

export default function Calories() {
  const { state, set, t, colors } = useStore();
  const b = state.body;
  const m = maintenanceKcal(b);
  const target = m + GOAL_DELTA[state.weightGoal];
  const note = { lose: t.loseNote, maintain: t.maintainNote, gain: t.gainNote }[state.weightGoal]
    .replace('{m}', num(m, state.lang))
    .replace('{v}', num(target, state.lang));
  const setBody = (patch: Partial<typeof b>) => set({ body: { ...b, ...patch } });

  return (
    <Window
      accent="teal"
      title={t.eatQ}
      subtitle={t.eatSub}
      progress={3 / 8}
      footer={<NavFooter next={t.next} accent="teal" onNext={() => router.push('/calc/allergens')} />}
    >
      <Display>
        <PText size={8} color={colors.displayGreen}>
          {t.maintenance.replace('{v}', num(m, state.lang))}
        </PText>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 12 }}>
          <PText size={56} digits color={colors.displayGreen}>
            {num(target, state.lang)}
          </PText>
          <PText size={9} color={colors.displayGold} style={{ marginBottom: 12 }}>
            {t.kcalGoal}
          </PText>
        </View>
        <PText size={7} color={colors.displayGold}>
          {note}
        </PText>
      </Display>

      <View style={{ flexDirection: 'row', gap: 6 }}>
        {(['lose', 'maintain', 'gain'] as WeightGoal[]).map((g) => (
          <Chip key={g} label={t[g]} selected={state.weightGoal === g} onPress={() => set({ weightGoal: g })} style={{ flex: 1 }} />
        ))}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <PText size={9} style={{ flex: 1 }}>
          {t.sex}
        </PText>
        <Chip label={t.female} selected={b.sex === 'female'} onPress={() => setBody({ sex: 'female' })} style={{ width: 100 }} />
        <Chip label={t.male} selected={b.sex === 'male'} onPress={() => setBody({ sex: 'male' })} style={{ width: 100 }} />
      </View>
      <NumField label={t.age} value={b.age} unit="" min={14} max={99} onChange={(v) => setBody({ age: v })} />
      <NumField label={t.weight} value={b.weightKg} unit={state.lang === 'ru' ? 'кг' : 'kg'} min={35} max={250} onChange={(v) => setBody({ weightKg: v })} />
      <NumField label={t.height} value={b.heightCm} unit={state.lang === 'ru' ? 'см' : 'cm'} min={120} max={230} onChange={(v) => setBody({ heightCm: v })} />

      <PText size={9}>{t.activity}</PText>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {(['low', 'moderate', 'high'] as Activity[]).map((a) => (
          <Chip
            key={a}
            label={{ low: t.actLow, moderate: t.actModerate, high: t.actHigh }[a]}
            selected={b.activity === a}
            onPress={() => setBody({ activity: a })}
            style={{ flex: 1 }}
          />
        ))}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <PText size={9} style={{ flex: 1 }}>
          {t.mealsADay}
        </PText>
        {[2, 3, 4, 5].map((n) => (
          <Chip key={n} label={String(n)} selected={state.mealsPerDay === n} onPress={() => set({ mealsPerDay: n })} style={{ width: 48 }} />
        ))}
      </View>

      <PText size={7} color={colors.textMuted}>
        {t.mifflin}
      </PText>
    </Window>
  );
}
