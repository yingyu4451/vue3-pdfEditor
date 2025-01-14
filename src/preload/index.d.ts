import { ElectronAPI } from '@electron-toolkit/preload'
/// <reference types="electron-vite/node" />

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
  }
}
