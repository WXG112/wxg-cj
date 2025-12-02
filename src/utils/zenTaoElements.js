import {  waitForElementToDisplay } from './common.js'
import { MyAction } from "@/utils/actionEnums.js";

const cssSelector= [
    {
      selector: 'input[id="pk_field${index}-search"] + div',
      method: "textContent"
    },
    {
      selector: '#operator${index}',
      method: "value"
    },
    {
      selector: '#groupAndOr',
      method: "value"
    },
    {
        selector: '#andOr${index}',
        method: "value"
      }
  ]
const fetchEle = async (selector, method, doc = null) => {
    const e = await waitForElementToDisplay(selector, doc)//等待几秒
    if (e) {
      return e[method]
  
    } else {
      return null
    }
  
  }


const simpleInput=["Bug标题","关键词","重现步骤","相关需求","Bug编号","激活次数","转任务","转研发需求"]
export const getZenTaoSearchElementValues = async (storageKey, doc = null) => {
    let dictToSave=[]
    let i=0;
    for (let e of cssSelector) {
       if(i==0){
        for(var j=1;j<=6;j++){
            let temp={}
            selector=e.selector.replace('${index}', j);
            const value = await fetchEle(selector, e["method"], doc);
            let tempPre="#pk_field"+j
            temp['selector']=`${tempPre}-search`
            temp['value']=value
            temp['itemSelector']=`div[data-id="pk_field${j}"] a[title*="${value}"]`
            temp['other']='#field'+j
            dictToSave.push(temp)
            if(simpleInput.includes(value) || value.includes("日期")){

                temp={}
                temp['selector']="#value"+j
                const value1=await fetchEle(temp['selector'],"value", doc);
                temp['value']=value1;
                dictToSave.push(temp)
            }else{
                if(value!="所属模块"){
                    temp={}
                    temp['selector']=`#pk_value${j}-search`
                    const value1=await fetchEle(temp['selector']+" + div span","textContent", doc);
                    temp['value']=value1
                    tempPre="#pk_value"+j
                    temp['itemSelector']=`div[data-id="pk_value${j}"] a[title*="${value1}"]`
                    temp['other']='#value'+j
                    dictToSave.push(temp)
                }

            }

        }

       }else if(i==1){
        for(var j=1;j<=6;j++){
            let temp={}
            selector=e.selector.replace('${index}', j);
            const value1=await fetchEle(selector,"value", doc);
            temp['selector']=selector
            temp['value']=value1
            dictToSave.push(temp)
        }
       }else if(i==2){
        let temp={}
        const value1=await fetchEle(e.selector,"value", doc);
        temp['selector']=e.selector
        temp['value']=value1
        dictToSave.push(temp)

       }else if(i==3){
        for(var j=1;j<=6;j++){
            if(j!=1 && j!=4){
                let temp={}
                selector=e.selector.replace('${index}', j);
                const value1=await fetchEle(selector,"value", doc);
                temp['selector']=selector
                temp['value']=value1
                dictToSave.push(temp)
            }


        }
       }

      i++;
    }
    let ob = {}
    ob[storageKey] = JSON.stringify(dictToSave)
    chrome.storage.sync.set(ob)
    chrome.runtime.sendMessage({ action: MyAction.finished });
  
  }

  export const judgeIfWrite=async (other,value,doc)=>{
    let option=await waitForElementToDisplay(`${other} option[selected="selected"]`, doc)
    if(option.title==value){
       return false
    }else{
        return true 
    }

  }