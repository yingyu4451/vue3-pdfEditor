import  { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'

console.log('electron.vite.config.ts');
export default defineConfig({
  main: {
    assetsInclude: ['**/*.gz?asset', '**/*.gz', '**/*.docx', '**/*.docx?asset', '**/*.traineddata'],
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    assetsInclude: ['**/*.gz?asset', '**/*.gz', '**/*.docx', '**/*.docx?asset', '**/*.traineddata'],
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    define: {
      'import.meta.env.PROD_API_URL': JSON.stringify('http://localhost:8008')
    },
    assetsInclude: ['**/*.gz?asset', '**/*.gz', '**/*.docx', '**/*.docx?asset', '**/*.traineddata'],
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@resources': resolve('./resources')
      }
    },
    plugins: [vue()],
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8008',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          secure: false
        }
      }
    }
  }
})
