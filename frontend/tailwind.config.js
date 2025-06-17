/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      // Örneğin özelleştirilmiş renkler veya fontlar eklemek isterseniz buraya yazabilirsiniz.
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
