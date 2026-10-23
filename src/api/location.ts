import * as Location from 'expo-location';

export type Place = { lat: number; lon: number; label: string };

export const CITIES: { ru: string; en: string; lat: number; lon: number }[] = [
  { ru: 'Москва', en: 'Moscow', lat: 55.7558, lon: 37.6173 },
  { ru: 'Санкт-Петербург', en: 'Saint Petersburg', lat: 59.9343, lon: 30.3351 },
  { ru: 'Новосибирск', en: 'Novosibirsk', lat: 55.0084, lon: 82.9357 },
  { ru: 'Екатеринбург', en: 'Yekaterinburg', lat: 56.8389, lon: 60.6057 },
  { ru: 'Казань', en: 'Kazan', lat: 55.7887, lon: 49.1221 },
  { ru: 'Нижний Новгород', en: 'Nizhny Novgorod', lat: 56.2965, lon: 43.9361 },
  { ru: 'Краснодар', en: 'Krasnodar', lat: 45.0355, lon: 38.9753 },
  { ru: 'Самара', en: 'Samara', lat: 53.1959, lon: 50.1002 },
];

/** Ask for foreground location and return the current position, or null if refused / unavailable. */
export async function getCurrentPlace(label: string): Promise<Place | null> {
  try {
    const perm = await Location.requestForegroundPermissionsAsync();
    if (perm.status !== 'granted') return null;
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    return { lat: pos.coords.latitude, lon: pos.coords.longitude, label };
  } catch {
    return null;
  }
}
