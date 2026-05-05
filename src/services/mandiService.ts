// data.gov.in agmarknet wrapper -- fetches mandi prices and turns them
// into something the UI can show on the map / list.

import axios from 'axios';
import { MANDI_COORDINATES } from '../data/crops';
import type { MandiPrice, MandiQueryParams } from '../types';

const BASE_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';

interface RawMandiRecord {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  arrival_date: string;
  min_price: string;
  max_price: string;
  modal_price: string;
}

interface RawMandiResponse {
  records: RawMandiRecord[];
  total: number;
}

export async function fetchMandiPrices(params: MandiQueryParams = {}): Promise<MandiPrice[]> {
  const apiKey = import.meta.env.VITE_DATA_GOV_API_KEY;
  const queryParams: Record<string, string> = {
    'api-key': apiKey,
    format: 'json',
    limit: String(params.limit ?? 200),
  };

  if (params.commodity) queryParams['filters[commodity]'] = params.commodity;
  if (params.state) queryParams['filters[state]'] = params.state;
  if (params.district) queryParams['filters[district]'] = params.district;

  try {
    const { data } = await axios.get<RawMandiResponse>(BASE_URL, { params: queryParams });
    return (data.records || []).map((r) => {
      const coords = MANDI_COORDINATES[r.market];
      return {
        commodity: r.commodity,
        market: r.market,
        state: r.state,
        district: r.district,
        min_price: Number(r.min_price) || 0,
        max_price: Number(r.max_price) || 0,
        modal_price: Number(r.modal_price) || 0,
        arrival_date: r.arrival_date,
        lat: coords?.lat,
        lng: coords?.lng,
      };
    });
  } catch (err) {
    // data.gov.in is flaky, fall back to mock data
    console.error('Mandi API error', err);
    return getMockMandiPrices(params.commodity || 'Tomato');
  }
}

// fake prices for offline / api-down case
export function getMockMandiPrices(commodity: string): MandiPrice[] {
  return Object.entries(MANDI_COORDINATES).map(([market, c]) => {
    const base = 2000 + Math.floor(Math.random() * 3000);
    return {
      commodity,
      market,
      state: c.state,
      min_price: base - 200,
      max_price: base + 400,
      modal_price: base,
      arrival_date: new Date().toISOString().slice(0, 10),
      lat: c.lat,
      lng: c.lng,
    };
  });
}

export function computeNationalAverage(prices: MandiPrice[]): number {
  if (prices.length === 0) return 0;
  const total = prices.reduce((s, p) => s + p.modal_price, 0);
  return Math.round(total / prices.length);
}
