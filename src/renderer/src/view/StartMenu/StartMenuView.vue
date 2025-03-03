<script setup>
import { onMounted, ref } from 'vue'
import er from '../../../../../resources/setting/projects.json'
import router from '../../router/router'
import axios from 'axios'
import {windowCreate} from "../../js/plugin"
import { ElMessage, ElMessageBox } from 'element-plus'

const dialogVisible = ref(false)
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

function openFile(item,key) {

  er[key].lastOpenTime = new Date().toLocaleString()
  console.log(er)
  const params = new URLSearchParams();
  params.append('data', JSON.stringify(er));
  window.localStorage.setItem('it', JSON.stringify(er[key]))
  windowCreate({'title':item.projectName})

  // axios.get('/api?',{params}).then(()=>{
  //
  // })

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
  router.push('/newProjectWindow/?flag=' + flag + '&type=' + type)
}
function openChoose(){

}
function opEdit(item, key) {
  console.log(item.settingPath)
  router.push('/newProjectWindow/?flag=' + false + '&&setting=' + item.settingPath + '&&key=' + key)
}
function delProject(item, key) {
  ElMessageBox.confirm(
    '确定要永久删除改项目吗?',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      draggable: true,
    }
  )
    .then(() => {
      const params = new URLSearchParams
      er.splice(key, 1)
      params.append('flag', '2')
      params.append('data', JSON.stringify(er))
      axios.get('/api?',{params:params}).then((res)=>{
      })
      const params2 = new URLSearchParams
      params2.append('flag', '7')
      params2.append('data', item.settingPath)
      axios.get('/api?',{params:params2}).then((res)=>{
      })
      ElMessage({
        type: 'success',
        message: '删除成功',
      })
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '取消删除',
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
      <el-button class="topBtn" @click="openNewProjectWindow(true,'xj')">新建项目</el-button>
      <el-button class="topBtn" @click="openNewProjectWindow(false,'dr')">导入</el-button>
    </div>
    <div class="body">
      <div v-for="(item, key) in projects" :key class="bodyList" @dblclick="openFile(item, key)">
        <div style="padding: 5px">
          <ul>
            <li>
              项目名称:  <span :key style="user-select: none">{{ item.projectName }}</span>
            </li>
            <li>
              文件地址:  <span style="user-select: none">{{ item.path }}</span>
               <span style="user-select: none;position: absolute;right: 45px">最新编辑时间:{{ item.lastOpenTime }}</span>
            </li>

          </ul>
          <div style="position: absolute; right: 20px; margin-top: -35px" class="omitDiv">
            <el-popover popper-class="pop" placement="bottom" trigger="click">
              <div><el-button style="width: 130px" @click="opEdit(item, key)">编辑</el-button>

              </div><div> <el-button style="width: 130px" @click="delProject(item, key)">删除</el-button></div>
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
  background-color: #263238;
  color: white;
  padding: 4px;
  margin: 4px;

}
.bodyList :hover {
  background-color: #314549;
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

  top: 3px;
  z-index: 2;
}

.omitDiv:active{

  border-radius: 3px;
  background-color: #425b67;
}
.omit:active{
  background-color: #425b67;
}
.all {
  background-color: #263238;
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.topSelect {
  width: 70%;
  margin: 10px;
  background: #263238;
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
