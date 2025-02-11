<template>
  <div class="common-layout">
    <el-header height="60px">
      <el-row :gutter="20">
        <el-col :span="6" :offset="0">
          <el-button-group>
            <el-button type="success" plain icon="" @click="">缩略图</el-button>
            <el-button type="success" plain icon="Back" @click="">撤销</el-button>
            <el-button type="success" plain icon="Right" @click="">恢复</el-button>
          </el-button-group>
        </el-col>
        <el-col class="text-center" :span="12" :offset="0">
          <el-button-group>
            <el-button type="success" plain="" icon="Position" @click="">选择</el-button>
            <el-button type="success" plain="" icon="Plus" @click=""></el-button>
            <el-button type="success" plain="" tag="input" @click=""></el-button>
            <el-button type="success" plain="" icon="Minus" @click=""></el-button>
          </el-button-group>
        </el-col>
        <el-col :span="6" :offset="0">
          <el-button-group>
            <el-button type="success" plain="" icon="Position" @click="">新建标目</el-button>
            <el-button type="success" plain="" icon="Plus" @click="">标目列表</el-button>
          </el-button-group>
        </el-col>
      </el-row>
    </el-header>
    <el-container>
      <el-aside class="leftAside" width="200px">
        <p class="numPages">0 页</p>
      </el-aside>
      <el-container>
        <el-main>
          <div id="pdfViewer" class="">
            <!-- 用于动态创建 canvas 的容器 -->
            <div ref="pdfContainer" @wheel="pdfWheel" class=""></div>
            <div class="controls">
              <div :disabled="currentPage <= 1" @click="prevPage">上一页</div>
              <span>{{ currentPage }} / {{ totalPages }}</span>
              <div :disabled="currentPage >= totalPages" @click="nextPage">下一页</div>
            </div>
          </div>
        </el-main>
      </el-container>
      <el-aside class="rightAside" width="200px">右边框</el-aside>
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

    const scale = 1.0 // 设置缩放级别
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
.el-header {
  border-bottom: 1px solid var(--el-border-color);
  .el-row{
    height: 100%;
    justify-content: center;
    align-items: center;
  }
}
.el-aside.rightAside {
  border-left: 1px solid var(--el-border-color);
}
.el-aside.leftAside {
  border-right: 1px solid var(--el-border-color);
}
.common-layout{
  background-color: rgb(239.8, 248.9, 235.3) !important;
  height: 100vh;
}
.controls{
  display: flex;
}
</style>
