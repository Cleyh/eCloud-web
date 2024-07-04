<template>
  <n-flex class="fileWindow" vertical>
    <n-flex justify="start">
      <!--      <n-input size="medium" style="width: 500px" round placeholder="搜索" v-model:value="searchInput"/>-->
      <n-button @click="refreshFileList" text>
        <n-icon size="24" :component="RefreshRound"/>
      </n-button>
      <n-popover class="viewSelect">
        <template #trigger>
          <n-button text>
            <n-icon size="24" v-if="viewMode==='list'" :component="FormatListBulletedRound"/>
            <n-icon size="24" v-else :component="GridViewRound"/>
          </n-button>
        </template>
        <n-flex vertical>
          <n-text style="align-self: center">视图</n-text>
          <n-button @click="viewMode = 'list'"> 列表视图</n-button>
          <n-button @click="viewMode = 'grid'"> 宫格视图</n-button>
        </n-flex>
      </n-popover>
      <n-button text @click="handleTaskBoxShow()">
        <n-icon size="24" :component="MoveToInboxRound"/>
      </n-button>
    </n-flex>

    <n-flex class="fileTools" align="center">
      <n-button-group>
        <n-button secondary round @click="onNewFile.show=true;onNewFile.type='folder'">新建目录</n-button>
        <n-button secondary @click="onNewFile.show=true;onNewFile.type='file'">新建文件</n-button>
        <n-button secondary @click="uploadRef.show=true;">上传文件</n-button>
        <n-button secondary @click="remoteDownloadRef.show=true" round>离线下载</n-button>
      </n-button-group>
      <n-popover class="orderSelect" trigger="click">
        <template #trigger>
          <n-button secondary round>{{ orderSelect.label }}</n-button>
        </template>
        <n-flex vertical>
          <n-text style="align-self: center">排序方式</n-text>
          <n-button v-for="item in orderOptions" :key="item.value"
                    @click="orderSelect = item;refreshFileList()">
            {{ item.label }}
          </n-button>
        </n-flex>
      </n-popover>
      <n-button v-if="onMovingFile.onMove" secondary round @click="handleMove">移到/复制到这</n-button>
    </n-flex>

    <n-breadcrumb class="pathRouter">
      <n-breadcrumb-item v-for="item in currentPath" :key="item.file_id" @click="gotoFolder(item.file_id)">
        <n-icon size="16" :color="{color:'#409EFF'}.color" :component="FolderOpenRound"/>
        {{ item.file_name }}
      </n-breadcrumb-item>
    </n-breadcrumb>

    <n-spin :show="onLoadingFile">
      <div v-if="viewMode === 'list'">
        <n-list hoverable>
          <n-list-item v-for="item in fileList" :key="item.file_id">
            <n-flex justify="space-between" align="center">
              <n-flex justify="start" align="center">
                <n-button @click="handleOpen(item)" quaternary>
                  <n-icon size="24"
                          :color="getItem(item).color"
                          :component="getItem(item).icon"/>
                </n-button>
                <n-popover style="left: 0" trigger="click">
                  <template #trigger>
                    <n-button style="width:120px;flex: 1" quaternary
                              @click="onEditName.name = item.file_name">{{ item.file_name }}
                    </n-button>
                  </template>
                  <n-input-group>
                    <n-input v-model:value="onEditName.name"/>
                    <n-button @click="renameFile(item,onEditName.name)">
                      <n-icon size="24" :component="CheckRound"/>
                    </n-button>
                  </n-input-group>
                </n-popover>
              </n-flex>
              <n-flex justify="end" align="center">
                <n-text> 上传时间：{{ item.upload_time }} |</n-text>
                <n-text> 修改时间：{{ item.latest_time }}</n-text>
                <n-popover style="flex: 1" trigger="click">
                  <template #trigger>
                    <n-button style="width:100px;flex: 1" quaternary>
                      <n-icon size="24" :component="MoreVertRound"/>
                    </n-button>
                  </template>
                  <n-flex vertical>
                    <n-button v-for="eitem in editOptions" :key="eitem.value"
                              @click="eitem.action(item);onEditName.file=item">
                      {{ eitem.label }}
                    </n-button>
                  </n-flex>
                </n-popover>
              </n-flex>
            </n-flex>
          </n-list-item>
        </n-list>
      </div>
      <div v-if="viewMode ==='grid'">
        <n-grid cols="1 s:2 m:4 l:5 xl:6 2xl:8" responsive="screen"
                x-gap="12" y-gap="12">
          <n-grid-item v-for="item in fileList" :key="item.file_id">
            <n-card hoverable @click="handleOpen(item)" style="border-radius: 5px">
              <n-icon size="52"
                      :color="getItem(item).color"
                      :component="getItem(item).icon"/>
              <template #footer>
                <n-flex justify="space-between">
                  {{ item.file_name.slice(0, 20) }}
                  <n-popover style="flex: 1">
                    <template #trigger>
                      <n-icon size="22" :component="MoreVertRound"/>
                    </template>
                    <n-flex vertical>
                      <n-button v-for="eitem in editOptions" :key="eitem.value" @click="eitem.action(item.file_id)">
                        {{ eitem.label }}
                      </n-button>
                    </n-flex>
                  </n-popover>
                </n-flex>
              </template>
            </n-card>
          </n-grid-item>
        </n-grid>
      </div>
    </n-spin>
  </n-flex>

  <n-modal v-model:show="onNewFile.show" @close="refreshFileList()">
    <n-card style="width: 45%">
      <template #header>
        新建{{ onNewFile.type === 'file' ? '文件' : '目录' }}
      </template>
      <template #header-extra>
        <n-button text @click="onNewFile.show = false;onNewFile.name = ''">
          <n-icon size="24" :component="CloseRound"/>
        </n-button>
      </template>
      <n-input v-model:value="onNewFile.name" placeholder="请输入名称"/>
      <template #footer>
        <n-button v-if="onNewFile.type === 'file'" type="primary"
                  @click="createFile(onNewFile.name);
                  onNewFile.show = false;onNewFile.name = ''">确定
        </n-button>
        <n-button v-if="onNewFile.type === 'folder'" type="primary"
                  @click="createFolder(onNewFile.name);
                  onNewFile.show = false;onNewFile.name = ''">确定
        </n-button>
      </template>
    </n-card>
  </n-modal>

  <n-modal v-model:show="uploadRef.show">
    <n-spin style="width: 50%" :show="uploadRef.onUpload">
      <n-card style="width: 100%">
        <template #header>
          上传文件
        </template>
        <template #header-extra>
          <n-button text @click="uploadRef.show = false">
            <n-icon size="24" :component="CloseRound"/>
          </n-button>
        </template>
        <FileChooser v-model:fileList="uploadRef.files" @start-upload="uploadFile"/>
      </n-card>
    </n-spin>
  </n-modal>

  <n-modal v-model:show="remoteDownloadRef.show">
    <n-card style="width:45%">
      <template #header>
        离线下载
      </template>
      <template #header-extra>
        <n-button text @click="remoteDownloadRef.show = false">
          <n-icon size="24" :component="CloseRound"/>
        </n-button>
      </template>
      <n-flex vertical>
        <n-text>文件保存为：</n-text>
        <n-input v-model:value="remoteDownloadRef.fileName" placeholder="请输入文件名"/>
        <n-text>下载链接：</n-text>
        <n-input v-model:value="remoteDownloadRef.link" placeholder="请输入下载链接"/>
      </n-flex>
      <template #footer>
        <n-button type="primary" @click="remoteDownload()">确定</n-button>
      </template>
    </n-card>
  </n-modal>

  <n-modal v-model:show="onEditName.show">
    <n-card style="width: 50%">
      <template #header>
        <n-text>重命名文件</n-text>
      </template>
      <template #header-extra>
        <n-button text>
          <n-icon @click="onEditName.show = false" size="24" :component="CloseRound"/>
        </n-button>
      </template>
      <n-input-group>
        <n-input v-model:value="onEditName.name" placeholder="请输入文件名"/>
        <n-button>
          <n-icon size="24" :component="CheckRound"
                  @click="renameFile(onEditName.file, onEditName.name);onEditName.show = false"/>
        </n-button>
      </n-input-group>
    </n-card>
  </n-modal>

  <n-modal v-model:show="taskBoxShow" @close="disconnectTaskProgress();">
    <n-card style="width: 65%">
      <template #header>
        <n-text>离线下载任务</n-text>
      </template>
      <template #header-extra>
        <n-button text @click="taskBoxShow = false;disconnectTaskProgress();">
          <n-icon size="24" :component="CloseRound"/>
        </n-button>
      </template>
      <n-list>
        <n-list-item v-for="item in remoteTasks" key="item.id">
          <n-flex justify="space-between" align="center">
            <n-icon size="22" :component="CloudDownloadAlt"/>
            <n-text style="flex: 1">{{ item.file_save_name }}</n-text>
            <n-text v-if="store.state.user.role='admin'">{{ item.user_name }}</n-text>
            <n-text>已下载:{{ (item.downloaded_bytes / item.total_bytes).toFixed(2) * 100 }}%</n-text>
            <n-text>{{ item.status }}</n-text>
            <n-button @click="showInFolder(item.file_parent_id);taskBoxShow=false">跳转</n-button>
          </n-flex>
          <n-empty v-if="remoteTasks.length === 0"/>
          <n-popover scrollable placement="left" style="max-height: 100px">
            <template #trigger>
              <n-p>{{ item.url.slice(0, 30) }}...</n-p>
            </template>
            <span style="width: 150px">{{ item.url }}</span>
          </n-popover>
          <n-button-group>
            <n-button size="small" @click="resumeTask(item)">恢复</n-button>
            <n-button size="small" @click="pauseTask(item)">暂停</n-button>
            <n-button size="small" @click="deleteTask(item)">删除</n-button>
          </n-button-group>
          <!--          <n-progress size type="line" :show-indicator="false" :percentage="item.progress"/>-->
        </n-list-item>
      </n-list>
    </n-card>
  </n-modal>

  <n-modal v-model:show="onShareFile.show">
    <n-card style="width: 60%">
      <template #header>
        分享文件
      </template>
      <template #header-extra>
        <n-button text @click="onShareFile.show = false;onShareFile.reset();">
          <n-icon size="24" :component="CloseRound"/>
        </n-button>
      </template>
      <n-flex vertical>
        <n-flex justify="space-between">
          <n-text>需要密码</n-text>
          <n-switch v-model:value="onShareFile.needPassword"/>
        </n-flex>
        <n-alert v-if="onShareFile.needPassword" title="设置密码" type="default">
          <template #icon>
            <n-icon :component="KeyRound"/>
          </template>
          <n-input v-model:value="onShareFile.password"/>
        </n-alert>
        <n-flex justify="space-between">
          <n-text>限定分享</n-text>
          <n-checkbox-group max="1" v-model:value="onShareFile.limitShare">
            <n-checkbox value="everyone" label="所有"/>
            <n-checkbox value="nominator" label="指定人"/>
          </n-checkbox-group>
        </n-flex>
        <n-alert v-if="onShareFile.limitShare[0] === 'nominator'" title="指定人" type="default">
          <template #icon>
            <n-icon :component="PersonAddRound"/>
          </template>
          <n-dynamic-tags v-model:value="onShareFile.limitedUser" closable>
            <template #input="{submit,deactivate}">
              <n-auto-complete v-model:value="friendInputRef"
                               :input-props="{autocomplete: 'disabled'}"
                               :options="inputOptions"
                               placeholder="好友名称"
                               :clear-after-select="true"
                               clearable
                               @select="submit($event)"
                               @blur="deactivate"
              />
            </template>
          </n-dynamic-tags>
        </n-alert>
        <n-flex justify="space-between">
          <n-text>有效期</n-text>
          <n-checkbox-group v-model:value="onShareFile.expireMode" max="1">
            <n-checkbox value="forever" label="永久"/>
            <n-checkbox value="expandable" label="有效期"></n-checkbox>
          </n-checkbox-group>
        </n-flex>
        <n-alert v-if="onShareFile.expireMode[0]==='expandable'" title="指定过期" type="default">
          <template #icon>
            <n-icon :component="CalendarMonthRound"/>
          </template>
          <n-date-picker :is-date-disabled="onShareFile.dateDisabled" type="date"
                         v-model:value="onShareFile.expireTime"/>
        </n-alert>
        <n-flex justify="space-between">
          <n-text>一次性</n-text>
          <n-switch v-model:value="onShareFile.disposable"/>
        </n-flex>
      </n-flex>
      <template #footer>
        <n-button type="primary" @click="shareFile">分享</n-button>
      </template>
    </n-card>
  </n-modal>

