import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';
import MobileLayout from '../components/layout/MobileLayout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { CROP_CATEGORIES, INDIAN_STATES } from '../data/crops';
import { getDistricts, getRecommendedCrops } from '../data/districtCrops';
import { LANGUAGE_OPTIONS } from '../i18n';
import { useAuthStore } from '../store/authStore';
import { upsertFarmerProfile } from '../config/supabase';
import type { Language } from '../types';

export default function Onboarding() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { phone, language, setLanguage, setProfile, setOnboarded } = useAuthStore();

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [state, setState] = useState('Karnataka');
  const [district, setDistrict] = useState('');
  const [farmSize, setFarmSize] = useState('');
  const [crops, setCrops] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const districtsList = useMemo(() => getDistricts(state), [state]);

  const recommendedCrops = useMemo(
    () => getRecommendedCrops(state, district),
    [state, district]
  );

  useEffect(() => {
    setDistrict('');
  }, [state]);

  const toggleCrop = (crop: string) => {
    setCrops((prev) => (prev.includes(crop) ? prev.filter((c) => c !== crop) : [...prev, crop]));
  };

  const handleLang = (code: string) => {
    setLanguage(code as Language);
    i18n.changeLanguage(code);
  };

  const handleFinish = async () => {
    if (!phone) {
      toast.error('Phone missing. Please login again.');
      navigate('/login');
      return;
    }
    if (!district) {
      toast.error('Please select your district.');
      setStep(1);
      return;
    }
    if (crops.length === 0) {
      toast.error('Please select at least one crop.');
      return;
    }
    setSubmitting(true);
    const { data: profile, error } = await upsertFarmerProfile({
      phone,
      name,
      language,
      state,
      district,
      primary_crops: crops,
      farm_size_hectares: farmSize ? Number(farmSize) * 0.4047 : undefined,
    });
    setSubmitting(false);
    if (profile) {
      setProfile(profile);
      setOnboarded(true);
      toast.success('Welcome to AgriConnect!');
      navigate('/');
    } else {
      toast.error(`Save failed: ${error ?? 'Check Supabase keys / RLS policies.'}`, {
        duration: 6000,
      });
    }
  };

  return (
    <MobileLayout hideNav title={t('onboarding.title')}>
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i === step ? 'bg-primary w-8' : 'bg-primary-mint w-4'
              }`}
            />
          ))}
        </div>

        {step === 0 && (
          <Card padding="lg">
            <h2 className="text-lg font-semibold mb-3">{t('onboarding.stepLang')}</h2>
            <div className="grid grid-cols-2 gap-2">
              {LANGUAGE_OPTIONS.map((opt) => (
                <button
                  key={opt.code}
                  onClick={() => handleLang(opt.code)}
                  className={`rounded-xl p-3 border-2 text-sm font-medium transition-colors ${
                    language === opt.code
                      ? 'border-primary bg-primary-pale text-primary-forest'
                      : 'border-gray-200 hover:border-primary-light'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <label className="block text-sm font-medium text-gray-700 mt-5 mb-2">
              {t('onboarding.name')}
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3 py-3 outline-none focus:border-primary"
            />
          </Card>
        )}

        {step === 1 && (
          <Card padding="lg">
            <h2 className="text-lg font-semibold mb-3">{t('onboarding.stepLocation')}</h2>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('onboarding.state')}
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3 py-3 outline-none focus:border-primary bg-white"
            >
              {INDIAN_STATES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>

            <label className="block text-sm font-medium text-gray-700 mt-4 mb-2">
              {t('onboarding.district')}
            </label>
            {districtsList.length > 0 ? (
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3 py-3 outline-none focus:border-primary bg-white"
              >
                <option value="">-- Select district --</option>
                {districtsList.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            ) : (
              <input
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="Enter district"
                className="w-full border border-gray-300 rounded-xl px-3 py-3 outline-none focus:border-primary"
              />
            )}

            <label className="block text-sm font-medium text-gray-700 mt-4 mb-2">
              {t('onboarding.farmSize')}
            </label>
            <input
              type="number"
              value={farmSize}
              onChange={(e) => setFarmSize(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3 py-3 outline-none focus:border-primary"
            />
          </Card>
        )}

        {step === 2 && (
          <Card padding="lg">
            <h2 className="text-lg font-semibold mb-3">{t('onboarding.pickCrops')}</h2>

            {recommendedCrops.length > 0 && (
              <div className="mb-4 rounded-xl bg-primary-pale p-3 border border-primary-mint">
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles size={14} className="text-primary-forest" />
                  <span className="text-xs font-semibold text-primary-forest">
                    Recommended for {district || state}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recommendedCrops.map((c) => (
                    <button
                      key={`rec-${c}`}
                      onClick={() => toggleCrop(c)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                        crops.includes(c)
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-primary-forest border-primary-light hover:border-primary'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-gray-600 mt-2">
                  These crops are commonly grown in your region. Pick any that apply.
                </p>
              </div>
            )}

            <div className="space-y-3">
              {CROP_CATEGORIES.map((cat) => (
                <div key={cat.key}>
                  <div className="text-xs font-semibold text-primary-forest mb-1">
                    {t(cat.nameKey)}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cat.crops.map((c) => (
                      <button
                        key={c}
                        onClick={() => toggleCrop(c)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                          crops.includes(c)
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-primary-light'
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
        )}

        <div className="flex gap-3 pt-2">
          {step > 0 && (
            <Button variant="secondary" onClick={() => setStep(step - 1)} icon={<ArrowLeft size={18} />}>
              {t('onboarding.back')}
            </Button>
          )}
          {step < 2 ? (
            <Button fullWidth onClick={() => setStep(step + 1)} icon={<ArrowRight size={18} />}>
              {t('onboarding.continue')}
            </Button>
          ) : (
            <Button fullWidth onClick={handleFinish} disabled={submitting} icon={<Check size={18} />}>
              {submitting ? t('common.loading') : t('onboarding.finish')}
            </Button>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
