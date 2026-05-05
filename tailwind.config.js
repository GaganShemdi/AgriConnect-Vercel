// tailwind config -- colors picked to look farmy (greens) + a few accents

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2D6A4F',
          light: '#52B788',
          pale: '#D8F3DC',
          accent: '#40916C',
          forest: '#1B4332',
          mint: '#B7E4C7',
        },
        alert: '#E63946',
        harvest: '#F4A261',
        sky: '#219EBC',
      },
      fontFamily: {
        sans: ['"Noto Sans"', '"Noto Sans Devanagari"', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        mobile: '480px',
      },
      boxShadow: {
        card: '0 2px 8px rgba(27, 67, 50, 0.08)',
        nav: '0 -2px 12px rgba(27, 67, 50, 0.12)',
      },
    },
  },
  plugins: [],
};
