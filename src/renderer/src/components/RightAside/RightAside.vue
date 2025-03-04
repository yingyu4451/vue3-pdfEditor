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
        <!-- 高亮 -->
        <el-table-column
          v-if="item.name == 'biaoMu' || item.name == 'chuangXin'"
          width="40px"
          label="高亮"
          header-align="center"
          align="center"
        >
          <template #default="HighLightScope">
            <el-checkbox
              v-model="HighLightScope.row.highlight"
              :indeterminate="false"
              @change="changeHighLight(HighLightScope)"
            ></el-checkbox>
          </template>
        </el-table-column>
        <!-- 文本 -->
        <el-table-column
          v-if="item.name == 'biaoMu' || item.name == 'chuangXin'"
          prop="content"
          :sort-method="sortText"
          label="文本"
        />
        <!-- 页码 -->
        <el-table-column v-if="item.name == 'biaoMu' || item.name == 'chuangXin'" label="页码">
          <template #default="pageScope">
            <span
              v-for="(page, pageIndex) in pageScope.row.pdfPage"
              :key="pageIndex"
              class="text-nowrap"
            >
              <el-link
                class="tablePageLink"
                type="success"
                link
                size="Default"
                @click="scrollpage(parseInt(page))"
                >{{ page }}</el-link
              >
              <span v-if="pageIndex !== pageScope.row.pdfPage.length - 1">,</span>
            </span>
          </template>
        </el-table-column>
        <!-- 参照 -->
        <el-table-column v-if="item.name == 'biaoMu' || item.name == 'chuangXin'" label="参照">
          <template #default="canZhaoScope">
            <el-tag
              v-for="tag in canZhaoScope.row.canZhao"
              :key="tag"
              closable
              type="success"
              :disable-transitions="false"
              @close="handleClose(canZhaoScope, tag)"
            >
              {{ tag }}
            </el-tag>
            <el-input
              v-if="
                tagList[canZhaoScope.$index].editing &
                (tagList[canZhaoScope.$index].index == canZhaoScope.$index)
              "
              ref="InputRef"
              v-model="inputValue"
              size="small"
              @keyup.enter="handleInputConfirm(canZhaoScope)"
              @blur="handleInputConfirm(canZhaoScope)"
            />
            <el-button
              v-if="!tagList[canZhaoScope.$index].editing & (canZhaoScope.row.canZhao.length == 0)"
              class="button-new-tag"
              size="small"
              @click="showInput(canZhaoScope)"
            >
              添加参照
            </el-button>
          </template>
        </el-table-column>
        <!-- 选项 -->
        <el-table-column v-if="item.name == 'biaoMu' || item.name == 'chuangXin'" label="选项">
          <template #default="optionScope">
            <el-button-group>
              <el-button link type="primary" size="small" @click.prevent="editRow(optionScope)">
                编辑
              </el-button>
              <el-button link type="danger" size="small">
                <el-popconfirm
                  title="你确定要删除吗?"
                  confirm-button-type="danger"
                  confirm-button-text="删除"
                  cancel-button-text="取消"
                  @confirm="deleteRow(index, optionScope)"
                >
                  <template #reference> 删除 </template>
                </el-popconfirm>
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
        <!-- 参照表格 -->
        <!-- <el-table-column
          v-if="item.name == 'canZhao'"
          prop="canZhao"
          :sort-method="sortText"
          label="文本"
        />
        <el-table-column
          v-if="item.name == 'canZhao'"
          prop="content"
          :sort-method="sortText"
          label="见"
        /> -->
      </el-table>
    </el-collapse-item>
  </el-collapse>
  <EditDialog />
</template>

<script setup>
import { inject, ref, watch } from 'vue'
import EditDialog from '@renderer/components/Dialog/EditDialog.vue'

const pdfIndexData = inject('pdfIndexData')
const removeTextHightLight = inject('removeTextHightLight')
const hightLightText = inject('hightLightText')
const sortText = inject('sortText')
const pdfIndexTable = inject('pdfIndexTable')
const pdfsetting = inject('pdfSetting')
const scrollpage = inject('scrollpage')
const editDialogVisible = inject('editDialogVisible')
const inputValue = ref('')
const InputRef = ref()
const tagList = ref([])
// const inputVisible = ref({
//   action: false,
//   index: null
// })
let tableInstance

const handleClose = (scope, tag) => {
  console.log(scope)

  scope.row.canZhao.splice(scope.row.canZhao.indexOf(tag), 1)
}

const showInput = (scope) => {
  tagList.value[scope.$index].editing = true
}

const handleInputConfirm = (scope) => {
  if (inputValue.value) {
    scope.row.canZhao.push(inputValue.value)
  }
  tagList.value[scope.$index].editing = false
  inputValue.value = ''
}

const changeHighLight = (scope) => {
  if (scope.row.highlight & pdfsetting.value.showHighlight) {
    hightLightText(scope.row.content)
  } else {
    removeTextHightLight(scope.row.content)
  }
}

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

  if (
    (dataName == 0) &
    (pdfIndexData.value.indexData[dataName].data[scope.$index].type == 'chuangXin')
  ) {
    removeTextHightLight(pdfIndexData.value.indexData[1].data[scope.$index].content)
    // 删除数据
    pdfIndexData.value.indexData[1].data.splice(scope.$index, 1)
  }

  if (
    (dataName == 1) &
    (pdfIndexData.value.indexData[dataName].data[scope.$index].type == 'chuangXin')
  ) {
    removeTextHightLight(pdfIndexData.value.indexData[0].data[scope.$index].content)
    // 删除数据
    pdfIndexData.value.indexData[0].data.splice(scope.$index, 1)
  }
  removeTextHightLight(pdfIndexData.value.indexData[dataName].data[scope.$index].content)
  // 删除数据
  pdfIndexData.value.indexData[dataName].data.splice(scope.$index, 1)
}

const editRow = (scope) => {
  editDialogVisible.value = true
  console.log(scope)

  indexTableRowData.value = scope
}

watch(pdfIndexData.value, (newVal) => {
  tagList.value = []
  console.log(newVal.indexData[0])

  if (newVal.indexData[0].data != 0) {
    newVal.indexData[0].data.forEach((element, index) => {
      if (element) {
        tagList.value.push({
          editing: false,
          index: index
        })
      }
    })
  }
})
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
