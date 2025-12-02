import { removeIframe,initUserInfo,removeUserInfoIframe } from "./initjs.ts";
import { waitForElementToDisplay } from '@/utils/common.js'
import { fetchEle,getElementValues, } from './elementMethod.ts'
import { getZenTaoSearchElementValues,judgeIfWrite } from '@/utils/zenTaoElements.js'
import {firstInputWrite,simpleInputWrite,listInputWrite,writeThenFocus} from '@/utils/elementMethod.js'
import { MyAction,MyStorageKey } from "@/utils/actionEnums.js"



let ifgetchData = false;
let ifZetTaoLogin = false;
let ifZenTaoBug = false;
let ifZenTaoSearch = false;
let ifHuaWeiLogin=false;
let ifDasLogin=false;
let env = "";
let project = "";
const currentURL = window.location.href;

export const auto_write =async (message, sender, sendResponse) :Promise<boolean> => {
  
  if (message.action === MyAction.fetchInfo) {
    const currentURL = window.location.href;
    if (currentURL.includes(tapdPath)) {
      ifgetchData = true;
    } else if (currentURL.includes(zentaoLoginPath)) {
      ifZetTaoLogin = true;
    } else if (currentURL.includes(zentaoBugPath)) {
      ifZenTaoBug = true;
    } else if (currentURL.includes(zentaoSearchPath)) {
      ifZenTaoSearch = true;
    }else if (currentURL.includes(huaweiLoginPath)){
      let span=await waitForElementToDisplay("div[id='loginForm'][class=''] >div[class='loginTypeDiv'] > span");

      if(span && span.textContent=="IAM用户登录"){

             ifHuaWeiLogin=true;

      }

    }else if (currentURL.includes(dasLoginPath)){

      ifDasLogin=true;
    }
    else {
      alert("当前页面不支持获取数据！")
    }
    // alert("获取完成！"+cssSelector)
  }
  else if (message.action === MyAction.endwriteInfo) {
    chrome.storage.sync.remove(message.target)
    removeIframe()
    alert("已清除数据结束回填！")
  } else if (message.action === MyAction.cancelFrame) {
    removeIframe()
  }
  return true;
}

const cssSelector = {
  one: {
    selector: 'div[id="RelationStoryTag"] span',
    method: "textContent"
  },
  two: {
    selector: 'a[id*="treechooser-tree-tree_select_iteration_id"][class*="curSelectedNode"]',
    method: "title"
  },
  three: {
    selector: '[id="BugPriorityDiv"] select',
    method: "title"
  },
  four: {
    selector: '[id="BugCustomFieldOneDiv"] select',
    method: "title"
  },
  five: {
    selector: '[id="BugPlatformDiv"] select',
    method: "title"
  },
  six: {
    selector: '[id="BugOriginphaseDiv"] select',
    method: "title"
  },
  seven: {
    selector: '#BugCurrentOwner',
    method: "value"
  },
  eight: {
    selector: 'input[id="BugTitle"]',
    method: "value"
  },




}

const cssZenTaoLogin = [
  {
    selector: 'input[id="account"]',
    method: "value"
  },
  {
    selector: 'input[name="password"]',
    method: "value"
  },

]

const cssZenTaoBug = [
  // {
  //   selector: 'div[id="module_chosen"] span',
  //   method: "title"
  // },
  {
    selector: 'div[id="project_chosen"] span',
    method: "title"
  },
  {
    selector: 'div[id="execution_chosen"] span',
    method: "title"
  },
  {
    selector: 'div[id="pk_openedBuild-item-dHJ1bms--selection"]',
    method: "title"
  },
  {
    selector: 'div[id="assignedTo_chosen"] span',
    method: "title"
  },
  {
    selector: 'input[id="title"]',
    method: "value"
  },
  {
    selector: 'div[id="story_chosen"] span',
    method: "title"
  },
  {
    selector: 'div[id="task_chosen"] span',
    method: "title"
  },
]
const cssHuaWeiLogin = [
  {
    selector: '#IAMAccountInputId',
    method: "value"
  },
  {
    selector: '#IAMUsernameInputId',
    method: "value"
  },
  {selector: '#IAMPasswordInputId',
    method: "value"
  }
]

