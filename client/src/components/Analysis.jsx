// The plan results panel: recommendation, bar chart of shop totals, shop table and items bought elsewhere.
import { fixed, money, useI18n } from '../i18n/index.js';
import { recommendationText } from '../lib/messages.js';

export default function Analysis({ a, meta }) {
  const { lang, tr, name, date, sep } = useI18n();
  const shopBy = Object.fromEntries(meta.shops.map((s) => [s.key, s]));
  const shopLabel = (key) => name(shopBy[key]) || key;
  const stapleName = (key) => name(meta.staples[key]) || key;
  const rec = a.recommendation;
  const top = Math.max(0, ...a.totals.map((x) => x.total));
  const isBest = (x) => rec.kind === 'single' && rec.best?.shop === x.shop;
  const worstStale = Math.max(0, ...a.totals.filter((x) => !x.missing.length).map((x) => x.stale.length));

  return (
    <>
      <section className={`card rec rec-${rec.kind}`}>
        <p className="rec-text">{recommendationText(a, lang, shopLabel)}</p>
        {rec.split && (
          <>
            <p>{tr('split', { a: shopLabel(rec.split.shops[0]), b: shopLabel(rec.split.shops[1]), saving: money(rec.split.saving) })}</p>
            <div className="split">
              {rec.split.shops.map((shop) => (
                <div key={shop}><strong>{tr('split_items', { shop: shopLabel(shop) })}</strong>{' '}
                  {Object.entries(rec.split.assignment).filter(([, s]) => s === shop).map(([st]) => stapleName(st)).sort().join(sep)}</div>
              ))}
            </div>
          </>
        )}
      </section>

      {a.totals.length > 0 && Object.keys(a.qty).length > 0 && (
        <section className="card">
          <h3>📊 {tr('chart_totals')}</h3>
          <ul className="bars">
            {a.totals.map((x) => (
              <li key={x.shop} className={`${isBest(x) ? 'best' : ''}${x.missing.length ? ' incomplete' : ''}`}>
                <span className="label">{shopLabel(x.shop)}</span>
                <span className="track"><span className="fill" style={{ width: `${top ? ((100 * x.total) / top).toFixed(1) : 0}%` }}>
                  {money(x.total)} {tr('egp')}{x.missing.length ? ' *' : ''}</span></span>
              </li>
            ))}
          </ul>
          {a.totals.some((x) => x.missing.length) && <p className="muted small">* {tr('missing_mark')}</p>}
          <div className="table-wrap">
            <table className="totals">
              <thead><tr><th>{tr('shop')}</th><th>{tr('total')}</th><th>{tr('range')}</th>
                <th>{tr('fresh_share')}</th><th>{tr('oldest')}</th><th>{tr('missing')}</th></tr></thead>
              <tbody>
                {a.totals.map((x) => (
                  <tr key={x.shop} className={`${isBest(x) ? 'best' : ''}${x.missing.length ? ' incomplete' : ''}`}>
                    <th scope="row">{shopLabel(x.shop)}</th>
                    <td className="num">{money(x.total)} <small>{tr('egp')}</small></td>
                    <td className="num">{money(x.low)}–{money(x.high)}</td>
                    <td className={`num${x.freshShare < 0.8 ? ' warn' : ''}`}>{Math.round(x.freshShare * 100)}%</td>
                    <td>{date(x.oldest)}</td>
                    <td>{x.missing.length ? <details><summary>{x.missing.length}</summary>{x.missing.map(stapleName).join(sep)}</details> : 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {worstStale > 0 && <p className="warn">⚠️ {tr('stale_warning', { n: worstStale })}</p>}
          <p className="muted">{tr('cost_note')}</p>
        </section>
      )}

      {a.outside.length > 0 && (
        <section className="card">
          <h3>{tr('outside_title')}</h3>
          <ul className="plain">
            {a.outside.map((o) => (
              <li key={o.staple}><strong>{stapleName(o.staple)}</strong>: {+o.qty.toFixed(1)} {tr(o.unit)}
                {o.known.length > 0 && <span className="muted"> — {o.known.map((k) =>
                  `${shopLabel(k.shop)}${k.staple !== o.staple ? ` (${stapleName(k.staple)})` : ''} ${fixed(k.unitPrice)} ${tr('egp')}`).join(sep)}</span>}
              </li>
            ))}
          </ul>
          <p className="muted small">{tr('outside_note')}</p>
        </section>
      )}
    </>
  );
}
