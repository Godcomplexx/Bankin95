import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { NavFooter, Window } from '@/components/Window';
import { Chip, Inset, PInput, PText } from '@/components/ui';
import { filterRecipes, getAllergens, getDiets, getIngredientList, getRecipes, type AllergenId, type IngredientId } from '@/domain/recipes';
import { useStore } from '@/state/store';
import { fonts } from '@/theme/tokens';

export default function Allergens() {
  const { state, set, dispatch, t, colors } = useStore();
  const [q, setQ] = useState('');
  const lang = state.lang;
  const allergens = getAllergens();
  const diets = getDiets();
  const dislikeOptions = getIngredientList().filter((i) => i.dislikeOption);

  const shownAllergens = allergens.filter((a) => !a.searchOnly || state.allergens.includes(a.id));
  const needle = q.trim().toLowerCase();
  const matches = needle ? allergens.filter((a) => a.name[lang].toLowerCase().includes(needle) || a.name.en.toLowerCase().includes(needle)) : [];

  const left = filterRecipes({ allergens: state.allergens, diet: state.diet, dislikedIngredients: state.disliked }).length;
  const hidden = state.allergens.length + state.customAllergens.length;

  const toggleDislike = (id: IngredientId) =>
    set({ disliked: state.disliked.includes(id) ? state.disliked.filter((x) => x !== id) : [...state.disliked, id] });

  const pickMatch = (id: AllergenId) => {
    if (!state.allergens.includes(id)) dispatch({ type: 'toggleAllergen', id });
    setQ('');
  };

  return (
    <Window
      accent="purple"
      title={t.cantEat}
      subtitle={t.hiddenFromCards}
      progress={4 / 8}
      footer={<NavFooter next={t.next} accent="purple" disabled={left === 0} onNext={() => { dispatch({ type: 'resetVotes' }); router.push('/calc/swipe'); }} />}
    >
      <View>
        <Inset style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 10 }}>
          <PText size={10} color="#000080">
            ?
          </PText>
          <PInput
            value={q}
            onChangeText={setQ}
            placeholder={t.search}
            placeholderTextColor={colors.textMuted}
            accessibilityLabel={t.search}
            style={{ flex: 1, fontFamily: fonts.pixel, fontSize: 9, color: colors.text, padding: 10, minHeight: 44 }}
          />
        </Inset>
        {q.trim() ? (
          <Inset style={{ marginTop: 2 }}>
            {matches.map((a) => (
              <Pressable key={a.id} onPress={() => pickMatch(a.id)} accessibilityRole="button" style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: 12 }}>
                <PText size={9}>+ {a.name[lang]}</PText>
              </Pressable>
            ))}
            <Pressable
              onPress={() => {
                const v = q.trim();
                if (v && !state.customAllergens.includes(v)) set({ customAllergens: [...state.customAllergens, v] });
                setQ('');
              }}
              accessibilityRole="button"
              style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: 12 }}
            >
              <PText size={8} color="#1E5FB0">
                {t.addOwn.replace('{q}', q.trim())}
              </PText>
            </Pressable>
          </Inset>
        ) : null}
      </View>

      <PText size={9} color="#1E5FB0">
        {t.allergens}
      </PText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {shownAllergens.map((a) => (
          <Chip key={a.id} danger label={a.name[lang]} selected={state.allergens.includes(a.id)} onPress={() => dispatch({ type: 'toggleAllergen', id: a.id })} style={{ width: '48.5%' }} />
        ))}
        {state.customAllergens.map((c) => (
          <Chip key={c} danger label={c} selected onPress={() => set({ customAllergens: state.customAllergens.filter((x) => x !== c) })} style={{ width: '48.5%' }} />
        ))}
      </View>

      <PText size={9} color="#1E5FB0">
        {t.diet}
      </PText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {diets.map((d) => (
          <Chip key={d.id} label={d.name[lang]} selected={state.diet === d.id} onPress={() => set({ diet: d.id })} style={{ width: '48.5%' }} />
        ))}
      </View>

      <PText size={9} color="#1E5FB0">
        {t.dislike}
      </PText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {dislikeOptions.map((i) => (
          <Chip key={i.id} label={i.name[lang]} selected={state.disliked.includes(i.id)} onPress={() => toggleDislike(i.id)} style={{ width: '48.5%' }} />
        ))}
      </View>

      <PText size={8} color={left === 0 ? colors.danger : colors.textMuted}>
        {left === 0
          ? t.noRecipesLeft
          : t.recipesLeft.replace('{a}', String(hidden)).replace('{n}', String(left)).replace('{t}', String(getRecipes().length))}
      </PText>
    </Window>
  );
}
