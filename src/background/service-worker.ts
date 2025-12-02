console.log('this is service worker file--')
import { MyStorageKey } from "@/utils/actionEnums.js";



chrome.runtime.onStartup.addListener(async function() {
    let startUpUrl = await chrome.storage.sync.get(MyStorageKey.startUpUrl)
    if(startUpUrl.startUpUrl==undefined || startUpUrl.startUpUrl==true){
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            // 更新当前标签页的 URL
            chrome.tabs.update(tabs[0].id, { url: "https://hwdevweb.zhanliujiang.com/test-platform/"});
        });
         chrome.tabs.create({ url: "http://zd.jxfkedu.com/zentao" });
    }
   
  });