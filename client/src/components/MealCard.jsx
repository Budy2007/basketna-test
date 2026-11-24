// One meal card: cost per serving at the cheapest shop, nutrition, ingredients and other shops.
import { fixed, useI18n } from '../i18n/index.js';
import { mealEmoji } from '../lib/art.js';

export default function MealCard({ card, meta, showDetails = true }) {
  const { tr, name, sep } = useI18n();
  const m = card.meal;
  const shopBy = Object.fromEntries(meta.shops.map((s) => [s.key, s]));
  return (
    <article className={`meal ${m.slot}`}>
      <div className="art" aria-hidden="true">{mealEmoji(m)}</div>
      <div className="body">
        <span><span className={`chip ${m.slot}`}>{tr(m.slot)}</span></span>
        <h3>{name(m)}</h3>
        {card.bestCost != null ? (
          <>
            <div className="cost">{fixed(card.bestCost, 1)} <small>{tr('egp')} {tr('per_serving')}</small></div>
            <div className="muted small">{tr('at_shop', { shop: name(shopBy[card.bestShop]) })}</div>
          </>
        ) : <div className="muted">{tr('no_complete_price')}</div>}
        <div className="facts">
          <span>🔥 {Math.round(card.kcal)} {tr('kcal_short')}</span>
          <span>💪 {Math.round(card.proteinG)} {tr('protein_short')}</span>
          <span>🌾 {Math.round(card.netCarbsG)} {tr('net_carbs_short')}</span>
        </div>
        {showDetails && (
          <>
            <p className="ingredients"><strong>{tr('ingredients')}:</strong>{' '}
              {Object.keys(m.ingredients).map((s) => name(meta.staples[s])).join(sep)}</p>
            {card.costs.length > 1 && (
              <details><summary>{tr('other_shops')}</summary>
                <ul className="plain">{card.costs.slice(1).map((c) => <li key={c.shop}>{name(shopBy[c.shop])}: {fixed(c.cost, 1)} {tr('egp')}</li>)}</ul>
              </details>
            )}
          </>
        )}
      </div>
    </article>
  );
}
