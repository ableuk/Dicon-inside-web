/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Figma 디자인 시스템 색상
        'dicon': {
          'orange': {
            DEFAULT: '#FFA100',
            50: '#FFEBB5',
            100: '#FFE5A1',
            200: '#FFD87A',
            300: '#FFCB52',
            400: '#FFBD2B',
            500: '#FFA100',
            600: '#C77C00',
            700: '#8F5900',
            800: '#573600',
            900: '#1F1300',
          },
          'accent': {
            DEFAULT: '#FF8000',
            light: '#FFA100',
            dark: '#FF4400',
          },
          'yellow': '#FFE100',
          'peach': '#FFB673',
          'brown': {
            DEFAULT: '#4B2C00',
            light: '#6B3F00',
          },
        },
      },
      fontFamily: {
        'sans': ['Wanted Sans Variable', 'Wanted Sans', 'Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Roboto', 'sans-serif'],
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
}
