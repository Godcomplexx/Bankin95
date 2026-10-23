import { StyleSheet, View } from 'react-native';

import { backspace, pressDigit } from '@/domain/money';
import { PButton } from './ui';

/** 3x4 numeric keypad, max 7 digits. C clears, < deletes the last digit. */
export function Keypad({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '<'];
  return (
    <View style={styles.grid}>
      {keys.map((k) => (
        <View key={k} style={styles.cell}>
          <PButton
            label={k}
            size={14}
            height={56}
            onPress={() => {
              if (k === 'C') onChange(0);
              else if (k === '<') onChange(backspace(value));
              else onChange(pressDigit(value, Number(k)));
            }}
            accent={k === 'C' ? 'red' : undefined}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  cell: { width: '33.333%', padding: 4 },
});
