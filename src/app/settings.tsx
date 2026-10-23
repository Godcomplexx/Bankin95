import { router } from 'expo-router';
import { Alert, View } from 'react-native';

import { Window } from '@/components/Window';
import { Chip, PButton, PText } from '@/components/ui';
import { useStore } from '@/state/store';

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 6 }}>
      <PText size={9}>{label}</PText>
      <View style={{ flexDirection: 'row', gap: 6 }}>{children}</View>
    </View>
  );
}

export default function Settings() {
  const { state, set, dispatch, t } = useStore();
  const confirmReset = () =>
    Alert.alert(t.resetData, t.resetConfirm, [
      { text: t.cancel, style: 'cancel' },
      {
        text: t.reset,
        style: 'destructive',
        onPress: () => {
          dispatch({ type: 'resetAll' });
          router.replace('/setup/welcome');
        },
      },
    ]);
  return (
    <Window accent="purple" title={t.settings} footer={<PButton label={t.menu} accent="purple" onPress={() => router.replace('/menu')} />}>
      <Row label={t.language}>
        <Chip label="English" selected={state.lang === 'en'} onPress={() => set({ lang: 'en' })} style={{ flex: 1 }} />
        <Chip label="Русский" selected={state.lang === 'ru'} onPress={() => set({ lang: 'ru' })} style={{ flex: 1 }} />
      </Row>
      <Row label={t.currency}>
        <Chip label="USD ($)" selected={state.currency === 'USD'} onPress={() => set({ currency: 'USD' })} style={{ flex: 1 }} />
        <Chip label="RUB (₽)" selected={state.currency === 'RUB'} onPress={() => set({ currency: 'RUB' })} style={{ flex: 1 }} />
      </Row>
      <Row label={t.reserve}>
        {[5, 10, 15, 20].map((p) => (
          <Chip key={p} label={`${p}%`} selected={state.reservePct === p} onPress={() => set({ reservePct: p })} style={{ flex: 1 }} />
        ))}
      </Row>
      <Row label={t.theme}>
        <Chip label={t.light} selected={state.theme === 'light'} onPress={() => set({ theme: 'light' })} style={{ flex: 1 }} />
        <Chip label={t.dark} selected={state.theme === 'dark'} onPress={() => set({ theme: 'dark' })} style={{ flex: 1 }} />
      </Row>
      <Row label={t.reminders}>
        <Chip label={t.on} selected={state.reminders} onPress={() => set({ reminders: true })} style={{ flex: 1 }} />
        <Chip label={t.off} selected={!state.reminders} onPress={() => set({ reminders: false })} style={{ flex: 1 }} />
      </Row>
      <PButton label={t.resetData} accent="red" onPress={confirmReset} height={46} />
    </Window>
  );
}
