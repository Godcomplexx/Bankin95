import { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type StyleProp, type TextInputProps, type TextStyle, type ViewStyle } from 'react-native';

import { useStore } from '@/state/store';
import { accents, fonts, type Accent } from '@/theme/tokens';

type TextProps = {
  children: ReactNode;
  size?: number;
  color?: string;
  digits?: boolean;
  align?: TextStyle['textAlign'];
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
};

/** Pixel text. `digits` switches to VT323 for amounts (Latin/digits only). */
export function PText({ children, size = 10, color, digits, align, style, numberOfLines }: TextProps) {
  const { colors } = useStore();
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        {
          fontFamily: digits ? fonts.digits : fonts.pixel,
          fontSize: size,
          lineHeight: Math.round(size * (digits ? 1.05 : 1.6)),
          color: color ?? colors.text,
          textAlign: align,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

/** Win95 raised bevel: light top/left, dark bottom/right. */
export function Bevel({ children, style, fill, pressed }: { children?: ReactNode; style?: StyleProp<ViewStyle>; fill?: string; pressed?: boolean }) {
  const { colors } = useStore();
  return (
    <View
      style={[
        {
          backgroundColor: fill ?? colors.surface,
          borderWidth: 2,
          borderTopColor: pressed ? colors.shadow : colors.highlight,
          borderLeftColor: pressed ? colors.shadow : colors.highlight,
          borderBottomColor: pressed ? colors.highlight : colors.shadow,
          borderRightColor: pressed ? colors.highlight : colors.shadow,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/** Win95 sunken field. */
export function Inset({ children, style, fill }: { children?: ReactNode; style?: StyleProp<ViewStyle>; fill?: string }) {
  const { colors } = useStore();
  return (
    <View
      style={[
        {
          backgroundColor: fill ?? colors.field,
          borderWidth: 2,
          borderTopColor: colors.shadow,
          borderLeftColor: colors.shadow,
          borderBottomColor: colors.highlight,
          borderRightColor: colors.highlight,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

type ButtonProps = {
  label: string;
  onPress?: () => void;
  accent?: Accent;
  disabled?: boolean;
  size?: number;
  style?: StyleProp<ViewStyle>;
  height?: number;
  accessibilityHint?: string;
};

/** Primary (accent) or secondary (grey) pixel button. Min height 44 for touch. */
export function PButton({ label, onPress, accent, disabled, size = 10, style, height = 52, accessibilityHint }: ButtonProps) {
  const { colors } = useStore();
  const fill = disabled ? colors.surface : accent ? accents[accent] : colors.surface;
  const color = disabled ? colors.textMuted : accent ? '#FFFFFF' : colors.text;
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      style={[{ minHeight: Math.max(44, height) }, style]}
    >
      {({ pressed }) => (
        <Bevel fill={fill} pressed={pressed && !disabled} style={[styles.btn, { minHeight: Math.max(44, height) }]}>
          <PText size={size} color={color} align="center">
            {label}
          </PText>
        </Bevel>
      )}
    </Pressable>
  );
}

/** Navy "display" panel used for big numbers. */
export function Display({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { colors } = useStore();
  return (
    <View
      style={[
        { backgroundColor: colors.displayBg, borderWidth: 2, borderColor: colors.displayBorder, padding: 12, gap: 4 },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Chip({ label, selected, onPress, danger, style }: { label: string; selected: boolean; onPress: () => void; danger?: boolean; style?: StyleProp<ViewStyle> }) {
  const { colors } = useStore();
  const fill = selected ? (danger ? accents.red : '#101040') : colors.surface;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      style={[{ minHeight: 44 }, style]}
    >
      <Bevel fill={fill} pressed={selected} style={styles.chip}>
        <PText size={8} color={selected ? '#FFFFFF' : colors.text} align="center">
          {selected ? `X ${label}` : label}
        </PText>
      </Bevel>
    </Pressable>
  );
}

/** Label + value row (white inset). */
export function ValueRow({ label, value, valueColor, fill, onPress }: { label: string; value: string; valueColor?: string; fill?: string; onPress?: () => void }) {
  const content = (
    <Inset fill={fill} style={styles.row}>
      <PText size={8} style={{ flex: 1 }}>
        {label}
      </PText>
      <PText size={26} digits color={valueColor}>
        {value}
      </PText>
    </Inset>
  );
  return onPress ? (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${label} ${value}`}>
      {content}
    </Pressable>
  ) : (
    content
  );
}

/** Segmented progress bar (Win95 style). */
export function Segments({ value, total = 17, label }: { value: number; total?: number; label: string }) {
  const { colors } = useStore();
  const filled = Math.round(Math.min(1, Math.max(0, value)) * total);
  return (
    <Inset style={styles.progress}>
      <PText size={7} style={{ marginRight: 8 }}>
        {label}
      </PText>
      <View style={{ flexDirection: 'row', gap: 3, flex: 1 }}>
        {Array.from({ length: total }).map((_, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: 14,
              backgroundColor: i < filled ? '#000080' : colors.field,
              borderWidth: 1,
              borderColor: colors.shadow,
            }}
          />
        ))}
      </View>
    </Inset>
  );
}

const styles = StyleSheet.create({
  btn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  chip: { minHeight: 44, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, minHeight: 44 },
  progress: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, height: 30 },
});

/**
 * Text input that never overflows its container: minWidth 0 and an explicit width keep the
 * text inside the sunken field (a bare TextInput can expand to its intrinsic width).
 */
export function PInput(props: TextInputProps) {
  return <TextInput {...props} style={[{ minWidth: 0, width: '100%' }, props.style]} />;
}
