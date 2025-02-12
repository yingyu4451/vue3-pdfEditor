<template>
  <div class="common-layout">
    <el-header height="60px">
      <tool-bar></tool-bar>
    </el-header>
    <el-container>
      <el-aside v-if="pdfSetting.pdfViewer.leftAsideShow" class="leftAside" width="240px">
        <LeftAside @scale-change="renderPage" @thumbnailClick="goToPage"></LeftAside>
      </el-aside>
      <el-container>
        <el-main>
          <div id="pdfViewer">
            <!-- 用于动态创建 canvas 的容器 -->
            <el-scrollbar id="pdfPageList" ref="pdfPageList" max-height="100vh">
            <div ref="pdfContainer" class="flex items-center justify-center" @wheel="">

              </div>
            </el-scrollbar>
            <!-- <div class="controls flex items-center justify-center">
              <div :disabled="currentPage <= 1" @click="prevPage">上一页</div>
              <span>{{ currentPage }} / {{ totalPages }}</span>
              <div :disabled="currentPage >= totalPages" @click="nextPage">下一页</div>
            </div> -->
          </div>
        </el-main>
      </el-container>
      <el-aside class="rightAside" width="300px">右边框</el-aside>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, provide } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'
import pdf from './../../../../../resources/1.pdf'
import ToolBar from '@renderer/components/ToolBar/ToolBar.vue'
import LeftAside from '@renderer/components/LeftAside/LeftAside.vue'

const pdfUrl = pdf
// const pdfCanvas = ref(null)
const pdfContainer = ref(null)
const currentPage = ref(1)
const totalPages = ref(0)
const loading = ref(true)
const pdfPageList = ref([])
const thumbnails = ref([])
const currentKeyDownRef = ref()
const pdfSetting = ref({
  pdfViewer: {
    scale: 100,
    leftAsideShow: true,
    rightAsideShow: true
  },
  thumbnails: {
    scale: 0.25
  }
})
let pdfDoc = null

provide('pdfSetting', pdfSetting)
provide('currentPage', currentPage)
provide('totalPages', totalPages)
provide('pdfPageList', pdfPageList)
provide('thumbnails', thumbnails)

// 检测屏幕大小
if (window.innerWidth == 1920) {
  pdfSetting.value.pdfViewer.scale = 100
}
if (window.innerWidth == 2560) {
  pdfSetting.value.pdfViewer.scale = 145
}

// 检测当前按下的按键
document.addEventListener('keydown', (event) => {
  console.log(`按下的键: ${event.key}, 键码: ${event.code}`)
  currentKeyDownRef.value = event.key
})

// 加载 PDF 文件
const loadPdf = async () => {
  try {
    const loadingTask = pdfjsLib.getDocument(pdfUrl)
    pdfDoc = await loadingTask.promise
    totalPages.value = pdfDoc.numPages
    loading.value = false
    // renderPage(currentPage.value)
    renderAllPage()
    createThumbnails()
  } catch (error) {
    console.error('加载 PDF 时出错:', error)
  }
}

// 渲染单页面
const renderPage = (pageNumber) => {
  pdfDoc.getPage(pageNumber).then((page) => {
    console.log('pageNumber', pageNumber)
    console.log('page', page)

    const viewport = page.getViewport({
      scale: pdfSetting.value.pdfViewer.scale / 100
    })

    const newCanvas = document.createElement('canvas')
    const context = newCanvas.getContext('2d')
    newCanvas.width = viewport.width
    newCanvas.height = viewport.height

    newCanvas.style.border = '2px solid var(--el-color-success)'

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

// 渲染所有页面模式
const renderAllPage = async () => {
  pdfPageList.value = [] // 清空之前的缩略图

  for (let pageNum = 1; pageNum <= totalPages.value; pageNum++) {
    const page = await pdfDoc.getPage(pageNum)
    const viewport = page.getViewport({
      scale: pdfSetting.value.pdfViewer.scale / 100
    })

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    canvas.width = viewport.width
    canvas.height = viewport.height
    canvas.style.border = '2px solid var(--el-color-success)'

    // 将页面渲染到 canvas 上
    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise

    // 将 canvas 转为图片，并保存为缩略图
    pdfPageList.value.push(canvas.toDataURL())
  }
}

// 创建所有页面的缩略图
const createThumbnails = async () => {
  thumbnails.value = [] // 清空之前的缩略图

  for (let pageNum = 1; pageNum <= totalPages.value; pageNum++) {
    const page = await pdfDoc.getPage(pageNum)
    const viewport = page.getViewport(pdfSetting.value.thumbnails)

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    canvas.width = viewport.width
    canvas.height = viewport.height

    // 将页面渲染到 canvas 上
    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise

    // 将 canvas 转为图片，并保存为缩略图
    thumbnails.value.push(canvas.toDataURL())
  }
}

// 下一页
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    renderPage(currentPage.value)
  }
}
// 上一页
const prevPage = () => {
  if (currentPage.value <= totalPages.value && currentPage.value != 1) {
    currentPage.value--
    renderPage(currentPage.value)
  }
}

const pdfWheel = (event) => {
  event.preventDefault()

  if (currentKeyDownRef.value === 'Control') {
    if (event.deltaY < 0) {
      pdfSetting.value.pdfViewer.scale += 5
    } else {
      pdfSetting.value.pdfViewer.scale -= 5
    }
    renderPage(currentPage.value)
  } else {
    if (event.deltaY < 0) {
      nextPage()
    } else {
      prevPage()
    }
  }
}

const goToPage = (page) => {
  currentPage.value = page
  renderPage(page)
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
  border-bottom: 1px solid var(--el-color-success);

  .el-row {
    height: 100%;
    justify-content: center;
    align-items: center;
  }
}

.el-aside.leftAside {
  border-right: 1px solid var(--el-color-success);
  @apply overflow-clip;
}
.el-aside.rightAside {
  border-left: 1px solid var(--el-color-success);
}
.common-layout {
  background-color: rgba(240, 249, 235, 0.15) !important;
  height: 100vh;
  overflow: hidden;
}

#pdfViewer {
  background-color: rgb(179, 224.5, 156.5);
  @apply py-4;
}
</style>
