<template>
  <el-row :gutter="20">
    <el-col :span="7" :offset="0">
      <el-button-group> </el-button-group>
    </el-col>
    <el-col class="text-center" :span="10" :offset="0">
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
        <el-button type="success" plain icon="">导出文档</el-button>
      </el-button-group>
    </el-col>
    <el-col :span="7" :offset="0">
      <el-button-group>

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

<style scoped>
.el-switch__label.is-active {
  span {
    color: var(--el-color-success) !important;
  }
}
</style>
