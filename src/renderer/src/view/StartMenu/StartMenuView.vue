<script setup>
import { onMounted, ref } from 'vue'

import router from '../../router/router'
import axios from 'axios'
// import { windowCreate } from '../../js/plugin'
import { ElMessage, ElMessageBox } from 'element-plus'

let er = ref([])
const dialogVisible = ref(false)
const projects = ref()

onMounted(() => {
  load()
})

function load() {
  const baseURL = import.meta.env.PROD ? import.meta.env.PROD_API_URL : '/api'
  let params = new URLSearchParams()
  params.append('flag', '9')
  params.append('data', 'resources/setting/projects.json')
  axios
    .get(baseURL, { params: params })
    .then((res) => {
      er.value = res.data
      console.log(er.value)
      projects.value = er.value.sort(dateData('lastOpenTime', false))
      console.log(projects.value)
    })
    .catch((err) => {})
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

function openFile(item, key) {
  const params = new URLSearchParams()
  params.append('flag', '10')
  params.append('data', encodeURIComponent(item.path))
  axios.get('/api', { params:params}).then((res) => {
    if (res.data) {
      er.value[key].lastOpenTime = new Date().toLocaleString()
      console.log(er.value)
      const params = new URLSearchParams()
      params.append('data', JSON.stringify(er.value))
      window.localStorage.setItem('it', JSON.stringify(er.value[key]))
      // windowCreate({ title: item.projectName })
      window.electron.ipcRenderer.send('openProjectWindow',{ title: item.projectName })
      router.push('/pdf')
    } else {
      ElMessage({
        type: 'error',
        message: '文件不存在'
      })
    }
  })

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

function openNewProjectWindow(flag, type) {
  window.localStorage.setItem('flag', flag)
  window.localStorage.setItem('type', type)
  window.localStorage.setItem('setting', '')
  router.push('/newProjectWindow/?flag=' + flag + '&type=' + type)
}
function openChoose() {}
function opEdit(item, key) {
  window.localStorage.setItem('flag', false)
  window.localStorage.setItem('setting', item.settingPath)
  window.localStorage.setItem('key', key)
  router.push('/newProjectWindow/?flag=' + false + '&&setting=' + item.settingPath + '&&key=' + key)
}
function delProject(item, key) {
  ElMessageBox.confirm('确定要永久删除改项目吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    draggable: true
  })
    .then(() => {
      const baseURL = import.meta.env.PROD ? import.meta.env.PROD_API_URL : '/api'
      const params = new URLSearchParams()
      er.value.splice(key, 1)
      params.append('flag', '2')
      params.append('data', JSON.stringify(er.value))
      axios.get(baseURL, { params: params }).then((res) => {})
      const params2 = new URLSearchParams()
      params2.append('flag', '7')
      params2.append('data', item.settingPath)
      axios
        .get(baseURL, { params: params2 })
        .then((res) => {})
        .catch((err) => {
          console.log(err)
          console.log(err.location)
        })
      ElMessage({
        type: 'success',
        message: '删除成功'
      })
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '取消删除'
      })
    })
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
      <el-button class="topBtn" @click="openNewProjectWindow(true, 'xj')">新建项目</el-button>
      <el-button class="topBtn" @click="openNewProjectWindow(false, 'dr')">导入</el-button>
    </div>
    <div class="body">
      <div v-for="(item, key) in projects" :key class="bodyList" @dblclick="openFile(item, key)">
        <div style="color:black;padding: 5px">
          <ul>
            <li>
              项目名称: <span :key style="color:black;user-select: none">{{ item.projectName }}</span>
            </li>
            <li>
              文件地址: <span style="color:black;user-select: none">{{ item.path }}</span>

              <span style="color:black;user-select: none; position: absolute; right: 45px"
                >最新编辑时间:{{ item.lastOpenTime }}</span
              >
            </li>
          </ul>
          <div style="position: absolute; right: 20px; margin-top: -35px" class="omitDiv">
            <el-popover popper-class="pop" placement="bottom" trigger="click">
              <div><el-button style="width: 130px" @click="opEdit(item, key)">编辑</el-button></div>
              <div>
                <el-button style="width: 130px" @click="delProject(item, key)">删除</el-button>
              </div>
              <template #reference>
                <i class="omit" @click="openChoose"></i>
              </template>
            </el-popover>
          </div>
        </div>
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
  background-color: #f3f3f3;
  color: white;
  padding: 4px;
  margin: 4px;
}
.bodyList :hover {
  background-color: #d3e8f8;
  border-radius: 5px;
}
.bodyList :hover .omit {
  background-image: url('../../../../../resources/png/StartMenuView/omit.png');
  background-size: 18px;
  display: inline-block;
  height: 20px;
  width: 20px;
  background-repeat: no-repeat;
  position: relative;
  color: #546e7a;
  top: 3px;
  z-index: 2;
}

.omitDiv:active {
  border-radius: 3px;
  background-color: #425b67;
}
.omit:active {
  background-color: #425b67;
}
.all {
  background-color: #f3f3f3;
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.topSelect {
  width: 70%;
  margin: 10px;
  background: #f3f3f3;
  border-radius: 5px;
  border: 1px solid #425b67;
  height: 38px;
}
.topSelect:focus {
  outline: 2px solid #009688;
  color: white;
}

.topBtn {
  margin-left: 10px;
  background-color: #d9d9d9;
  color: #607d8b;
  border: 1px solid #d9d9d9;
}

.topBtn:hover,
.topBtn:focus {
  background: #b7c5cf;
  border-color: #b7c5cf;
  color: white;
}
</style>