</template>

<script setup>

import {computed, onMounted, ref, onBeforeMount} from "vue";
import {useMessage} from "naive-ui"
import Api from "@/api/Api.js";
import store from "@/store/store.js";
import FileChooser from "@/components/FileChooser.vue";

// 组件变量
const message = useMessage();
const viewMode = ref('list');
const editOptions = [
  {
    label: '重命名',
    value: 'rename',
    action: (file) => {
      onEditName.value.show = true
      onEditName.value.name = file.file_name
    },
  },
  {
    label: '删除',
    value: 'delete',
    action: (file) => {
      deleteFile(file.file_id)
    },
  },
  {
    label: '复制',
    value: 'move',
    action: (file) => {
      if (file.fileType) {
        message.error('不能复制文件夹');
        return;
      }
      onMovingFile.value.onMove = true;
      onMovingFile.value.sourceID = file.file_id;
    },
  },
  {
    label: '移至回收站',
    value: 'recycle',
    action: () => {
      message.info('开发中')
    },
  },
  {
    label: '分享',
    value: 'share',
    action: (file) => {
      onShareFile.value.reset();
      onShareFile.value.fileID = file.file_id;
      onShareFile.value.show = true;
      console.log(file)
    },
  },
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
    action: () => {
      message.info('开发中')
    },
  }
];
const orderOptions = [
  {
    label: '文件名称',
    value: 'fileName'
  },
  {
    label: '最近修改',
    value: 'recentEdit'
  },
  {
    label: '上传时间',
    value: 'uploadTime'
  },
  {
    label: '文件大小',
    value: 'size'
  },
];
const orderSelect = ref(orderOptions[0]);
const onLoadingFile = ref(false);
const onMovingFile = ref({
  onMove: false,
  sourceID: -1,
  targetID: -1
});
const taskBoxShow = ref(false);
const onShareFile = ref({
  show: false,
  fileID: -1,
  needPassword: false,
  password: '',
  limitShare: [],
  limitedUser: [],
  expireMode: [],
  expireTime: new Date(Date.now() + 1000 * 60 * 60 * 24),
  disposable: false,
  dateDisabled: (time) => {
    return new Date(time) < new Date
  },
  reset: () => {
    onShareFile.value.fileID = -1;
    onShareFile.value.needPassword = false;
    onShareFile.value.limitShare = [];
    onShareFile.value.limitedUser = [];
    onShareFile.value.expireMode = [];
    onShareFile.value.expireTime = new Date(Date.now() + 1000 * 60 * 60 * 24);
    onShareFile.value.disposable = false;
  }
})
const searchInput = ref('');

