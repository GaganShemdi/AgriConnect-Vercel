import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { LogOut, MapPin, Wheat, Globe, Store } from 'lucide-react';
import MobileLayout from '../components/layout/MobileLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { LANGUAGE_OPTIONS } from '../i18n';
import type { Language } from '../types';

export default function Profile() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { profile, phone, language, setLanguage, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLangChange = (code: string) => {
    setLanguage(code as Language);
    i18n.changeLanguage(code);
  };

  return (
    <MobileLayout title={t('profile.title')}>
      <div className="px-4 py-4 space-y-4">
        <Card className="text-center">
          <div className="w-20 h-20 rounded-full bg-primary-pale mx-auto flex items-center justify-center">
            <span className="text-3xl">👨‍🌾</span>
          </div>
          <div className="mt-2 font-semibold text-primary-forest">
            {profile?.name || 'Farmer'}
          </div>
          <div className="text-xs text-gray-500">{phone}</div>
        </Card>

        <Card padding="sm">
          <div className="p-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-primary-accent" />
              <span className="text-sm">{t('profile.location')}</span>
            </div>
            <span className="text-sm text-gray-600">
              {profile?.district ? `${profile.district}, ` : ''}
              {profile?.state || '—'}
            </span>
          </div>
          <div className="p-2 flex items-start justify-between border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Wheat size={16} className="text-primary-accent" />
              <span className="text-sm">{t('profile.crops')}</span>
            </div>
            <div className="text-right text-xs text-gray-600 max-w-[60%]">
              {profile?.primary_crops?.join(', ') || '—'}
            </div>
          </div>
          <div className="p-2 flex items-center justify-between border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-primary-accent" />
              <span className="text-sm">{t('profile.language')}</span>
            </div>
            <select
              value={language}
              onChange={(e) => handleLangChange(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-2 py-1 bg-white"
            >
              {LANGUAGE_OPTIONS.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
        </Card>

        <Button
          fullWidth
          variant="secondary"
          onClick={() => navigate('/market')}
          icon={<Store size={18} />}
        >
          {t('market.title')}
        </Button>

        <Button fullWidth variant="danger" onClick={handleLogout} icon={<LogOut size={18} />}>
          {t('profile.logout')}
        </Button>
      </div>
    </MobileLayout>
  );
}
