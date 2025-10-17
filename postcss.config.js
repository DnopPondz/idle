// postcss.config.js

export default {
  plugins: {
    '@tailwindcss/postcss': {}, // <-- แก้ไขจาก 'tailwindcss' เป็น '@tailwindcss/postcss'
    autoprefixer: {},
  },
}