const friendList = ref([{
  user_id: -1,
  email: "",
  user_name: "",
  avatar: "",
  status: ""
},]);
const friendInputRef = ref('');
const inputOptions = computed(() => {
  const input = friendInputRef.value;
  if (!input) return [];

  // 将输入转换为正则表达式，匹配输入的每个字符，忽略大小写
  const regex = new RegExp(input.split('').join('.*'), 'i');

  // 过滤出匹配的用户名
  return friendList.value
      .map(friend => friend.user_name)
      .filter(name => regex.test(name));
})

// 文件操作缓冲变量
const onNewFile = ref({
  show: false,
  type: 'file',
  name: ''
});
const uploadRef = ref({
  onUpload: false,
  show: false,
  files: [],
});
const remoteDownloadRef = ref({
  show: false,
  link: "",
  fileName: "",
  status: "running",
});
const onEditName = ref({
  show: false,
  file: ref(
      {
        file_id: -1,
        file_name: '',
        file_true_name: '',
        file_path: '',
        parent_id: -1,
        file_size: 0,
        file_type: 'folder',
        upload_time: '',
        latest_time: '',
        user_id: -1
      }
  ),
  name: ''
});

// 文件系统变量
const currentPath = ref([{order: 0, file_id: -1, file_name: ''}]);
const fileList = ref([
  {
    file_id: -1,
    file_name: '',
    file_true_name: '',
    file_path: '',
    parent_id: -1,
    file_size: 0,
    file_type: 'folder',
    upload_time: '',
    latest_time: '',
    user_id: -1
  }
]);


