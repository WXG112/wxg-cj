<template>

  <div style="width: 100%;height: 100%;color: red;">
    <div>
      当前环境：
      <div style="margin-left: 10px;">
        {{ env }}
      </div>

    </div>
    <div>
      项目：
      <div style="margin-left: 10px;">
        {{ project }}
      </div>
    </div>
    <div>

      userId:
      <div style="margin-left: 10px;">
        {{ userId }}
      </div>
    </div>
    <div>

      用户昵称:
      <div style="margin-left: 10px;">
        {{ userName }}
      </div>
    </div>
    <div>

      手机号:
      <div style="margin-left: 10px;">
        {{ phone }}
      </div>
    </div>
    <div>

      首次登录项目时间:
      <div style="margin-left: 10px;">
        {{ firstLoginTime }}
      </div>
    </div>
    <div>

      钱包余额:
      <div style="margin-left: 10px;">
        {{ wallet }}
      </div>
    </div>
    <div>

      微信unionId:
      <div style="margin-left: 10px;">
        {{ wetchatUnionId }}
      </div>
    </div>


  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import axios from "axios";
import { MyAction } from '@/utils/actionEnums.js';



const userId = ref("");
const userName = ref("");
const phone = ref("");
const firstLoginTime = ref("");
const wallet = ref("");
const wetchatUnionId = ref("");

const env = ref("");
const project = ref("");
setInterval(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: MyAction.GetJxUserId }, async function (response: any) {
      // console.log("返回的数据：" + response)
      if (response.userId == "") {
        userId.value = "未登录"
      } else {
        if (userId.value != response.userId) {
          userId.value = response.userId
          //调接口获取数据
          let res = null;
          if (response.env != "" && response.project != "") {
            if (response.env == "dev") {
              res = await axios.post("https://devapi.zhanliujiang.com/tester/huaweiapi/getUserInfoDev", {
                "userId": response.userId,
                "sysId": response.project == "cpa" ? 6 : response.project == "fk" ? 5 : 3
              });


            } else if (response.env == "rel") {
              res = await axios.post("https://devapi.zhanliujiang.com/tester/huaweiapi/getUserInfoRel", {
                "userId": response.userId,
                "sysId": response.project == "cpa" ? 6 : response.project == "fk" ? 5 : 3
              });
            }
            userName.value = res?.data.user?.name;
            phone.value = res?.data.user?.phone;
            firstLoginTime.value = res?.data.userLoginRecord?.firstLoginTime;
            wallet.value = res?.data.userWallet?.amount;
            wetchatUnionId.value = res?.data.wechatOauth?.unionid;
          }



        }



      }
      if (response.env == "") {
        env.value = "获取环境信息失败！"
      } else {
        env.value = response.env
      }
      if (response.project == "") {
        project.value = "获取项目信息失败！"
      } else {
        project.value = response.project
      }

    })
  })

}, 1000);




console.log("contentPage打印！")



</script>

<style scoped lang="less"></style>