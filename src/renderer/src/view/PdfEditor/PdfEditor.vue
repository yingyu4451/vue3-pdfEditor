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
          <div id="pdfViewer" class="relative">
            <el-scrollbar ref="pdfContainerScroll" max-height="100vh" @scroll="scrollBarMove">
              <!-- 添加按钮 -->
              <!-- <el-dropdown style="display: none" @command="addIndexItem">
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
              </el-dropdown> -->
              <!-- 用于动态创建 canvas 的容器 -->
              <div
                id="pdfContainer"
                @wheel.prevent="pdfWheel"
                ref="pdfContainer"
                class="w-max mx-auto relative"
              ></div>
            </el-scrollbar>
          </div>
        </el-main>
      </el-container>
      <el-aside v-if="pdfSetting.pdfViewer.rightAsideShow" class="rightAside" width="17%">
        <RightAside></RightAside>
      </el-aside>
    </el-container>
    <CiBiaoDialog ref="ciBiaoDialog" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch, provide, onUnmounted } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'
// import pdf from '../../../../../resources/4.pdf?asset'
// import '../../../../../resources/Tesseract/worker.min.js?asset'
// import '../../../../../resources/Tesseract/tesseract-core.wasm.js?asset'
// import '../../../../../resources/Tesseract/tesseract-core-simd.wasm.js?asset'
import axios from 'axios'
import router from '../../router/router'
import er from '../../../../../resources/setting/projects.json'
import { data } from 'autoprefixer'
// 组件
import ToolBar from '@renderer/components/ToolBar/ToolBar.vue'
import LeftAside from '@renderer/components/LeftAside/LeftAside.vue'
import RightAside from '@renderer/components/RightAside/RightAside.vue'
import { ElMessage } from 'element-plus'
import CiBiaoDialog from '@renderer/components/Dialog/CiBiaoDialog.vue'

// const pdfModules = import.meta.glob('@resources/*.pdf')

const pdfUrl = ref('')

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
        // type: 'biaoMu', pdfPage: ['1', '3'], content: '工作管理', highlight: true, canZhao: []
      ]
    },
    {
      id: 1,
      name: 'chuangXin',
      title: '创新词汇',
      data: []
    }
    // {
    //   id: 1,
    //   name: 'canZhao',
    //   title: '参照',
    //   data: []
    // }
  ]
})

const pdfSetting = ref({
  dropDownMenu: [
    { title: '添加标目', command: 'biaoMu' },
    { title: '添加创新词汇', command: 'chuangXin' }
    // { title: '添加款目', command: 'addIndexItem()' },
  ],
  showHighlight: true,
  autoHighlight: true,
  pdfViewer: {
    scale: 100,
    leftAsideShow: true,
    rightAsideShow: true,
    containerHeight: 0
  },
  pdfThumbnails: {
    scale: 0.25
  }
})
const currentKeyDownRef = ref()
const outputData = ref()
const editDialogVisible = ref(false)
const dialogResult = ref()
const scrollBarData = ref()
const ciBiaoDialog = ref()
const ciBiaoData = ref()
provide('pdfSetting', pdfSetting)
provide('pdfCurrentPage', pdfCurrentPage)
provide('pdfTotalPages', pdfTotalPages)
provide('pdfPageList', pdfPageList)
provide('pdfThumbnails', pdfThumbnails)
provide('pdfText', pdfText)
provide('pdfIndexData', pdfIndexData)
provide('pdfIndexTable', pdfIndexTable)
provide('outputData', outputData)
provide('editDialogVisible', editDialogVisible)
provide('dialogResult', dialogResult)
provide('ciBiaoDialog', ciBiaoDialog)
provide('ciBiaoData', ciBiaoData)

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

// document.addEventListener('contextmenu', (event) => {
//   event.preventDefault()

// })

window.electron.ipcRenderer.on('contextmenuCommand', (event, value) => {
  console.log(event)

  switch (value) {
    case '0':
      addIndexItem(0)
      break
    case '1':
      addIndexItem(1)
      break
    default:
      break
  }
})

document.addEventListener('mouseup', (event) => {
  // const addMenu = document.querySelector('.el-dropdown')
  // addMenu.style.zIndex = '9999'
  // addMenu.style.position = 'absolute'

  const eventElementParentParentMarginStyle = window.getComputedStyle(
    event.target.parentElement.parentElement
  )

  if (
    window.getSelection().toString().trim() !== '' &&
    event.target.parentElement.id.includes('page')
  ) {
    window.electron.ipcRenderer.send('contextmenu')

    pdfSelectionText.value = document.getSelection().toString()
    pdfSelectionPage.value = document
      .getSelection()
      .focusNode.parentElement.attributes.getNamedItem('data-page').value
    // console.log(event.clientX)

    // addMenu.style.top = `${event.clientY - 70}px`
    // addMenu.style.left = `${event.clientX - parseFloat(eventElementParentParentMarginStyle.marginLeft)}px`
    // addMenu.style.display = 'block'
  } else {
    // addMenu.style.display = 'none'
  }
})

