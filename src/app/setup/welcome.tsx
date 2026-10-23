import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { NavFooter, Window } from '@/components/Window';
import { Bevel, Inset, PText } from '@/components/ui';
import type { Currency } from '@/domain/money';
import type { Lang } from '@/i18n/strings';
import { useStore } from '@/state/store';
import { accents } from '@/theme/tokens';

const OPTIONS: { lang: Lang; currency: Currency; code: string; name: string; cur: string; color: string }[] = [
  { lang: 'en', currency: 'USD', code: 'EN', name: 'English', cur: 'US dollar ($)', color: accents.blue },
  { lang: 'ru', currency: 'RUB', code: 'RU', name: 'Русский', cur: 'Российский рубль (₽)', color: accents.pink },
];

export default function Welcome() {
  const { state, set, t, colors } = useStore();
  return (
    <Window
      accent="blue"
      title={t.welcome}
      subtitle={`${t.chooseLangCur} · ${t.step1}`}
      onClose={() => {}}
      footer={<NavFooter onBack={() => {}} next={state.lang === 'ru' ? 'Далее >' : 'Next >'} accent="blue" onNext={() => router.push('/setup/goal')} />}
    >
      <Inset style={{ padding: 6, gap: 6 }}>
        {OPTIONS.map((o) => {
          const sel = state.lang === o.lang;
          return (
            <Pressable
              key={o.code}
              onPress={() => set({ lang: o.lang, currency: o.currency })}
              accessibilityRole="radio"
              accessibilityState={{ selected: sel }}
              accessibilityLabel={`${o.name}, ${o.cur}`}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 12, backgroundColor: sel ? '#000080' : 'transparent' }}>
                <Bevel fill={o.color} style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}>
                  <PText size={13} color="#FFFFFF">
                    {o.code}
                  </PText>
                </Bevel>
                <View style={{ flex: 1, gap: 6 }}>
                  <PText size={11} color={sel ? '#FFFFFF' : colors.text}>
                    {o.name}
                  </PText>
                  <PText size={8} color={sel ? '#C0C0FF' : colors.textMuted}>
                    {o.cur}
                  </PText>
                </View>
              </View>
            </Pressable>
          );
        })}
      </Inset>
      <PText size={8} color={colors.textMuted}>
        {t.changeLater}
      </PText>
    </Window>
  );
}
