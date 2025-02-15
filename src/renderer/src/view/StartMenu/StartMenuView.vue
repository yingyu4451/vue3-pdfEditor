<script setup lang="ts">
import { onMounted, ref } from 'vue'
import er from '../../../../../resources/setting/projects.json'
import router from '../../router/router'
import { loginWin } from '../../windows/action.js'

const projects = ref()

onMounted(() => {
  load()
})
function load() {
  projects.value = er.sort(dateData('lastOpenTime', false))
  console.log(projects)
}

// property是你需要排序传入的key,bol为true时是升序，false为降序
function dateData(property, bol) {
  return function (a, b) {
    const value1 = a[property]
    const value2 = b[property]
    if (bol) {
      // 升序
      return Date.parse(value1) - Date.parse(value2)
    } else {
      // 降序
      return Date.parse(value2) - Date.parse(value1)
    }
  }
}

function openFile() {
  router.push('/pdf')
}
// 搜集输入框数据
const inpval = ref('')
// 监听输入框变化的函数
const handleInputChange = () => {
  console.log(inpval.value)
  const zs = projects.value
  projects.value = zs.filter((it) => it.projectName.indexOf(inpval.value) != -1)
  // 如果输入框为空，进行相关的逻辑
  if (inpval.value == '' || inpval.value == null) {
    load()
  }
}

function openNewProjectWindow() {
  // loginWin()
}
</script>
<template>
  <div class="all">
    <router-link to="/test"></router-link>
    <div class="top">
      <input
        v-model="inpval"
        class="topSelect"
        placeholder="请输入内容"
        @input="handleInputChange"
      />
      <el-button class="topBtn" @click="openNewProjectWindow">新建项目</el-button>
      <el-button class="topBtn">打开</el-button>
    </div>
    <div class="body">
      <div v-for="(item, key) in projects" :key class="bodyList" @dblclick="openFile">
        <ul>
          <li>
            <span :key style="user-select: none">{{ item.projectName }}</span>
          </li>
          <li>
            <span style="user-select: none">{{ item.path }}</span>
          </li>
        </ul>
      </div>
    </div>
    <div class="footer"></div>
  </div>
</template>
<style scoped>
.body {
  margin-left: 10px;
}
.bodyList {
  background-color: #263238;
  color: white;
  padding: 4px;
  margin: 4px;
}
.bodyList :hover {
  background-color: #314549;
  border-radius: 5px;
}
.all {
  background-color: #263238;
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.topSelect {
  width: 50%;
  margin: 10px;
  background: #263238;
  border-radius: 5px;
  border: 1px solid #425b67;
  height: 38px;
}
.topSelect:focus {
  outline: 2px solid #009688;
}

.topBtn {
  background-color: #2e3c43;
  color: #607d8b;
  border: 1px solid #2e3c43;
}

.topBtn:hover,
.topBtn:focus {
  background: #384e54;
  border-color: #384e54;
  color: white;
}
</style>
