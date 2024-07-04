import axios from "axios";
import store from "@/store/store.js";

class Request {
    constructor(httpRequest) {
        this.url = httpRequest.url || null;
        this.accuracyUrl = httpRequest.accuracyUrl || null;
        this.method = httpRequest.method;
        this.params = httpRequest.params;
        this.headers = httpRequest.headers;
        this.data = httpRequest.data;
        this.config = httpRequest.config || {};
    }

    send() {
        return axios({
            url: this.accuracyUrl !== null ? this.accuracyUrl : store.state.ROOT_URL + this.url,
            method: this.method,
            params: this.params,
            headers: {
                authorization: store.state.user.token,
                ...this.headers
            },
            data: this.data,
            ...this.config
        });
    }

}


export default Request;