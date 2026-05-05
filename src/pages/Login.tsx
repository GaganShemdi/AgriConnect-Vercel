import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Phone, ShieldCheck } from 'lucide-react';
import type { ConfirmationResult } from 'firebase/auth';
import MobileLayout from '../components/layout/MobileLayout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { sendOTP, resetRecaptcha } from '../config/firebase';
import { useAuthStore } from '../store/authStore';
import { LANGUAGE_OPTIONS } from '../i18n';
import { getFarmerProfile, upsertFarmerProfile } from '../config/supabase';
import type { Language } from '../types';

export default function Login() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { setAuth, setProfile, setOnboarded, setLanguage, language } = useAuthStore();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const handleSendOTP = async () => {
    const clean = phone.replace(/\D/g, '');
    if (clean.length !== 10) {
      toast.error('Enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    try {
      const conf = await sendOTP(`+91${clean}`);
      setConfirmation(conf);
      setStep('otp');
      setCooldown(60);
      toast.success('OTP sent');
    } catch (err) {
      console.error('Firebase sendOTP error:', err);
      const fbErr = err as { code?: string; message?: string };
      const code = fbErr?.code ?? '';
      let msg = fbErr?.message ?? 'Could not send OTP';
      if (code === 'auth/invalid-phone-number') {
        msg = 'Invalid phone number format';
      } else if (code === 'auth/too-many-requests') {
        msg = 'Too many requests. Please wait a few minutes and try again.';
      } else if (code === 'auth/quota-exceeded' || code === 'auth/billing-not-enabled') {
        msg = 'SMS quota reached. Enable Blaze plan in Firebase Console.';
      } else if (code === 'auth/captcha-check-failed') {
        msg = 'reCAPTCHA verification failed. Refresh the page and try again.';
      } else if (code === 'auth/operation-not-allowed') {
        msg = 'Phone sign-in not enabled in Firebase Console.';
      } else if (code === 'auth/unauthorized-domain') {
        msg = 'This domain is not authorized in Firebase Authentication settings.';
      } else if (code) {
        msg = `${code}: ${msg}`;
      }
      toast.error(msg, { duration: 6000 });
      resetRecaptcha();
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!confirmation) return;
    if (otp.length !== 6) {
      toast.error('Enter a 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const result = await confirmation.confirm(otp);
      const uid = result.user.uid;
      const fullPhone = `+91${phone.replace(/\D/g, '')}`;
      setAuth(fullPhone, uid);

      const { data: existing, error: fetchErr } = await getFarmerProfile(fullPhone);
      if (fetchErr) {
        console.warn('[Login] profile fetch issue:', fetchErr);
      }
      if (existing) {
        setProfile(existing);
        if (existing.language) {
          setLanguage(existing.language as Language);
          i18n.changeLanguage(existing.language);
        }
        setOnboarded(true);
        navigate('/');
      } else {
        await upsertFarmerProfile({ phone: fullPhone, language });
        navigate('/onboarding');
      }
    } catch (err) {
      console.error(err);
      toast.error('Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (code: string) => {
    setLanguage(code as Language);
    i18n.changeLanguage(code);
  };

  return (
    <MobileLayout hideNav>
      <div className="min-h-screen flex flex-col p-6 bg-gradient-to-b from-primary-pale to-white">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center shadow-card mb-4">
            <span className="text-white text-4xl">🌾</span>
          </div>
          <h1 className="text-2xl font-bold text-primary-forest">{t('app.name')}</h1>
          <p className="text-sm text-gray-600 mb-6">{t('app.tagline')}</p>

          <Card className="w-full" padding="lg">
            {step === 'phone' ? (
              <>
                <h2 className="text-lg font-semibold text-primary-forest mb-1">
                  {t('login.title')}
                </h2>
                <p className="text-sm text-gray-600 mb-5">{t('login.subtitle')}</p>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('login.phoneLabel')}
                </label>
                <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden focus-within:border-primary">
                  <span className="px-3 py-3 bg-primary-pale text-primary-forest font-medium">
                    +91
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 px-3 py-3 outline-none text-base"
                    placeholder="9876543210"
                  />
                  <Phone className="mr-3 text-gray-400" size={18} />
                </div>

                <div className="mt-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('login.language')}
                  </label>
                  <select
                    value={language}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3 py-3 bg-white outline-none focus:border-primary"
                  >
                    {LANGUAGE_OPTIONS.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  fullWidth
                  className="mt-6"
                  onClick={handleSendOTP}
                  disabled={loading}
                  icon={<ShieldCheck size={18} />}
                >
                  {loading ? t('common.loading') : t('login.sendOTP')}
                </Button>
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-primary-forest mb-1">
                  {t('login.otpLabel')}
                </h2>
                <p className="text-sm text-gray-600 mb-5">+91 {phone}</p>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-[0.5em] text-xl font-semibold border border-gray-300 rounded-xl px-3 py-3 outline-none focus:border-primary"
                  placeholder="000000"
                />
                <Button fullWidth className="mt-5" onClick={handleVerify} disabled={loading}>
                  {loading ? t('common.loading') : t('login.verify')}
                </Button>
                <button
                  className="w-full mt-3 text-sm text-primary-forest disabled:text-gray-400"
                  disabled={cooldown > 0}
                  onClick={handleSendOTP}
                >
                  {cooldown > 0
                    ? t('login.resendIn', { sec: cooldown })
                    : t('login.resend')}
                </button>
              </>
            )}
          </Card>
        </div>
        <div id="recaptcha-container" />
      </div>
    </MobileLayout>
  );
}
