<template>
  <n-flex vertical>
    <n-input size="medium" round placeholder="搜索" v-model:value="search"/>
    <n-tabs type="segment" animated @update:value="handleTabSwitch" v-model:value="currentTab">
      <n-tab-pane tab="我的分享" name="myShared">
        <n-list hoverable>
          <n-list-item v-for="item in searchFile" :key="item.file_id">
            <n-flex justify="space-between" align="center">
              <n-flex justify="start" align="center">
                <n-icon size="24"
                        :color="getItem(item).color"
                        :component="getItem(item).icon"/>
                <n-text>{{ item.file_name }}</n-text>
              </n-flex>
              <n-flex justify="end" align="center">
                <n-text> 分享有效期：{{ item.expire_time ? item.expire_time.toLocaleDateString() : '永久' }}，</n-text>
                <n-text>
                  分享给：{{ item.user_id === 0 ? '所有人' : getUserName(item) }}，
                </n-text>
                <n-text> 一次性分享：{{ item.disposable ? '是' : '否' }}</n-text>
                <n-button @click="cancelShare(item)">取消分享</n-button>
                <n-popover style="flex: 1">
                  <template #trigger>
                    <n-button>操作</n-button>
                  </template>
                  <n-flex vertical>
                    <n-button v-for="eitem in editOptions" :key="eitem.value" @click="eitem.action(item)">
                      {{ eitem.label }}
                    </n-button>
                  </n-flex>
                </n-popover>
              </n-flex>
            </n-flex>
          </n-list-item>
        </n-list>
        <n-empty v-if="fileList.length === 0" description="暂无分享文件"/>
      </n-tab-pane>
      <n-tab-pane tab="分享给我" name="sharedToMe">
        <n-list hoverable>
          <n-list-item v-for="item in searchFile" :key="item.file_id">
            <n-flex justify="space-between" align="center">
              <n-flex justify="start" align="center">
                <n-icon size="24"
                        :color="getItem(item).color"
                        :component="getItem(item).icon"/>
                <n-text>{{ item.file_name }}</n-text>
              </n-flex>
              <n-flex justify="end" align="center">
                <n-text> 分享有效期：{{ item.expire_time ? item.expire_time.toLocaleDateString() : '永久' }}，</n-text>
                <n-text> 一次性分享：{{ item.disposable ? '是' : '否' }}</n-text>
                <n-button type="primary" @click="saveToMyDrive(item)">保存到云盘</n-button>
                <n-popover style="flex: 1">
                  <template #trigger>
                    <n-button>操作</n-button>
                  </template>
                  <n-flex vertical>
                    <n-button v-for="eitem in editOptions" :key="eitem.value" @click="eitem.action(item)">
                      {{ eitem.label }}
                    </n-button>
                  </n-flex>
                </n-popover>
              </n-flex>
            </n-flex>
          </n-list-item>
        </n-list>
        <n-empty v-if="fileList.length === 0" description="暂无分享文件"/>
      </n-tab-pane>
    </n-tabs>
  </n-flex>
  <n-modal v-model:show="fileProperty.show">
    <n-card style="width: 60%">
      <template #header>
        <n-flex justify="space-between" align="center">
          <n-button @click="fileProperty.show=false" text>
            <n-icon size="20" :component="CloseRound"/>
          </n-button>
          文件属性
        </n-flex>
      </template>
      <n-flex vertical>
        <n-h4 prefix="1">分享链接</n-h4>
        <n-alert type="warning" v-if="fileProperty.file.disposable">
          这是一次性分享，点击生成链接后将失效！
        </n-alert>
        <n-alert closable type="info" v-if="!fileProperty.file.disposable">
          tips: 下载链接短期内有效，且下载后即失效，需要重新生成。如需长期使用，请选择不删除分享链接选项。
        </n-alert>
        <n-code>
          {{ fileProperty.link }}
        </n-code>

        <n-flex vertical>
          <n-checkbox v-model:checked="fileProperty.disposableLink" v-if="!fileProperty.file.disposable">
            删除分享链接
          </n-checkbox>
          <n-button type="info" v-if="fileProperty.link === ''"
                    @click="getDownloadLink">
            生成链接
          </n-button>
          <n-button type="info" v-if="fileProperty.link !== ''">复制链接</n-button>
        </n-flex>
      </n-flex>
      <template #footer>

      </template>
    </n-card>
  </n-modal>

</template>
<script setup>

import {onMounted, ref, computed} from "vue";
import {CheckRound, MoreVertRound, PhotoRound, CloseRound} from "@vicons/material";
import {FileAlt, FileExcel, FilePdf, FileWord, FolderOpen, Paperclip, Video} from "@vicons/fa";
import Api from "@/api/Api.js";
import {useMessage} from "naive-ui";
import store from "@/store/store.js";

const search = ref('');

const message = useMessage();
const currentTab = ref('myShared');
const editOptions = [
  {
    label: '下载',
    value: 'download',
    action: (file) => {
      downloadFile(file);
    },
  },
  {
    label: '属性',
    value: 'property',
    action: (file) => {
      fileProperty.value.show = true;
      fileProperty.value.file = file;
      fileProperty.value.link = '';
    },
  }
];

