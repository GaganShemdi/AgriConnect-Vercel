import { Home, BarChart3, Bot, CloudSun, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const items = [
  { to: '/', icon: Home, key: 'nav.home' },
  { to: '/mandi', icon: BarChart3, key: 'nav.mandi' },
  { to: '/advisory', icon: Bot, key: 'nav.advisory' },
  { to: '/weather', icon: CloudSun, key: 'nav.weather' },
  { to: '/profile', icon: User, key: 'nav.profile' },
];

export default function BottomNav() {
  const { t } = useTranslation();
  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-mobile bg-white shadow-nav border-t border-primary-pale z-40"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
    >
      <ul className="flex items-center justify-around px-2 py-2">
        {items.map(({ to, icon: Icon, key }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                [
                  'flex flex-col items-center justify-center gap-0.5 min-h-12 rounded-lg py-1 text-[11px] font-medium',
                  isActive
                    ? 'text-primary-forest bg-primary-pale'
                    : 'text-gray-500 hover:text-primary-forest',
                ].join(' ')
              }
            >
              <Icon size={22} strokeWidth={2} />
              <span>{t(key)}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
