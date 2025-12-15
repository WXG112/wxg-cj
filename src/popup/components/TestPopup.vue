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

    <!-- 新增代理控制区域 -->
    <el-divider>代理控制</el-divider>
    <el-row style="margin-top: 10px;">
      <el-input v-model="proxyHost" placeholder="代理IP" style="width: 150px; margin-right: 10px;"></el-input>
      <el-input v-model="proxyPort" placeholder="端口" style="width: 100px; margin-right: 10px;"></el-input>
      <el-button type="success" @click="enableProxy">开启代理</el-button>
      <el-button type="danger" @click="disableProxy">关闭代理</el-button>
    </el-row>
    <el-row v-if="proxyMsg" style="margin-top: 10px;">
      <el-text :type="proxyStatus === 'success' ? 'success' : 'error'">
        {{ proxyMsg }}
      </el-text>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { MyAction, MyStorageKey } from '@/utils/actionEnums.js';

// 原有功能变量
const checked = ref(true)
const checkedJxWeb = ref(true)

// 代理控制变量
const proxyHost = ref('')
const proxyPort = ref('')
const proxyStatus = ref('')
const proxyMsg = ref('')

// 核心：通过环境变量传递参数执行固定模板BAT（替换原有executeBat函数）
const executeBat = async (action: string, host?: string, port?: string) => {
  return new Promise((resolve, reject) => {
    // 1. 筛选普通网页标签页（避开chrome://）
    chrome.tabs.query({ 
      active: true, 
      currentWindow: true,
      url: ["http://*/*", "https://*/*"] 
    }, async (tabs) => {
      if (tabs.length === 0) {
        reject(new Error("请先打开普通网页（如百度），再操作代理"));
        return;
      }
      const tabId = tabs[0].id;
      if (!tabId) {
        reject(new Error("未找到有效标签页"));
        return;
      }

      // 2. 在网页中执行脚本，通过环境变量传递参数
      chrome.scripting.executeScript({
        target: { tabId },
        func: (action, host, port) => {
          try {
            // 创建WScript.Shell对象（Windows核心）
            const shell = new ActiveXObject("WScript.Shell");
            
            // 关键：设置进程级环境变量（仅当前执行会话有效）
            const env = shell.Environment("PROCESS");
            env("PROXY_ACTION") = action;
            env("PROXY_HOST") = host || "";
            env("PROXY_PORT") = port || "";

            // 执行固定模板BAT（替换为你的实际路径）
            const batPath = "C:\\Users\\afei\\Desktop\\SCRIPT\\guge_cj\\proxy_template.bat";
            const exec = shell.Exec(`cmd /c "${batPath}"`);

            // 读取BAT执行输出（阻塞直到执行完成）
            let output = "";
            while (!exec.StdOut.AtEndOfStream) {
              output += exec.StdOut.ReadLine() + "\n";
            }
            // 读取错误输出
            let errorOutput = "";
            while (!exec.StdErr.AtEndOfStream) {
              errorOutput += exec.StdErr.ReadLine() + "\n";
            }

            // 解析执行结果
            if (exec.ExitCode === 0) {
              const jsonMatch = output.match(/\{.*\}/);
              if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
              } else {
                return { 
                  status: 'success', 
                  message: `执行成功（无JSON响应）：${output}` 
                };
              }
            } else {
              return { 
                status: 'error', 
                message: `执行失败（退出码：${exec.ExitCode}）：${errorOutput || output}` 
              };
            }
          } catch (e: any) {
            return { 
              status: 'error', 
              message: `脚本执行异常：${e.message}（可能是ActiveX被禁用）` 
            };
          }
        },
        args: [action, host, port] // 传递参数到func函数
      }, (results) => {
        // 处理插件层面的错误
        if (chrome.runtime.lastError) {
          reject(new Error(`插件执行错误：${chrome.runtime.lastError.message}`));
        } else if (results && results[0] && results[0].result) {
          resolve(results[0].result);
        } else {
          reject(new Error("未获取到BAT执行结果"));
        }
      });
    });
  });
};

// 发送代理命令（原有逻辑不变）
const sendProxyCommand = async (action: string, host?: string, port?: string) => {
  proxyStatus.value = '';
  proxyMsg.value = '';

  // 参数校验
  if (action === 'enable' && (!host || !port)) {
    proxyMsg.value = '代理IP和端口不能为空';
    proxyStatus.value = 'error';
    return;
  }

  try {
    const result = await executeBat(action, host, port);
    const res = result as any;
    
    if (res.status === 'success') {
      proxyStatus.value = 'success';
      proxyMsg.value = res.message;
      // 保存配置
      if (action === 'enable') {
        await chrome.storage.sync.set({ 
          [MyStorageKey.proxyConfig]: { host, port } 
        });
      }
    } else {
      throw new Error(res.message || '操作失败');
    }
  } catch (error) {
    console.error('执行失败：', error);
    proxyStatus.value = 'error';
    proxyMsg.value = `操作失败：${(error as Error).message}`;
  }
};

// 开启/关闭代理（原有逻辑不变）
const enableProxy = () => sendProxyCommand('enable', proxyHost.value, proxyPort.value);
const disableProxy = () => sendProxyCommand('disable');

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

  // 初始化代理配置
  const proxyConfig = await chrome.storage.sync.get(MyStorageKey.proxyConfig);
  if (proxyConfig.proxyConfig) {
    proxyHost.value = proxyConfig.proxyConfig.host || '';
    proxyPort.value = proxyConfig.proxyConfig.port || '';
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