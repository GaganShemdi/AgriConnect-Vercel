import type { WeatherResponse } from '../types';

export type AlertSeverity = 'info' | 'warning' | 'danger';

export interface FarmAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
}

// hardcoded bangalore forecast for 29-apr-2026 used when openweather is down
// (kept deterministic so demo screenshots dont change)
const BANGALORE_FALLBACK: WeatherResponse = {
  current: {
    temp: 33,
    humidity: 58,
    wind_speed: 4.2,
    description: 'partly cloudy with isolated thundershowers',
    icon: '03d',
    feels_like: 35,
    rain_1h: 0,
  },
  daily: [
    { date: '2026-04-29', temp_min: 23, temp_max: 34, description: 'thundershowers in evening', icon: '11d', rain_probability: 65 },
    { date: '2026-04-30', temp_min: 22, temp_max: 33, description: 'cloudy', icon: '04d', rain_probability: 45 },
    { date: '2026-05-01', temp_min: 22, temp_max: 35, description: 'humid, possible showers', icon: '10d', rain_probability: 55 },
    { date: '2026-05-02', temp_min: 23, temp_max: 36, description: 'hot and dry', icon: '01d', rain_probability: 15 },
    { date: '2026-05-03', temp_min: 23, temp_max: 35, description: 'partly cloudy', icon: '02d', rain_probability: 30 },
    { date: '2026-05-04', temp_min: 22, temp_max: 34, description: 'showers', icon: '10d', rain_probability: 70 },
    { date: '2026-05-05', temp_min: 22, temp_max: 33, description: 'thundershowers', icon: '11d', rain_probability: 75 },
  ],
  hourly: [
    { time: '09:00', temp: 28, rain: 0 },
    { time: '12:00', temp: 32, rain: 0 },
    { time: '15:00', temp: 34, rain: 0.2 },
    { time: '18:00', temp: 31, rain: 1.4 },
    { time: '21:00', temp: 27, rain: 0.6 },
    { time: '00:00', temp: 24, rain: 0 },
  ],
  location: 'Bengaluru',
};

const RAIN_SENSITIVE = new Set([
  'Tomato', 'Onion', 'Wheat', 'Cotton', 'Groundnut', 'Chana', 'Arhar Dal', 'Moong Dal',
  'Mango', 'Grapes', 'Pomegranate', 'Capsicum', 'Brinjal', 'Spinach', 'Methi', 'Coriander',
]);
const HEAT_SENSITIVE = new Set([
  'Tomato', 'Spinach', 'Methi', 'Coriander', 'Cabbage', 'Cauliflower', 'Capsicum', 'Beans', 'Peas',
]);
const WIND_SENSITIVE = new Set(['Banana', 'Sugarcane', 'Maize', 'Papaya']);

export function getEffectiveForecast(weather: WeatherResponse | null): WeatherResponse {
  return weather ?? BANGALORE_FALLBACK;
}

// look at the next 3 days of forecast and the farmer's crops, return a
// list of useful warnings (rain, heat, wind). if nothing bad shows up
// we add a single "all clear" item so the UI is never empty
export function buildAlerts(
  weather: WeatherResponse | null,
  crops: string[] = []
): FarmAlert[] {
  const forecast = getEffectiveForecast(weather);
  const alerts: FarmAlert[] = [];
  const next3 = forecast.daily.slice(0, 3);

  const heaviestRainDay = next3.reduce(
    (best, d) => (d.rain_probability > (best?.rain_probability ?? 0) ? d : best),
    next3[0]
  );
  if (heaviestRainDay && heaviestRainDay.rain_probability >= 60) {
    const sensitiveHit = crops.filter((c) => RAIN_SENSITIVE.has(c));
    alerts.push({
      id: 'rain',
      severity: 'warning',
      title: `Heavy rain likely on ${formatDay(heaviestRainDay.date)}`,
      message:
        sensitiveHit.length > 0
          ? `Cover or harvest ready ${sensitiveHit.join(', ')} early. Hold spraying for 24 hours after the rain.`
          : `${heaviestRainDay.rain_probability}% chance of rain. Drain low spots and avoid spraying today.`,
    });
  }

  const hottest = next3.reduce(
    (best, d) => (d.temp_max > (best?.temp_max ?? 0) ? d : best),
    next3[0]
  );
  if (hottest && hottest.temp_max >= 36) {
    const sensitiveHit = crops.filter((c) => HEAT_SENSITIVE.has(c));
    alerts.push({
      id: 'heat',
      severity: hottest.temp_max >= 40 ? 'danger' : 'warning',
      title: `Heat spike up to ${Math.round(hottest.temp_max)}C on ${formatDay(hottest.date)}`,
      message:
        sensitiveHit.length > 0
          ? `Irrigate ${sensitiveHit.join(', ')} early morning and use mulch to keep soil cool.`
          : 'Irrigate early morning, mulch beds, and avoid afternoon spraying.',
    });
  }

  if (forecast.current.wind_speed >= 8) {
    const sensitiveHit = crops.filter((c) => WIND_SENSITIVE.has(c));
    alerts.push({
      id: 'wind',
      severity: 'info',
      title: `Strong winds today, ${forecast.current.wind_speed.toFixed(1)} m/s`,
      message:
        sensitiveHit.length > 0
          ? `Stake or tie ${sensitiveHit.join(', ')} stems and skip foliar spraying.`
          : 'Skip foliar spraying and check trellises and shade nets.',
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      id: 'all-clear',
      severity: 'info',
      title: 'All clear for the next 3 days',
      message: 'No heavy rain, heat, or wind expected. Carry on with your routine field work.',
    });
  }

  return alerts;
}

function formatDay(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  } catch {
    return iso;
  }
}
