<template>
  <div class="common-layout">
    <el-container>
      <el-aside v-if="pdfSetting.pdfViewer.leftAsideShow" class="leftAside" width="12%">
        <LeftAside></LeftAside>
      </el-aside>
      <el-container>
        <el-header class="sticky" height="50.5px">
          <tool-bar @extract-text-form-p-d-f="extractTextFormPDF"></tool-bar>
        </el-header>
        <el-main>
          <button @click="saveHeadings">保存</button>
          <div id="pdfViewer" class="relative" @wheel="pdfWheel">
            <el-scrollbar ref="pdfContainerScroll" max-height="100vh">
              <!-- 添加按钮 -->
              <el-dropdown style="display: none" @command="addIndexItem">
                <el-button size="small" type="success">
                  菜单<el-icon class="el-icon--right"><arrow-down /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item
                      v-for="(item, index) in pdfSetting.dropDownMenu"
                      :key="index"
                      :command="index"
                      >{{ item.title }}</el-dropdown-item
                    >
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              <!-- 用于动态创建 canvas 的容器 -->
              <div ref="pdfContainer" class="w-max mx-auto relative"></div>
            </el-scrollbar>
          </div>
        </el-main>
      </el-container>
      <el-aside v-if="pdfSetting.pdfViewer.rightAsideShow" class="rightAside" width="17%">
        <RightAside></RightAside>
      </el-aside>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, provide, onUnmounted } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'
// import pdf from '../../../../../resources/3.pdf?asset'
// import '../../../../../resources/Tesseract/worker.min.js?asset'
// import '../../../../../resources/Tesseract/tesseract-core.wasm.js?asset'
// import '../../../../../resources/Tesseract/tesseract-core-simd.wasm.js?asset'
import ToolBar from '@renderer/components/ToolBar/ToolBar.vue'
import LeftAside from '@renderer/components/LeftAside/LeftAside.vue'
import RightAside from '@renderer/components/RightAside/RightAside.vue'
import axios from 'axios'
import router from '../../router/router'
import er from '../../../../../resources/setting/projects.json'
import { data } from 'autoprefixer'

const pdfModules = import.meta.glob('@resources/*.pdf')

const pdfUrl = '/@fs/J:/work/tc-pdf/resources/3.pdf'

let pdfUrl = ref('')
let pdfDoc = null
// const pdfCanvas = ref(null)
const pdfContainer = ref(null)
const pdfCurrentPage = ref(1)
const pdfTotalPages = ref(0)
const loading = ref(true)
const pdfSelectionText = ref()
const pdfSelectionPage = ref()
const pdfPageList = ref([])
const pdfThumbnails = ref([])
const pdfIndexTable = ref([])
const pdfText = ref('')
const pdfContainerScroll = ref()
const pdfIndexData = ref({
  indexData: [
    {
      name: 'biaoMu',
      id: 1,
      title: '标目',
      data: [
        { pdfPage: ['1', '3'], content: '工作管理', highlight: true },
        { pdfPage: ['1', '3'], content: '工作管理', highlight: true }
      ]
    },
    {
      id: 1,
      name: 'chuangXin',
      title: '创新词汇',
      data: [
        { pdfPage: ['1', '3'], content: '工作管理', highlight: true },
        { pdfPage: ['1', '3'], content: '工作管理', highlight: true }
      ]
    }
  ]
})

