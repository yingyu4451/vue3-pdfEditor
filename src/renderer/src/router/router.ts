import { createRouter, createWebHashHistory } from 'vue-router'
import Pdf from '@renderer/view/PdfEditor/PdfEditor.vue'
import start from '@renderer/view/StartMenu/StartMenuView.vue'
import newProjectWindow from '@renderer/view/newProjectWindow/newProjectWindow.vue'

const routes = [
  {
    path: '/',
    component: start
  },
  {
    path: '/pdf',
    name: 'pdf',
    component: Pdf
  },
  {
    path: '/newProjectWindow',
    name: 'newProjectWindow',
    component: newProjectWindow
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
