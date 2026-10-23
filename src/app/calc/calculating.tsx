import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { Window } from '@/components/Window';
import { Display, PText, Segments } from '@/components/ui';
import { useStore } from '@/state/store';

/** Short animated pause before showing the result (pure UI feedback, the math is instant). */
export default function Calculating() {
  const { t, colors } = useStore();
  const [p, setP] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setP((v) => Math.min(1, v + 0.12)), 120);
    const done = setTimeout(() => router.replace('/calc/result'), 1300);
    return () => {
      clearInterval(id);
      clearTimeout(done);
    };
  }, []);
  return (
    <Window accent="red" title={t.calculating} subtitle={t.calcSub} progress={1} scroll={false}>
      <View style={{ gap: 16, marginTop: 30 }}>
        <Display style={{ alignItems: 'center', paddingVertical: 30 }}>
          <PText size={12} color={colors.displayGreen} align="center">
            {t.crunching}
          </PText>
        </Display>
        <Segments value={p} label="" />
      </View>
    </Window>
  );
}