// 加载 PDF 文件
const loadPdf = async () => {
  try {
    const loadingTask = pdfjsLib.getDocument({ data: pdfUrl.value })
    pdfDoc = await loadingTask.promise
    pdfTotalPages.value = pdfDoc.numPages
    loading.value = false
    // renderPage(pdfCurrentPage.value)
    await renderAllPages()
    createThumbnails()
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

// 滚动事件
const scrollpage = (page) => {
  const pageElement = document.getElementById(`page-${page}`)

  if (pageElement) {
    pdfContainerScroll.value.scrollTo({
      top: pageElement.offsetTop,
      behavior: 'smooth'
    })
    // pdfCurrentPage.value = page
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

        textDiv.style.fontSize = `${scaleX * viewport.scale}px`
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
  pdfText.value = ''
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
  pdfSetting.value.pdfViewer.containerHeight =
    document.querySelector('#pdfContainer').clientHeight + 'px'
  await extractTextFormPDF()
}

const removeAllTextHightLight = () => {
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

const removeTextHightLight = (textToRemoveHighlight) => {
  const walker = document.createTreeWalker(
    document.querySelector('#pdfViewer'),
    NodeFilter.SHOW_ELEMENT, // 查找元素节点
    null,
    false
  )

  let node
  const highlightNodes = []

  // 遍历所有元素节点，查找高亮的 <span> 元素
  while ((node = walker.nextNode())) {
    if (
      node.nodeName === 'SPAN' &&
      node.classList.contains('bg-yellow-400') &&
      node.textContent === textToRemoveHighlight // 检查文本内容是否匹配
    ) {
      highlightNodes.push(node)
    }
  }

  // 移除高亮效果，恢复原始文本
  highlightNodes.forEach((highlightNode) => {
    const textNode = document.createTextNode(highlightNode.textContent)
    highlightNode.parentNode.replaceChild(textNode, highlightNode)
  })
}

// 高亮文本
const hightLightText = (HighLightText) => {
  pdfPageList.value = [] // 清空之前的页码列表
  // 条件判断
  if (
    (pdfSetting.value.autoHighlight && !pdfSetting.value.showHighlight) || // 情况1
    (!pdfSetting.value.autoHighlight && !pdfSetting.value.showHighlight) // 情况2
  ) {
    console.log('不通过：autoHighlight 和 showHighlight 的条件不满足')
    return // 不通过，直接返回
  }

  const walker = document.createTreeWalker(
    document.querySelector('#pdfViewer'),
    NodeFilter.SHOW_TEXT,
    null,
    false
  )

  let node
  const nodesList = []

  // 遍历所有文本节点，查找匹配的文本
  while ((node = walker.nextNode())) {
    if (node.nodeValue.includes(HighLightText)) {
      nodesList.push(node)
      pdfPageList.value.push(node.parentElement.attributes.getNamedItem('data-page').value)
      pdfPageList.value = [...new Set(pdfPageList.value)]
    }
  }

  // 为匹配的文本节点添加高亮效果
  if (pdfSetting.value.showHighlight) {
    nodesList.forEach((node) => {
      const text = node.nodeValue
      const newText = text.replace(
        new RegExp(HighLightText, 'g'),
        `<span class="bg-yellow-400 bg-opacity-25">${HighLightText}</span>`
      )
      const temp = document.createElement('div')
      temp.innerHTML = newText
      while (temp.firstChild) {
        node.parentNode.insertBefore(temp.firstChild, node)
      }
      node.parentNode.removeChild(node)
    })
  }
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
  if (pdfSetting.value.autoHighlight) {
    hightLightText(pdfSelectionText.value)
  }
  pdfIndexData.value.indexData[index].data.push({
    pdfPage: pdfPageList.value,
    content: pdfSelectionText.value,
    highlight: pdfSetting.value.autoHighlight,
    type: pdfIndexData.value.indexData[index].name,
    canZhao: []
  })
  if (index == 1) {
    pdfIndexData.value.indexData[0].data.push({
      pdfPage: pdfPageList.value,
      content: pdfSelectionText.value,
      highlight: pdfSetting.value.autoHighlight,
      type: pdfIndexData.value.indexData[index].name,
      canZhao: []
    })
  }
  console.log('addIndexItem pdfIndexData', pdfIndexData.value)

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
let pdfWheelTimeout = null

const pdfWheel = async (event) => {
  if (pdfWheelTimeout) {
    clearTimeout(pdfWheelTimeout)
  }
  if (currentKeyDownRef.value === 'Control') {
    if (event.deltaY < 0) {
      pdfSetting.value.pdfViewer.scale += 5
    } else {
      pdfSetting.value.pdfViewer.scale -= 5
    }
  }
  pdfWheelTimeout = setTimeout(async () => {
    renderAllPages()
  }, 900) // 防抖延迟时间，单位为毫秒
}

const scrollBarMove = (data) => {
  // console.log(pdfContainerScroll.value,data);
  const pdfPagediv = document.querySelector('#pdfContainer').clientHeight
  // console.log(pdfPagediv);
  // console.log(data.scrollTop);

  pdfCurrentPage.value = parseInt((data.scrollTop / pdfPagediv) * pdfTotalPages.value) + 1
  // console.log(pdfCurrentPage.value);
  // console.log(pdfContainer.scrollHeight)
}

// 自定义排序
const sortText = (a, b) => {
  // console.log(a, b)
  return a.content.localeCompare(b.content)
}

function saveEdit() {
  //获取需要保存的标目列表
  const headings = pdfIndexData.value.indexData
  //配置参数
  const params = new URLSearchParams()
  const it = JSON.parse(window.localStorage.getItem('it'))
  const path = it.settingPath
  params.append('flag', '6')
  params.append('data', JSON.stringify(headings))
  params.append('path', path)
  const baseURL = import.meta.env.PROD ? import.meta.env.PROD_API_URL : '/api'
  //通过axios请求方式将标目列表保存至配置文件
  axios.get(baseURL, { params }).then((res) => {
    ElMessage({
      message: '保存成功',
      type: 'success'
    })
  })
}

// 监听页码变化并重新渲染
// watch(pdfCurrentPage, (newPage) => {
//   // renderPage(newPage)
//   renderAllPages()
// })

// 方法继承

provide('removeTextHightLight', removeTextHightLight)
provide('removeAllTextHightLight', removeAllTextHightLight)
provide('hightLightText', hightLightText)
provide('sortText', sortText)
provide('scrollpage', scrollpage)
provide('renderAllPages', renderAllPages)
provide('saveEdit', saveEdit)
provide('addIndexItem', addIndexItem)
// provide('dialogResult', dialogResult)

// watch(pdfIndexData.value, (newVal, oldVal) => {
//   console.log('pdfIndexData old', oldVal)
//   console.log('pdfIndexData New', newVal)
// })

watch(
  () => pdfSetting.value.showHighlight,
  (newVal) => {
    if (newVal) {
      console.log('if true')
      for (let index = 0; index < pdfIndexData.value.indexData[0].data.length; index++) {
        console.log(pdfIndexData.value.indexData[0].data[index].highlight)
        if (pdfIndexData.value.indexData[0].data[index].highlight) {
          hightLightText(pdfIndexData.value.indexData[0].data[index].content)
        }

        console.log(pdfIndexData.value.indexData[0].data[index].content)
      }
    } else {
      removeAllTextHightLight()
    }
  }
)

onMounted(async () => {
  const baseURL = import.meta.env.PROD ? import.meta.env.PROD_API_URL : '/api'
  const it = JSON.parse(window.localStorage.getItem('it'))
  const path = it.path
  console.log('path', path)
  const settingPath = it.settingPath
  const param = new URLSearchParams()
  param.append('flag', '8')
  param.append('data', settingPath)
  axios.get(baseURL, { params: param }).then((res) => {
    if (res.data.length !== 0) {
      pdfIndexData.value.indexData = res.data
      console.log('res.data', res.data)
      console.log('res pdfIndexData', pdfIndexData.value)
    }
  })
  const params = new URLSearchParams()
  params.append('flag', '5')
  params.append('data', path)
  axios.get(baseURL, { params }).then((base64PDF) => {
    console.log(base64PDF.data)
    const base64Data = base64PDF.data.replace(/^data:application\/pdf;base64,/, '')
    const binaryData = atob(base64Data)
    const arrayBuffer = new ArrayBuffer(binaryData.length)
    const uint8Array = new Uint8Array(arrayBuffer)
    for (let i = 0; i < binaryData.length; i++) {
      uint8Array[i] = binaryData.charCodeAt(i)
    }
    pdfUrl.value = uint8Array
    loadPdf()
  })

  // 自动化索引
  for (const key in pdfIndexTable.value) {
    // console.log(key, pdfIndexTable.value[key])
    // console.log(pdfIndexData.value.indexData[key].id)
    pdfIndexData.value.indexData[key].id = key
  }

  console.log('pdfIndexData.value', pdfIndexData.value)
})
// window.addEventListener('beforeunload', function () {
//   saveEdit()
// })
// window.addEventListener('beforeunload', saveEdit());
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
