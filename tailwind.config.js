/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    colors: {
      dark: '#111111',
      darkgray: '#222222',
      gray: '#333333',
      skyblue: '#71A2EB',
      purple: '#BA76FF',
      white: '#ffffff'
    },
    fontFamily: {
      maven: ['Maven Pro'],
      oxygen: ['Oxygen'],
      monts: ['Montserrat'],
      prompt: ['Prompt'],
      playfair: ['Playfair Display'],
      lato: ['Lato'],
      gugi: ['Gugi']
    },
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
  corePlugins: {
    objectPosition: false,
  }
}