<template>
  <el-dialog
    v-model="dialogVisible"
    title="导入词表"
    width="40%"
    center
    draggable
    @close="dialogVisible = false"
  >
    <el-collapse v-model="activeNames">
      <el-collapse-item
        v-for="(cibiaoList, cibiaoListIndex) in ciBiaoData"
        :key="cibiaoListIndex"
        :name="cibiaoListIndex"
        :title="cibiaoList.fileName"
      >
        <!-- content -->
        <div>
          <el-checkbox
            v-model="allCiBiaoCheckBox"
            label="全选"
            :indeterminate="false"
            @change="selectAllciBiao"
          ></el-checkbox>
          <el-checkbox
            v-model="isChuangXin"
            label="添加为创新词汇"
            :indeterminate="false"
          ></el-checkbox>
        </div>
        <el-check-tag
          v-for="(ciBiaoitems, ciBiaoitemsIndex) in cibiaoList.fileData"
          class="mx-1"
          :key="ciBiaoitemsIndex"
          :checked="ciBiaocheckedList[cibiaoListIndex]?.index[ciBiaoitemsIndex] || false"
          type="success"
          @change="onciBiaocheckedChange(cibiaoListIndex, ciBiaoitemsIndex)"
        >
          {{ ciBiaoitems }}
        </el-check-tag>
      </el-collapse-item>
    </el-collapse>

    <template #footer>
      <el-button type="primary" @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="callAddItem">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue'

const ciBiaoData = inject('ciBiaoData')
const hightLightText = inject('hightLightText')
const pdfIndexData = inject('pdfIndexData')
const pdfPageList = inject('pdfPageList')
const dialogVisible = ref(false)
const activeNames = ref()
const ciBiaocheckedList = ref([])
const allCiBiaoCheckBox = ref(false)
const isChuangXin = ref(false)

function initData() {
  ciBiaocheckedList.value = []
  allCiBiaoCheckBox.value = false
  isChuangXin.value = false
}

function openDialog() {
  dialogVisible.value = true
  initData()
}

function closeDialog() {
  dialogVisible.value = false
  initData()
}

function onciBiaocheckedChange(listIndex, itemIndex) {
  console.log('Checkbox changed:', listIndex, itemIndex)
  if (!ciBiaocheckedList.value[listIndex]) {
    ciBiaocheckedList.value[listIndex] = { index: [] }
    ciBiaoData.value[listIndex].fileData.forEach((element, elementIndex) => {
      ciBiaocheckedList.value[listIndex].index[elementIndex] = false
    })
  }
  ciBiaocheckedList.value[listIndex].index[itemIndex] =
    !ciBiaocheckedList.value[listIndex].index[itemIndex]
  console.log('Checked list:', ciBiaocheckedList.value)
}

function selectAllciBiao() {
  console.log('selectAllciBiao')
  ciBiaoData.value.forEach((element, index) => {
    if (!ciBiaocheckedList.value[index]) {
      ciBiaocheckedList.value[index] = { index: [] }
      element.fileData.forEach((item, itemIndex) => {
        ciBiaocheckedList.value[index].index[itemIndex] =
          !ciBiaocheckedList.value[index].index[itemIndex]
      })
    } else {
      element.fileData.forEach((item, itemIndex) => {
        ciBiaocheckedList.value[index].index[itemIndex] =
          !ciBiaocheckedList.value[index].index[itemIndex]
      })
    }
  })
}

function callAddItem() {
  console.log('callAddItem')
  ciBiaocheckedList.value.forEach((element, index) => {
    if (element.index) {
      element.index.forEach((item, itemIndex) => {
        if (item) {
          hightLightText(ciBiaoData.value[index].fileData[itemIndex])
          const addIndex = isChuangXin.value ? 1 : 0
          pdfIndexData.value.indexData[addIndex].data.push({
            pdfPage: pdfPageList.value,
            content: ciBiaoData.value[index].fileData[itemIndex],
            highlight: false,
            type: 'biaoMu',
            canZhao: []
          })
        }
      })
    }
  })
  closeDialog()
}
defineExpose({
  openDialog,
  closeDialog
})

onMounted(() => {})
</script>

<style scoped>
:deep(.el-collapse-item__content) {
  @apply pt-1;
}
:deep(.el-check-tag) {
  @apply border border-gray-400;
}
:deep(.el-check-tag.is-checked) {
  border-color: var(--el-color-success) !important;
}
</style>
