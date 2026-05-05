
// crop list + state centers + mandi coords -- static reference data
// the rest of the app pulls from.

import type { CropCategory } from '../types';

export const CROP_CATEGORIES: CropCategory[] = [
  {
    key: 'leafy',
    nameKey: 'crops.leafy',
    crops: ['Spinach', 'Methi', 'Coriander', 'Cabbage', 'Cauliflower', 'Amaranth'],
  },
  {
    key: 'root',
    nameKey: 'crops.root',
    crops: ['Onion', 'Potato', 'Carrot', 'Radish', 'Beetroot', 'Turnip'],
  },
  {
    key: 'gourds',
    nameKey: 'crops.gourds',
    crops: ['Tomato', 'Brinjal', 'Capsicum', 'Cucumber', 'Pumpkin', 'Bitter Gourd'],
  },
  {
    key: 'legumes',
    nameKey: 'crops.legumes',
    crops: ['Beans', 'Peas', 'Cluster Beans', 'Drumstick'],
  },
  {
    key: 'fruits',
    nameKey: 'crops.fruits',
    crops: ['Mango', 'Banana', 'Papaya', 'Pomegranate', 'Grapes', 'Watermelon'],
  },
  {
    key: 'grains',
    nameKey: 'crops.grains',
    crops: ['Wheat', 'Rice', 'Maize', 'Moong Dal', 'Chana', 'Arhar Dal'],
  },
  {
    key: 'cash',
    nameKey: 'crops.cash',
    crops: ['Cotton', 'Sugarcane', 'Groundnut', 'Soybean', 'Sunflower'],
  },
];

export const MANDI_COORDINATES: Record<string, { lat: number; lng: number; state: string }> = {
  'Azadpur': { lat: 28.7167, lng: 77.1833, state: 'Delhi' },
  'Pune': { lat: 18.5204, lng: 73.8567, state: 'Maharashtra' },
  'Mumbai': { lat: 19.076, lng: 72.8777, state: 'Maharashtra' },
  'Bangalore': { lat: 12.9716, lng: 77.5946, state: 'Karnataka' },
  'Hyderabad': { lat: 17.385, lng: 78.4867, state: 'Telangana' },
  'Chennai': { lat: 13.0827, lng: 80.2707, state: 'Tamil Nadu' },
  'Kolkata': { lat: 22.5726, lng: 88.3639, state: 'West Bengal' },
  'Ahmedabad': { lat: 23.0225, lng: 72.5714, state: 'Gujarat' },
  'Jaipur': { lat: 26.9124, lng: 75.7873, state: 'Rajasthan' },
  'Lucknow': { lat: 26.8467, lng: 80.9462, state: 'Uttar Pradesh' },
  'Patna': { lat: 25.5941, lng: 85.1376, state: 'Bihar' },
  'Bhopal': { lat: 23.2599, lng: 77.4126, state: 'Madhya Pradesh' },
  'Nagpur': { lat: 21.1458, lng: 79.0882, state: 'Maharashtra' },
  'Indore': { lat: 22.7196, lng: 75.8577, state: 'Madhya Pradesh' },
  'Kanpur': { lat: 26.4499, lng: 80.3319, state: 'Uttar Pradesh' },
  'Surat': { lat: 21.1702, lng: 72.8311, state: 'Gujarat' },
  'Ludhiana': { lat: 30.901, lng: 75.8573, state: 'Punjab' },
  'Agra': { lat: 27.1767, lng: 78.0081, state: 'Uttar Pradesh' },
  'Vijayawada': { lat: 16.5062, lng: 80.648, state: 'Andhra Pradesh' },
  'Mysore': { lat: 12.2958, lng: 76.6394, state: 'Karnataka' },
  'Hubli': { lat: 15.3647, lng: 75.124, state: 'Karnataka' },
  'Belgaum': { lat: 15.8497, lng: 74.4977, state: 'Karnataka' },
  'Kolar': { lat: 13.1362, lng: 78.1296, state: 'Karnataka' },
  'Davangere': { lat: 14.4644, lng: 75.9218, state: 'Karnataka' },
};

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Bihar',
  'Delhi',
  'Gujarat',
  'Haryana',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'West Bengal',
];


// rough centers for each indian state, used as a map fallback when we
// dont have the exact mandi lat/lng. coords eyeballed from wikipedia.
export const STATE_CENTERS: Record<string, { lat: number; lng: number }> = {
  'Andhra Pradesh': { lat: 15.9129, lng: 79.7400 },
  'Arunachal Pradesh': { lat: 28.2180, lng: 94.7278 },
  'Assam': { lat: 26.2006, lng: 92.9376 },
  'Bihar': { lat: 25.0961, lng: 85.3131 },
  'Chhattisgarh': { lat: 21.2787, lng: 81.8661 },
  'Delhi': { lat: 28.7041, lng: 77.1025 },
  'Goa': { lat: 15.2993, lng: 74.1240 },
  'Gujarat': { lat: 22.2587, lng: 71.1924 },
  'Haryana': { lat: 29.0588, lng: 76.0856 },
  'Himachal Pradesh': { lat: 31.1048, lng: 77.1734 },
  'Jammu and Kashmir': { lat: 33.7782, lng: 76.5762 },
  'Jharkhand': { lat: 23.6102, lng: 85.2799 },
  'Karnataka': { lat: 15.3173, lng: 75.7139 },
  'Kerala': { lat: 10.8505, lng: 76.2711 },
  'Madhya Pradesh': { lat: 22.9734, lng: 78.6569 },
  'Maharashtra': { lat: 19.7515, lng: 75.7139 },
  'Manipur': { lat: 24.6637, lng: 93.9063 },
  'Meghalaya': { lat: 25.4670, lng: 91.3662 },
  'Mizoram': { lat: 23.1645, lng: 92.9376 },
  'Nagaland': { lat: 26.1584, lng: 94.5624 },
  'Odisha': { lat: 20.9517, lng: 85.0985 },
  'Punjab': { lat: 31.1471, lng: 75.3412 },
  'Rajasthan': { lat: 27.0238, lng: 74.2179 },
  'Sikkim': { lat: 27.5330, lng: 88.5122 },
  'Tamil Nadu': { lat: 11.1271, lng: 78.6569 },
  'Telangana': { lat: 18.1124, lng: 79.0193 },
  'Tripura': { lat: 23.9408, lng: 91.9882 },
  'Uttar Pradesh': { lat: 26.8467, lng: 80.9462 },
  'Uttarakhand': { lat: 30.0668, lng: 79.0193 },
  'West Bengal': { lat: 22.9868, lng: 87.8550 },
};
