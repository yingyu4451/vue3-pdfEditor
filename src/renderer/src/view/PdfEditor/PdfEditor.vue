<template>
  <div class="common-layout">
    <el-header height="60px">
      <tool-bar @extract-text-form-p-d-f="extractTextFormPDF(pdfCurrentPage)"></tool-bar>
      <button id="upload"></button>
    </el-header>
    <el-container>
      <el-aside v-if="pdfSetting.pdfViewer.leftAsideShow" class="leftAside" width="240px">
        <LeftAside @scale-change="renderPage" @thumbnail-click="goToPage"></LeftAside>
      </el-aside>
      <el-container>
        <el-main>
          <div id="pdfViewer" class="relative" @wheel.passive="pdfWheel">
            <!-- 用于动态创建 canvas 的容器 -->
            <!-- <el-scrollbar max-height="100vh"> -->
            <div ref="pdfContainer" class="w-max mx-auto relative"></div>
            <!-- </el-scrollbar> -->
          </div>
        </el-main>
      </el-container>
      <el-aside v-if="pdfSetting.pdfViewer.rightAsideShow" class="rightAside" width="300px">
        <RightAside></RightAside>
      </el-aside>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, provide } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'
import pdf from './../../../../../resources/1.pdf?asset'
import '../../assets/Tesseract/worker.min.js?worker'
import '../../assets/Tesseract/tesseract-core.wasm.js?loader'
import '../../assets/Tesseract/tesseract-core-lstm.wasm.js?loader'
import '../../assets/Tesseract/tesseract-core-simd.wasm.js?loader'
import '../../assets/Tesseract/tesseract-core-simd-lstm.wasm.js?loader'
import '../../assets/Tesseract/lang/chi_sim_vert.traineddata.gz'
// import '../../../../../resources/Tesseract/worker.min.js?asset'
// import '../../../../../resources/Tesseract/tesseract-core.wasm.js?asset'
// import '../../../../../resources/Tesseract/tesseract-core-simd.wasm.js?asset'
import ToolBar from '@renderer/components/ToolBar/ToolBar.vue'
import LeftAside from '@renderer/components/LeftAside/LeftAside.vue'
import RightAside from '@renderer/components/RightAside/RightAside.vue'
import tesseract from 'tesseract.js'

const { createWorker } = tesseract;

const tesseractWorker = await createWorker({
  corePath: '/src/assets/Tesseract',
  langPath: '/src/assets/Tesseract/lang',
  workerPath: '/src/assets/Tesseract/worker.min.js',
  workerBlobURL:true,
})


const pdfUrl = pdf
let pdfDoc = null
// const pdfCanvas = ref(null)
const pdfContainer = ref(null)
const pdfCurrentPage = ref(1)
const pdfTotalPages = ref(0)
const loading = ref(true)
const pdfPageList = ref([])
const pdfThumbnails = ref([])
const pdfText = ref('')
const pdfPaperContentIndexData = ref({
  biaoMu: {
    name: '标目',
    data: [
      { pdfPage: 1, content: '第一章内容' },
      { pdfPage: 2, content: '第一章内容' }
    ]
  },
  kuanMu: {
    name: '款目',
    data: [
      { pdfPage: 1, content: '第一章内容' },
      { pdfPage: 2, content: '第一章内容' }
    ]
  },
  chuangXin: {
    name: '创新词汇',
    data: [
      { pdfPage: 1, content: '第一章内容' },
      { pdfPage: 2, content: '第一章内容' }
    ]
  }
})
const pdfSetting = ref({
  pdfViewer: {
    scale: 100,
    leftAsideShow: true,
    rightAsideShow: true
  },
  pdfThumbnails: {
    scale: 0.25
  }
})
const currentKeyDownRef = ref()

provide('pdfSetting', pdfSetting)
provide('pdfCurrentPage', pdfCurrentPage)
provide('pdfTotalPages', pdfTotalPages)
provide('pdfPageList', pdfPageList)
provide('pdfThumbnails', pdfThumbnails)
provide('pdfText', pdfText)
provide('pdfPaperContentIndexData', pdfPaperContentIndexData)

// 检测屏幕大小
if (window.innerWidth == 1920) {
  pdfSetting.value.pdfViewer.scale = 100
}
if (window.innerWidth == 2560) {
  pdfSetting.value.pdfViewer.scale = 145
}

// 检测当前按下的按键
document.addEventListener('keydown', (event) => {
  // console.log(`按下的键: ${event.key}, 键码: ${event.code}`)
  currentKeyDownRef.value = event.key
})
document.addEventListener('keyup', (event) => {
  // console.log(`松开的键: ${event.key}, 键码: ${event.code}`)
  currentKeyDownRef.value = ''
})
// 加载 PDF 文件
const loadPdf = async () => {
  try {
    const loadingTask = pdfjsLib.getDocument(pdfUrl)
    pdfDoc = await loadingTask.promise
    pdfTotalPages.value = pdfDoc.numPages
    loading.value = false
    renderPage(pdfCurrentPage.value)
    // renderAllPages()
    createThumbnails()
  } catch (error) {
    console.error('加载 PDF 时出错:', error)
  }
}

