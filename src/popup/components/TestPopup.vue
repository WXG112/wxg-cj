<template>
  <div style="width: 600px; height: 200px;" >

    <el-row>
      <el-text type="warn">获取tapd、禅道提bug页面,禅道登录页面的数据，华为IAM登录，api登录，jenkins登录等自动回填（每次刷新或加载页面时）</el-text>
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
        <el-divider>这是一条分割线
    </el-divider>
        <!-- 新增代理控制区域 -->
    <el-divider>系统代理控制</el-divider>
    <el-row>
      <el-switch 
        v-model="proxyEnabled" 
        active-text="代理已开启" 
        inactive-text="代理已关闭"
        @change="handleProxyChange"
      />
      <el-button 
        type="primary" 
        style="margin-left: 10px;"
        @click="showProxyConfigDialog = true"
        :disabled="!proxyEnabled"
      >
        配置代理
      </el-button>
    </el-row>

    <!-- 代理配置弹窗 -->
    <el-dialog 
      v-model="showProxyConfigDialog" 
      title="设置系统代理" 
      width="300px"
    >
      <el-form :model="proxyForm" label-width="80px">
        <el-form-item label="IP地址">
          <el-input v-model="proxyForm.host" placeholder="例如：127.0.0.1"></el-input>
        </el-form-item>
        <el-form-item label="端口号">
          <el-input v-model="proxyForm.port" type="number" placeholder="例如：8080"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showProxyConfigDialog = false">取消</el-button>
        <el-button type="primary" @click="saveProxyConfig">确认保存</el-button>
      </template>
    </el-dialog>

  </div>
 

</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { MyAction,MyStorageKey } from '@/utils/actionEnums.js';
import { waitForElementToDisplay } from '@/utils/common.js'
import { enableSystemProxy, disableSystemProxy, getProxyStatus } from '@/utils/systemProxyUtil.ts';

const checked = ref(true)
const checkedJxWeb=ref(true)

// 新增代理相关状态
const proxyEnabled = ref(false);
const showProxyConfigDialog = ref(false);
const proxyForm = ref({
  host: '',
  port: 8080
});

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

    // 代理状态初始化
  proxyEnabled.value = await getProxyStatus();
  const storedProxy = await chrome.storage.sync.get("systemProxy");
  if (storedProxy.systemProxy) {
    proxyForm.value = storedProxy.systemProxy;
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



// 新增代理控制方法
const handleProxyChange = async (enabled: boolean) => {
  if (enabled) {
    if (!proxyForm.value.host || !proxyForm.value.port) {
      showProxyConfigDialog.value = true;
      proxyEnabled.value = false;
      return;
    }
    try {
      await enableSystemProxy(proxyForm.value);
      alert("系统代理已开启");
    } catch (err) {
      alert((err as Error).message);
      proxyEnabled.value = false;
    }
  } else {
    try {
      await disableSystemProxy();
      alert("系统代理已关闭");
    } catch (err) {
      alert((err as Error).message);
      proxyEnabled.value = true;
    }
  }
};

const saveProxyConfig = async () => {
  if (!proxyForm.value.host || !proxyForm.value.port) {
    alert("请填写IP和端口");
    return;
  }
  if (proxyEnabled.value) {
    try {
      await enableSystemProxy(proxyForm.value);
      alert("代理配置已更新");
    } catch (err) {
      alert((err as Error).message);
      return;
    }
  }
  showProxyConfigDialog.value = false;
};









</script>

<style scoped lang='scss'>
.popup-container {
  width: 600px;
  padding: 15px;
}
.el-row {
  margin-bottom: 10px;
}

</style>