// global auth store (zustand). persisted to localStorage so users
// stay logged in between visits. key = "agriconnect-auth"

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FarmerProfile } from '../config/supabase';
import type { Language } from '../types';

interface AuthState {
  phone: string | null;
  uid: string | null;
  profile: FarmerProfile | null;
  language: Language;
  onboarded: boolean;
  setAuth: (phone: string, uid: string) => void;
  setProfile: (profile: FarmerProfile) => void;
  setLanguage: (lang: Language) => void;
  setOnboarded: (v: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      phone: null,
      uid: null,
      profile: null,
      language: (import.meta.env.VITE_DEFAULT_LANGUAGE as Language) || 'en',
      onboarded: false,
      setAuth: (phone, uid) => set({ phone, uid }),
      setProfile: (profile) => set({ profile }),
      setLanguage: (language) => set({ language }),
      setOnboarded: (onboarded) => set({ onboarded }),
      logout: () => set({ phone: null, uid: null, profile: null, onboarded: false }),
    }),
    { name: 'agriconnect-auth' }
  )
);
