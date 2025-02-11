// specify `electron.x64.vite.config.ts` for building x64 Electron app
import { defineConfig } from 'electron-vite'


export default defineConfig(() => {
  process.env.ELECTRON_EXEC_PATH = '/path/to/electron-x64/electron.app'

  return {
    // electron-vite config

  }
})
