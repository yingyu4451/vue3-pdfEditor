<script setup>
import { onMounted, ref } from 'vue'
import er from '../../../../../resources/setting/projects.json'
import axios from 'axios'
import router from '../../router/router'

const name = ref('')
const projects = ref()
const filePath = ref('')
const remark = ref('')
const projectCreatePerson = ref('')
const latestEditors=ref('')
const flag = ref(new URL(window.location.href.replace('/#', '')).searchParams.get('flag'))
const set = ref(new URL(window.location.href.replace('/#', '')).searchParams.get('setting'))
const key = ref(new URL(window.location.href.replace('/#', '')).searchParams.get('key'))
const createTime = ref('')
const setingPath = ref('')
const lastOpenTime = ref('')

function selectFile(flag1) {
  const input = document.createElement('input')
  input.type = 'file'
  // input.accept = '.pdf'


  input.click()
  console.log(flag1)

  input.onchange = function () {
    const file = input.files[0]
    if (flag1) {

        filePath.value = file.path
      console.log(input.value)

    }else {
      console.log(2)
      setingPath.value=file.path
      console.log(input)
      const params = new URLSearchParams();
      params.append('flag', '1');
      params.append('data', setingPath.value);
      axios.get('/api?',{params}).then((data)=>{
        console.log(data.data)
        // router.back()
        filePath.value=data.data.path
        name.value=data.data.projectName
        latestEditors.value=data.data.latestEditors
        remark.value=data.data.remark
        createTime.value=data.data.createTime
        projectCreatePerson.value=data.data.projectCreatePerson
        setingPath.value=data.data.settingPath
        lastOpenTime.value=data.data.lastOpenTime
      })
    }

    console.log('选择的文件：' + input.value)
  }
}
function newProject(edit) {
  latestEditors.value=projectCreatePerson.value
  const params = new URLSearchParams();
  if (edit && !flag){
    //编辑
    let obj ={
      projectName: name.value,
      path: filePath.value,
      lastOpenTime: lastOpenTime.value,
      remark: remark.value,
      projectCreatePerson: projectCreatePerson.value,
      createTime: createTime.value,
      latestEditors: latestEditors.value,
      settingPath: setingPath.value
    }
    console.log(obj)
    console.log(er[key.value])
    er.splice(key.value, 1, obj)
    console.log(er)
    params.append('data', JSON.stringify(er))
    params.append('flag', '4')
    params.append('key', key.value)
  }else {
    //新建项目
    if(flag.value){
      setingPath.value=filePath.value.toString().substring(0,filePath.value.toString().lastIndexOf("\\")+1)+name.value+'.json'
      er.push({
        projectName: name.value,
        path: filePath.value,
        lastOpenTime: new Date().toLocaleString(),
        remark: remark.value,
        projectCreatePerson: projectCreatePerson.value,
        createTime: new Date().toLocaleString(),
        latestEditors: latestEditors.value,
        settingPath: setingPath.value
      })
      params.append('flag', '3');
      params.append('data', JSON.stringify(er));
    } else {
      //导入项目
      er.push({
        projectName: name.value,
        path: filePath.value,
        lastOpenTime: lastOpenTime.value,
        remark: remark.value,
        projectCreatePerson: projectCreatePerson.value,
        createTime: createTime.value,
        latestEditors: latestEditors.value,
        settingPath: setingPath.value
      })
      params.append('flag', '2');
      params.append('data', JSON.stringify(er));
    }
  }

  console.log(JSON.stringify(er))
  axios.get('/api?',{params}).then(()=>{
    router.back()
  })
}
onMounted(() => {
  projects.value = er.sort(dateData('lastOpenTime', false))
  console.log(projects)
  if(JSON.parse(flag.value)===true) {
   flag.value = true
  }else {
    flag.value = false
   setingPath.value=set.value
    const params = new URLSearchParams();
    params.append('flag', '1');
    params.append('data', setingPath.value);
    axios.get('/api?',{params}).then((data)=>{
      console.log(data.data)
      // router.back()
      filePath.value=data.data.path
      name.value=data.data.projectName
      latestEditors.value=data.data.latestEditors
      remark.value=data.data.remark
      createTime.value=data.data.createTime
      projectCreatePerson.value=data.data.projectCreatePerson
      setingPath.value=data.data.settingPath
      lastOpenTime.value=data.data.lastOpenTime
    })
  }
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
      <span v-if="flag" class="inrTxt"
        >项目名称
        <input v-model="name" class="inp" />
      </span>
      <span v-if="!flag" class="inrTxt"
      >配置文件<input v-model="setingPath" class="inp" style="margin-left:15px" />
        <i id="sefile" class="file" @click="selectFile(false)"></i
        ></span>
      <span class="inrTxt"
        >地址<input v-model="filePath" class="inp" style="margin-left: 47px" />
        <i id="sefile" class="file" @click="selectFile(true)"></i
      ></span>
      <span v-if="!flag" class="inrTxt"
      >项目名称
        <input v-model="name" class="inp" />
      </span>
      <span class="inrTxt"
      >创建人<input v-model="projectCreatePerson" class="inp" style="margin-left: 32px" />
       </span>
      <span class="inrTxt"
      >备注<input v-model="remark" class="inp" style="margin-left: 47px" />
       </span>
      <span  v-if="!flag" class="inrTxt"
      >创建时间<input v-model="createTime" class="inp" style="margin-left: 15px" />
       </span>
      <span  v-if="!flag" class="inrTxt"
      >编辑人<input v-model="latestEditors" class="inp" style="margin-left: 32px" />
       </span>
      <span  v-if="!flag" class="inrTxt"
      >编辑时间<input v-model="createTime" class="inp" style="margin-left: 15px" />
       </span>
    </div>
    <div class="footer">
      <el-button v-if="flag" class="footerBtn" @click="newProject">完成</el-button>
      <el-button v-if="!flag && set==null||set===''" class="footerBtn" @click="newProject">导入</el-button>
      <el-button v-if="set !== null && set !== ''" class="footerBtn" @click="newProject(true)"
        >保存</el-button
      >
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