onBeforeMount(() => {
  Api.getUserFolder().then(res => {
    const root = res;
    currentPath.value[0].file_id = root.file_id;
    currentPath.value[0].file_name = root.file_name;
    Api.getFilesInFolder(root.file_id).then(res => {
      fileList.value = res;
      reorderList();
    })
  });
  Api.getFriendList().then(res => {
    console.log(res);
    friendList.value = res;
  });
});


// 任务系统变量
const remoteTasks = ref([
  {
    task_uuid: "",
    five_save_name: "离线下载",
    url: "https://objects.githubusercontent.com/github-production-release-asset-2e65be/35886124/89f6483c-48c6-4f1e-b7df-267c0b39b313?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=releaseassetproduction%2F20240524%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240524T043201Z&X-Amz-Expires=300&X-Amz-Signature=373e8ae500db2094e260312e573ce87c0e68cf0ee861d27e26ef4a40a023c092&X-Amz-SignedHeaders=host&actor_id=54311607&key_id=0&repo_id=35886124&response-content-disposition=attachment%3B%20filename%3DjMc2Obj-124.jar&response-content-type=application%2Foctet-stream",
    downloaded_bytes: 0,
    total_bytes: 0,
    status: "",
    file_parent_id: -1,
    user_id: -1,
    user_name: "",
  },
]);

