<template>
  <div style="width: 600px; height: 200px;" >

    <el-row>
      <el-text type="warn">获取tapd、禅道提bug页面,禅道登录页面的数据，华为IAM登录，gitee登录，自动回填（每次刷新或加载页面时）</el-text>
    </el-row>
    <el-row>
      <el-button type="primary" @click="firstStep">1、抓取页面已填的内容，开启回填</el-button>
      <el-button type="primary" @click="secondStep">2、结束回填</el-button>
    </el-row>
    <el-divider>这是一条分割线
    </el-divider>
    <el-row>
      <el-col>
        <el-checkbox v-model="checked" label="在浏览器打开时自动打开测试、禅道（重启生效）等平台" size="large" @change="handleChange" />
      </el-col>
      
    </el-row>
    <el-row>
      <el-col>
        <el-checkbox v-model="checkedJxWeb" label="在觉晓web端打开用户信息面板" size="large" @change="handleChangeJxWeb" />
      </el-col>
      
    </el-row>
  </div>
 

</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { MyAction,MyStorageKey } from '@/utils/actionEnums.js';
import { waitForElementToDisplay } from '@/utils/common.js'

const checked = ref(true)
const checkedJxWeb=ref(true)
const handleChange = async () => {
  if (checked.value == true) {
    await chrome.storage.sync.set({ [MyStorageKey.startUpUrl]: true })
  } else {
    await chrome.storage.sync.set({[MyStorageKey.startUpUrl]: false })
  }


}

const handleChangeJxWeb=async()=>{
  if (checkedJxWeb.value == true) {
    await chrome.storage.sync.set({ [MyStorageKey.JxWebUserInfo]: true })
  } else {
    await chrome.storage.sync.set({[MyStorageKey.JxWebUserInfo]: false })
  }


}





chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  // 接收来自 content script 的消息，并进行处理
  if (message.action === MyAction.finished) {
    alert("获取完成");
  }
});
onMounted(async () => {

  let startUpUrl = await chrome.storage.sync.get(MyStorageKey.startUpUrl)
  let JxWebUserInfo=await chrome.storage.sync.get(MyStorageKey.JxWebUserInfo)

  
  if (startUpUrl.startUpUrl == undefined || startUpUrl.startUpUrl == true) {
    checked.value = true
  } else if (startUpUrl.startUpUrl == false) {
    checked.value = false
  }

  if (JxWebUserInfo.JxWebUserInfo == undefined || JxWebUserInfo.JxWebUserInfo == true) {
    checkedJxWeb.value = true
  } else if (JxWebUserInfo.JxWebUserInfo == false) {
    checkedJxWeb.value = false
  }


})


const firstStep = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action:MyAction.fetchInfo }, async function  (response: any) {
      // 回调函数，把传回的信息渲染在popup.html上
      // console.log("auto_write_start")
      
    })
  })
}
const secondStep = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: MyAction.showDialog }, function (response: any) {
      // 回调函数，把传回的信息渲染在popup.html上
      // console.log("auto_write_start")
    })
  })
  window.close();}

</script>

<style scoped lang='scss'></style>