// shared TS types used across the app

export interface MandiPrice {
  commodity: string;
  market: string;
  state: string;
  district?: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  arrival_date: string;
  lat?: number;
  lng?: number;
}

export interface MandiQueryParams {
  commodity?: string;
  state?: string;
  district?: string;
  limit?: number;
}

export interface WeatherCurrent {
  temp: number;
  humidity: number;
  wind_speed: number;
  description: string;
  icon: string;
  rain_1h?: number;
  uv?: number;
  feels_like: number;
}

export interface WeatherDaily {
  date: string;
  temp_min: number;
  temp_max: number;
  description: string;
  icon: string;
  rain_probability: number;
}

export interface WeatherResponse {
  current: WeatherCurrent;
  daily: WeatherDaily[];
  hourly: { time: string; temp: number; rain: number }[];
  location?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface MarketListing {
  id?: string;
  user_id: string;
  crop: string;
  quantity_kg: number;
  price_per_kg: number;
  location: string;
  state: string;
  contact_phone: string;
  notes?: string;
  status?: 'active' | 'sold' | 'cancelled';
  created_at?: string;
}

export interface CropCategory {
  key: string;
  nameKey: string;
  crops: string[];
}

export type Language = 'en' | 'hi' | 'kn' | 'te' | 'ta' | 'mr' | 'bn';
