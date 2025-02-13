<template>
  <div class="numPages">
    <el-row :gutter="20">
      <el-col :span="14" :offset="0">
        <el-input-number
          v-model="pdfCurrentPage"
          :value="pdfCurrentPage"
          size="small"
          :min="1"
          :max="pdfTotalPages || 2"
          :step="1"
          :precision="0"
          :controls="false"
          class=""
          data-type="1"
          @change=""
        >
          <template #suffix>
            <span>页 / {{ pdfTotalPages }} 页</span>
          </template>
        </el-input-number>
      </el-col>
      <el-col :span="10" :offset="0">
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
          @change="$emit('scaleChange', pdfCurrentPage)"
        >
          <template #suffix>
            <span>%</span>
          </template>
        </el-input-number>
      </el-col>
    </el-row>
  </div>
  <!-- 渲染所有缩略图 -->
  <el-scrollbar id="pdfPageList" ref="pdfPageList" max-height="100vh">
    <div
      v-for="(thumbnail, index) in pdfThumbnails"
      :key="index"
      class="relative"
      @click="$emit('thumbnailClick', index + 1)"
    >
      <img class="mx-auto" :src="thumbnail" :alt="'Page ' + (index + 1)" />
      <span class="absolute top-0 w-6 h-6 text-center">{{ index + 1 }}</span>
    </div>
  </el-scrollbar>
</template>

<script setup lang="ts">
import { inject } from 'vue'

const pdfSetting = inject('pdfSetting')
const pdfCurrentPage = inject('pdfCurrentPage')
const pdfTotalPages = inject('pdfTotalPages')
const pdfThumbnails = inject('pdfThumbnails')
</script>

<style scoped>
.numPages {
  border-bottom: 1px solid var(--el-color-success);
  @apply py-2 px-3;
}
#pdfPageList {
  @apply p-1 h-full ;
  div {
    @apply py-5 cursor-pointer ease-in-out transition-all duration-100;
    @apply hover:bg-lime-300 hover:bg-opacity-50;
    span {
      background-color: var(--el-color-success);
      top: 20px;
      left: 21px;
    }
    img {
      border: 1px solid var(--el-color-success);
    }
  }
  div:last-of-type {
    @apply mb-28;
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
