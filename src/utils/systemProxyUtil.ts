// src/utils/systemProxyUtil.ts
interface ProxyConfig {
  host: string;
  port: number;
}

// 开启系统代理（popup中调用后台脚本）
export const enableSystemProxy = async (config: ProxyConfig) => {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        action: "controlSystemProxy",
        data: { type: "enable", host: config.host, port: config.port }
      },
      (response) => {
        if (response?.success) {
          alert("系统代理开启成功");
          resolve(true);
        } else {
          reject(new Error(`开启失败: ${response?.error || "未知错误"}`));
        }
      }
    );
  });
};

// 关闭系统代理
export const disableSystemProxy = async () => {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { action: "controlSystemProxy", data: { type: "disable" } },
      (response) => {
        if (response?.success) {
          alert("系统代理关闭成功");
          resolve(true);
        } else {
          reject(new Error(`关闭失败: ${response?.error || "未知错误"}`));
        }
      }
    );
  });
};

// 获取代理状态
export const getProxyStatus = async () => {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { action: "controlSystemProxy", data: { type: "getStatus" } },
      (response) => {
        resolve(!!response?.data?.enabled);
      }
    );
  });
};