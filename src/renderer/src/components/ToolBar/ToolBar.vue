<template>
  <el-row :gutter="20">
    <!-- <el-col :span="6" :offset="0">
      <el-button-group> </el-button-group>
    </el-col> -->
    <el-col class="text-center" :span="24" :offset="0">
      <el-button-group>
        <el-button type="success" plain icon="" @click="thumbnailsShow">缩略图</el-button>
        <el-button
          v-model="pdfSetting.autoHighlight"
          type="success"
          active-text="自动高亮"
          tag="el-switch"
          plain
          style="--el-switch-on-color: #13ce66"
          >自动高亮</el-button
        >
        <!-- <el-button type="success" plain icon="" @click="">保存</el-button> -->
        <el-button type="success" plain icon="" @click="renderDoc">导出文档</el-button>
      </el-button-group>
    </el-col>
    <!-- <el-col :span="6" :offset="0">
      <el-button-group>

      </el-button-group>
    </el-col> -->
  </el-row>
</template>

<script setup>
import { inject } from 'vue'
import Docxtemplater from 'docxtemplater'
import PizZip from 'pizzip'
import PizZipUtils from 'pizzip/utils/index.js'
import { saveAs } from 'file-saver'
import inputWord from '../../../../../resources/input.docx?asset'
import { pinyin } from 'pinyin-pro'

const pdfSetting = inject('pdfSetting')
const pdfIndexData = inject('pdfIndexData')
const outputData = inject('outputData')
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
    const pinyinA = pinyin(a.content);
    const pinyinB = pinyin(b.content);
    return pinyinA.localeCompare(pinyinB);
  });

  // 按首字母分组
  const groupedData = []; // 改为数组
  const groups = {}; // 临时对象，用于分组

  data.forEach((item) => {
    const firstLetter = pinyin(item.content, { pattern: 'first', toneType: 'none' })[0].toUpperCase();
    if (!groups[firstLetter]) {
      groups[firstLetter] = { firstLetter, data: [] }; // 初始化分组
      groupedData.push(groups[firstLetter]); // 将分组添加到数组
    }
    groups[firstLetter].data.push(item); // 将数据添加到分组
  });

  return groupedData; // 返回数组
};

// 处理每个 indexData 的 data

const renderDoc = async () => {
  // 处理数据
  try {
    outputData.value = {}; // 初始化 outputData
    pdfIndexData.value.indexData.forEach((item) => {
      outputData.value[item.name] = processData(item.data); // 保存为数组
    });

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
</script>

<style scoped>
.el-switch__label.is-active {
  span {
    color: var(--el-color-success) !important;
  }
}
</style>