const cssDasLogin = [
  {
    selector: 'input[class="ant-input"][type="text"]',
    method: "value"
  },
  {
    selector: 'input[class="ant-input"][type="password"]',
    method: "value"
  },
]



export async function timerFunction() {

  if (ifgetchData) {
    ifgetchData = false;
    for (const key in cssSelector) {
      const value = await fetchEle(cssSelector[key]["selector"], cssSelector[key]["method"])
      cssSelector[key]["value"] = value
    }
    chrome.storage.sync.set({ [MyStorageKey.elementValues]: JSON.stringify(cssSelector) })
    chrome.runtime.sendMessage({ action: MyAction.finished });
  } else if (ifZetTaoLogin) {
    ifZetTaoLogin = false;
    await getElementValues(cssZenTaoLogin, MyStorageKey.ZenTaoLogin)


  } else if (ifZenTaoBug) {
    ifZenTaoBug = false;
    let iframe = await waitForElementToDisplay("#appIframe-qa")
    var iframeDocument = iframe.contentDocument;
    await getElementValues(cssZenTaoBug, MyStorageKey.ZenTaoBug, iframeDocument)

  } else if (ifZenTaoSearch) {
    ifZenTaoSearch = false;
    let iframe = await waitForElementToDisplay("#appIframe-qa")
    var iframeDocument = iframe.contentDocument;
    await getZenTaoSearchElementValues(MyStorageKey.ZenTaoSearch, iframeDocument)
  } else if (ifHuaWeiLogin){
    ifHuaWeiLogin=false;
    await getElementValues(cssHuaWeiLogin, MyStorageKey.HuaWeiLogin)
  } else if (ifDasLogin){
    ifDasLogin=false;
    await getElementValues(cssDasLogin, MyStorageKey.DasLogin)
  }


  if (currentURL.includes(zentaoBugPath) || currentURL.includes(zentaoSearchPath)) {

    let isfreshed = sessionStorage.getItem("isfreshed")
    if (isfreshed != '1') {
      console.log("自动刷新")
      sessionStorage.setItem("isfreshed", '1')
      window.location.reload();
    }
  }

}








export const getUserInfo =  (message, sender, sendResponse) :boolean => {
  const otherOriginLocalStorageData = document.defaultView.localStorage.getItem('JxToken');
  if (otherOriginLocalStorageData) {
    var jsonObject = JSON.parse(otherOriginLocalStorageData);
    if (jsonObject && jsonObject.userId) {
      console.log("jsonObject.userId" + jsonObject.userId);

      sendResponse({ userId: jsonObject.userId, "env": env, project });
    } else {
      sendResponse({ userId: "", "env": env, project });
    }
  } else {
    sendResponse({ userId: "", "env": env, project });

  }
  return true;
}




const tapdPath = "/bugtrace/bugs/add";
const zentaoLoginPath = "/zentao/user-login";
const zentaoBugPath = "/zentao/bug-create";
const zentaoSearchPath = "/zentao/bug-browse";
const huaweiLoginPath="auth.huaweicloud.com/authui/login.html"
const dasLoginPath ="das.juexiaotime.com/login/index.html"

const jxWebUrl = ["devweb.zhanliujiang.com", "relweb.zhanliujiang.com", "devfkweb.juexiaotime.com", "relfkweb.juexiaotime.com", "dev.juexiaofashuo.com", "rel.juexiaofashuo.com"];




export const createUserInfoIframe =async () => {
var iframe = document.querySelector('#user-info-page');
  const JxWebUserInfo = await chrome.storage.sync.get(MyStorageKey.JxWebUserInfo)
  let ifJxWeb = false;
  jxWebUrl.forEach((e) => {

    if (currentURL.includes(e) && !currentURL.includes("hwdevweb.zhanliujiang.com")) {

      ifJxWeb = true;
      if (e.includes("dev")) {
        env = "dev"
      } else if (e.includes("rel")) {
        env = "rel"
      }

      if (e.includes("zhanliujiang")) {
        project = "cpa"
      } else if (e.includes("juexiaotime")) {
        project = "fk"
      } else if (e.includes("juexiaofashuo")) {
        project = "fs"
      }

    }
  })
  if (ifJxWeb && (JxWebUserInfo.JxWebUserInfo == undefined || JxWebUserInfo.JxWebUserInfo == true) && !iframe) {
    console.log("初始化面板")
    initUserInfo();
  }

  if (JxWebUserInfo.JxWebUserInfo == false && iframe) {
    removeUserInfoIframe();
  }
}


