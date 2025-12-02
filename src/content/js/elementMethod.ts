import { waitForElementToDisplay } from '@/utils/common.js'
import { MyAction } from "@/utils/actionEnums.js"
export const fetchEle = async (selector, method, doc = null) => {
  const e = await waitForElementToDisplay(selector, doc)//等待几秒
  if (e) {
    return e[method]

  } else {
    return null
  }

}

export const getElementValues = async (cssSelector, storageKey, doc = null) => {
  for (let e of cssSelector) {
    const value = await fetchEle(e["selector"], e["method"], doc);
    e["value"] = value
  }
  let ob = {}
  ob[storageKey] = JSON.stringify(cssSelector)
  chrome.storage.sync.set(ob)
  chrome.runtime.sendMessage({ action:MyAction.finished});

}



