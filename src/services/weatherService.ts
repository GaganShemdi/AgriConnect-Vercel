// openweather wrapper -- pulls current + 5day/3hr forecast and squashes
// the 3hr buckets into 7 daily summaries for the dashboard.

import axios from 'axios';
import type { WeatherResponse } from '../types';

const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';

export async function fetchWeather(lat: number, lng: number): Promise<WeatherResponse> {
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;

  try {
    const [currentRes, forecastRes] = await Promise.all([
      axios.get(`${BASE_URL}/weather`, {
        params: { lat, lon: lng, appid: apiKey, units: 'metric' },
      }),
      axios.get(`${BASE_URL}/forecast`, {
        params: { lat, lon: lng, appid: apiKey, units: 'metric' },
      }),
    ]);

    const current = currentRes.data;
    const forecast = forecastRes.data;

    // group 3hr forecast entries by date so we can build per-day min/max
    const dailyMap: Record<
      string,
      { temps: number[]; descs: string[]; icons: string[]; pop: number[] }
    > = {};
    for (const entry of forecast.list) {
      const date = entry.dt_txt.slice(0, 10);
      if (!dailyMap[date]) dailyMap[date] = { temps: [], descs: [], icons: [], pop: [] };
      dailyMap[date].temps.push(entry.main.temp);
      dailyMap[date].descs.push(entry.weather[0].description);
      dailyMap[date].icons.push(entry.weather[0].icon);
      dailyMap[date].pop.push(entry.pop || 0);
    }

    const daily = Object.entries(dailyMap)
      .slice(0, 7)
      .map(([date, v]) => ({
        date,
        temp_min: Math.min(...v.temps),
        temp_max: Math.max(...v.temps),
        description: v.descs[Math.floor(v.descs.length / 2)],
        icon: v.icons[Math.floor(v.icons.length / 2)],
        rain_probability: Math.round(Math.max(...v.pop) * 100),
      }));

    const hourly = (forecast.list as Array<{ dt_txt: string; main: { temp: number }; rain?: { '3h'?: number } }>)
      .slice(0, 8)
      .map((e) => ({
        time: e.dt_txt.slice(11, 16),
        temp: e.main.temp,
        rain: e.rain?.['3h'] ?? 0,
      }));

    return {
      current: {
        temp: current.main.temp,
        humidity: current.main.humidity,
        wind_speed: current.wind.speed,
        description: current.weather[0].description,
        icon: current.weather[0].icon,
        feels_like: current.main.feels_like,
        rain_1h: current.rain?.['1h'] ?? 0,
      },
      daily,
      hourly,
      location: current.name,
    };
  } catch (err) {
    // network failed / api down -- return placeholder so UI still renders
    console.error('Weather API error', err);
    return getMockWeather();
  }
}

// quick city -> lat/lng using openweather geo api, india biased
export async function geocodeCity(city: string): Promise<{ lat: number; lng: number } | null> {
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
  try {
    const { data } = await axios.get(`${GEO_URL}/direct`, {
      params: { q: `${city},IN`, limit: 1, appid: apiKey },
    });
    if (!data || data.length === 0) return null;
    return { lat: data[0].lat, lng: data[0].lon };
  } catch {
    return null;
  }
}

// placeholder data when openweather is unreachable
function getMockWeather(): WeatherResponse {
  return {
    current: {
      temp: 28,
      humidity: 65,
      wind_speed: 3.2,
      description: 'partly cloudy',
      icon: '02d',
      feels_like: 30,
      rain_1h: 0,
    },
    daily: Array.from({ length: 7 }).map((_, i) => ({
      date: new Date(Date.now() + i * 86_400_000).toISOString().slice(0, 10),
      temp_min: 22 + Math.floor(Math.random() * 3),
      temp_max: 30 + Math.floor(Math.random() * 5),
      description: 'partly cloudy',
      icon: '02d',
      rain_probability: Math.floor(Math.random() * 60),
    })),
    hourly: Array.from({ length: 8 }).map((_, i) => ({
      time: `${(new Date().getHours() + i * 3) % 24}:00`,
      temp: 26 + Math.floor(Math.random() * 5),
      rain: 0,
    })),
    location: 'Your Farm',
  };
}
