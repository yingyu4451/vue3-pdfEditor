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
        <el-button type="success" plain icon="" @click="">保存</el-button>
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


function loadFile(url, callback) {
  PizZipUtils.getBinaryContent(url, callback);
}
const pdfSetting = inject('pdfSetting')

const thumbnailsShow = () => {
  pdfSetting.value.pdfViewer.leftAsideShow = !pdfSetting.value.pdfViewer.leftAsideShow
}

const renderDoc = () => {
  loadFile(inputWord, function (error, content) {
    if (error) {
      throw error
    }
    const zip = new PizZip(content)
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true })
    doc.render({
      first_name: 'John',
      last_name: 'Doe',
      phone: '0652455478',
      description: '456456456'
    })

    const out = doc.getZip().generate({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    })
    // Output the document using Data-URI
    saveAs(out, 'output.docx')
  })
}
</script>

<style scoped>
.el-switch__label.is-active {
  span {
    color: var(--el-color-success) !important;
  }
}
</style>
