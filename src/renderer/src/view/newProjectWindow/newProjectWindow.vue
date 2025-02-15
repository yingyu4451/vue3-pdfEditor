<script setup lang="ts">
import { onMounted, ref } from 'vue'
import er from '../../../../../resources/setting/projects.json'
import axios from 'axios'
import router from '../../router/router'

const name = ref('')
const projects = ref()
const filePath = ref('')

function selectFile() {
  const input = document.createElement('input')
  input.type = 'file'
  // input.accept = '.pdf'
  input.click()
  input.onchange = function () {
    filePath.value = input.value
    console.log('选择的文件：' + input.value)
  }
}
function newProject() {
  er.push({
    projectName: name.value,
    path: filePath.value,
    lastOpenTime: new Date().toLocaleString()
  })

  console.log(JSON.stringify(er))
  const params = new URLSearchParams();
  params.append('data', JSON.stringify(er));
  axios.get('/api?',{params}).then(()=>{
    router.back()
  })
}
onMounted(() => {
  projects.value = er.sort(dateData('lastOpenTime', false))
  console.log(projects)
})
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
</script>
<template>
  <div class="all">
    <div class="top">
      <span class="inrTxt"
        >项目名称
        <input v-model="name" class="inp" />
      </span>
      <span class="inrTxt"
        >地址<input v-model="filePath" class="inp" style="margin-left: 47px" />
        <i id="sefile" class="file" @click="selectFile"></i
      ></span>
    </div>
    <div class="footer">
      <el-button class="footerBtn" @click="newProject">完成</el-button>
      <el-button class="footerBtn" @click="$router.back">取消</el-button>
    </div>
  </div>
</template>

<style scoped>
.footer {
  position: absolute;
  bottom: 10px;
  right: 20px;
}
.footerBtn {
  background-color: #2e3c43;
  color: #607d8b;
  border: 1px solid #2e3c43;
}

.footerBtn:hover,
.footerBtn:focus {
  background: #384e54;
  border-color: #384e54;
  color: white;
}
.all {
  background-color: #263238;
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.inp {
  text-indent: 10px;
  width: 80%;
  margin: 10px;
  background: #263238;
  border-radius: 5px;
  border: 1px solid #425b67;
  height: 38px;
}
.inp:focus {
  outline: 2px solid #009688;
}
.top {
  display: flex;
  flex-direction: column;
  padding: 20px;
}
.inrTxt {
  color: white;
}
.file {
  background-image: url('../../../../../resources/png/newProjectWindow/file.png');
  background-size: 18px;
  display: inline-block;
  height: 20px;
  width: 20px;
  background-repeat: no-repeat;
  position: relative;
  right: 40px;
  top: 7px;
  z-index: 2;
}
</style>
