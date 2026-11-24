import { Link } from 'react-router-dom';
import MealCard from '../components/MealCard.jsx';
import { useI18n } from '../i18n/index.js';
import { useHomeQuery, useShopsQuery } from '../store/api.js';

export default function Home({ meta }) {
  const { lang, tr, date, name } = useI18n();
  const { data } = useHomeQuery();
  const shops = useShopsQuery();
  const place = meta.settings[`neighborhood_${lang}`];
  return (
    <>
      <section className="hero">
        <h1>{tr('app_name')} 🧺</h1>
        <p>{tr('tagline')}</p>
        <p className="place">📍 {place ? `${place} · ` : ''}{meta.settings[`city_${lang}`]}</p>
        <div className="actions">
          <Link className="btn" to="/plan">{tr('home_cta')}</Link>
          <Link className="btn secondary" to="/meals">{tr('see_all_meals')}</Link>
        </div>
        <div className="deco" aria-hidden="true">🍅🥘🧆🍋</div>
      </section>

      {data && (
        <section className="stats" aria-label={tr('app_name')}>
          <div className="stat"><strong>{data.stats.meals}</strong><span>{tr('stat_meals')}</span></div>
          <div className="stat"><strong>{data.stats.shops}</strong><span>{tr('stat_shops')}</span></div>
          <div className="stat"><strong>{data.stats.prices}</strong><span>{tr('stat_prices')}</span></div>
          <div className="stat"><strong>{date(data.stats.latest)}</strong><span>{tr('stat_latest')}</span></div>
        </section>
      )}

      <section className="features">
        <Link className="feature" style={{ '--c': 'var(--tomato)' }} to="/plan">
          <span className="icon" aria-hidden="true">🗓️</span><h3>{tr('feature_plan')}</h3><p>{tr('feature_plan_body')}</p></Link>
        <Link className="feature" style={{ '--c': 'var(--saffron)' }} to="/meals">
          <span className="icon" aria-hidden="true">🍲</span><h3>{tr('feature_meals')}</h3><p>{tr('feature_meals_body')}</p></Link>
        <Link className="feature" style={{ '--c': 'var(--nile)' }} to="/prices">
          <span className="icon" aria-hidden="true">📈</span><h3>{tr('feature_prices')}</h3><p>{tr('feature_prices_body')}</p></Link>
      </section>

      {shops.data?.shops.some((s) => s.inComparison) && (
        <section className="card">
          <h2>{tr('shops_title')}</h2>
          <ul className="plain">
            {shops.data.shops.filter((s) => s.inComparison).map((s) => (
              <li key={s.key}>
                <strong>{s.website ? <a href={s.website} rel="noopener noreferrer" target="_blank">{name(s)}</a> : name(s)}</strong>
                {' · '}<span className="muted">{tr('shop_prices', { n: s.prices, date: date(s.latest) })}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {data?.cheapCards?.length > 0 && (
        <>
          <div className="section-head">
            <h2>{tr('cheapest_now')}</h2>
            <Link to="/meals">{tr('see_all_meals')} {lang === 'ar' ? '←' : '→'}</Link>
          </div>
          <div className="meal-grid">{data.cheapCards.map((c) => <MealCard key={c.meal.key} card={c} meta={meta} showDetails={false} />)}</div>
        </>
      )}
    </>
  );
}
