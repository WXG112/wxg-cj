console.log('this is service worker file--')
import { MyStorageKey } from "@/utils/actionEnums.js";



chrome.runtime.onStartup.addListener(async function() {
    let startUpUrl = await chrome.storage.sync.get(MyStorageKey.startUpUrl)
    if(startUpUrl.startUpUrl==undefined || startUpUrl.startUpUrl==true){
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        // 更新当前标签页的 URL
        chrome.tabs.update(tabs[0].id, { url: "http://zd.jxfkedu.com/zentao"});
        });

        chrome.tabs.create({ url: "https://devmb.juexiaotime.com" });
        chrome.tabs.create({ url: "http://devshopadmin.juexiaotime.com" });
        chrome.tabs.create({ url: "http://devuser.juexiaotime.com" });
        chrome.tabs.create({ url: "https://hwdevweb.zhanliujiang.com/datatest-front" });
        chrome.tabs.create({ url: "https://hwdevweb.zhanliujiang.com/test-platform/" });

    }
   
  });


  // src/background/service-worker.js
// 监听来自popup的代理控制请求
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "controlSystemProxy") {
    const { type, host, port } = message.data;
    // 调用sendNativeMessage（仅后台脚本支持）
    chrome.runtime.sendNativeMessage(
      "com.example.proxycontrol", // 对应本地消息主机的name
      { action: type, host, port },
      (response) => {
        if (chrome.runtime.lastError) {
          sendResponse({ success: false, error: chrome.runtime.lastError.message });
        } else {
          // 同步设置Chrome浏览器级代理
          if (type === "enable") {
            chrome.proxy.settings.set({
              value: {
                mode: "fixed_servers",
                rules: {
                  singleProxy: { scheme: "http", host, port: parseInt(port) },
                  bypassList: ["localhost", "127.0.0.1"]
                }
              },
              scope: "regular"
            }, () => {});
          } else {
            chrome.proxy.settings.set({ value: { mode: "direct" }, scope: "regular" }, () => {});
          }
          sendResponse({ success: true, data: response });
        }
      }
    );
    // 必须返回true，确保异步响应生效（Manifest V3 关键）
    return true;
  }
});


// 在 popup 或 background 中添加测试代码
const port = chrome.runtime.connectNative('com.example.proxycontrol');
port.onDisconnect.addListener(() => {
  console.error('连接失败原因：', chrome.runtime.lastError);
});


