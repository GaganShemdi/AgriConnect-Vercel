
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
