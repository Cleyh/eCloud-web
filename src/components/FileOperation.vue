<template>
  <n-popover style="flex: 1">
    <template #trigger>
      <n-icon size="24" :component="MoreVertRound"/>
    </template>
    <n-flex vertical>
      <n-button v-for="item in editOptions" :key="item.value">
        {{ item.label }}
      </n-button>
    </n-flex>
  </n-popover>
</template>

<script setup>
import {MoreVertRound} from "@vicons/material";
const props = defineProps({
  path: {
    type: String,
    required: true
  },
  fileID: {
    type: String,
    required: true
  }
})
const editOptions = [
  {
    label: '重命名',
    value: 'rename',
    onClick: props
  },
  {
    label: '删除',
    value: 'delete'
  },
  {
    label: '移动',
    value: 'move',
  },
  {
    label: '分享',
    value: 'share'
  },
  {
    label: '下载',
    value: 'download'
  },
  {
    label: '属性',
    value: 'property'
  }
]

</script>

<style scoped>

</style>