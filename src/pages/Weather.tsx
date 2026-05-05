import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Droplets, Wind, CloudRain, MapPin } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import MobileLayout from '../components/layout/MobileLayout';
import Card from '../components/ui/Card';
import { useGeolocation } from '../hooks/useGeolocation';
import { fetchWeather } from '../services/weatherService';
import type { WeatherResponse } from '../types';

function icon(code: string): string {
  return `https://openweathermap.org/img/wn/${code}@2x.png`;
}

export default function Weather() {
  const { t } = useTranslation();
  const { lat, lng, loading: geoLoading } = useGeolocation();
  const [weather, setWeather] = useState<WeatherResponse | null>(null);

  useEffect(() => {
    if (lat != null && lng != null) fetchWeather(lat, lng).then(setWeather);
  }, [lat, lng]);

  if (geoLoading || !weather) {
    return (
      <MobileLayout title={t('weather.title')}>
        <div className="p-6 text-center text-gray-500">{t('common.loading')}</div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title={t('weather.title')}>
      <div className="px-4 py-4 space-y-4">
        <Card className="bg-gradient-to-br from-sky to-primary-light text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1 text-xs opacity-90">
                <MapPin size={12} /> {weather.location || 'Your Farm'}
              </div>
              <div className="text-5xl font-bold">{Math.round(weather.current.temp)}°</div>
              <div className="capitalize text-sm">{weather.current.description}</div>
              <div className="text-xs opacity-90 mt-1">
                Feels like {Math.round(weather.current.feels_like)}°
              </div>
            </div>
            <img src={icon(weather.current.icon)} alt="" width={96} />
          </div>
        </Card>

        <div className="grid grid-cols-3 gap-3">
          <Card padding="sm" className="text-center">
            <Droplets className="mx-auto text-sky" size={22} />
            <div className="text-xs text-gray-500 mt-1">{t('weather.humidity')}</div>
            <div className="font-semibold">{weather.current.humidity}%</div>
          </Card>
          <Card padding="sm" className="text-center">
            <Wind className="mx-auto text-primary-accent" size={22} />
            <div className="text-xs text-gray-500 mt-1">{t('weather.wind')}</div>
            <div className="font-semibold">{weather.current.wind_speed} m/s</div>
          </Card>
          <Card padding="sm" className="text-center">
            <CloudRain className="mx-auto text-sky" size={22} />
            <div className="text-xs text-gray-500 mt-1">{t('weather.rain')}</div>
            <div className="font-semibold">{weather.current.rain_1h ?? 0} mm</div>
          </Card>
        </div>

        <Card padding="sm">
          <div className="text-sm font-semibold px-1 mb-2">{t('weather.hourly')}</div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weather.hourly}>
                <defs>
                  <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#52B788" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#52B788" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="temp"
                  stroke="#2D6A4F"
                  fillOpacity={1}
                  fill="url(#tempGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div>
          <div className="text-sm font-semibold px-1 mb-2">{t('weather.forecast7d')}</div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {weather.daily.map((d) => (
              <Card key={d.date} padding="sm" className="min-w-[80px] text-center">
                <div className="text-[10px] text-gray-500">
                  {new Date(d.date).toLocaleDateString('en-IN', { weekday: 'short' })}
                </div>
                <img src={icon(d.icon)} alt="" width={40} className="mx-auto" />
                <div className="text-sm font-semibold">{Math.round(d.temp_max)}°</div>
                <div className="text-[11px] text-gray-500">{Math.round(d.temp_min)}°</div>
                <div className="text-[10px] text-sky mt-1">💧 {d.rain_probability}%</div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
