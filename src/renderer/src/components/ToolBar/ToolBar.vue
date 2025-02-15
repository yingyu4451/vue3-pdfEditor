<template>
  <el-row :gutter="20">
    <el-col :span="6" :offset="0">
      <el-button-group>
        <el-button type="success" plain icon="" @click="thumbnailsShow">缩略图</el-button>
        <el-button type="success" plain icon="Back" @click="">撤销</el-button>
        <el-button type="success" plain icon="Right" @click="">恢复</el-button>
      </el-button-group>
    </el-col>
    <el-col class="text-center" :span="12" :offset="0">
      <el-button-group>
        <el-button type="success" plain icon="Position" @click="">选择</el-button>
        <el-button type="success" plain icon="Position" @click="$emit('extractTextFormPDF',1)">识别文本</el-button>
      </el-button-group>
    </el-col>
    <el-col :span="6" :offset="0">
      <el-button-group>
        <el-button type="success" plain icon="Position" @click="">新建标目</el-button>
        <el-button type="success" plain icon="Plus" @click="">标目列表</el-button>
      </el-button-group>
    </el-col>
  </el-row>
</template>

<script setup>
import { inject } from 'vue'

const pdfSetting = inject('pdfSetting')

const thumbnailsShow = () => {
  pdfSetting.value.pdfViewer.leftAsideShow = !pdfSetting.value.pdfViewer.leftAsideShow
}
</script>

<style scoped></style>