let zentaoiframeqa = null;
 const writeZenTaoBug = async () => {
  let iframeUrl = zentaoiframeqa.contentWindow.location.href;
  if (iframeUrl.includes(zentaoBugPath) && iframeUrl.includes("moduleID")) {

    let ZenTaoBug = await chrome.storage.sync.get(MyStorageKey.ZenTaoBug)
    if ( !ZenTaoBug || Object.keys(ZenTaoBug).length == 0) {
      return
    }
    ZenTaoBug = JSON.parse(ZenTaoBug[MyStorageKey.ZenTaoBug])
    var iframeDocument = zentaoiframeqa.contentDocument;
    let value = ZenTaoBug[0]['value']
    await firstInputWrite('div[id="project_chosen"] input', value, `li[title*="${value}"]`, false, iframeDocument)

    value = ZenTaoBug[1]['value']
    await firstInputWrite('div[id="execution_chosen"] input', value, `li[title*="${value}"]`, false, iframeDocument)

    value = ZenTaoBug[2]['value']
    await firstInputWrite('#pk_openedBuild-search', value, `a[title*="${value}"]`, false, iframeDocument, true)

    value = ZenTaoBug[3]['value']
    await firstInputWrite('div[id="assignedTo_chosen"] input', value, `li[title*="${value}"]`, false, iframeDocument)

    value = ZenTaoBug[4]['value']
    await simpleInputWrite('#title', value, iframeDocument)

    value = ZenTaoBug[5]['value']
    await firstInputWrite('div[id="story_chosen"] input', value, `li[title*="${value}"]`, false, iframeDocument)

    value = ZenTaoBug[6]['value']
    await firstInputWrite('div[id="task_chosen"] input', value, `li[title*="${value}"]`, false, iframeDocument)

  } else if (iframeUrl.includes(zentaoSearchPath)) {

    let ZenTaoSearch = await chrome.storage.sync.get(MyStorageKey.ZenTaoSearch)
  
    if (Object.keys(ZenTaoSearch) == 0 || ZenTaoSearch.length == 0) {
      return
    }
    ZenTaoSearch = JSON.parse(ZenTaoSearch[MyStorageKey.ZenTaoSearch])
    var iframeDocument = zentaoiframeqa.contentDocument;
    const a = await waitForElementToDisplay('#bysearchTab', iframeDocument);
    if (!a.className.includes("querybox-opened")) {
      a.click();
    }
    const btn = await waitForElementToDisplay('button[class="btn-expand-form btn btn-info pull-right"]', iframeDocument);
    const ifClick = await waitForElementToDisplay('#formType', iframeDocument);
    if (ifClick.value == "lite") {
      btn.click();
    }

    for (let ele of ZenTaoSearch) {

      if (ele.itemSelector) {
        if (await judgeIfWrite(ele.other, ele.value, iframeDocument)) {
          await firstInputWrite(ele.selector, ele.value, ele.itemSelector, false, iframeDocument)
        }


      } else {
        await simpleInputWrite(ele.selector, ele.value, iframeDocument)
      }

    }



  }
}


