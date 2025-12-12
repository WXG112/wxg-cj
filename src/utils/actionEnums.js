// 消息动作类型枚举
export const  MyAction= {
   GetJxUserId:"GetJxUserId",
   endwriteInfo:"endwriteInfo",
   cancelFrame:"cancelFrame",
   fetchInfo:"fetchInfo",
   showDialog:"showDialog",
   finished:"finished",
   enableProxy: "enableProxy",    // 新增：开启代理
  disableProxy: "disableProxy",  // 新增：关闭代理
  proxyStatus: "proxyStatus"     // 新增：代理状态回调
}
// 本地存储键名枚举
export const  MyStorageKey = {
  JxWebUserInfo:"JxWebUserInfo",
  startUpUrl:"startUpUrl",
  elementValues:"elementValues",
  ZenTaoBug:"ZenTaoBug",
  ZenTaoSearch:"ZenTaoSearch",
  ZenTaoLogin:"ZenTaoLogin",
  HuaWeiLogin:"HuaWeiLogin",
  JenkinsLogin:"JenkinsLogin",
  JxapiLogin:"JxapiLogin",
  DasLogin:"DasLogin",
  proxyConfig: "proxyConfig"     // 新增：存储代理IP和端口
}