function getUserName(id){
}

const taskUrl = "http://localhost:8080" + "/remoteTaskProgress?userID=" + store.state.user.user_id;
let eventSource = null;

function handleTaskBoxShow() {
  taskBoxShow.value = true
  refreshTaskList();
  connectTaskProgress();
}

function refreshTaskList() {
  Api.getTaskList().then(res => {
    remoteTasks.value = res;
  })
}

function pauseTask(task) {
  Api.pauseTask(task.task_uuid).then(res => {
    message.success("暂停成功");
    refreshTaskList();
  })
}

function resumeTask(task) {
  Api.resumeTask(task.task_uuid).then(res => {
    message.success("恢复成功");
    refreshTaskList();
  })
}

function deleteTask(task) {
  Api.deleteTask(task.task_uuid).then(res => {
    message.success("删除成功");
    refreshTaskList();
  })
}

function connectTaskProgress() {
  eventSource = new EventSource(taskUrl);
  eventSource.onmessage = (event) => {
    if (!taskBoxShow || remoteTasks.value.length === 0) return;
    const data = JSON.parse(event.data);
    remoteTasks.value.forEach(task => {
      if (task.task_uuid in data) {
        task.downloaded_bytes = data[task.task_uuid];
      }
    });
  }
  eventSource.onerror = (event) => {
    console.log('SSE error:', event);
    eventSource.close();
  }
}

