<template>
  <n-flex vertical>
    <n-flex justify="space-between" align="center">
      <n-avatar :src="myProfile.avatar" round size="large"/>
      <span id="user-name">{{ myProfile.user_name }}</span>
      <div style="flex: 1">
        <n-tag type="success" round size="small">在线</n-tag>
      </div>
      <n-button text @click="addFriend.show=true">
        <n-icon size="30" :component="AddCircleOutlineRound"/>
      </n-button>
    </n-flex>
    <n-tabs animated type="segment" v-model:value="currentTab">
      <n-tab-pane name="1" tab="好友">
        <n-list hoverable>
          <n-list-item v-for="friend in friendList" :key="friend.user_id">
            <n-flex justify="flex-start" align="center">
              <n-avatar :src="friend.avatar" round size="medium"/>
              <span id="friend-name">{{ friend.user_name }}</span>
              <n-button text @click="currentChat = friend;currentTab='2'">
                <n-icon size="20" :component="SendRound"/>
              </n-button>
            </n-flex>
          </n-list-item>
        </n-list>
      </n-tab-pane>
      <n-tab-pane name="2" tab="聊天">
        <n-card>
          <template #header>
            <n-flex justify="flex-start" align="center">
              <n-button text @click="currentTab='1'">
                <n-icon size="20" :component="ArrowBackRound"/>
              </n-button>
              {{ currentChat === null ? "未选择" : currentChat.user_name }}
            </n-flex>
          </template>
          <template #footer>
            <n-input type="textarea" :resizable="false"/>
          </template>
        </n-card>
      </n-tab-pane>
    </n-tabs>
  </n-flex>
  <n-modal v-model:show="addFriend.show" style="width: 60%;max-height: 90%">
    <n-card>
      <template #header>
        <n-flex justify="space-between" align="center">
          <n-button text>
            <n-icon size="20" :component="CloseRound"/>
          </n-button>
          添加好友
        </n-flex>
      </template>
      <n-h4 prefix="bar">请求添加</n-h4>
      <n-list hoverable>
        <n-list-item v-for="friend in acceptList">
          <n-flex justify="space-between" align="center">
            <n-avatar :src="friend.avatar" round size="medium"/>
            <span id="friend-name">{{ friend.user_name }}</span>
            <n-tag type="info" round>{{ friend.status }}</n-tag>
            <n-button v-if="friend.status==='waiting'" text
                      @click="acceptFriend(friend.user_id)">
              <n-icon size="20" :component="CheckRound"/>
            </n-button>
            <n-button v-if="friend.status==='waiting'" text
                      @click="rejectFriend(friend.user_id)">
              <n-icon size="20" :component="CloseRound"/>
            </n-button>
          </n-flex>
        </n-list-item>
      </n-list>
      <n-empty description="暂无好友请求" v-if="acceptList.length===0"/>
      <n-divider/>
      <n-h4 prefix="bar">寻找新朋友</n-h4>
      <n-input v-model:value="addFriend.email" placeholder="请输入邮箱" round/>
      <template #footer>
        <n-button type="primary" round
                  @click="sendAddFriend">
          发送请求
        </n-button>
      </template>
    </n-card>
  </n-modal>
</template>

<script setup>
import {computed, onMounted, ref} from "vue";
import store from "@/store/store.js";
import {SendRound, ArrowBackRound, AddCircleOutlineRound, CloseRound, CheckRound} from "@vicons/material"
import Api from "@/api/Api.js";
import {useMessage} from "naive-ui";

const message = useMessage();

const myProfile = ref(store.state.user);
const currentTab = ref("1");
const currentChat = ref(null);

const addFriend = ref({
  show: false,
  email: ""
})

const friendList = ref([
  {
    user_id: -1,
    email: "",
    user_name: "",
    avatar: "",
    status: ""
  }
]);
const acceptList = ref([
  {
    user_id: -1,
    email: "",
    user_name: "",
    avatar: "",
    status: ""
  }
]);

onMounted(() => {
  Api.getFriendList().then(res => {
    console.log(res);
    friendList.value = res;
  });
  Api.getAcceptList().then(res => {
    console.log(res);
    acceptList.value = res;
  });
})

function refreshList() {
  Api.getFriendList().then(res => {
    console.log(res);
    friendList.value = res;
  });
  Api.getAcceptList().then(res => {
    console.log(res);
    acceptList.value = res;
  });
}

function sendAddFriend() {
  Api.addFriend(addFriend.value.email).then(res => {
    if (res) {
      message.success("发送成功");
      addFriend.value.email = "";
      addFriend.value.show = false;
    } else {
      message.error("发送失败");
    }
  })
}

function acceptFriend(friend_id) {
  Api.acceptFriend(friend_id).then(res => {
    if (res) {
      message.success("已同意");
    } else {
      message.error("同意失败");
    }
  })
}

function rejectFriend(friend_id) {
  Api.rejectFriend(friend_id).then(res => {
    if (res) {
      message.success("已拒绝");
    } else {
      message.error("拒绝失败");
    }
  })
}
</script>

<style scoped>
#user-name {
  font-weight: bold;
  font-size: 20px;
  color: #000000;
}

#friend-name {
  font-weight: bold;
  font-size: 16px;
  color: #000000;
  flex: 1;
}
</style>