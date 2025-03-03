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
          />
        </el-form-item>
        <el-form-item label="参照列表：" size="default">
          <el-tag
            v-for="tag in indexTableRowData.row.chanZhao"
            :key="tag"
            closable
            :disable-transitions="false"
            @close="handleClose(tag)"
          >
            {{ tag }}
          </el-tag>
          <el-input
            v-if="inputVisible"
            ref="InputRef"
            v-model="inputValue"
            class="w-20"
            size="small"
            @keyup.enter="handleInputConfirm"
            @blur="handleInputConfirm"
          />
          <el-button v-else class="button-new-tag" size="small" @click="showInput">
            + New Tag
          </el-button>
        </el-form-item>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="testa"> 确定 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { inject, onMounted, ref, nextTick } from 'vue'

const editDialogVisible = inject('editDialogVisible')
const indexTableRowData = inject('indexTableRowData')
const pdfIndexData = inject('pdfIndexData')
const pdfIndexDataNameList = ref([])
const inputValue = ref('')
const InputRef = ref()
const inputVisible = ref(false)

const testa = () => {
  console.log(pdfIndexData.value.indexData.name)
}

const handleClose = (tag) => {
  indexTableRowData.value.row.chanZhao.splice(indexTableRowData.value.row.chanZhao.indexOf(tag), 1)
}

const showInput = () => {
  inputVisible.value = true
  nextTick(() => {
    InputRef.value.input.focus()
  })
}

const handleInputConfirm = () => {
  if (inputValue.value) {
    indexTableRowData.value.row.chanZhao.push(inputValue.value)
  }
  inputVisible.value = false
  inputValue.value = ''
}

onMounted(() => {
  pdfIndexData.value.indexData.forEach((element) => {
    pdfIndexDataNameList.value.push(element.name)
  })
})
</script>

<style scoped>
.el-segmented {
  --el-segmented-item-selected-color: white;
  --el-segmented-item-selected-bg-color: var(--el-color-success);
}
</style>