// 渲染单页面
const renderPage = (pageNumber) => {
  pdfDoc.getPage(pageNumber).then((page) => {
    const viewport = page.getViewport({
      scale: pdfSetting.value.pdfViewer.scale / 100
    })

    const newCanvas = document.createElement('canvas')
    const context = newCanvas.getContext('2d')
    newCanvas.width = viewport.width
    newCanvas.height = viewport.height

    newCanvas.style.border = '2px solid var(--el-color-success)'

    pdfContainer.value.innerHTML = '' // 清除之前的 canvas（可选）
    // 将新创建的 canvas 添加到容器中
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

const extractTextFormPDF = async (pageNumber) => {
  if (pdfText.value == null) {
    const page = await pdfDoc.getPage(pageNumber)

    const textContent = await page.getTextContent()
    console.log('textContent', textContent)

    const textItems = textContent.items
    console.log('textItems', textItems)

    const str = textItems.map((item) => item.str).join('')
    pdfText.value = str

    textContent.items.forEach((textItem) => {
      const textDiv = document.createElement('button')
      textDiv.textContent = textItem.str
      textDiv.style.position = 'absolute'
      textDiv.className = 'bg-lime-500 bg-opacity-50 p-1 hover:bg-opacity-100'
      const viewport = page.getViewport({
        scale: pdfSetting.value.pdfViewer.scale / 100
      })
      // 获取文本位置（transform 矩阵的位移部分）
      // console.log('textItem.transform',textItem.transform);

      const [scaleX, skewY, skewX, scaleY, translateX, translateY] = textItem.transform
      console.log(viewport.height)

      textDiv.style.left = `${translateX * viewport.scale}px`
      textDiv.style.top = `${viewport.height - translateY * viewport.scale}px`
      // textDiv.style.transform = `scale(${viewport.scale},${viewport.scale}) skew(0deg, 0deg)`

      pdfContainer.value.appendChild(textDiv)
    })
  }
}

// 渲染所有页面模式
// const renderAllPages = async () => {
//   // pdfPageList.value = [] // 清空之前的缩略图

//   for (let pageNum = 1; pageNum <= pdfTotalPages.value; pageNum++) {
//     const page = await pdfDoc.getPage(pageNum)
//     const viewport = page.getViewport({
//       scale: pdfSetting.value.pdfViewer.scale / 100
//     })
//     const div = document.createElement('div')
//     div.style.padding = `30px 0px`
//     div.id = `page-${pageNum}`
//     const canvas = document.createElement('canvas')
//     const context = canvas.getContext('2d')
//     canvas.width = viewport.width
//     canvas.height = viewport.height
//     canvas.style.border = '2px solid var(--el-color-success)'
//     div.appendChild(canvas)
//     // 将页面渲染到 canvas 上
//     await page.render({
//       canvasContext: context,
//       viewport: viewport
//     }).promise

//     pdfContainer.value.appendChild(div)
//   }
// }

// 创建所有页面的缩略图
const createThumbnails = async () => {
  pdfThumbnails.value = [] // 清空之前的缩略图

  for (let pageNum = 1; pageNum <= pdfTotalPages.value; pageNum++) {
    const page = await pdfDoc.getPage(pageNum)
    const viewport = page.getViewport(pdfSetting.value.pdfThumbnails)

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
    pdfThumbnails.value.push(canvas.toDataURL())
  }
  for (let pageNum = 1; pageNum <= pdfTotalPages.value; pageNum++) {
    const page = await pdfDoc.getPage(pageNum)
    const viewport = page.getViewport(pdfSetting.value.pdfViewer.scale)

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
    pdfPageList.value.push(canvas.toDataURL())
  }
}

// 下一页
const nextPage = () => {
  if (pdfCurrentPage.value < pdfTotalPages.value) {
    pdfCurrentPage.value++
    renderPage(pdfCurrentPage.value)
  }
}
// 上一页
const prevPage = () => {
  if (pdfCurrentPage.value <= pdfTotalPages.value && pdfCurrentPage.value != 1) {
    pdfCurrentPage.value--
    renderPage(pdfCurrentPage.value)
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
    renderPage(pdfCurrentPage.value)
  } else {
    if (event.deltaY < 0) {
      prevPage()
    } else {
      nextPage()
    }
  }
}

const goToPage = (page) => {
  pdfCurrentPage.value = page
  renderPage(page)
}
// 监听页码变化并重新渲染
watch(pdfCurrentPage, (newPage) => {
  // renderPage(newPage)
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
