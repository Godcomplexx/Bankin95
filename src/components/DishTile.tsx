import { Image, View } from 'react-native';

import type { Recipe } from '@/domain/recipes';
import { useStore } from '@/state/store';
import { PText } from './ui';

/**
 * Dish picture. Shows the licensed photo when the recipe has one, otherwise a pixel tile with the
 * first letter. Photo attribution (author, licence) is kept on the recipe and must be shown in the app credits.
 */
export function DishTile({ recipe, size = 46 }: { recipe: Recipe; size?: number }) {
  const { state } = useStore();
  const name = recipe.name[state.lang];
  const box = { width: size, height: size, borderWidth: 2, borderColor: '#000000' } as const;
  if (recipe.photo) {
    return <Image accessibilityLabel={name} source={{ uri: recipe.photo.url }} style={box} resizeMode="cover" />;
  }
  return (
    <View accessible accessibilityLabel={name} style={{ ...box, backgroundColor: recipe.tile, alignItems: 'center', justifyContent: 'center' }}>
      <PText size={Math.round(size / 3)} color="#FFFFFF">
        {name.charAt(0).toUpperCase()}
      </PText>
    </View>
  );
}
