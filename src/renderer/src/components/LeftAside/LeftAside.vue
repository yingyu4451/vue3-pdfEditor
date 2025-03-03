<template>
  <div class="numPages">
    <el-input-number
      v-model="pdfCurrentPage"
      :value="pdfCurrentPage"
      size="small"
      :min="1"
      :max="pdfTotalPages || 2"
      :step="1"
      :precision="0"
      :controls="false"
      data-type="1"
      @change="scrollpage(pdfCurrentPage)"
    >
      <template #suffix>
        <span>页 / {{ pdfTotalPages }} 页</span>
      </template>
    </el-input-number>
    <el-input-number
      v-model="pdfSetting.pdfViewer.scale"
      :value="pdfSetting.pdfViewer.scale"
      size="small"
      :min="100"
      :max="200"
      :step="5"
      :precision="0"
      :controls="false"
      data-type="2"
      @change="renderAllPages"
    >
      <template #suffix>
        <span>%</span>
      </template>
    </el-input-number>
  </div>
  <!-- 渲染所有缩略图 -->
  <el-scrollbar id="pdfPageList" ref="pdfPageList" height="100vh">
    <div
      v-for="(thumbnail, index) in pdfThumbnails"
      :key="index"
      class="relative"
      @click="scrollpage(index + 1)"
    >
      <img class="mx-auto" :src="thumbnail" :alt="'Page ' + (index + 1)" />
      <span class="absolute top-5 w-6 h-6 text-center">{{ index + 1 }}</span>
    </div>
  </el-scrollbar>
</template>

<script setup>
import { inject } from 'vue'

const pdfSetting = inject('pdfSetting')
const pdfCurrentPage = inject('pdfCurrentPage')
const pdfTotalPages = inject('pdfTotalPages')
const pdfThumbnails = inject('pdfThumbnails')
const scrollpage = inject('scrollpage')
const renderAllPages = inject('renderAllPages')
</script>

<style scoped>
.numPages {
  border-bottom: 1px solid var(--el-color-success);
  @apply md:columns-1;
  @apply py-3 2xl:px-3 2xl:columns-2;
  .el-input-number {
    display: block;
    margin: auto;
    border-color: var(--el-color-success);
  }
  .el-input-number:last-child {
    @apply md:mt-2 2xl:mt-0.5;
  }
}
#pdfPageList {
  @apply p-1 h-full;
  div:last-child {
    @apply mb-12;
  }
  div {
    @apply py-5 px-4 cursor-pointer ease-in-out transition-all duration-100;
    @apply hover:bg-lime-300 hover:bg-opacity-50;

    span {
      background-color: var(--el-color-success);
      @apply 2xl:left-14;
    }

    img {
      border: 1px solid var(--el-color-success);
    }
  }
}

.el-input-number[data-type='1'] {
  max-width: 120px !important;
}

.el-input-number[data-type='2'] {
  width: 75px !important;
}
input {
  background-color: #b83333 !important;
}
.el-input__wrapper {
  background-color: var(--el-color-success) !important;
}
</style>
