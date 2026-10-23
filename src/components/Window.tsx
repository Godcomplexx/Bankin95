import { router } from 'expo-router';
import { type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useStore } from '@/state/store';
import { accents, type Accent } from '@/theme/tokens';
import { Bevel, PButton, PText, Segments } from './ui';

type Props = {
  accent: Accent;
  title?: string;
  subtitle?: string;
  /** 0..1 progress through the monthly calculation; omit to hide the bar. */
  progress?: number;
  children: ReactNode;
  footer?: ReactNode;
  scroll?: boolean;
  /** Close (X) goes to the menu by default. */
  onClose?: () => void;
};

/** App screen rendered as a retro window: title bar, optional progress, content, sticky footer. */
export function Window({ accent, title, subtitle, progress, children, footer, scroll = true, onClose }: Props) {
  const { colors, t } = useStore();
  const Body = scroll ? ScrollView : View;
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.page }]} edges={['top', 'bottom']}>
      <View style={[styles.window, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.titleBar, { backgroundColor: accents[accent] }]}>
          <PText size={8} color="#FFFFFF" style={{ flex: 1 }} numberOfLines={1}>
            {t.menuBar}
          </PText>
          <Pressable
            onPress={onClose ?? (() => router.replace('/menu'))}
            accessibilityRole="button"
            accessibilityLabel="Close"
            hitSlop={8}
          >
            <Bevel style={styles.closeBtn}>
              <PText size={9} align="center">
                X
              </PText>
            </Bevel>
          </Pressable>
        </View>
        {progress !== undefined && (
          <View style={{ paddingHorizontal: 12, paddingTop: 6 }}>
            <Segments value={progress} label={t.progress} />
          </View>
        )}
        <Body
          style={{ flex: 1 }}
          contentContainerStyle={scroll ? styles.content : undefined}
          keyboardShouldPersistTaps="handled"
        >
          <View style={scroll ? undefined : styles.content}>
            {title ? (
              <PText size={13} style={{ marginBottom: 6 }}>
                {title}
              </PText>
            ) : null}
            {subtitle ? (
              <PText size={8} color={colors.textMuted} style={{ marginBottom: 14 }}>
                {subtitle}
              </PText>
            ) : null}
            {children}
          </View>
        </Body>
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </View>
    </SafeAreaView>
  );
}

/** Standard back + primary footer. */
export function NavFooter({
  onBack,
  next,
  onNext,
  accent,
  disabled,
}: {
  onBack?: () => void;
  next: string;
  onNext: () => void;
  accent: Accent;
  disabled?: boolean;
}) {
  const { t } = useStore();
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <PButton label={t.back} onPress={onBack ?? (() => router.back())} style={{ flex: 1 }} />
      <PButton label={next} onPress={onNext} accent={accent} disabled={disabled} style={{ flex: 1.7 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  window: { flex: 1, margin: 8, borderWidth: 2 },
  titleBar: { flexDirection: 'row', alignItems: 'center', paddingLeft: 10, paddingRight: 4, height: 36, gap: 6 },
  closeBtn: { width: 30, height: 26, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 14, gap: 10 },
  footer: { padding: 12, paddingTop: 8 },
});
