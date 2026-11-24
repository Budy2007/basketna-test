import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { NavLink, Route, Routes } from 'react-router-dom';
import { useI18n } from './i18n/index.js';
import { useMetaQuery } from './store/api.js';
import { toggleLang } from './store/slices.js';
import Home from './pages/Home.jsx';
import Meals from './pages/Meals.jsx';
import Plan from './pages/Plan.jsx';
import Prices from './pages/Prices.jsx';

export default function App() {
  const { lang, dir, tr } = useI18n();
  const dispatch = useDispatch();
  const meta = useMetaQuery();

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    document.title = tr('app_name');
  }, [lang, dir]);

  return (
    <>
      <header className="top">
        <NavLink className="brand" to="/"><span className="logo" aria-hidden="true">🧺</span><span className="word">{tr('app_name')}</span></NavLink>
        <nav aria-label={tr('app_name')}>
          <NavLink to="/plan">{tr('nav_plan')}</NavLink>
          <NavLink to="/meals">{tr('nav_meals')}</NavLink>
          <NavLink to="/prices">{tr('nav_prices')}</NavLink>
          <button type="button" className="lang" lang={lang === 'ar' ? 'en' : 'ar'} onClick={() => dispatch(toggleLang())}>{tr('lang_switch')}</button>
        </nav>
      </header>
      <main>
        {meta.isError && <p className="flash warn" role="alert">{lang === 'ar' ? 'مش قادرين نوصل للسيرفر. اتأكد إنه شغال.' : 'Cannot reach the server. Make sure it is running.'}</p>}
        {meta.data ? (
          <Routes>
            <Route path="/" element={<Home meta={meta.data} />} />
            <Route path="/plan" element={<Plan meta={meta.data} />} />
            <Route path="/meals" element={<Meals meta={meta.data} />} />
            <Route path="/prices" element={<Prices meta={meta.data} />} />
            <Route path="*" element={<p className="card">404</p>} />
          </Routes>
        ) : !meta.isError && <p className="muted" role="status">…</p>}
      </main>
      <footer><p>{tr('footer')}</p></footer>
    </>
  );
}
