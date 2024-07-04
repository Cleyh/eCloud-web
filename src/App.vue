<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-layout has-sider>
      <n-layout-sider
          bordered show-trigger collapse-mode="width"
          :collapsed-width="64" :width="240" :collapsed="collapsed"
          @collapse="collapsed = true" @expand="collapsed = false">
        <n-menu :collapsed="collapsed"
                :collapsed-width="64"
                :collapsed-icon-size="22"
                :options="menuOptions"/>
      </n-layout-sider>
      <n-layout>
        <n-message-provider class="mainWindow">
          <div class="mainWindow">
            <router-view/>
          </div>
        </n-message-provider>
      </n-layout>
    </n-layout>
    <n-float-button style="z-index: 10000 ;" :left="30" :bottom="30" type="primary" @click="toLogin">
      <n-icon :size="24" :component="SettingsRound"/>
    </n-float-button>
  </n-config-provider>
</template>

<script setup>
import {SettingsRound, StorageRound, ShareRound, AccountCircleRound, RestoreFromTrashOutlined} from '@vicons/material'
import {RouterLink, useRouter} from 'vue-router'
import {h, ref} from "vue";
import {NIcon} from "naive-ui";
const router = useRouter();
const collapsed = ref(false);
const themeOverrides = ref({
  common: {
    borderRadius: "8px"
  }
})

function renderIcon(icon) {
  return () => h(NIcon, null, {default: () => h(icon)});
}

const menuOptions = [
  {
    label: () => h(RouterLink, {to: {path: '/'}}, {default: () => '我的空间'}),
    key: 'mySpace',
    icon: renderIcon(StorageRound),
  },
  {
    label: () => h(RouterLink, {to: {path: '/'}}, '回收站'),
    key: 'trashCan',
    icon: renderIcon(RestoreFromTrashOutlined),
  },
  {
    label: () => h(RouterLink, {to: {path: '/share'}}, '所有分享'),
    key: 'user',
    icon: renderIcon(ShareRound),
  },
  {
    label: () => h(RouterLink, {to: {path: '/socialize'}}, '我的朋友'),
    key: 'profile',
    icon: renderIcon(AccountCircleRound),
  }
]

function toLogin() {
  router.push('/login');
}
</script>

<style scoped>
.mainWindow {
  padding: 15px;
  width: 100%;
}
</style>
