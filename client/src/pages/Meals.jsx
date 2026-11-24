// Meal gallery with a name search and meal-slot and sort filters (all kept in the URL).
import { Link, useSearchParams } from 'react-router-dom';
import MealCard from '../components/MealCard.jsx';
import { useI18n } from '../i18n/index.js';
import { useMealsQuery } from '../store/api.js';

export default function Meals({ meta }) {
  const { tr } = useI18n();
  const [params, setParams] = useSearchParams();
  const query = Object.fromEntries(['slot', 'sort', 'q'].filter((k) => params.get(k)).map((k) => [k, params.get(k)]));
  const { data } = useMealsQuery(query);
  const slot = data?.slot ?? null;
  const sort = data?.sort ?? 'cheapest';
  const search = params.get('q') ?? '';
  const href = (change) => {
    const next = { slot, sort, q: search || null, ...change };
    return `/meals?${new URLSearchParams(Object.entries(next).filter(([, v]) => v))}`;
  };
  const current = (on) => (on ? 'true' : undefined);
  const onSearch = (e) => {
    const next = new URLSearchParams(params);
    if (e.target.value) next.set('q', e.target.value); else next.delete('q');
    setParams(next, { replace: true });
  };

  return (
    <>
      <h1>🍲 {tr('meals_title')}</h1>
      <p className="muted">{tr('meals_intro')}</p>

      <div className="form-row">
        <label htmlFor="meal-search" className="search">{tr('search_meals')}
          <input id="meal-search" type="search" maxLength={50} value={search} onChange={onSearch} placeholder={tr('search_placeholder')} />
        </label>
      </div>
      <nav className="filters" aria-label={tr('meals_title')}>
        <Link to={href({ slot: null })} aria-current={current(!slot)}>{tr('all')}</Link>
        {meta.slots.map((s) => <Link key={s} to={href({ slot: s })} aria-current={current(slot === s)}>{tr(s)}</Link>)}
      </nav>
      <nav className="filters" aria-label={tr('sort_label')}>
        <span className="label">{tr('sort_label')}:</span>
        {meta.sorts.map((k) => <Link key={k} to={href({ sort: k })} aria-current={current(sort === k)}>{tr(`sort_${k}`)}</Link>)}
      </nav>

      {data && data.cards.length === 0 && (
        <p className="card" role="status">{tr('no_meals_match')} <Link to={href({ q: null })}>{tr('clear_search')}</Link></p>
      )}
      <div className="meal-grid">{data?.cards.map((c) => <MealCard key={c.meal.key} card={c} meta={meta} />)}</div>
    </>
  );
}
