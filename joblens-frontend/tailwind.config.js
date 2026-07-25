export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        page: '#F7F8FA',
        skywash: '#EAF6FB',
        surface: '#FFFFFF',
        surface2: '#F1F4F8',
        navy: '#241D45',
        text: '#1F2937',
        muted: '#6B7280',
        line: '#E5E7EB',
        blue: '#2F6FED',
        blueSoft: '#EAF1FF',
        magenta: '#E8437A',
        orange: '#F4793B',
        green: '#7ED957',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
