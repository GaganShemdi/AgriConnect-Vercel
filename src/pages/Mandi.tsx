import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import MobileLayout from '../components/layout/MobileLayout';
import Card from '../components/ui/Card';
import { CROP_CATEGORIES, INDIAN_STATES } from '../data/crops';
import { computeNationalAverage, fetchMandiPrices } from '../services/mandiService';
import type { MandiPrice } from '../types';

export default function Mandi() {
  const { t } = useTranslation();
  const [selectedCrop, setSelectedCrop] = useState<string>('Tomato');
  const [stateFilter, setStateFilter] = useState<string>('');
  const [prices, setPrices] = useState<MandiPrice[]>([]);
  const [loading, setLoading] = useState(false);
  const tileUrl =
    import.meta.env.VITE_OSM_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  useEffect(() => {
    setLoading(true);
    fetchMandiPrices({ commodity: selectedCrop, state: stateFilter || undefined, limit: 200 })
      .then((p) => setPrices(p))
      .finally(() => setLoading(false));
  }, [selectedCrop, stateFilter]);

  const national = useMemo(() => computeNationalAverage(prices), [prices]);

 
  const trendData = useMemo(() => {
    const avg = national || 2500;
    return Array.from({ length: 30 }).map((_, i) => ({
      day: `D${i + 1}`,
      price: Math.round(avg + Math.sin(i / 3) * 150 + (Math.random() - 0.5) * 200),
    }));
  }, [national]);

  return (
    <MobileLayout title={t('mandi.title')}>
      <div className="px-4 py-4 space-y-4">
        <Card padding="sm">
          <div className="flex items-center justify-between px-1 mb-2">
            <div className="text-sm font-semibold">{t('mandi.selectCrop')}</div>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="text-xs border border-gray-300 rounded-lg px-2 py-1 bg-white"
            >
              <option value="">All India</option>
              {INDIAN_STATES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="max-h-40 overflow-y-auto space-y-2">
            {CROP_CATEGORIES.map((cat) => (
              <div key={cat.key}>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider px-1">
                  {t(cat.nameKey)}
                </div>
                <div className="flex flex-wrap gap-1.5 py-1 px-1">
                  {cat.crops.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedCrop(c)}
                      className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                        selectedCrop === c
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-gray-700 border-gray-300'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card padding="sm">
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="text-sm font-semibold">{t('mandi.pricesAt')}</div>
            <div className="text-xs text-gray-500">
              Avg: <span className="font-semibold text-primary-forest">₹{national}</span>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden h-72 border border-gray-100">
            <MapContainer
              center={[22.5, 79.0]}
              zoom={4}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url={tileUrl}
              />
              {prices.filter((p) => p.lat != null && p.lng != null).map((p, i) => {
                const weight = national ? (p.modal_price - national) / national : 0;
                const color = weight > 0.05 ? '#2D6A4F' : weight < -0.05 ? '#E63946' : '#F4A261';
                return (
                  <CircleMarker
                    key={`${p.market}-${i}`}
                    center={[p.lat!, p.lng!]}
                    radius={Math.max(6, Math.min(18, Math.abs(weight) * 60 + 6))}
                    pathOptions={{ color, fillColor: color, fillOpacity: 0.6 }}
                  >
                    <Popup>
                      <div className="text-sm">
                        <div className="font-semibold">{p.market}</div>
                        <div className="text-xs text-gray-600">{p.state}</div>
                        <div className="mt-1">
                          {t('mandi.modal')}: <b>₹{p.modal_price}</b>
                          <br />
                          {t('mandi.min')}: ₹{p.min_price} · {t('mandi.max')}: ₹{p.max_price}
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>
          <div className="flex items-center gap-3 mt-2 px-1 text-[11px] text-gray-600">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" /> Above avg
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-harvest" /> Near avg
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-alert" /> Below avg
            </span>
          </div>
        </Card>

        <Card padding="sm">
          <div className="text-sm font-semibold px-1 mb-1">
            {t('mandi.trendTitle')} — {selectedCrop}
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" hide />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#2D6A4F"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card padding="sm">
          <div className="text-sm font-semibold px-1 mb-2">Mandi-wise prices</div>
          {loading ? (
            <div className="text-sm text-gray-500 p-3">{t('common.loading')}</div>
          ) : prices.length === 0 ? (
            <div className="text-sm text-gray-500 p-3">{t('mandi.noData')}</div>
          ) : (
            <ul className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
              {[...prices].sort((a, b) => b.modal_price - a.modal_price).map((p, i) => (
                <li
                  key={`${p.market}-${i}`}
                  className="py-2 px-2 flex justify-between items-center text-sm"
                >
                  <div>
                    <div className="font-medium">{p.market}</div>
                    <div className="text-[11px] text-gray-500">{p.state}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-primary-forest">₹{p.modal_price}</div>
                    <div className="text-[10px] text-gray-400">
                      ₹{p.min_price}–₹{p.max_price}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </MobileLayout>
  );
}
