console.log('this is content file --')
import { init} from './js/initjs.ts'
import {auto_write,getUserInfo,timerFunction,createUserInfoIframe,writeDataTopage} from './js/listenerProcess.ts'
import { MyAction } from "@/utils/actionEnums.js";






//监听popup的消息 向页面注入弹窗——————————————————————————————————————
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  var iframe = document.querySelector('#content-start-iframe');
  if (message.action === MyAction.showDialog && !iframe) {

    init();

    console.log("注入contentiframe")
  }
  return true;
});




//处理用户信息在页面的展示
chrome.runtime.onMessage.addListener(getUserInfo);


//监听popup的消息，抓取数据、结束回填
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse)=>{await auto_write(message, sender, sendResponse)})


//临听到popup有抓取页面数据需求时处理
setInterval(timerFunction, 500);



  //这部分是判断是否展示学员信息页板————————————————————————————————————————————————
createUserInfoIframe();

    
//从storage中获取存储的值，回填至页面
writeDataTopage();

