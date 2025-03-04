<template>
  <div>
    <el-dialog
      v-model="editDialogVisible"
      title="编辑"
      width="30%"
      center
      draggable
      @close="editDialogVisible = false"
    >
      <div>
        <el-form-item label="数据类型：" size="default">
          <el-segmented
            v-model="indexTableRowData.row.type"
            :options="pdfIndexDataNameList"
            size="default"
          >
            <template #default="scope">
              <div>
                <div>{{ scope.item.label }}</div>
              </div>
            </template>
          </el-segmented>
        </el-form-item>
        <!-- <el-form-item label="参照列表：" size="default">
        </el-form-item> -->
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="editDialogVisible = false"> 确定 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { inject, onMounted, ref } from 'vue'

const editDialogVisible = inject('editDialogVisible')
const pdfIndexData = inject('pdfIndexData')
const pdfIndexDataNameList = ref([])

onMounted(() => {
  pdfIndexData.value.indexData.forEach((element) => {
    pdfIndexDataNameList.value.push({ label: element.title, value: element.name })
  })
})
</script>

<style scoped>
.el-segmented {
  --el-segmented-item-selected-color: white;
  --el-segmented-item-selected-bg-color: var(--el-color-success);
}
</style>
