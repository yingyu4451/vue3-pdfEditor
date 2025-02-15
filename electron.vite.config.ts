import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  main: {
    assetsInclude: ['**/*.gz?asset','**/*.gz','**/*.traineddata'],
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    assetsInclude: ['**/*.gz?asset','**/*.gz','**/*.traineddata'],
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    assetsInclude: ['**/*.gz?asset','**/*.gz','**/*.traineddata'],
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [vue()]
  }
})
