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

    <el-divider>系统代理控制</el-divider>
    <el-row style="margin: 10px 0;">
      <el-col :span="10">
        <el-input v-model="proxyHost" placeholder="代理IP（如127.0.0.1）"></el-input>
      </el-col>
      <el-col :span="6">
        <el-input v-model="proxyPort" placeholder="端口（如8080）"></el-input>
      </el-col>
      <el-col :span="4">
        <el-button type="success" @click="enableProxy">开启代理</el-button>
      </el-col>
      <el-col :span="4">
        <el-button type="danger" @click="disableProxy">关闭代理</el-button>
      </el-col>
    </el-row>
    <el-alert 
      v-if="proxyMsg" 
      :title="proxyMsg" 
      :type="proxyStatus === 'success' ? 'success' : 'error'" 
      show-icon
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { MyAction, MyStorageKey } from '@/utils/actionEnums.js';
import { waitForElementToDisplay } from '@/utils/common.js'
import { enableSystemProxy, disableSystemProxy, getProxyStatus } from '@/utils/systemProxyUtil.ts';

// 原有功能变量
const checked = ref(true)
const checkedJxWeb = ref(true)

// 代理控制变量（提前初始化，避免未定义访问）
const proxyHost = ref<string>('127.0.0.1');
const proxyPort = ref<string>('8080');
const proxyMsg = ref<string>('');
const proxyStatus = ref<string>('');

// Native Messaging 通信核心函数（适配JSON格式，带错误处理）
const sendProxyCommand = (action: string, host?: string, port?: string) => {
  // 重置响应状态
  proxyStatus.value = '';
  proxyMsg.value = '';

  try {
    // 参数校验
    if (action === 'enable' && (!host || !port)) {
      proxyMsg.value = '代理IP和端口不能为空';
      proxyStatus.value = 'error';
      return;
    }

    // 构建标准JSON指令
    const command = {
      action: action,
      proxyHost: host || '',
      proxyPort: port || ''
    };

    // 连接Native Messaging主机
    const nativePort = chrome.runtime.connectNative('com.example.proxycontrol');

    // 监听返回消息
    nativePort.onMessage.addListener((response: any) => {
      proxyStatus.value = response.status || 'error';
      proxyMsg.value = response.message || '未知响应';
      // 开启代理成功时保存配置到本地
      if (action === 'enable' && response.status === 'success') {
        chrome.storage.sync.set({
          [MyStorageKey.proxyConfig]: { host, port }
        });
      }
    });

    // 监听断开连接（捕获真实错误）
    nativePort.onDisconnect.addListener(() => {
      if (chrome.runtime.lastError) {
        proxyStatus.value = 'error';
        proxyMsg.value = `通信失败：${chrome.runtime.lastError.message}`;
        console.error('Native Messaging断开原因：', chrome.runtime.lastError);
      }
    });

    // 发送指令
    nativePort.postMessage(command);

  } catch (err: any) {
    proxyStatus.value = 'error';
    proxyMsg.value = `执行失败：${err.message || '未知错误'}`;
    console.error('代理操作异常：', err);
  }
};

// 开启代理（修复重复定义问题）
const enableProxy = () => {
  sendProxyCommand('enable', proxyHost.value, proxyPort.value);
};

// 关闭代理
const disableProxy = () => {
  sendProxyCommand('disable');
};

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
});

// 原有功能：页面挂载初始化
onMounted(async () => {
  // 初始化开机启动配置
  const startUpUrl = await chrome.storage.sync.get(MyStorageKey.startUpUrl);
  const JxWebUserInfo = await chrome.storage.sync.get(MyStorageKey.JxWebUserInfo);
  
  checked.value = startUpUrl.startUpUrl !== false;
  checkedJxWeb.value = JxWebUserInfo.JxWebUserInfo !== false;

  // 初始化代理配置
  const savedProxy = await chrome.storage.sync.get(MyStorageKey.proxyConfig);
  if (savedProxy.proxyConfig) {
    proxyHost.value = savedProxy.proxyConfig.host;
    proxyPort.value = savedProxy.proxyConfig.port;
  }
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
.popup-container {
  width: 600px;
  padding: 15px;
}
.el-row {
  margin-bottom: 10px;
}
</style>