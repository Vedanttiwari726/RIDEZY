/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {

      keyframes: {

        carMove: {
          '0%': { transform: 'translateX(-120px)' },
          '100%': { transform: 'translateX(120vw)' },
        },

        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }

      },

      animation: {

        carMove: "carMove 4s linear infinite",
        float: "float 3s ease-in-out infinite"

      }

    },
  },
  plugins: [],
}