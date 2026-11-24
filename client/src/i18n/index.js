// Text helpers: translations, Arabic number agreement, dates and money.
import { useSelector } from 'react-redux';
import { DAY_NAMES, MONTHS, TEXT, UNITS_AR } from './text.js';

export { DAY_NAMES };

export function t(key, lang, vars) {
  const entry = TEXT[key];
  if (!entry) throw new Error(`missing text: ${key}`);
  const text = entry[lang === 'ar' ? 'ar' : 'en'];
  return vars ? text.replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? '')) : text;
}

/** Arabic number agreement: 1 and 2 have their own forms, 3-10 take the plural, 11+ the singular. */
function countAr(n, one, two, few, many) {
  if (n === 1) return one;
  if (n === 2) return two;
  return `${n} ${n >= 3 && n <= 10 ? few : many}`;
}

export function forPeople(n, lang) {
  if (lang === 'ar') return n === 1 ? 'لفرد واحد' : `لأسرة من ${countAr(n, '', 'فردين', 'أفراد', 'فردًا')}`;
  return n === 1 ? 'for 1 person' : `for a household of ${n}`;
}

export const unitLabel = (unit, lang) => (lang === 'ar' ? UNITS_AR[unit] ?? unit : unit);

/** Day and month; the year is added when it differs from today's, so old prices cannot pass as current. */
export function fmtDate(iso, lang, today = new Date().toLocaleDateString('en-CA')) {
  if (!iso) return '—';
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  const text = `${d} ${MONTHS[lang][m - 1]}`;
  return y !== Number(today.slice(0, 4)) ? `${text} ${y}` : text;
}

export const money = (v) => Math.round(v).toLocaleString('en-US');
export const fixed = (v, digits = 2) => Number(v).toFixed(digits);
export const nameOf = (obj, lang) => (lang === 'ar' ? obj?.nameAr : obj?.nameEn) ?? '';

/** Everything a component needs for the current language. */
export function useI18n() {
  const lang = useSelector((s) => s.ui.lang);
  return {
    lang,
    dir: lang === 'ar' ? 'rtl' : 'ltr',
    sep: lang === 'ar' ? '، ' : ', ',
    tr: (key, vars) => t(key, lang, vars),
    name: (obj) => nameOf(obj, lang),
    date: (iso) => fmtDate(iso, lang),
    people: (n) => forPeople(n, lang),
    unit: (u) => unitLabel(u, lang),
    days: DAY_NAMES[lang],
  };
}
