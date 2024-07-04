<template>
  <n-flex vertical>
    <n-flex align="center">
      <input id="default-input" type="file" :multiple="multiple" @change="onFileChange" style="display: none">
      <label for="default-input" class="file-input">选择文件</label>
      <span>已选择 {{ fileList.length }} 个文件</span>
    </n-flex>
    <n-list class="file-list">
      <n-list-item v-for="file in fileList" :key="file.name">
        <n-flex justify="space-between" align="center">
          <n-icon size="16" :component="UploadFileRound"/>
          <span style="flex: 1;">{{ file.name }}</span>
          <span style="margin-right: 8px;">{{ file.size }}</span>
          <n-button size="16" text @click="removeFile(file)">
            <n-icon :component="CloseRound"/>
          </n-button>
        </n-flex>
      </n-list-item>
    </n-list>
    <n-button v-if="trigger" type="primary" @click="emit('startUpload')">上传</n-button>
  </n-flex>
</template>

<script setup>
import {UploadFileRound, CloseRound} from "@vicons/material"

const props = defineProps({
  multiple: {
    type: Boolean,
    default: false
  },
  duplicate: {
    type: Boolean,
    default: false
  },
  trigger: {
    type: Boolean,
    default: true
  }
});
const emit = defineEmits(['startUpload']);
const fileList = defineModel('fileList');

function onFileChange(event) {
  if (props.multiple) {
    Array.from(event.target.files).forEach(file => {
      console.log(file);
      if (!props.duplicate && fileList.value.some(f => f.name === file.name)) {
        return;
      }
      fileList.value.push(file);
    })
  } else {
    if (!props.duplicate && fileList.value.some(f => f.name === event.target.files[0].name)) {
      return;
    }
    fileList.value = [event.target.files[0]];
  }
}

function removeFile(file) {
  fileList.value = fileList.value.filter(f => f !== file);
}
</script>

<style scoped>
.file-input {
  cursor: pointer;
  background: #f8f8f8;
  padding: 8px 16px;
  border-radius: 4px;
  transition: 0.3s;
}

.file-input:hover {
  background: #e8e8e8;
  transition: 0.3s;
}

.file-list {
  max-height: 60%;
}
</style>