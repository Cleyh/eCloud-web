import './assets/main.css'

import {createApp} from 'vue'
import App from './App.vue'
import naive from 'naive-ui'
import store from "@/store/store.js";
import Login from "@/views/Login.vue";
import Home from "@/views/Home.vue";
import {createRouter, createWebHistory} from "vue-router";
import Profile from "@/views/Profile.vue";
import Socialize from "@/views/Socialize.vue";
import Share from "@/views/Share.vue";
import Api from "@/api/Api.js";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'Home',
            component: Home
        },
        {
            path: '/share',
            name: 'Share',
            component: Share
        },
        {
            path: '/login',
            name: 'Login',
            component: Login
        },
        {
            path: '/socialize',
            name: 'Socialize',
            component: Socialize
        },
        {
            path: '/profile',
            name: 'Profile',
            component: Profile
        },
    ]
});

router.beforeEach((to,
                   from,
                   next) => {
    const requireLogin = false;
    if (store.state.user.token || to.name === 'Login' || !requireLogin) {
        console.log(store.state.user.token);
        next();
    } else {
        console.log(store.state.user.token);
        next({
            path: '/login'
        });
    }
});

const app = createApp(App);
app.use(naive);
app.use(router);
app.use(store);
const user = JSON.parse( localStorage.getItem('user'));
if (user) {
    store.state.user = user;
    if(store.state.user.role==='admin'){
        store.state.ROOT_URL = 'http://localhost:8080/admin';
    }
    Api.getUserFolder().then(res => {
        store.state.rootFileID = res.file_id;
    });
}
app.mount('#app');
