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
        <el-table-column prop="content" :sort-method="sortText" label="文本" />
        <el-table-column label="页码">
          <template #default="pages">
            <span v-for="(page, pageIndex) in pages.row.pdfPage" :key="pageIndex">
              <el-link
                class="tablePageLink"
                type="success"
                link
                size="Default"
                @click="scrollpage(parseInt(page))"
                >{{ page }}</el-link
              >
              <span v-if="pageIndex !== pages.row.pdfPage.length - 1">,</span>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="选项">
          <template #default="scope">
            <el-button-group>
              <el-button link type="primary" size="small" @click.prevent="editRow(scope)">
                编辑
              </el-button>
              <el-button link type="danger" size="small">
                <el-popconfirm
                  title="你确定要删除吗?"
                  confirm-button-type="danger"
                  @confirm="deleteRow(index, scope.$index)"
                >
                  <template #reference> 删除 </template>
                </el-popconfirm>
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </el-collapse-item>
  </el-collapse>
  <EditDialog />
</template>

<script setup>
import { inject, watch, ref, provide } from 'vue'
import EditDialog from '@renderer/components/Dialog/EditDialog.vue'

const pdfIndexData = inject('pdfIndexData')
const removeTextHightLight = inject('removeTextHightLight')
const sortText = inject('sortText')
const pdfIndexTable = inject('pdfIndexTable')
const pdfsetting = inject('pdfSetting')
const scrollpage = inject('scrollpage')
const editDialogVisible = inject('editDialogVisible')
const indexTableRowData = ref()

provide('indexTableRowData', indexTableRowData)

let tableInstance

const updateTable = (tableData, index) => {
  // console.log(Object.keys(pdfIndexData.value))
  // console.log('tableData', tableData, ref)

  // console.log(pdfIndexTable.value[0])
  // console.log('当前表格索引:', index)
  // console.log('当前表格数据:', tableData)
  // console.log('当前表格index:', index)
  pdfIndexTable.value[index]
  // 通过 ref 获取表格实例

  if (tableInstance) {
    console.log('表格实例:', tableInstance)
    // 获取当前表格的选中行
    const selectedRows = tableInstance.getSelectionRows()
    // tableInstance.toggleRowSelection(selectedRows, true)
    console.log('选中行:', selectedRows)
  }
}

const deleteRow = (dataName, scope) => {
  // console.log('dataName', dataName)
  // console.log('index.store', scope)
  // console.log('index.row', index.row)
  // console.log('index.$index', index.$index)

  removeTextHightLight(pdfIndexData.value.indexData[dataName].data[scope].content)
  // 删除数据
  pdfIndexData.value.indexData[dataName].data.splice(scope, 1)
}

const editRow = (scope) => {
  editDialogVisible.value = true
  console.log(scope)

  indexTableRowData.value = scope
}
</script>

<style scoped>
.el-collapse-item {
  border-bottom: 1px solid var(--el-color-success) !important;
  padding: 0.5px 0.75rem;
}
.el-button + .el-button {
  margin-left: 0px;
}
.tablePageLink {
  @apply px-1 text-black hover:text-lime-500;
}
</style>
