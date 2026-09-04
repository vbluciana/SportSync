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
          primary: '#076A9F',
          dark: '#054B70',
        }
      }
    },
  },
  plugins: [],
}