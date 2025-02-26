<template>
  <el-collapse :accordion="false">
    <el-collapse-item
      v-for="(item, index) in pdfIndexData.indexData"
      :key="index"
      :title="item.title"
      :name="item.name"
    >
      <!-- content -->
      <el-table
        ref="pdfIndexTable"
        :data="item.data"
        stripe
        style="width: 100%"
        size="small"
        @sort-change="updateTable(item[index], index)"
      >
        <el-table-column prop="content" sortable :sort-method="sortText" label="文本" />
        <el-table-column prop="pdfPage" label="页码" />
        <!-- <el-table-column label="高亮">
          <template #default="scope">
            <el-checkbox v-model="item.highlight">{{ item.highlight }}</el-checkbox>
          </template>
        </el-table-column> -->
        <el-table-column fixed="right" label="选项">
          <template #default="scope">
            <el-button-group>
              <el-button link type="primary" size="small" @click.prevent="edit(scope.$index)">
                编辑
              </el-button>
              <el-button link type="danger" size="small" @click.prevent="deleteRow(index, scope)">
                删除
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </el-collapse-item>
  </el-collapse>
</template>
.store
<script setup>
import { inject, watch } from 'vue'

const pdfIndexData = inject('pdfIndexData')
const removeTextHightLight = inject('removeTextHightLight')
const sortText = inject('sortText')
const pdfIndexTable = inject('pdfIndexTable')
const pdfsetting = inject('pdfSetting')

const updateTable = (tableData, index) => {
  // console.log(Object.keys(pdfIndexData.value))
  // console.log('tableData', tableData, ref)

  // console.log(pdfIndexTable.value[0])
  // console.log('当前表格索引:', index)
  // console.log('当前表格数据:', tableData)
  // console.log('当前表格index:', index)

  // 通过 ref 获取表格实例
  const tableInstance = pdfIndexTable.value[index]
  if (tableInstance) {
    console.log('表格实例:', tableInstance)
    // 获取当前表格的选中行
    const selectedRows = tableInstance.getSelectionRows()
    // tableInstance.toggleRowSelection(selectedRows, true)
    console.log('选中行:', selectedRows)
  }
}

const callRemoveTextHightLight = (content) => {
  removeTextHightLight(content)
}

const deleteRow = (dataName, index) => {
  console.log('dataName', dataName)
  console.log('index.store', index.store)
  console.log('index.row', index.row)
  console.log('index.$index', index.$index)

  // callRemoveTextHightLight(pdfIndexData.value[dataName].data[index].content)
  // pdfIndexData.value[dataName].data.splice(index, 1)
}
</script>

<style scoped>
.el-collapse-item {
  border-bottom: 1px solid var(--el-color-success) !important;
  padding: 0.5px 0.75rem;
}
</style>
