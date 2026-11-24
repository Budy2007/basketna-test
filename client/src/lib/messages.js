// The recommendation sentence built from analysis results.
import { money, t } from '../i18n/index.js';

export function recommendationText(a, lang, shopName) {
  const rec = a.recommendation;
  if (rec.kind === 'empty') return t('rec_empty', lang);
  if (rec.kind === 'incomplete') return t('rec_incomplete', lang);
  if (rec.kind === 'stale') return t('rec_stale', lang);
  if (!rec.runnerUp) return t('rec_only', lang, { shop: shopName(rec.best.shop) });
  const names = { shop: shopName(rec.best.shop), runner: shopName(rec.runnerUp.shop) };
  if (rec.kind === 'single') return t('rec_single', lang, { ...names, saving: money(rec.saving) });
  return t('rec_no_clear', lang, names);
}
