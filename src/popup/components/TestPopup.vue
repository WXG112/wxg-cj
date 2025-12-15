<template>
  <div style="width: 600px; height: 200px;">
    <el-row>
      <el-text type="warn">获取tapd、禅道提bug页面,禅道登录页面的数据，华为IAM登录，api登录，jenkins登录等自动回填（每次刷新或加载页面时）</el-text>
    </el-row>
    <el-row>
      <el-button type="primary" @click="firstStep">1、抓取页面已填的内容，开启回填</el-button>
      <el-button type="primary" @click="secondStep">2、结束回填</el-button>
    </el-row>
    <el-divider>这是一条分割线</el-divider>
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

       <el-divider>Windows控制</el-divider>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted,watch } from 'vue'
import { MyAction, MyStorageKey } from '@/utils/actionEnums.js';
import { ElMessage } from 'element-plus';
// 原有功能变量
const checked = ref(true)
const checkedJxWeb = ref(true)







// 原有功能：开机启动URL设置
const handleChange = async () => {
  await chrome.storage.sync.set({ [MyStorageKey.startUpUrl]: checked.value });
};

// 原有功能：觉晓web用户信息面板设置
const handleChangeJxWeb = async () => {
  await chrome.storage.sync.set({ [MyStorageKey.JxWebUserInfo]: checkedJxWeb.value });
};

// 原有功能：接收content script消息
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === MyAction.finished) {
    alert("获取完成");
  }
  return true;
});

// 原有功能：页面挂载初始化
onMounted(async () => {
  // 初始化开机启动配置
  const startUpUrl = await chrome.storage.sync.get(MyStorageKey.startUpUrl);
  const JxWebUserInfo = await chrome.storage.sync.get(MyStorageKey.JxWebUserInfo);
  
  checked.value = startUpUrl.startUpUrl !== false;
  checkedJxWeb.value = JxWebUserInfo.JxWebUserInfo !== false;



});


// 原有功能：1、抓取页面内容开启回填
const firstStep = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: MyAction.fetchInfo }, async function (response: any) {
      // 原有逻辑保留
    });
  });
};

// 原有功能：2、结束回填
const secondStep = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: MyAction.showDialog }, function (response: any) {
      // 原有逻辑保留
    });
  });
  window.close();
};



</script>

<style scoped lang='scss'>
.proxy-container {
  width: 500px;
  padding: 15px;
}
.el-row {
  margin-bottom: 15px;
}
</style>