export const writeDataTopage = async () => {
  const currentURL = window.location.href;
  const valueListToSkip = [" ", "", "--", "-空-", "优先级", "严重程度1", "软件平台", "发现阶段"]

  if (currentURL.includes(tapdPath)) {
    let elementValues = await chrome.storage.sync.get(MyStorageKey.elementValues)
    if ( !elementValues || Object.keys(elementValues).length == 0) {
      return
    }
    await waitForElementToDisplay(".sydr")
    elementValues = JSON.parse(elementValues[MyStorageKey.elementValues])
    const keys = Object.keys(elementValues).map((e, i) => {
      if (!valueListToSkip.includes(elementValues[e]["value"])) {
        return e;
      }
    })

    keys.forEach(async (key) => {
      switch (key) {
        case "one":
          const oneValue = elementValues["one"]["value"]
          await firstInputWrite('#inline-choose-workitem-of__common_story-page__edit_bug input', oneValue, `[class="item"][title="${oneValue}"]`)
          break;
        case "two":
          const twoValue = elementValues["two"]["value"]

          await listInputWrite('input[type="text"][class="treechooser-name"]', `a[title="${twoValue}"]`)
          break;
        case "three":
          const threeValue = elementValues["three"]["value"]
          await listInputWrite('#BugPriority + div.dk_select.dk_cover', `td[title="${threeValue}"]`, true)
          break;
        case "four":

          const fourValue = elementValues["four"]["value"]

          await listInputWrite('#BugCustomFieldOne + div.dk_select.dk_cover', `td[val="${fourValue}"][title="${fourValue}"]`, true)
          break
        case "five":

          const fiveValue = elementValues["five"]["value"]
          await listInputWrite('#BugPlatform + div.dk_select.dk_cover', `td[val="${fiveValue}"][title="${fiveValue}"]`, true)
          break
        case "six":
          const sixValue = elementValues["six"]["value"]

          await listInputWrite('#BugOriginphase + div.dk_select.dk_cover', `td[val="${sixValue}"][title="${sixValue}"]`, true)
          break
        case "seven":

          const sevenValue = elementValues["seven"]["value"]

          await writeThenFocus('#BugCurrentOwnerValue', `${sevenValue}`)
          break
        case "eight":
          const eightValue = elementValues["eight"]["value"]

          await simpleInputWrite('#BugTitle', `${eightValue}`)
          break

      }

    })
    await waitForElementToDisplay(".sydrTest")//等待几秒
    const list = await waitForElementToDisplay("#recent-user-panel")
    if (list) {
      list.style.display = 'none'
    }
  }
  else if (currentURL.includes(zentaoLoginPath)) {

    let ZenTaoLogin = await chrome.storage.sync.get(MyStorageKey.ZenTaoLogin)
    if ( !ZenTaoLogin || Object.keys(ZenTaoLogin).length == 0) {
      return
    }
    await waitForElementToDisplay(".sydr")
    ZenTaoLogin = JSON.parse(ZenTaoLogin[MyStorageKey.ZenTaoLogin])
    ZenTaoLogin.forEach(async (e, index) => {
      await writeThenFocus(e["selector"], e["value"]);

    })

    const button = await waitForElementToDisplay('button[id="submit"]');
    button.click();

  }
  else if (currentURL.includes("zentao")) {
    zentaoiframeqa = await waitForElementToDisplay("#appIframe-qa")//对于禅道创建bug以外的页面，是等待操作，因为其它面页没有这个iframe
    if (zentaoiframeqa != null) {
      zentaoiframeqa.onload = writeZenTaoBug;
    }

  }
  else if (currentURL.includes(huaweiLoginPath)){
    let span=await waitForElementToDisplay("div[id='loginForm'][class=''] >div[class='loginTypeDiv'] > span");
          if(span && span.textContent=="IAM用户登录"){
              let HuaWeiLogin = await chrome.storage.sync.get(MyStorageKey.HuaWeiLogin)
              if ( !HuaWeiLogin || Object.keys(HuaWeiLogin).length == 0) {
                return
              }
              HuaWeiLogin = JSON.parse(HuaWeiLogin[MyStorageKey.HuaWeiLogin])
              HuaWeiLogin.forEach(async (e, index) => {
                await writeThenFocus(e["selector"], e["value"]);
              })
              const button = await waitForElementToDisplay('#btn_submit');
              button.click();
          }

  }else if(currentURL.includes(dasLoginPath)){
              let DasLogin = await chrome.storage.sync.get(MyStorageKey.DasLogin)
              if ( !DasLogin || Object.keys(DasLogin).length == 0) {
                return
              }
              DasLogin = JSON.parse(DasLogin[MyStorageKey.DasLogin])
              DasLogin.forEach(async (e, index) => {
                await writeThenFocus(e["selector"], e["value"]);
              })
              const button = await waitForElementToDisplay('button[type="submit"]');
              button.click();

  }
}