const pdfSetting = ref({
  dropDownMenu: [
    { title: '添加标目', command: 'biaoMu' },
    { title: '添加创新词汇', command: 'chuangXin' }
    // { title: '添加款目', command: 'addIndexItem()' },
  ],
  autoHighlight: true,
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
const outputData = ref()
provide('pdfSetting', pdfSetting)
provide('pdfCurrentPage', pdfCurrentPage)
provide('pdfTotalPages', pdfTotalPages)
provide('pdfPageList', pdfPageList)
provide('pdfThumbnails', pdfThumbnails)
provide('pdfText', pdfText)
provide('pdfIndexData', pdfIndexData)
provide('pdfIndexTable', pdfIndexTable)
provide('outputData', outputData)
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

document.addEventListener('mouseup', (event) => {
  const addMenu = document.querySelector('.el-dropdown')
  addMenu.style.zIndex = '9999'
  addMenu.style.position = 'absolute'

  const eventElementParentParentMarginStyle = window.getComputedStyle(
    event.target.parentElement.parentElement
  )

  if (
    window.getSelection().toString().trim() !== '' &&
    event.target.parentElement.id.includes('page')
  ) {
    pdfSelectionText.value = document.getSelection().toString()
    pdfSelectionPage.value = document
      .getSelection()
      .focusNode.parentElement.attributes.getNamedItem('data-page').value

    addMenu.style.top = `${event.clientY - 70}px`
    addMenu.style.left = `${event.clientX - parseFloat(eventElementParentParentMarginStyle.marginLeft)}px`
    addMenu.style.display = 'block'
  } else {
    addMenu.style.display = 'none'
  }
})

// document.addEventListener('mouseover', (event) => {
//   console.log(event);
//   mouseOverElement.value = event.target.
// })
document.addEventListener('mousemove', (event) => {
  // 视口坐标
  // // 页面坐标
  // const pagePosition = `(${event.pageX}, ${event.pageY})`
  // // 屏幕坐标
  // const screenPosition = `(${event.screenX}, ${event.screenY})`
})

// 加载 PDF 文件
const loadPdf = async () => {
  try {
    const loadingTask = pdfjsLib.getDocument('C:\\Users\\34058\\WebstormProjects\\vue-pdf\\resources\\1.pdf')
    pdfDoc = await loadingTask.promise
    pdfTotalPages.value = pdfDoc.numPages
    loading.value = false
    // renderPage(pdfCurrentPage.value)
    await renderAllPages()
    createThumbnails()
    extractTextFormPDF()
  } catch (error) {
    console.error('加载 PDF 时出错:', error)
  }
}

// // 渲染单页面
// const renderPage = async () => {
//   for (let pageNum = 1; pageNum <= pdfTotalPages.value; pageNum++) {
//     await pdfDoc.getPage(pageNum).then((page) => {
//       const viewport = page.getViewport({
//         scale: pdfSetting.value.pdfViewer.scale / 100
//       })

//       const newCanvas = document.createElement('canvas')
//       const context = newCanvas.getContext('2d')
//       newCanvas.width = viewport.width
//       newCanvas.height = viewport.height

//       newCanvas.style.border = '2px solid var(--el-color-success)'
//       // 将新创建的 canvas 添加到容器中
//       pdfContainer.value.appendChild(newCanvas)
//        page
//         .render({
//           canvasContext: context,
//           viewport: viewport
//         })
//         .promise.then(() => {
//           // 当前页渲染完成
//         })
//         .catch((error) => {
//           console.error('渲染页面时出错:', error)
//         })
//     })
//   }
// }

const scrollpage = (page) => {
  const pageElement = document.getElementById(`page-${page}`)

  if (pageElement) {
    pdfContainerScroll.value.scrollTo({
      top: pageElement.offsetTop,
      behavior: 'smooth'
    })
    pdfCurrentPage.value = page
  }
}

const extractTextFormPDF = async () => {
  if (pdfText.value == null || pdfText.value == '') {
    for (let pageNumber = 1; pageNumber <= pdfTotalPages.value; pageNumber++) {
      const page = await pdfDoc.getPage(pageNumber)

      const textContent = await page.getTextContent()
      // console.log('textContent', textContent)

      const textItems = textContent.items
      // console.log('textItems', textItems)

      const str = textItems.map((item) => item.str).join('')
      pdfText.value = str

      textContent.items.forEach((textItem) => {
        const parentDiv = document.getElementById('page-' + pageNumber)
        parentDiv.style.position = 'relative'
        const textDiv = document.createElement('span')
        textDiv.dataset.page = pageNumber
        textDiv.textContent = textItem.str
        textDiv.style.color = 'rgba(0,0,0,0)'
        textDiv.style.position = 'absolute'
        // textDiv.className = 'bg-lime-500 bg-opacity-50 hover:bg-opacity-100'
        const viewport = page.getViewport({
          scale: pdfSetting.value.pdfViewer.scale / 100
        })
        // console.log(textContent.items)

        const [scaleX, skewY, skewX, scaleY, translateX, translateY] = textItem.transform
        // console.log(viewport.height)

        // console.log('viewport', viewport.scale)
        // console.log('textItem.transform', viewport.height)
        // console.log('textItem.transform', translateX)

        textDiv.style.fontSize = `${scaleX}px`
        textDiv.style.left = `${translateX * viewport.scale}px`
        textDiv.style.top = `${viewport.height - scaleX - translateY * viewport.scale}px`
        // textDiv.style.transform = `scale(${viewport.scale},${viewport.scale}) skew(0deg, 0deg)`
        parentDiv.appendChild(textDiv)
      })
    }
  }
}

// 渲染所有页面模式
const renderAllPages = async () => {
  pdfContainer.value.innerHTML = '' // 清空之前的页面

  for (let pageNum = 1; pageNum <= pdfTotalPages.value; pageNum++) {
    const page = await pdfDoc.getPage(pageNum)
    const viewport = page.getViewport({
      scale: pdfSetting.value.pdfViewer.scale / 100
    })
    const div = document.createElement('div')
    div.style.position = 'relative'
    div.style.border = `1rem solid rgba(0,0,0,0)`
    div.id = `page-${pageNum}`

    if (pageNum == pdfTotalPages.value) {
      div.style.marginBottom = '100px'
    }

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    canvas.width = viewport.width
    canvas.height = viewport.height
    canvas.style.border = '2px solid var(--el-color-success)'
    div.appendChild(canvas)
    // 将页面渲染到 canvas 上
    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise

    pdfContainer.value.appendChild(div)
  }
}

const removeTextHightLight = () => {
  // 查找所有高亮元素
  const highlightedElements = document.querySelectorAll(
    '#pdfViewer span.bg-yellow-400.bg-opacity-25'
  )

  // 遍历所有高亮元素
  highlightedElements.forEach((element) => {
    // 获取高亮元素的父节点
    const parent = element.parentNode
    // 创建文本节点，内容为高亮元素的文本
    const textNode = document.createTextNode(element.textContent)
    // 用文本节点替换高亮元素
    parent.replaceChild(textNode, element)
  })

  // 清空 pdfPageList
}
// 高亮文本
const hightLightText = (textToHighlight) => {
  const walker = document.createTreeWalker(
    document.querySelector('#pdfViewer'),
    NodeFilter.SHOW_TEXT,
    null,
    false
  )

  let node
  const nodesToHighlight = []

  // 遍历所有文本节点，查找匹配的文本
  while ((node = walker.nextNode())) {
    if (node.nodeValue.includes(textToHighlight)) {
      nodesToHighlight.push(node)
    }
  }

  // 为匹配的文本节点添加高亮效果
  nodesToHighlight.forEach((node) => {
    pdfPageList.value.push(node.parentElement.attributes.getNamedItem('data-page').value)
    pdfPageList.value = [...new Set(pdfPageList.value)]
    if (pdfSetting.value.autoHighlight) {
      const text = node.nodeValue
      const newText = text.replace(
        new RegExp(textToHighlight, 'g'),
        `<span class="bg-yellow-400 bg-opacity-25">${textToHighlight}</span>`
      )
      const temp = document.createElement('div')
      temp.innerHTML = newText
      while (temp.firstChild) {
        node.parentNode.insertBefore(temp.firstChild, node)
      }
      node.parentNode.removeChild(node)
    }
  })
}

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
    pdfThumbnails.value.push(canvas.toDataURL())
  }
}
// 添加数据
const addIndexItem = (index) => {
  hightLightText(pdfSelectionText.value)
  pdfIndexData.value.indexData[index].data.push({
    pdfPage: pdfPageList.value,
    content: pdfSelectionText.value,
    highlight: pdfSetting.value.autoHighlight,
    tag: pdfIndexData.value.indexData[index].name
  })
  if (index == 1) {
    pdfIndexData.value.indexData[0].data.push({
      pdfPage: pdfPageList.value,
      content: pdfSelectionText.value,
      highlight: pdfSetting.value.autoHighlight,
      tag: pdfIndexData.value.indexData[index].name
    })
  }
  // if (event == 'biaoMu') {
  //   pdfIndexData.value.biaoMu.data.push({
  //     pdfPage: pdfPageList.value,
  //     content: pdfSelectionText.value,
  //     highlight: pdfSetting.value.autoHighlight
  //   })
  // }
  // if (event == 'chuangXin') {
  //   pdfIndexData.value.chuangXin.data.push({
  //     pdfPage: pdfPageList.value,
  //     content: pdfSelectionText.value,
  //     highlight: pdfSetting.value.autoHighlight
  //   })
  // }

  pdfPageList.value = []
}
// pdf滚动事件
const pdfWheel = (event) => {
  // 放大缩小pdf
  if (currentKeyDownRef.value === 'Control') {
    if (event.deltaY < 0) {
      pdfSetting.value.pdfViewer.scale += 5
      renderAllPages()
    } else {
      pdfSetting.value.pdfViewer.scale -= 5
      renderAllPages()
    }
  }
}
// 自定义排序
const sortText = (a, b) => {
  // console.log(a, b)
  return a.content.localeCompare(b.content)
}
// const goToPage = (page) => {
//   pdfCurrentPage.value = page
//   renderAllPages(page)
// }
// 监听页码变化并重新渲染
// watch(pdfCurrentPage, (newPage) => {
//   // renderPage(newPage)
//   renderAllPages()
// })
provide('removeTextHightLight', removeTextHightLight)
provide('sortText', sortText)
provide('scrollpage', scrollpage)
provide('renderAllPages', renderAllPages)
// watch(pdfIndexData.value, (newVal, oldVal) => {
//   console.log('pdfIndexData old', oldVal)
//   console.log('pdfIndexData New', newVal)
// })
onMounted(async () => {

  let it = JSON.parse(window.localStorage.getItem('it'))
  console.log(it)
  let path = it.path
  const params = new URLSearchParams();
  params.append('flag', '5');
  params.append('data', path);
  axios.get('/api?',{params}).then((res)=>{
   console.log(res.data)
    pdfUrl=res.data
  })
  loadPdf()
  // 自动化索引
  for (const key in pdfIndexTable.value) {
    // console.log(key, pdfIndexTable.value[key])
    // console.log(pdfIndexData.value.indexData[key].id)
    pdfIndexData.value.indexData[key].id = key
  }
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
  @apply overflow-clip h-max;
}

.el-aside.rightAside {
  border-left: 1px solid var(--el-color-success);
}

.common-layout {
  background-color: rgba(240, 249, 235, 0.15) !important;
  height: 100vh;
  overflow: hidden;
  position: relative;
}

#pdfViewer {
  background-color: rgb(179, 224.5, 156.5);
  @apply py-4;
}

.highlight {
  @apply bg-yellow-400 bg-opacity-25;
}
</style>
