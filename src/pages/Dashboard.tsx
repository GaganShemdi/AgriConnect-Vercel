import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Bell, Bot, CloudSun, Sparkles, TrendingUp } from 'lucide-react';
import MobileLayout from '../components/layout/MobileLayout';
import Card from '../components/ui/Card';
import { useAuthStore } from '../store/authStore';
import { fetchMandiPrices } from '../services/mandiService';
import { fetchWeather } from '../services/weatherService';
import { useGeolocation } from '../hooks/useGeolocation';
import { dailyTip } from '../services/geminiService';
import { buildAlerts } from '../utils/alerts';
import Markdown from '../utils/markdown';
import { pickTipForToday } from '../data/tips';
import type { MandiPrice, WeatherResponse, Language } from '../types';


// helper -- race a promise against a timeout, resolve null if it loses
function withTimeout<T>(p: Promise<T>, ms: number): Promise<T | null> {
  return new Promise((resolve) => {
    const t = setTimeout(() => resolve(null), ms);
    p.then((v) => { clearTimeout(t); resolve(v); }).catch(() => { clearTimeout(t); resolve(null); });
  });
}


export default function Dashboard() {
  const { t } = useTranslation();
  const { profile, language } = useAuthStore();
  const { lat, lng } = useGeolocation();

  // start empty -- only show real same-day prices from data.gov.in, no mocks
  const [prices, setPrices] = useState<MandiPrice[]>([]);
  const [pricesLoading, setPricesLoading] = useState(true);

  const [weather, setWeather] = useState<WeatherResponse | null>(null);

  // INSTANT tip -- pick a deterministic one based on today + farmer's profile
  const [tip, setTip] = useState<string>(() =>
    pickTipForToday(`${profile?.name ?? ''}|${(profile?.primary_crops || []).join(',')}`)
  );


  // fetch real same-day prices from data.gov.in (same call the Mandi tab uses).
  // pull all-india for the user's primary crop, fall back to Tomato if 0 rows.
  // no mock data -- the list shows actual market prices or a loading state.
  useEffect(() => {
    let cancelled = false;
    const crop = profile?.primary_crops?.[0] ?? 'Tomato';
    setPricesLoading(true);

    const dedupeAndSort = (rows: MandiPrice[]) => {
      const seen = new Set<string>();
      return rows
        .filter((r) => {
          const k = `${r.market}|${r.state}`;
          if (seen.has(k) || r.modal_price <= 0) return false;
          seen.add(k);
          return true;
        })
        .sort((a, b) => b.modal_price - a.modal_price)
        .slice(0, 10);
    };

    (async () => {
      // primary crop, all India (matches Mandi-tab default)
      let p = await fetchMandiPrices({ commodity: crop, limit: 200 }).catch(() => [] as MandiPrice[]);

      // if user's crop returns nothing, fall back to Tomato so the card always shows real data
      if (!cancelled && p.length === 0) {
        p = await fetchMandiPrices({ commodity: 'Tomato', limit: 200 }).catch(() => [] as MandiPrice[]);
      }

      if (cancelled) return;
      setPrices(dedupeAndSort(p));
      setPricesLoading(false);
    })();

    return () => { cancelled = true; };
  }, [profile]);


  // weather
  useEffect(() => {
    if (lat != null && lng != null) fetchWeather(lat, lng).then(setWeather);
  }, [lat, lng]);


  // upgrade tip in background -- max 5s wait, otherwise keep static
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const ai = await withTimeout(
        dailyTip({
          name: profile?.name,
          state: profile?.state,
          language: (language ?? 'en') as Language,
          crops: profile?.primary_crops,
          weather: weather?.current
            ? { temp: weather.current.temp, description: weather.current.description }
            : undefined,
        }),
        5000
      );
      if (cancelled) return;
      // only swap in if AI actually returned something meaningful
      if (ai && ai.trim().length > 20) {
        setTip(ai);
      }
    })();

    return () => { cancelled = true; };
  }, [profile, language, weather]);


  // farm-relevant alerts from forecast + crops
  const alerts = buildAlerts(weather, profile?.primary_crops || []);


  return (
    <MobileLayout>
      <header className="bg-primary text-white px-5 pt-6 pb-8 rounded-b-3xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-primary-pale">{t('dashboard.hi')}, 🌾</p>
            <h1 className="text-xl font-semibold">{profile?.name || 'Farmer'}</h1>
            {profile?.state && <p className="text-xs opacity-80">{profile.state}</p>}
          </div>
          <button className="rounded-full bg-white/20 p-2.5" aria-label="Notifications">
            <Bell size={20} />
          </button>
        </div>
      </header>

      <div className="px-4 -mt-5 space-y-4">

        {/* weather */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500">{t('dashboard.weatherToday')}</div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-primary-forest">
                  {weather?.current ? Math.round(weather.current.temp) : '—'}°
                </span>
                <span className="text-sm text-gray-500">
                  {weather?.current?.description ?? '...'}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                💧 {weather?.current.humidity ?? '—'}% &nbsp;•&nbsp; 💨{' '}
                {weather?.current.wind_speed ?? '—'} m/s
              </div>
            </div>
            <CloudSun className="text-primary-light" size={64} strokeWidth={1.5} />
          </div>
          <Link
            to="/weather"
            className="block text-xs text-primary-forest mt-3 font-medium"
          >
            {t('weather.forecast7d')} →
          </Link>
        </Card>


        {/* kisanmitra tip card -- inline style so the green can never be purged */}
        <Link to="/advisory">
          <div
            className="rounded-2xl shadow-card p-4"
            style={{ backgroundColor: '#1B4332', color: '#ffffff' }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0" style={{ color: '#ffffff' }}>
                <div className="flex items-center gap-1.5 text-[11px] mb-1" style={{ opacity: 0.85 }}>
                  <Sparkles size={12} />
                  KISANMITRA • TODAY'S TIP
                </div>
                <div className="text-sm leading-snug" style={{ color: '#ffffff' }}>
                  <Markdown text={tip} />
                </div>
                <div className="text-[11px] mt-2" style={{ opacity: 0.85 }}>
                  Tap to ask anything →
                </div>
              </div>
              <div
                className="rounded-2xl p-2.5 shrink-0"
                style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}
              >
                <Bot size={22} />
              </div>
            </div>
          </div>
        </Link>


        {/* todays mandi prices */}
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <h2 className="text-sm font-semibold text-primary-forest flex items-center gap-1">
              <TrendingUp size={16} /> {t('dashboard.todayPrices')}
            </h2>
            <Link to="/mandi" className="text-xs text-primary-accent">
              See all →
            </Link>
          </div>
          <Card padding="sm">
            {pricesLoading ? (
              <ul className="divide-y divide-gray-100">
                {Array.from({ length: 4 }).map((_, i) => (
                  <li key={i} className="py-2.5 px-2 flex justify-between items-center animate-pulse">
                    <div className="flex-1">
                      <div className="h-3 w-24 bg-gray-200 rounded mb-1.5" />
                      <div className="h-2.5 w-36 bg-gray-100 rounded" />
                    </div>
                    <div className="h-4 w-14 bg-gray-200 rounded" />
                  </li>
                ))}
              </ul>
            ) : prices.length === 0 ? (
              <div className="text-sm text-gray-500 p-3">No mandi prices reported today.</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {prices.map((p, i) => (
                  <li
                    key={`${p.market}-${i}`}
                    className="py-2.5 px-2 flex justify-between items-center"
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate">{p.market}</div>
                      <div className="text-xs text-gray-500 truncate">
                        {p.commodity} • {p.state}
                      </div>
                    </div>
                    <div className="text-right shrink-0 pl-2">
                      <div className="text-sm font-semibold text-primary-forest">
                        ₹{p.modal_price}
                      </div>
                      <div className="text-[10px] text-gray-400">/ quintal</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>


        {/* alerts */}
        <Card>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-harvest" />
            <h2 className="text-sm font-semibold">{t('dashboard.alerts')}</h2>
          </div>
          <ul className="space-y-2">
            {alerts.map((a) => {
              const bg =
                a.severity === 'danger'
                  ? 'bg-red-50 border-red-200'
                  : a.severity === 'warning'
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-primary-pale border-primary-mint';
              const titleColor =
                a.severity === 'danger'
                  ? 'text-red-700'
                  : a.severity === 'warning'
                  ? 'text-amber-800'
                  : 'text-primary-forest';
              const icon = a.severity === 'danger' ? '🔥' : a.severity === 'warning' ? '🌧️' : '✅';
              return (
                <li key={a.id} className={`rounded-xl border ${bg} p-2.5`}>
                  <div className={`text-xs font-semibold ${titleColor}`}>
                    {icon} {a.title}
                  </div>
                  <div className="text-xs text-gray-700 mt-0.5">{a.message}</div>
                </li>
              );
            })}
          </ul>
        </Card>

      </div>
    </MobileLayout>
  );
}
