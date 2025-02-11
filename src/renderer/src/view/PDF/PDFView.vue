<template>
  <div class="common-layout">
    <el-header>

    </el-header>
    <el-container>
      <el-aside class="text-cyan-600" width="200px">预览</el-aside>
      <el-container>
        <el-main>
          <div id="pdfViewer" class="">
            <div ref="pdfContainer" @wheel="pdfWheel" class=""></div>
            <!-- 用于动态创建 canvas 的容器 -->
            <div class="controls">
              <div :disabled="currentPage <= 1" @click="prevPage">上一页</div>
              <span>{{ currentPage }} / {{ totalPages }}</span>
              <div :disabled="currentPage >= totalPages" @click="nextPage">下一页</div>
            </div>
          </div>
        </el-main>
        <el-footer>Footer</el-footer>
      </el-container>
      <el-aside width="200px">Aside</el-aside>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'
import pdf from './../../../../../resources/1.pdf'

const pdfUrl = pdf

// const pdfCanvas = ref(null)
const pdfContainer = ref(null)
const currentPage = ref(1)
const totalPages = ref(0)
const loading = ref(true)
let pdfDoc = null

// 加载 PDF 文件
const loadPdf = async () => {
  try {
    const loadingTask = pdfjsLib.getDocument(pdfUrl)
    pdfDoc = await loadingTask.promise
    totalPages.value = pdfDoc.numPages
    loading.value = false
    renderPage(currentPage.value)
  } catch (error) {
    console.error('加载 PDF 时出错:', error)
  }
}

// 渲染页面
const renderPage = (pageNumber) => {
  pdfDoc.getPage(pageNumber).then((page) => {
    console.log('pageNumber', pageNumber)
    console.log('page', page)

    const scale = 1.5 // 设置缩放级别
    const viewport = page.getViewport({ scale })

    const newCanvas = document.createElement('canvas')
    const context = newCanvas.getContext('2d')
    newCanvas.width = viewport.width
    newCanvas.height = viewport.height

    // 将新创建的 canvas 添加到容器中
    pdfContainer.value.innerHTML = '' // 清除之前的 canvas（可选）
    pdfContainer.value.appendChild(newCanvas)

    page
      .render({
        canvasContext: context,
        viewport: viewport
      })
      .promise.then(() => {
        // 当前页渲染完成
      })
      .catch((error) => {
        console.error('渲染页面时出错:', error)
      })
  })
}

// 下一页
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    renderPage(currentPage.value)
  }
}

const prevPage = () => {
  if (currentPage.value <= totalPages.value && currentPage.value != 1) {
    currentPage.value--
    renderPage(currentPage.value)
  }
}
// const currentKeyDown = document.addEventListener('keydown', (event) => {
//   console.log(`按下的键: ${event.key}, 键码: ${event.code}`)
// })

let lastScrollTime = 0 // 用于节流
const pdfWheel = (event) => {
  event.preventDefault()
  console.log(event)

  const now = Date.now()
  const throttleTime = 100 // 节流时间 (500ms)

  // 如果滚动频率太快，则忽略事件
  if (now - lastScrollTime < throttleTime) return
  lastScrollTime = now

  if (event.deltaY > 0) {
    nextPage() // 向下滚动翻到下一页
  } else if (event.deltaY < 0) {
    prevPage() // 向上滚动翻到上一页
  }
}
// 监听页码变化并重新渲染
watch(currentPage, (newPage) => {
  renderPage(newPage)
})

onMounted(() => {
  loadPdf()
})
</script>

<style scoped>

</style>
