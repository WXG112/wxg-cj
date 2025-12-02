<template>
    <el-dialog v-model="dialogVisible" title="选择要结束回填的内容" style="text-align: center;" @close="handleCancel">
      <el-select v-model="contentValue" placeholder="选择内容" size="large">
        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="primary" @click="handleComfirm">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
    
</template>

<script setup lang="ts">
import { useCounterStore } from '../store/counter';
import {ref} from 'vue';
import { MyAction } from '@/utils/actionEnums.js';

const store = useCounterStore();
const dialogVisible = ref(true);
const contentValue=ref();

const options = [
  {
    value: 'ZenTaoLogin',
    label: '禅道登录',
  },
  {
    value: 'elementValues',
    label: 'tapd报bug',
  },
  {
    value: 'ZenTaoBug',
    label: '禅道报bug',
  },
  {
    value: 'ZenTaoSearch',
    label: '禅道搜索bug',
  },
    {
    value: 'HuaWeiLogin',
    label: '华为登录',
  },
    {
    value: 'DasLogin',
    label: '神策登录',
  }
]
const handleComfirm=()=>{
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: MyAction.endwriteInfo, target: contentValue.value }, function (response: any) {
      // 回调函数，把传回的信息渲染在popup.html上
      // console.log("auto_write_start")
    })
  })
}
const handleCancel=()=>{

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: MyAction.cancelFrame, target: contentValue.value }, function (response: any) {
      // 回调函数，把传回的信息渲染在popup.html上
      // console.log("auto_write_start")
    })
  })

}

</script>

<style scoped lang="less">


</style>