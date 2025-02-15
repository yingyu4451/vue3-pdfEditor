import { createRouter, createWebHashHistory } from 'vue-router'
import Pdf from '../view/PdfEditor/PdfEditor.vue'
import start from '../view/StartMenu/StartMenuView.vue'
import test from '@renderer/view/test/test.vue'

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
    path: '/test',
    name: 'test',
    component: test
  }
]

const router = createRouter({
  // history: createWebHistory(),
  history: createWebHashHistory(),
  routes
})

export default router
