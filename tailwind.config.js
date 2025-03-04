/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/renderer/index.html',
    './src/renderer/src/**/*.{js,ts,jsx,tsx,vue}',
    './src/renderer/src/**/**/*.{js,ts,jsx,tsx,vue}'
  ],
  theme: {
    extend: {
      screens: {
        '2k': '2048px'
      }
    }
  },
  plugins: []
}
