import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Animated, PanResponder, View } from 'react-native';

import { DishTile } from '@/components/DishTile';
import { NavFooter, Window } from '@/components/Window';
import { Bevel, Inset, PButton, PText } from '@/components/ui';
import { buildPlan } from '@/domain/calc';
import { filterRecipes } from '@/domain/recipes';
import { useStore } from '@/state/store';

type Vote = 'like' | 'skip' | 'never';
const THRESHOLD = 90;

export default function Swipe() {
  const { state, dispatch, set, t, colors } = useStore();
  const deck = useMemo(
    () => filterRecipes({ allergens: state.allergens, diet: state.diet, dislikedIngredients: state.disliked }),
    [state.allergens, state.diet, state.disliked],
  );
  const [index, setIndex] = useState(0);
  const [anim] = useState(() => {
    const pos = new Animated.ValueXY();
    return {
      pos,
      rotate: pos.x.interpolate({ inputRange: [-200, 0, 200], outputRange: ['-12deg', '0deg', '12deg'] }),
      likeOpacity: pos.x.interpolate({ inputRange: [0, THRESHOLD], outputRange: [0, 1], extrapolate: 'clamp' }),
      nopeOpacity: pos.x.interpolate({ inputRange: [-THRESHOLD, 0], outputRange: [1, 0], extrapolate: 'clamp' }),
    };
  });
  const { pos, rotate, likeOpacity, nopeOpacity } = anim;
  const card = deck[index];
  const lang = state.lang;

  const decide = useCallback(
    (vote: Vote) => {
      if (!card) return;
      const to = vote === 'like' ? { x: 500, y: 0 } : vote === 'never' ? { x: -500, y: 0 } : { x: 0, y: -700 };
      Animated.timing(pos, { toValue: to, duration: 180, useNativeDriver: false }).start(() => {
        dispatch({ type: 'vote', id: card.id, vote });
        pos.setValue({ x: 0, y: 0 });
        setIndex((i) => i + 1);
      });
    },
    [card, pos, dispatch],
  );

  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 6 || Math.abs(g.dy) > 6,
        onPanResponderMove: Animated.event([null, { dx: pos.x, dy: pos.y }], { useNativeDriver: false }),
        onPanResponderRelease: (_, g) => {
          if (g.dx > THRESHOLD) decide('like');
          else if (g.dx < -THRESHOLD) decide('never');
          else if (g.dy < -THRESHOLD) decide('skip');
          else Animated.spring(pos, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
        },
      }),
    [pos, decide],
  );

  const done = index >= deck.length;
  const likedNames = deck.filter((r) => state.liked.includes(r.id)).map((r) => r.name[lang]);
  const skippedNames = deck.filter((r) => state.skipped.includes(r.id)).map((r) => r.name[lang]);
  const neverNames = deck.filter((r) => state.never.includes(r.id)).map((r) => r.name[lang]);

  const next = () => {
    set({ plan: buildPlan(state.liked, state.mealsPerDay) });
    router.push('/calc/plan');
  };

  return (
    <Window
      accent="teal"
      title={t.pickFoods}
      subtitle={t.pickSub}
      progress={5 / 8}
      scroll={false}
      footer={<NavFooter next={t.next} accent="teal" disabled={state.liked.length === 0} onNext={next} />}
    >
      <PText size={8}>{t.card.replace('{i}', String(Math.min(index + 1, deck.length))).replace('{n}', String(deck.length))}</PText>
      {done ? (
        <Inset style={{ padding: 14, gap: 10 }}>
          <PText size={12} align="center">
            {t.allDone}
          </PText>
          <PText size={8} color={colors.success}>
            {t.liked.replace('{n}', String(likedNames.length))}
          </PText>
          <PText size={8}>{likedNames.join(', ') || '-'}</PText>
          <PText size={8} color={colors.textMuted}>
            {t.skipped.replace('{n}', String(skippedNames.length))}
          </PText>
          <PText size={8}>{skippedNames.join(', ') || '-'}</PText>
          <PText size={8} color={colors.danger}>
            {t.neverShow.replace('{n}', String(neverNames.length))}
          </PText>
          <PText size={8}>{neverNames.join(', ') || '-'}</PText>
          {state.liked.length === 0 ? (
            <PText size={8} color={colors.danger}>
              {t.likeAtLeast}
            </PText>
          ) : null}
          <PButton
            label={t.startOver}
            onPress={() => {
              dispatch({ type: 'resetVotes' });
              setIndex(0);
            }}
          />
        </Inset>
      ) : (
        <>
          <View style={{ height: 340 }}>
            {deck[index + 1] ? (
              <Inset style={{ position: 'absolute', left: 10, right: 10, top: 10, bottom: 0 }}>
                <View />
              </Inset>
            ) : null}
            <Animated.View
              {...pan.panHandlers}
              accessible
              accessibilityLabel={card.name[lang]}
              accessibilityHint={t.swipeHint}
              style={{ flex: 1, transform: [{ translateX: pos.x }, { translateY: pos.y }, { rotate }] }}
            >
              <Inset style={{ flex: 1, alignItems: 'center', padding: 16, gap: 12 }}>
                <DishTile recipe={card} size={170} />
                <PText size={11} align="center">
                  {card.name[lang]}
                </PText>
                <PText size={8} color={colors.textMuted}>
                  {card.slot === 'breakfast' ? t.breakfast : t.main}
                </PText>
                <PText size={8} color={colors.textMuted}>
                  {`${card.kcal} ${lang === 'ru' ? 'ккал' : 'kcal'} - ${card.minutes} ${lang === 'ru' ? 'мин' : 'min'}`}
                </PText>
                <Animated.View style={{ position: 'absolute', top: 16, left: 16, opacity: likeOpacity }}>
                  <Bevel fill={colors.success} style={{ paddingHorizontal: 10, paddingVertical: 8 }}>
                    <PText size={10} color="#FFFFFF">
                      {t.likeBtn}
                    </PText>
                  </Bevel>
                </Animated.View>
                <Animated.View style={{ position: 'absolute', top: 16, right: 16, opacity: nopeOpacity }}>
                  <Bevel fill={colors.danger} style={{ paddingHorizontal: 10, paddingVertical: 8 }}>
                    <PText size={10} color="#FFFFFF">
                      {t.neverBtn}
                    </PText>
                  </Bevel>
                </Animated.View>
              </Inset>
            </Animated.View>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <PButton label={t.neverBtn} accent="red" onPress={() => decide('never')} style={{ flex: 1 }} size={8} height={64} />
            <PButton label={t.skipBtn} onPress={() => decide('skip')} style={{ flex: 1 }} size={8} height={64} />
            <PButton label={t.likeBtn} accent="green" onPress={() => decide('like')} style={{ flex: 1 }} size={8} height={64} />
          </View>
          <PText size={7} color={colors.textMuted}>
            {t.swipeHint}
          </PText>
        </>
      )}
    </Window>
  );
}
