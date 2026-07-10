import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/bureaut-demo/',
  plugins: [
    tailwindcss(),
  ]
})