const fileProperty = ref({
  show: false,
  file: {
    share_id: -1,
    file_id: -1,
    file_name: 'heelo',
    user_id: -1,
    password: '',
    expire_time: null,
    disposable: false,
    deleted: false
  },
  link: '',
  disposableLink: true
});

const fileList = ref([
  {
    share_id: -1,
    file_id: -1,
    file_name: 'heelo',
    user_id: -1,
    password: '',
    expire_time: null,
    disposable: false,
    deleted: false
  }
])
const friendList = ref(null);

const searchFile = computed(() => {
  const input = search.value;
  if (!input) return fileList.value;

  // 将输入转换为正则表达式，匹配输入的每个字符，忽略大小写
  const regex = new RegExp(input.split('').join('.*'), 'i');

  // 过滤出匹配的用户名
  return fileList.value.filter(file => regex.test(file.file_name));
})

const getUserName = (item) => {
  if (friendList.value === null) return '';
  return friendList.value.find(e => e.user_id === item.user_id).user_name;
}

function getItem(item) {
  if (item.file_type === 'folder') {
    return {
      icon: FolderOpen,
      color: '#409EFF'
    }
  }

  const fileName = item.file_name;
  const fileType = fileName.substring(fileName.lastIndexOf('.') + 1);

  switch (fileType) {
    case 'txt':
      return {
        icon: FileAlt,
        color: '#b6b6b6'
      };
    case 'pdf':
      return {
        icon: FilePdf,
        color: '#ff7676'
      }
    case 'doc':
    case 'docx':
      return {
        icon: FileWord,
        color: '#368fec'
      }
    case 'xlsx':
    case 'xls':
    case 'csv':
      return {
        icon: FileExcel,
        color: '#00b420'
      }
    case 'mov':
    case 'mp4':
    case 'flv':
      return {
        icon: Video,
        color: '#774aff'
      }
    case 'png':
    case 'jpg':
    case'jpeg':
      return {
        icon: PhotoRound,
        color: '#5db400'
      }
    default:
      return {
        icon: Paperclip,
        color: '#d9d9d9'
      }
  }

}

onMounted(() => {
  Api.getSharedFiles().then(res => {
    fileList.value = res;
  });
  Api.getFriendList().then(res => {
    friendList.value = res;
  });
});

function downloadFile(file) {
  console.log(currentTab);
  if (currentTab.value === 'myShared') {
    Api.getDownload(file.file_id).then(res => {
      if (res === false) {
        message.error('下载失败');
        return;
      }
      const downloadLink = document.createElement('a');
      downloadLink.href = res; // 设置下载链接
      downloadLink.setAttribute('download', file.file_name);
      downloadLink.style.display = 'none'; // 隐藏链接
      document.body.appendChild(downloadLink); // 将链接添加到DOM中
      downloadLink.click(); // 触发点击事件
      document.body.removeChild(downloadLink); // 移除链接
    }).catch(err => {
      console.log(err);
    });
  } else {
    Api.getShareDownload(file.share_id).then(res => {
      if (res === false) {
        message.error('下载失败');
        return;
      }
      const downloadLink = document.createElement('a');
      downloadLink.href = res; // 设置下载链接
      downloadLink.setAttribute('download', file.file_name);
      downloadLink.style.display = 'none'; // 隐藏链接
      document.body.appendChild(downloadLink); // 将链接添加到DOM中
      downloadLink.click(); // 触发点击事件
      document.body.removeChild(downloadLink); // 移除链接
    }).catch(err => {
      console.log(err);
    });
  }
}

function handleTabSwitch(tabs) {
  console.log(tabs);
  switch (tabs) {
    case 'sharedToMe':
      Api.getMySharedFiles().then(res => {
        fileList.value = res;
      });
      break;
    case 'myShared':
      Api.getSharedFiles().then(res => {
        fileList.value = res;
      });
      break;
  }
}

function cancelShare(share) {
  Api.deleteShare(share.share_id).then(res => {
    if (res) {
      message.success('取消分享成功');
      Api.getSharedFiles().then(res => {
        fileList.value = res;
      });
    } else {
      message.error('取消分享失败');
    }
  });
}

function getDownloadLink() {
  if (fileProperty.value.disposableLink || fileProperty.value.file.disposable) {
    return Api.getShareDownload(fileProperty.value.file.share_id).then(res => {
      fileProperty.value.link = res;
      return res;
    });
  } else {
    return Api.getLongShareDownload(fileProperty.value.file.share_id).then(res => {
      fileProperty.value.link = res;
      return res;
    });
  }
}

function saveToMyDrive(share) {
  Api.shareSaveToDrive(share.share_id, store.state.rootFileID).then(res => {
    if (res) {
      message.success('保存成功');
    } else {
      message.error('保存失败');
    }
  });
}
</script>

<style scoped>

</style>