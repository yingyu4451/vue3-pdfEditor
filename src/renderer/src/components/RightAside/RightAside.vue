<template>
  <el-collapse :accordion="false" @change="">
    <el-collapse-item
      v-for="(item, index) in pdfPaperContentIndexData"
      :key="index"
      :title="item.name"
      :name="item.name"
      class="px-2"
    >
      <!-- content -->
      <div v-for="(data, index) in item.data" :key="index">
        {{ data.content }} - {{ data.pdfPage }}
      </div>
    </el-collapse-item>
  </el-collapse>
</template>

<script setup lang="ts">
import { inject } from 'vue'

const pdfPaperContentIndexData = inject('pdfPaperContentIndexData')
</script>

<style scoped>
.el-collapse-item{
  border-bottom: 1px solid var(--el-color-success) !important;
}
</style>
