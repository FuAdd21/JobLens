export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0E1420',
        surface: '#161F30',
        surface2: '#1D2740',
        brass: '#C99A3E',
        brassLight: '#E0B85C',
        signal: '#3FBF9F',
        text: '#F2F4F8',
        muted: '#8A94A6',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
