import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';

import { fetchBasket, type Quote } from '@/api/basket';
import { CITIES, getCurrentPlace } from '@/api/location';
import { NavFooter, Window } from '@/components/Window';
import { Chip, Display, Inset, PButton, PText } from '@/components/ui';
import { basketKey, groceryList, portionFactor, targetKcal } from '@/domain/calc';
import { formatMoney, fromUsd } from '@/domain/money';
import { getIngredient } from '@/domain/recipes';
import { useStore, type Basket } from '@/state/store';

function qtyLabel(qty: number, unit: string): string {
  const v = qty >= 10 ? Math.round(qty) : Math.round(qty * 10) / 10;
  return `${v} ${unit}`;
}

const km = (m: number) => (m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(1)} km`);
const kmRu = (m: number) => (m < 1000 ? `${Math.round(m / 10) * 10} м` : `${(m / 1000).toFixed(1).replace('.', ',')} км`);

type Status = 'idle' | 'loading' | 'ready' | 'error';

export default function Groceries() {
  const { state, set, t, colors } = useStore();
  const lang = state.lang;
  const factor = portionFactor(state.plan, targetKcal(state.body, state.weightGoal));
  const lines = useMemo(() => groceryList(state.plan, factor), [state.plan, factor]);
  const key = useMemo(() => basketKey(lines, state.currency), [lines, state.currency]);
  const prevChoice = useRef(state.basket);
  const estimate = fromUsd(lines.reduce((s, l) => s + l.usd, 0), state.currency);

  const [result, setResult] = useState<{ rk: string; quotes: Quote[]; error: boolean } | null>(null);
  const [retry, setRetry] = useState(0);
  const [locating, setLocating] = useState(false);
  const dist = lang === 'ru' ? kmRu : km;

  const toBasket = (q: Quote): Basket => ({
    key,
    storeId: q.store.id,
    storeName: q.store.name,
    distanceM: q.store.distanceM,
    total: q.total,
    prices: Object.fromEntries(q.lines.map((l) => [l.ingredientId, l.price])),
  });

  const loc = state.location;
  const rk = loc ? `${loc.lat},${loc.lon}|${key}|${retry}` : '';
  const status: Status = !loc ? 'idle' : result?.rk === rk ? (result.error ? 'error' : 'ready') : 'loading';
  const quotes = status === 'ready' && result ? result.quotes : [];

  useEffect(() => {
    if (!loc || lines.length === 0) return;
    let cancelled = false;
    fetchBasket({
      lat: loc.lat,
      lon: loc.lon,
      currency: state.currency,
      items: lines.map((l) => ({ ingredientId: l.id, qty: Math.round(l.qty * 1000) / 1000 })),
    })
      .then((r) => {
        if (cancelled) return;
        setResult({ rk, quotes: r.quotes, error: false });
        const keep = r.quotes.find((q) => q.store.id === prevChoice.current?.storeId && prevChoice.current?.key === key);
        const chosen = keep ?? r.quotes[0];
        set({ basket: chosen ? toBasket(chosen) : null });
      })
      .catch(() => {
        if (!cancelled) setResult({ rk, quotes: [], error: true });
      });
    return () => {
      cancelled = true;
    };
    // toBasket depends only on `key`, which is part of rk
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rk]);

  const useGps = async () => {
    setLocating(true);
    const place = await getCurrentPlace(t.useMyLocation);
    setLocating(false);
    if (place) set({ location: place });
  };

  const selected = state.basket && state.basket.key === key ? state.basket : null;
  const total = selected ? selected.total : estimate;

  // 1. no place yet: ask for location or a city
  if (!state.location) {
    return (
      <Window accent="orange" title={t.shopping} subtitle={t.shoppingSub} progress={7 / 8} footer={<NavFooter next={t.calculate} accent="orange" onNext={() => router.push('/calc/calculating')} />}>
        <Inset fill={colors.note} style={{ padding: 12 }}>
          <PText size={8}>{t.locationAsk}</PText>
        </Inset>
        <PButton label={locating ? t.locating : t.useMyLocation} accent="orange" onPress={useGps} height={52} disabled={locating} />
        <PText size={8} color="#1E5FB0">
          {t.chooseCity}
        </PText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {CITIES.map((c) => (
            <Chip key={c.en} label={c[lang]} selected={false} onPress={() => set({ location: { lat: c.lat, lon: c.lon, label: c[lang] } })} style={{ width: '48.5%' }} />
          ))}
        </View>
      </Window>
    );
  }

  return (
    <Window
      accent="orange"
      title={t.shopping}
      subtitle={t.shoppingSub}
      progress={7 / 8}
      footer={<NavFooter next={t.calculate} accent="orange" disabled={status === 'loading'} onNext={() => router.push('/calc/calculating')} />}
    >
      <Display>
        <PText size={8} color={colors.displayGreen}>
          {selected ? selected.storeName.toUpperCase() : t.cheapest}
        </PText>
        <PText size={52} digits color={colors.displayGreen} align="right">
          {formatMoney(total, state.currency)}
        </PText>
        <PText size={7} color={colors.displayGold}>
          {status === 'loading' ? t.locating : selected ? dist(selected.distanceM) : state.location.label}
        </PText>
      </Display>

      {status === 'error' ? (
        <Inset fill={colors.dangerBg} style={{ padding: 12, gap: 10 }}>
          <PText size={8} color={colors.danger}>
            {t.noConnection}
          </PText>
          <PButton label={t.retry} onPress={() => setRetry((n) => n + 1)} height={44} />
        </Inset>
      ) : null}

      {status === 'ready' && quotes.length === 0 ? (
        <PText size={8} color={colors.danger}>
          {t.noStores}
        </PText>
      ) : null}

      {quotes.length > 0 ? (
        <>
          <PText size={8} color="#1E5FB0">
            {t.storesNear}
          </PText>
          {quotes.slice(0, 6).map((q, i) => {
            const sel = selected?.storeId === q.store.id;
            return (
              <Pressable key={q.store.id} onPress={() => set({ basket: toBasket(q) })} accessibilityRole="radio" accessibilityState={{ selected: sel }} accessibilityLabel={`${q.store.name}, ${dist(q.store.distanceM)}, ${formatMoney(q.total, state.currency)}`}>
                <Inset fill={sel ? '#000080' : undefined} style={{ flexDirection: 'row', alignItems: 'center', padding: 10, gap: 10, minHeight: 56 }}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <PText size={9} color={sel ? '#FFFFFF' : colors.text} numberOfLines={1}>
                      {q.store.name}
                    </PText>
                    <PText size={7} color={sel ? '#C0C0FF' : colors.textMuted}>
                      {i === 0 ? `${t.cheapestTag} - ` : ''}
                      {dist(q.store.distanceM)}
                    </PText>
                  </View>
                  <PText size={22} digits color={sel ? '#FFFFFF' : colors.text}>
                    {formatMoney(q.total, state.currency)}
                  </PText>
                </Inset>
              </Pressable>
            );
          })}
        </>
      ) : null}

      <PText size={8} color="#1E5FB0">
        {t.shopping}
      </PText>
      {lines.map((l) => {
        const ing = getIngredient(l.id);
        if (!ing) return null;
        const price = selected?.prices[l.id] ?? fromUsd(l.usd, state.currency);
        return (
          <View key={l.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ flex: 1, gap: 4 }}>
              <PText size={9}>{ing.name[lang]}</PText>
              <PText size={7} color={colors.textMuted}>
                {qtyLabel(l.qty, ing.unit[lang])}
              </PText>
            </View>
            <Inset style={{ width: 150, minHeight: 44, justifyContent: 'center', paddingHorizontal: 10 }}>
              <PText size={26} digits align="right">
                {formatMoney(price, state.currency)}
              </PText>
            </Inset>
          </View>
        );
      })}

      <PText size={7} color={colors.textMuted}>
        {t.estimateNote}
      </PText>
      <PButton label={`${t.changePlace}: ${state.location.label}`} onPress={() => set({ location: null, basket: null })} height={44} size={8} />
    </Window>
  );
}
