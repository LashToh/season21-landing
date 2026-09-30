import en from './translations/en';
import es from './translations/es';
import pt from './translations/pt';

export const LOCALES = ['en', 'es', 'pt'];
export const DEFAULT_LOCALE = 'en';
export const STORAGE_KEY = 'mubreda-locale';

export const translations = { en, es, pt };

export const LOCALE_LABELS = {
  en: 'EN',
  es: 'ES',
  pt: 'PT',
};

/** Map browser language tags (Chrome, etc.) to supported locales. */
export function localeFromBrowserLanguage() {
  if (typeof navigator === 'undefined') return DEFAULT_LOCALE;

  const candidates = [
    ...(navigator.languages ?? []),
    navigator.language,
  ].filter(Boolean);

  for (const tag of candidates) {
    const code = String(tag).toLowerCase().split('-')[0];
    if (LOCALES.includes(code)) return code;
  }

  return DEFAULT_LOCALE;
}

function getNested(obj, path) {
  return path.split('.').reduce((acc, key) => (acc != null ? acc[key] : undefined), obj);
}

export function translate(locale, key, params = {}) {
  const dict = translations[locale] ?? translations[DEFAULT_LOCALE];
  let value = getNested(dict, key);

  if (value === undefined && locale !== DEFAULT_LOCALE) {
    value = getNested(translations[DEFAULT_LOCALE], key);
  }

  if (value === undefined) return key;

  if (typeof value !== 'string') return value;

  return Object.entries(params).reduce(
    (str, [param, replacement]) => str.replaceAll(`{${param}}`, String(replacement)),
    value,
  );
}
