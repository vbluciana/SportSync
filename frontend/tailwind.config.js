// Configuración de Tailwind para colores y estilos personalizados del proyecto.
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#0288D1',
          dark: '#01579B',
        }
      }
    },
  },
  plugins: [],
}