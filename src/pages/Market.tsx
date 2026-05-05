import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, MapPin, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import MobileLayout from '../components/layout/MobileLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { supabase } from '../config/supabase';
import { useAuthStore } from '../store/authStore';
import type { MarketListing } from '../types';

export default function Market() {
  const { t } = useTranslation();
  const { phone, profile } = useAuthStore();
  const [listings, setListings] = useState<MarketListing[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<MarketListing>>({
    crop: '',
    quantity_kg: 0,
    price_per_kg: 0,
    location: '',
    state: profile?.state ?? '',
    notes: '',
  });

  const loadListings = async () => {
    const { data, error } = await supabase
      .from('market_listings')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) {
      console.warn('Supabase listings error', error);
      return;
    }
    setListings((data as MarketListing[]) || []);
  };

  useEffect(() => {
    loadListings();
  }, []);

  const submit = async () => {
    if (!phone) return;
    if (!form.crop || !form.quantity_kg || !form.price_per_kg) {
      toast.error('Fill crop, quantity, and price');
      return;
    }
    const payload: MarketListing = {
      user_id: phone,
      crop: form.crop!,
      quantity_kg: Number(form.quantity_kg),
      price_per_kg: Number(form.price_per_kg),
      location: form.location!,
      state: form.state!,
      contact_phone: phone,
      notes: form.notes,
      status: 'active',
    };
    const { error } = await supabase.from('market_listings').insert(payload);
    if (error) {
      console.error('[Supabase] market insert error', error);
      toast.error(`Could not create listing: ${error.message ?? 'check Supabase setup'}`, {
        duration: 6000,
      });
    } else {
      toast.success('Listing posted');
      setShowForm(false);
      setForm({ crop: '', quantity_kg: 0, price_per_kg: 0, location: '', state: profile?.state });
      loadListings();
    }
  };

  return (
    <MobileLayout title={t('market.title')}>
      <div className="px-4 py-4 space-y-4">
        <Button fullWidth onClick={() => setShowForm((v) => !v)} icon={<Plus size={18} />}>
          {t('market.create')}
        </Button>

        {showForm && (
          <Card padding="md">
            <div className="space-y-3">
              <input
                placeholder="Crop (e.g., Tomato)"
                value={form.crop}
                onChange={(e) => setForm({ ...form, crop: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 outline-none focus:border-primary"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Quantity (kg)"
                  value={form.quantity_kg || ''}
                  onChange={(e) => setForm({ ...form, quantity_kg: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 outline-none focus:border-primary"
                />
                <input
                  type="number"
                  placeholder="Price / kg (₹)"
                  value={form.price_per_kg || ''}
                  onChange={(e) => setForm({ ...form, price_per_kg: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 outline-none focus:border-primary"
                />
              </div>
              <input
                placeholder="Location (village/town)"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 outline-none focus:border-primary"
              />
              <textarea
                placeholder="Notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 outline-none focus:border-primary"
                rows={2}
              />
              <Button fullWidth onClick={submit}>
                Post listing
              </Button>
            </div>
          </Card>
        )}

        <div className="space-y-3">
          {listings.length === 0 ? (
            <div className="text-center text-sm text-gray-500 py-6">No active listings yet.</div>
          ) : (
            listings.map((l) => (
              <Card key={l.id}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-primary-forest">{l.crop}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin size={12} /> {l.location}, {l.state}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary-forest">
                      ₹{l.price_per_kg}
                    </div>
                    <div className="text-[11px] text-gray-500">/ kg</div>
                  </div>
                </div>
                <div className="flex justify-between items-end mt-2">
                  <div className="text-xs text-gray-600">Qty: {l.quantity_kg} kg</div>
                  <a
                    href={`tel:${l.contact_phone}`}
                    className="text-primary-accent text-sm font-medium inline-flex items-center gap-1"
                  >
                    <Phone size={14} /> Contact
                  </a>
                </div>
                {l.notes && <p className="text-xs text-gray-500 mt-2">{l.notes}</p>}
              </Card>
            ))
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
