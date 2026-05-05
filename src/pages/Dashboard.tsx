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
import type { MandiPrice, WeatherResponse } from '../types';

export default function Dashboard() {
  const { t } = useTranslation();
  const { profile } = useAuthStore();
  const { lat, lng } = useGeolocation();
  const [prices, setPrices] = useState<MandiPrice[]>([]);
  const [weather, setWeather] = useState<WeatherResponse | null>(null);

  useEffect(() => {
  
    const crop = profile?.primary_crops?.[0] ?? 'Tomato';
    fetchMandiPrices({ commodity: crop, state: profile?.state, limit: 5 }).then((p) =>
      setPrices(p.slice(0, 5))
    );
  }, [profile]);

  useEffect(() => {
    if (lat != null && lng != null) fetchWeather(lat, lng).then(setWeather);
  }, [lat, lng]);

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

        <Link to="/advisory">
          <Card className="bg-primary-forest text-white border-0">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs opacity-80">AI</div>
                <div className="text-lg font-semibold">{t('dashboard.askAI')}</div>
                <p className="text-xs opacity-80 mt-1">
                  Pest, fertilizer, weather advice in your language
                </p>
              </div>
              <div className="bg-white/20 rounded-2xl p-3">
                <Bot size={32} />
              </div>
            </div>
          </Card>
        </Link>

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
            {prices.length === 0 ? (
              <div className="text-sm text-gray-500 p-3">{t('common.loading')}</div>
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

        <Card>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={16} className="text-harvest" />
            <h2 className="text-sm font-semibold">{t('dashboard.alerts')}</h2>
          </div>
          <p className="text-xs text-gray-500">{t('dashboard.noAlerts')}</p>
        </Card>
      </div>
    </MobileLayout>
  );
}
