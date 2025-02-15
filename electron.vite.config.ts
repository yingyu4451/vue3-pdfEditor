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
    plugins: [vue()],
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8888', // 你的 Web 服务地址
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    }
  },

})
