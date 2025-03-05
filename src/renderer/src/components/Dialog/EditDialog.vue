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
        <el-form label-position="right" label-width="130px" size="default">
          <el-form-item label="数据类型：" size="default">
            <el-segmented
              v-model="indexTableRowData.row.type"
              :options="pdfIndexDataNameList"
              size="default"
              @change="changeType"
            >
              <template #default="scope">
                <div>
                  <div>{{ scope.item.label }}</div>
                </div>
              </template>
            </el-segmented>
          </el-form-item>
          <el-form-item label="注释：" size="default">
            <el-input
              v-model="indexTableRowData.row.zhuShi"
              size="default"
              label=""
              maxlength="50px"
              placeholder=""
              @change="changeZhuShi"
            >
            </el-input>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <!-- <el-button @click="editDialogVisible = false">取消</el-button> -->
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
const indexTableRowData = inject('indexTableRowData')
const pdfIndexDataNameList = ref([])

const changeZhuShi = () => {
  if (indexTableRowData.value.row.zhuShi.trim() != '') {
    indexTableRowData.value.row.hasZhuShi = true
  }
}

const changeType = (val) => {
  if (val == 'chuangXin') {
    // console.log(pdfIndexData.value.indexData[1].data);

    pdfIndexData.value.indexData[1].data.push(indexTableRowData.value.row)
  } else {
    if (pdfIndexData.value.indexData[1].length != 0) {
      console.log(pdfIndexData.value.indexData[1].data);

      pdfIndexData.value.indexData[1].data.forEach((element, index) => {
        if (indexTableRowData.value.row.content == element.content) {
          // console.log('element',element)
          // console.log('indexTableRowData.value.row',indexTableRowData.value.row.content)

          pdfIndexData.value.indexData[1].data.splice(index, 1)
        }
      })
    }
  }
}

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
