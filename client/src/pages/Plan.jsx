// Weekly plan builder: pick a meal for each day and slot, then compare what the week costs at each shop.
// The plan lives in the URL, so a plan can be shared as a link.
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Analysis from '../components/Analysis.jsx';
import { useI18n } from '../i18n/index.js';
import { mealEmoji } from '../lib/art.js';
import { clampPeople, clearWeek, copyFirstDay } from '../lib/plan.js';
import { useAnalyzeQuery } from '../store/api.js';

const SLOTS = ['breakfast', 'lunch', 'dinner'];
const planFromParams = (params) => Object.fromEntries([...params.entries()].filter(([k]) => /^d[0-6]_(breakfast|lunch|dinner)$/.test(k)));

export default function Plan({ meta }) {
  const { tr, name, days } = useI18n();
  const [params, setParams] = useSearchParams();
  const urlPlan = useMemo(() => planFromParams(params), [params]);
  const people = clampPeople(params.get('people'), clampPeople(meta.settings.default_people, 4));
  const [grid, setGrid] = useState(urlPlan);
  const [peopleInput, setPeopleInput] = useState(people);
  useEffect(() => { setGrid(urlPlan); setPeopleInput(people); }, [params]);

  const analysis = useAnalyzeQuery({ plan: urlPlan, people });
  const compare = (e) => { e.preventDefault(); setParams({ ...grid, people: String(clampPeople(peopleInput, people)) }); };

  return (
    <>
      <h1>🗓️ {tr('nav_plan')}</h1>

      <form className="card plan-form" onSubmit={compare}>
        <div className="form-row">
          <label className="people" htmlFor="people">{tr('people')}
            <input id="people" type="number" min="1" max="20" inputMode="numeric" value={peopleInput} onChange={(e) => setPeopleInput(e.target.value)} />
          </label>
        </div>
        <div className="table-wrap">
          <table className="week edit">
            <thead><tr><th />{SLOTS.map((s) => <th key={s}><span className={`chip ${s}`}>{tr(s)}</span></th>)}</tr></thead>
            <tbody>
              {days.map((dayName, day) => (
                <tr key={day}>
                  <th scope="row">{dayName}</th>
                  {SLOTS.map((slot) => {
                    const field = `d${day}_${slot}`;
                    return (
                      <td key={slot}>
                        <select id={field} aria-label={`${dayName} · ${tr(slot)}`} value={grid[field] ?? ''}
                          onChange={(e) => setGrid({ ...grid, [field]: e.target.value })}>
                          <option value="">{tr('none')}</option>
                          {Object.values(meta.meals).filter((m) => m.slot === slot).map((m) => (
                            <option key={m.key} value={m.key}>{mealEmoji(m)} {name(m)}</option>
                          ))}
                        </select>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="actions">
          <button className="btn" type="submit">{tr('compare')}</button>
          <button className="btn secondary" type="button" onClick={() => setGrid(copyFirstDay(grid))}>{tr('copy_first_day')}</button>
          <button className="btn secondary" type="button" onClick={() => setGrid(clearWeek())}>{tr('clear_week')}</button>
        </div>
      </form>

      {analysis.data && <Analysis a={analysis.data} meta={meta} />}
    </>
  );
}
