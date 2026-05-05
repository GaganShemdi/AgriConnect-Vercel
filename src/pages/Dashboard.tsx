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
import type { MandiPrice, WeatherResponse, Language } from '../types';


export default function Dashboard() {
  const { t } = useTranslation();
  const { profile, language } = useAuthStore();
  const { lat, lng } = useGeolocation();

  const [prices, setPrices] = useState<MandiPrice[]>([]);
  const [pricesLoaded, setPricesLoaded] = useState(false);
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [tip, setTip] = useState<string>('');
  const [tipLoading, setTipLoading] = useState(true);


  // mandi prices for the user's main crop.
  // try state-filtered first, fall back to all-india if empty
  useEffect(() => {
    let cancelled = false;
    const crop = profile?.primary_crops?.[0] ?? 'Tomato';
    setPricesLoaded(false);

    (async () => {
      // 1. user's crop in their state
      let p = await fetchMandiPrices({ commodity: crop, state: profile?.state, limit: 25 });
      // 2. user's crop, anywhere in India
      if (p.length === 0) {
        p = await fetchMandiPrices({ commodity: crop, limit: 25 });
      }
      // 3. last resort -- something that always has data so home isnt blank
      if (p.length === 0) {
        p = await fetchMandiPrices({ commodity: 'Tomato', limit: 25 });
      }
      if (cancelled) return;
      const sorted = [...p].sort((a, b) => b.modal_price - a.modal_price).slice(0, 5);
      setPrices(sorted);
      setPricesLoaded(true);
    })();

    return () => { cancelled = true; };
  }, [profile]);


  // weather
  useEffect(() => {
    if (lat != null && lng != null) fetchWeather(lat, lng).then(setWeather);
  }, [lat, lng]);


  // daily AI tip -- depends on profile + weather + language
  useEffect(() => {
    let cancelled = false;
    setTipLoading(true);
    dailyTip({
      name: profile?.name,
      state: profile?.state,
      language: (language ?? 'en') as Language,
      crops: profile?.primary_crops,
      weather: weather?.current
        ? { temp: weather.current.temp, description: weather.current.description }
        : undefined,
    }).then((text: string) => {
      if (cancelled) return;
      setTip(text);
      setTipLoading(false);
    });
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


        {/* kisanmitra daily tip -- doubles as advisory entry point */}
        <Link to="/advisory">
          <Card className="bg-primary-forest text-white border-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-[11px] opacity-80 mb-1">
                  <Sparkles size={12} />
                  KISANMITRA • TODAY'S TIP
                </div>
                {tipLoading ? (
                  <p className="text-sm opacity-90">Brewing today's tip…</p>
                ) : (
                  <div className="text-sm leading-snug text-white">
                    <Markdown text={tip && tip.trim().length > 5 ? tip : 'Check your crops every morning, water early, and watch for pests on new leaves.'} />
                  </div>
                )}
                <div className="text-[11px] opacity-80 mt-2">Tap to ask anything →</div>
              </div>
              <div className="bg-white/20 rounded-2xl p-2.5 shrink-0">
                <Bot size={22} />
              </div>
            </div>
          </Card>
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
            {!pricesLoaded ? (
              <div className="text-sm text-gray-500 p-3">{t('common.loading')}</div>
            ) : prices.length === 0 ? (
              <div className="text-sm text-gray-500 p-3">No prices today. Check the Mandi tab.</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {prices.map((p, i) => (
                  <li
                    key={`${p.market}-${i}`}
                    className="py-2.5 px-2 flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium text-sm">{p.commodity}</div>
                      <div className="text-xs text-gray-500">
                        {p.market}, {p.state}
                      </div>
                    </div>
                    <div className="text-right">
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