function disconnectTaskProgress() {
  if (eventSource !== null) {
    eventSource.close();
  }
}

function reorderList() {
  switch (orderSelect.value.value) {
    case 'fileName':
      fileList.value.sort((a, b) => a.file_name.localeCompare(b.file_name));
      break;
    case 'recentEdit':
      fileList.value.sort((a, b) => new Date(b.latest_time) - new Date(a.latest_time));
      break;
    case 'uploadTime':
      fileList.value.sort((a, b) => new Date(b.upload_time) - new Date(a.upload_time));
      break;
    case 'size':
      fileList.value.sort((a, b) => b.file_size - a.file_size);
      break;
  }
}

// 文件系统方法
function getCurrentFolder() {
  return currentPath.value[currentPath.value.length - 1];
}

async function refreshFileList() {
  onLoadingFile.value = true;
  await Api.getFilesInFolder(getCurrentFolder().file_id).then(res => {
    fileList.value = res;
    reorderList();
    onLoadingFile.value = false;
  });
}

function createFolder(folderName) {
  const fileRegx = /^[^\/\\:\?\*<>\|'"]+$/;
  if (!fileRegx.test(folderName)) {
    message.error('文件名不合法');
  }
  console.log(fileList.value);
  if (fileList.value.find(item => item.name === folderName)) {
    message.error('文件夹已存在');
  }
  Api.createFolder(folderName, getCurrentFolder().file_id).then(res => {
    if (res === false) {
      message.error('创建失败');
      return;
    }
    message.success('创建成功');
    refreshFileList();
  })
}

function createFile(fileName) {
  const fileRegx = /^[^\/\\:\?\*<>\|'"]+$/;
  if (!fileRegx.test(fileName)) {
    message.error('文件名不合法');
    return false;
  }
  console.log(fileList.value);
  if (fileList.value.find(item => item.name === fileName)) {
    message.error('文件已存在');
    return false;
  }
  Api.createFile(fileName, getCurrentFolder().file_id).then(res => {
    if (res === false) {
      message.error('创建失败');
      return;
    }
    message.success('创建成功');
    refreshFileList();
  })
}

function renameFile(file, newName) {
  const refile = fileList.value.find(item => item.file_id === file.file_id);
  if (!refile) {
    message.error('文件不存在');
  }
  if (refile.file_name === newName) {
    message.error('文件名未改变');
  }
  Api.rename(file.file_id, newName).then((res) => {
    if (res === false) {
      message.error('重命名失败');
      return;
    }
    message.success('重命名成功');
    refreshFileList();
  });
  onEditName.value.name = '';
}

function shareFile() {
  const userIDs = [];
  if (onShareFile.value.limitShare[0] === 'nominator') {
    if (onShareFile.value.limitedUser.length === 0) {
      message.error('请选择分享对象');
      return;
    }
    onShareFile.value.limitedUser.forEach(userName => {
      let friend = friendList.value.find(item => item.user_name === userName);
      if (!friend) {
        message.error('用户不存在');
        return;
      }
      userIDs.push(friend.user_id);
    })
  }

  Api.shareFile({
    fileID: onShareFile.value.fileID,
    needPassword: onShareFile.value.needPassword,
    password: onShareFile.value.password,
    limited: onShareFile.value.limitShare[0] === 'nominator',
    userIDs: userIDs,
    expandable: onShareFile.value.expireMode === 'expandable',
    expireTime: onShareFile.value.expireTime,
    disposable: onShareFile.value.disposable
  }).then(res => {
    if (res === false) {
      message.error('分享失败');
      onShareFile.value.reset();
      return;
    }
    message.success('分享成功');
    onShareFile.value.reset();
    refreshFileList();
  });
}

function uploadFile() {
  uploadRef.value.onUpload = true;

  uploadRef.value.files.forEach(file => {
    if (file.size > 1024 * 1024) {
      message.info('文件大小不能超过1MB');
      return;
    }
    Api.basicUpload(file, getCurrentFolder().file_id).then(res => {
      if (res === true) {
        message.success('上传成功');
        refreshFileList();
      } else {
        message.error('上传失败');
      }
    });
  })
  uploadRef.value.onUpload = false;
  uploadRef.value.show = false;
  uploadRef.value.files = [];
}

function downloadFile(file) {
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
}

function remoteDownload() {
  if (remoteDownloadRef.value.link === '') {
    message.info('请输入下载链接');
    return;
  } else if (fileList.value.find(item => item.file_name === remoteDownloadRef.value.fileName)) {
    message.info('文件名为空或者已存在');
    return;
  }
  remoteDownloadRef.value.show = false;
  Api.remoteDownload(remoteDownloadRef.value.link, getCurrentFolder().file_id, remoteDownloadRef.value.fileName).then(res => {
    if (res === false) {
      message.error('下载失败');
    } else {
      message.success('下载任务创建成功');
      refreshFileList();
    }
    remoteDownloadRef.value.link = '';
    remoteDownloadRef.value.fileName = '';
  });
}

function deleteFile(fileID) {
  const delFile = fileList.value.find(item => item.file_id === fileID);

  if (delFile === null) {
    message.error('文件不存在');
    return false;
  }

  Api.delete(fileID).then(res => {
    if (res === false) {
      message.error('删除失败');
      return;
    }
    message.success('删除成功');
    refreshFileList();
  })
}

function moveFile(sourceID, targetID) {

}

function openFolder(folderID) {
  const folder = fileList.value.find(item => item.file_id === folderID);
  if (!folder) {
    return false;
  }
  currentPath.value.push({
    order: currentPath.value.length,
    file_id: folder.file_id,
    file_name: folder.file_name
  });
  console.log("跳转页面");
  refreshFileList();
}

function gotoFolder(folderID) {
  const index = currentPath.value.findIndex(item => item.file_id === folderID);
  if (index === -1) {
    console.log('文件夹不存在');
    return false;
  }
  currentPath.value = currentPath.value.slice(0, index + 1);
  console.log("跳转页面");
  refreshFileList();
}

function showInFolder(file_id) {
  Api.getFile(file_id).then((res, index) => {
    const fileChain = [];
    let i = 0;
    res.forEach(item => {
      if (item.file_id === 0) return;
      fileChain.unshift({
        order: res.length - i,
        file_id: item.file_id,
        file_name: item.file_name
      })
      i++;
    })
    console.log(1, fileChain);
    currentPath.value.splice(1, fileChain.length);
    currentPath.value = fileChain;
    console.log(currentPath.value);
  });
  Api.getFilesInFolder(file_id).then(res => {
    fileList.value = res;
    reorderList();
  })
}

import {
  CheckRound,
  RefreshRound,
  CloseRound,
  FolderOpenRound,
  MoreVertRound,
  FormatListBulletedRound,
  GridViewRound,
  MoveToInboxRound,
  PhotoRound,
  KeyRound,
  PersonAddRound,
  CalendarMonthRound
} from '@vicons/material'
import {
  FilePdf,
  Video,
  FileWord,
  FileExcel,
  FileAlt,
  FileRegular,
  Paperclip,
  FolderOpen,
  CloudDownloadAlt
} from '@vicons/fa'

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

function handleOpen(item) {
  if (item.file_type === 'folder') {
    openFolder(item.file_id);
  } else {
    console.log('打开文件');
  }
}

function handleMove() {
  onMovingFile.value.targetID = getCurrentFolder().file_id;
  Api.clone(onMovingFile.value.sourceID, onMovingFile.value.targetID).then(res => {
    if (res === false) {
      message.error('移动失败');
    } else {
      message.success('移动成功');
    }
    onMovingFile.value.isMoving = false;
    refreshFileList();
  });
}
</script>

<style scoped>
.fileWindow {
  height: 100%;
}
</style>