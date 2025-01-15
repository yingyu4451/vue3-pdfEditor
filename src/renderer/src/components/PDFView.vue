<template>
  <div id="pdfViewer" class="h-full flex flex-col" v-loading="loading">
    <div ref="pdfContainer" class="flex-1">
    </div>
    <!-- 用于动态创建 canvas 的容器 -->
    <div class="controls">
      <div @click="prevPage" :disabled="currentPage <= 1">上一页</div>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <div @click="nextPage" :disabled="currentPage >= totalPages">下一页</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'
import pdf from './../assets/1.pdf'

const pdfUrl = pdf;

const pdfCanvas = ref(null)
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
    console.log("pageNumber",pageNumber);
    console.log("page",page);

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

const pdfView = document.querySelector('pdfViewer')

function pdfWheel(event){
  event.preventDefault();
  console.log(1);

}

pdfView.onwheel = pdfWheel;
// 上一页
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    renderPage(currentPage.value)
  }
}

// 下一页
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    renderPage(currentPage.value)
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
#pdfViewer {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
}

canvas {
  border: 1px solid #000;
}

.controls {
  display: flex;
  justify-content: center;
  margin-top: 10px;

  div,
  span {
    padding: 5px 10px;
    margin: 0 5px;
    cursor: pointer;
  }
}
</style>
