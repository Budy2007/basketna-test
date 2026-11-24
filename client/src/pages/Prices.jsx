// Latest unit price of every staple at every shop, plus reference sources (official, wholesale).
// A food-group filter (kept in the URL as ?group=) shows one kind of food at a time.
import { Link, useSearchParams } from 'react-router-dom';
import { fixed, useI18n } from '../i18n/index.js';
import { groupEmoji } from '../lib/art.js';
import { cheapestShops } from '../lib/prices.js';
import { usePricesQuery } from '../store/api.js';

const GROUPS = ['grains', 'legumes', 'vegetables', 'starchy', 'fruits', 'protein', 'dairy', 'fats', 'sugars', 'other'];

function PriceCell({ est }) {
  const { tr, date } = useI18n();
  if (!est) return <span className="muted">—</span>;
  return (
    <>
      <span className={`price${est.stale ? ' stale' : ''}`}>{fixed(est.unitPrice)}</span>
      <small className="date">{date(est.observedOn)}{est.isPromo && <> · <span className="badge">{tr('promo')}</span></>}{est.stale && ` · ${tr('stale')}`}</small>
    </>
  );
}

function PriceTable({ group, keys, staples, estimates, highlight = false }) {
  const { tr, name } = useI18n();
  const shopKeys = group.map((s) => s.key);
  return (
    <div className="table-wrap">
      <table className="prices">
        <thead><tr><th />{group.map((s) => <th key={s.key}>{s.website ? <a href={s.website} rel="noopener noreferrer" target="_blank">{name(s)}</a> : name(s)}</th>)}</tr></thead>
        <tbody>
          {keys.map((key) => {
            const st = staples[key];
            const cheapest = highlight ? cheapestShops(estimates, key, shopKeys) : [];
            return (
              <tr key={key}>
                <th scope="row"><span aria-hidden="true">{groupEmoji(st.foodGroup)}</span> {name(st)} <small className="muted">/ {tr(st.unit)}</small></th>
                {group.map((s) => (
                  <td key={s.key} className={cheapest.includes(s.key) ? 'cheapest' : undefined}>
                    <PriceCell est={estimates[`${key}|${s.key}`]} />
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function Prices({ meta }) {
  const { tr } = useI18n();
  const { data } = usePricesQuery();
  const [params] = useSearchParams();
  const present = GROUPS.filter((g) => Object.values(meta.staples).some((s) => s.foodGroup === g));
  const group = present.includes(params.get('group')) ? params.get('group') : null;
  const inGroup = (key) => !group || meta.staples[key].foodGroup === group;
  const current = (on) => (on ? 'true' : undefined);
  const referenceKeys = (data?.referenceKeys ?? []).filter(inGroup);

  return (
    <>
      <h1>📈 {tr('prices_title')}</h1>
      <p className="muted">{tr('prices_intro')} ({tr('egp')})</p>
      <nav className="filters" aria-label={tr('food_group')}>
        <Link to="/prices" aria-current={current(!group)}>{tr('all')}</Link>
        {present.map((g) => (
          <Link key={g} to={`/prices?group=${g}`} aria-current={current(group === g)}>{groupEmoji(g)} {tr(`group_${g}`)}</Link>
        ))}
      </nav>
      {data?.shops.length > 0 && (
        <PriceTable group={data.shops} keys={Object.keys(meta.staples).filter(inGroup)} staples={meta.staples} estimates={data.estimates} highlight />
      )}
      {data?.references.length > 0 && referenceKeys.length > 0 && (
        <>
          <h2>{tr('reference_sources')}</h2>
          <PriceTable group={data.references} keys={referenceKeys} staples={meta.staples} estimates={data.estimates} />
        </>
      )}
    </>
  );
}
