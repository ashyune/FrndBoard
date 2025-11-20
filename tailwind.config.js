/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        glow: {
          '0%, 100%': { textShadow: '0 0 1px #B2D8CE, 0 0 2px #B2D8CE, 0 0 3px #B2D8CE' },
          '50%': { textShadow: '0 0 2px #B2D8CE, 0 0 3px #B2D8CE, 0 0 4px #B2D8CE' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' },
        },
      },
      animation: {
        glow: 'glow 3s ease-in-out infinite',
        float: 'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
