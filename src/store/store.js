import {createStore} from "vuex";

const store = createStore({
    state() {
        return {
            ROOT_URL: "http://localhost:8080",
            user: {
                "user_id": 0,
                "password": "",
                "email": "",
                "user_name": "",
                "avatar": null,
                "role": "",
                "token": ""
            },
            rootFileID: -1,
        }
    }
})

export default store;