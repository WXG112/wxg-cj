import {focusDispatch,waitForElementToDisplay,clickDispath} from "./common.js"



export const listInputWrite=async (inputEleMentSelectorStr,itemSelectorStr,ifClick=false,doc=null,ifDoubleClick=false,value=null)=>{
    const input=await waitForElementToDisplay(inputEleMentSelectorStr,doc)
    if(input){
        if(ifClick){
            clickDispath(input);
           }else{
            focusDispatch(input,ifDoubleClick,value);
           }
    }
    
    const item=await waitForElementToDisplay(itemSelectorStr,doc)
    if(item){
        clickDispath(item);
    }
}


export const simpleInputWrite=async (inputEleMentSelectorStr,value,doc=null)=>{
    const ele=await waitForElementToDisplay(inputEleMentSelectorStr,doc)
    if(ele){
        ele.value=value;
    }

}


export const writeThenFocus=async (inputEleMentSelectorStr,value)=>{
    const ele=await waitForElementToDisplay(inputEleMentSelectorStr)
    if(ele){
        ele.value=value;
        focusDispatch(ele)
    }

}


export const firstInputWrite=async (inputEleMentSelectorStr,value,itemSelectorStr,ifClick=false,doc=null,ifDoubleClick=false)=>{
    // await simpleInputWrite(inputEleMentSelectorStr,value,doc);
    await listInputWrite(inputEleMentSelectorStr,itemSelectorStr,ifClick,doc,ifDoubleClick,value)
}

