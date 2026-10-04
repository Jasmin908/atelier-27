import type { Locale } from '../config/site';
import { de } from './de';
import { en } from './en';

export const copy = { de, en } as const;

export function getCopy(locale: Locale) {
  return copy[locale];
}
