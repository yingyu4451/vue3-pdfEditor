<template>
  <el-row :gutter="20">
    <el-col :span="6" :offset="0">
      <!-- <el-button-group>

      </el-button-group> -->
      <el-button type="default" plain size="default" @click="closeWindow"> 返回菜单 </el-button>
      <el-button-group class="ml-2">
        <el-button type="success" size="default" plain @click="openCiBiao">导入词表</el-button>
      </el-button-group>
    </el-col>
    <el-col class="text-center" :span="12" :offset="0">
      <el-button-group>
        <el-button type="success" plain icon="" @click="thumbnailsShow">缩略图</el-button>
        <el-button
          v-model="pdfSetting.autoHighlight"
          type="success"
          tag="el-checkbox"
          size="small"
          plain
          >自动高亮</el-button
        >
        <el-button type="success" plain icon="" @click="saveEdit">保存</el-button>
        <el-button type="success" plain icon="" @click="renderDoc">导出文档</el-button>
      </el-button-group>
    </el-col>
    <el-col :span="6" :offset="0">
      <el-button-group>
        <el-button
          v-model="pdfSetting.showHighlight"
          type="success"
          tag="el-checkbox"
          size="small"
          plain
          >高亮显示</el-button
        >
      </el-button-group>
    </el-col>
  </el-row>
</template>

<script setup>
import { ref, inject } from 'vue'
import Docxtemplater from 'docxtemplater'
import PizZip from 'pizzip'
import PizZipUtils from 'pizzip/utils/index.js'
import { saveAs } from 'file-saver'
import inputWord from '../../../../../resources/input.docx?asset'
import { pinyin } from 'pinyin-pro'
import axios from 'axios'
import router from '../../router/router'


const pdfSetting = inject('pdfSetting')
const pdfIndexData = inject('pdfIndexData')
const outputData = inject('outputData')
const saveEdit = inject('saveEdit')
const ciBiaoDialog = inject('ciBiaoDialog')
const ciBiaoData = inject('ciBiaoData')

function closeWindow() {
  router.back()
}

function loadFile(url) {
  return new Promise((resolve, reject) => {
    PizZipUtils.getBinaryContent(url, (error, content) => {
      if (error) {
        reject(error)
      } else {
        resolve(content)
      }
    })
  })
}

const thumbnailsShow = () => {
  pdfSetting.value.pdfViewer.leftAsideShow = !pdfSetting.value.pdfViewer.leftAsideShow
}

const processData = (data) => {
  // 按拼音排序
  data.sort((a, b) => {
    const pinyinA = pinyin(a.content)
    const pinyinB = pinyin(b.content)
    return pinyinA.localeCompare(pinyinB)
  })

  // 按首字母分组
  const groupedData = [] // 改为数组
  const groups = {} // 临时对象，用于分组

  data.forEach((item) => {
    const firstLetter = pinyin(item.content, {
      pattern: 'first',
      toneType: 'none'
    })[0].toUpperCase()
    if (!groups[firstLetter]) {
      groups[firstLetter] = { firstLetter, data: [] } // 初始化分组
      groupedData.push(groups[firstLetter]) // 将分组添加到数组
    }
    groups[firstLetter].data.push(item) // 将数据添加到分组
  })

  return groupedData // 返回数组
}

// 处理每个 indexData 的 data

const renderDoc = async () => {
  // 处理数据
  try {
    outputData.value = {} // 初始化 outputData
    pdfIndexData.value.indexData.forEach((item) => {
      outputData.value[item.name] = processData(item.data) // 保存为数组
    })

    // 加载模板文件
    const content = await loadFile(inputWord)

    // 初始化 docxtemplater
    const zip = new PizZip(content)
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true })

    // 渲染文档
    await doc.renderAsync(outputData.value)

    // 生成输出文件
    const out = doc.getZip().generate({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    })

    // 保存文件
    saveAs(out, 'output.docx')
  } catch (error) {
    console.error('导出文档失败:', error)
  }
}

const openCiBiao = () => {
  ciBiaoData.value = []
  window.electron.ipcRenderer.send('openCiBiaoList')
}

window.electron.ipcRenderer.on('openCiBiaoList', (event, arg) => {
  // console.log(event);
  console.log(arg)
  ciBiaoDialog.value.openDialog()
  ciBiaoData.value.push(arg)
  console.log("ciBiaoData.value",ciBiaoData.value)
})
</script>

<style scoped>
:deep(.el-switch__label.is-active) {
  color: var(--el-color-success) !important;
}
:deep(.el-checkbox) {
  color: var(--el-color-success) !important;
  :hover {
    color: white !important;
  }
}
:deep(.el-checkbox__input.is-checked + .el-checkbox__label) {
  color: var(--el-color-success) !important;
}
:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: var(--el-color-success) !important;
  border-color: var(--el-color-success) !important;
}
</style>
