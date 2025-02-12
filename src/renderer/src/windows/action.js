import { ipcRenderer } from 'electron'

/**
 * 创建新窗口
 * @param {object} args | {width: 640, height: 480, route: '/home'}
 */
export function createWin(args) {
  ipcRenderer.send('win-create', args)
}

/**
 * 设置窗口
 * @param {string} type | 'show'/'hide'/'close'/'min'/'max'/'max2min'/'restore'/'reload'
 * @param {number} id
 */
export function setWin(type, id) {
  window.electronAPI.send('win-' + type, id)
}

/**
 * 创建登录窗口
 */
export function loginWin() {
  createWin({
    isMainWin: true,
    title: '登录',
    route: '/pdf',
    width: 550,
    height: 320,
    resize: false,
    alwaysOnTop: true
  })
}
