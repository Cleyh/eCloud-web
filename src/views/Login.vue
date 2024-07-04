<template>
  <n-flex vertical align="center">

    <n-card class="userForm" v-if="userMode === 'login'">
      <template #header>
        <h1>请登录</h1>
      </template>
      <n-spin :show="onLogin">
        <n-form>
          <n-form-item label="账号">
            <n-input v-model:value="userAccount" placeholder="请输入用户名或者邮箱"/>
          </n-form-item>
          <n-form-item label="密码">
            <n-input v-model:value="userPassword" placeholder="请输入密码"/>
          </n-form-item>
          <n-form-item>
            <n-button type="primary" @click="login">登录</n-button>
          </n-form-item>
        </n-form>
      </n-spin>
      <template #footer>
        <n-a @click="userMode = 'register'">没有账号？</n-a>
      </template>
    </n-card>

    <n-card class="userForm" v-else>
      <template #header>
        <h1>注册</h1>
      </template>
      <n-spin :show="onRegister">
        <n-form>
          <n-form-item label="邮箱">
            <n-input v-model:value="registerEmail" placeholder="请输入邮箱" @blur="checkEmail"
                     :loading="onCheckingEmail">
            </n-input>
          </n-form-item>
          <n-form-item label="用户名">
            <n-input v-model:value="registerName" placeholder="请输入用户名" @blur="checkName"
                     :loading="onCheckingName"/>
          </n-form-item>
          <n-form-item label="密码">
            <n-input v-model:value="registerPassword" placeholder="请输入密码"/>
          </n-form-item>
          <n-form-item label="确认密码">
            <n-input v-model:value="registerPasswordConfirm" placeholder="请再次输入密码"/>
          </n-form-item>
          <n-form-item>
            <n-button type="primary" @click="register">注册</n-button>
          </n-form-item>
        </n-form>
      </n-spin>
      <template #footer>
        <n-a @click="userMode = 'login'">已有账号？</n-a>
      </template>
    </n-card>
  </n-flex>

</template>

<script setup>
import {CheckRound} from "@vicons/material"
import {useRouter} from 'vue-router'; // 导入 useRouter
import {useMessage} from "naive-ui"
import {ref} from "vue";
import api from "@/api/Api.js";

const router = useRouter();
const message = useMessage();
const userMode = ref("login");

const registerEmail = ref("");
const registerName = ref("");
const registerPassword = ref("");
const registerPasswordConfirm = ref("");

const userAccount = ref("");
const userPassword = ref("");


const onCheckingName = ref(false)

const onCheckingEmail = ref(false)

const onLogin = ref(false);
const onRegister = ref(false);


async function checkName() {
  onCheckingName.value = true;
  const nameFormat = /^[a-zA-Z0-9_-]{2,32}$/;
  if (!nameFormat.test(registerName.value)) {
    message.error("用户名需要2~32个英文字符，允许包含下划线和数字");
    onCheckingName.value = false;
    registerName.value = "";
    return false;
  }
  if (await api.checkNameExist(registerName.value)) {
    message.error("用户名已存在");
    onCheckingName.value = false;
    registerName.value = "";
    return false;
  }
  message.success("用户名可用");
  onCheckingName.value = false;
  return true;
}

async function checkEmail() {
  onCheckingEmail.value = true;
  const eml = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
  if (!eml.test(registerEmail.value)) {
    message.error("邮箱格式错误");
    onCheckingEmail.value = false;
    registerEmail.value = "";
    return false;
  }
  if (await api.checkEmailExist(registerEmail.value)) {
    message.error("邮箱已存在");
    onCheckingEmail.value = false;
    registerEmail.value = "";
    return false;
  }
  message.success("邮箱可用");
  onCheckingEmail.value = false;
  return true;
}

async function login() {
  onLogin.value = true;
  const eml = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
  let result;
  if (eml.test(userAccount.value)) {
    result = await api.emailLogin(userAccount.value, userPassword.value);
  } else {
    result = await api.nameLogin(userAccount.value, userPassword.value);
  }
  if (result) {
    message.success("登录成功");
    onLogin.value = false;
    await router.push("/");
    return;
  } else {
    message.error("登录失败");
  }
  onLogin.value = false;
}

async function register() {
  console.log(registerPassword.value);
  console.log(registerPasswordConfirm.value);
  if (registerPassword.value !== registerPasswordConfirm.value) {
    message.error("两次密码不一致");
    return;
  }
  if (!await checkEmail(registerEmail.value) || !await checkName(registerName.value)) {
    return;
  }

  onRegister.value = true;
  if (await api.register(registerEmail.value, registerName.value, registerPassword.value)) {
    message.success("注册成功");
    onRegister.value = false;
    userMode.value = "login";
    return;
  }
  message.error("注册失败,请重试");
  onRegister.value = false;
}
</script>

<style scoped>
.userForm {
  width: 50%;
}
</style>