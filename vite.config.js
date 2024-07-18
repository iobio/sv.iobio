import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 7476,
  },
  plugins: [vue()],
  base: '/sv.iobio/', //add a base path to the project
})
