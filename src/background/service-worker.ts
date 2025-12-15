console.log('this is service worker file--');
import { MyStorageKey, MyAction } from "@/utils/actionEnums.js";

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

// 仅保留原有消息处理
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === MyAction.finished) {
    alert("获取完成");
    sendResponse({ status: "success" });
  }
  return true;
});