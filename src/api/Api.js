import Request from "@/api/Request.js"
import store from "@/store/store.js";
import axios from "axios";

// import crypto from "crypto";
class Api {
    async emailLogin(userEmail, userPassword) {
        return new Request({
            accuracyUrl: "http://localhost:8080/user/login",
            method: "POST",
            params: {},
            headers: {},
            data: {
                email: userEmail,
                password: userPassword
            }
        }).send().then(res => {
            if (res.data.status === 'success') {
                console.log(res.data);
                store.state.user = res.data.data;
                localStorage.setItem("user", JSON.stringify(res.data.data));
                return true;
            }
            console.log(res.data);
            return false;
        });
    }

    async nameLogin(userName, userPassword) {
        return new Request({
            accuracyUrl: "http://localhost:8080/user/login",
            method: "POST",
            params: {},
            headers: {},
            data: {
                user_name: userName,
                password: userPassword
            }
        }).send().then(res => {
            if (res.data.status === 'success') {
                console.log(res.data);
                store.state.user = res.data.data;
                localStorage.setItem("user", JSON.stringify(res.data.data));
                return true;
            }
            console.log(res.data);
            return false;
        });
    }

    async register(userEmail, userName, userPassword) {
        // const hash = crypto.createHash('sha256');
        // hash.update(userPassword);
        // const hashedPassword = hash.digest('hex');
        return new Request({
            accuracyUrl: "http://localhost:8080/user/register",
            method: "POST",
            params: {},
            headers: {},
            data: {
                email: userEmail,
                user_name: userName,
                password: userPassword
            }
        }).send().then(res => {
            console.log(res);
            return res.data.status === 'success';
        });
    }

    async checkEmailExist(userEmail) {
        return new Request({
            url: "/user/checkEmailExist",
            method: "GET",
            params: {
                email: userEmail
            },
            headers: {},
            data: {},
        }).send().then(res => {
            console.log(res);
            return res.data.message === '邮箱已存在';
        });
    }

    async checkNameExist(userName) {
        return new Request({
            url: "/user/checkNameExist",
            method: "GET",
            params: {
                name: userName
            },
            headers: {},
            data: {},
        }).send().then(res => {
            return res.data.message === '用户名已存在';
        });
    }

    async getUserFolder() {
        return new Request({
            url: "/userFile/getUserFolder",
            method: "GET",
            params: {},
            headers: {},
            data: {},
        }).send().then(res => {
            console.log(res.data.data);
            return res.data.data;
        });
    }

    async getFilesInFolder(folderID) {
        return new Request({
            url: "/userFile/getFilesInFolder",
            method: "GET",
            params: {
                folderID: folderID
            },
            headers: {},
            data: {},
        }).send().then(res => {
            if (res.data.status === 'success') {
                console.log(res.data.data);
                return res.data.data;
            } else {
                return false;
            }
        });
    }

    async createFolder(fileName, parentID) {
        const fileRegx = /^[^\/\\:\?\*<>\|'"]+$/;
        if (!fileRegx.test(fileName)) {
            return false;
        }
        return new Request({
            url: "/userFile/create",
            method: "POST",
            params: {},
            headers: {},
            data: {
                fileName: fileName,
                parentID: parentID,
                fileType: 'folder'
            }
        }).send().then(res => {
            if (res.data.status === 'success') {
                return res.data.data;
            } else {
                return false;
            }
        });
    }

    async createFile(fileName, parentID) {
        const fileRegx = /^[^\/\\:\?\*<>\|'"]+$/;
        if (!fileRegx.test(fileName)) {
            return false;
        }
        console.log("创建文件参数：" + fileName + " " + parentID);
        return new Request({
            url: "/userFile/create",
            method: "POST",
            params: {},
            headers: {},
            data: {
                fileName: fileName,
                parentID: parentID,
                fileType: 'file'
            }
        }).send().then(res => {
            if (res.data.status === 'success') {
                return res.data.data;
            } else {
                return false;
            }
        });
    }

    async delete(fileID) {
        return new Request({
            url: "/userFile/delete",
            method: "POST",
            params: {
                fileID: fileID
            },
            headers: {},
            data: {}
        }).send().then(res => {
            return res.data.status === 'success';
        });
    }

    async rename(fileID, newName) {
        return new Request({
            url: "/userFile/rename",
            method: "POST",
            params: {
                fileID: fileID,
                newName: newName,
            },
            headers: {},
            data: {}
        }).send().then(res => {
            return res.data.status === 'success';
        })
    }

    async move(fileID, newParentID) {
        return new Request({
            url: "/userFile/move",
            method: "POST",
            params: {
                fileID: fileID,
                newParentID: newParentID,
            },
            headers: {},
            data: {}
        }).send().then(res => {
            return res.data.status === 'success';
        })
    }

    async clone(fileID, newParentID) {
        return new Request({
            url: "/userFile/clone",
            method: "POST",
            params: {},
            headers: {},
            data: {
                fileID: fileID,
                newParentID: newParentID,
            }
        }).send().then(res => {
            return res.data.status === 'success';
        })
    }

    async getDownload(fileID) {
        return new Request({
            url: "/userFile/getDownload",
            method: "GET",
            params: {
                fileID: fileID,
            },
            headers: {},
            data: {}
        }).send().then(res => {
            if (res.data.status === 'success') {
                return `${store.state.ROOT_URL}/download?token=${res.data.data}`;
            } else {
                return false;
            }
        });
    }

    async basicUpload(file, parentID) {
        const formData = new FormData();
        formData.append('folderID', new Blob([parentID], {type: 'application/json'}));
        formData.append('file', file);
        return new Request({
            url: "/userFile/upload",
            method: "POST",
            params: {},
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            data: formData
        }).send().then(res => {
            return res.data.status === 'success';
        })
    }

    async remoteDownload(url, parentID, fileName) {
        return new Request({
            url: "/userFile/remoteDownload",
            method: "POST",
            params: {},
            headers: {},
            data: {
                url: url,
                parentID: parentID,
                fileName: fileName
            }
        }).send().then(res => {
            return res.data.status === 'success';
        })
    }

    async getTaskList(taskID) {
        return new Request({
            url: "/userFile/getRemoteTaskList",
            method: "GET",
            params: {},
            headers: {},
            data: {}
        }).send().then(res => {
            return res.data.data;
        })
    }

    async pauseTask(task_uuid) {
        return new Request({
            url: "/userFile/pauseRemoteDownload",
            method: "GET",
            params: {
                taskID: task_uuid
            },
            headers: {},
            data: {}
        }).send().then(res => {
            return res.data.status === 'success';
        })
    }

    async resumeTask(task_uuid) {
        return new Request({
            url: "/userFile/resumeRemoteDownload",
            method: "GET",
            params: {
                taskID: task_uuid
            },
            headers: {},
            data: {}
        }).send().then(res => {
            return res.data.status === 'success';
        })
    }

    async deleteTask(task_uuid) {
        return new Request({
            url: "/userFile/deleteRemoteDownload",
            method: "GET",
            params: {
                taskID: task_uuid
            },
            headers: {},
            data: {}
        }).send().then(res => {
            return res.data.status === 'success';
        })
    }

    async shareFile(shareDto) {
        console.log(shareDto);
        return new Request({
            url: "/userFile/shareFile",
            method: "POST",
            params: {},
            headers: {},
            data: {
                ...shareDto
            }
        }).send().then(res => {
            return res.data.status === 'success';
        })
    }

    async getSharedFiles() {
        return new Request({
            url: "/userFile/getSharedFiles",
            method: "GET",
            params: {},
            headers: {},
            data: {}
        }).send().then(res => {
            return res.data.data;
        })
    }

    async getMySharedFiles() {
        return new Request({
            url: "/userFile/getMySharedFiles",
            method: "GET",
            params: {},
            headers: {},
            data: {}
        }).send().then(res => {
            console.log(res.data.data);
            return res.data.data;
        })
    }

    async getShareDownload(shareID) {
        return new Request({
            url: "/userFile/getShareDownload",
            method: "GET",
            params: {
                shareID: shareID
            },
            headers: {},
            data: {}
        }).send().then(res => {
            return `${store.state.ROOT_URL}/download?token=${res.data.data}`;
        })
    }

    deleteShare(shareID) {
        return new Request({
            url: "/userFile/deleteShare",
            method: "GET",
            params: {
                shareID: shareID
            },
            headers: {},
            data: {}
        }).send().then(res => {
            return res.data.status === 'success';
        })
    }

    async getFriendList() {
        return new Request({
            url: '/socialize/getFriendList',
            method: 'GET',
            params: {},
            headers: {},
            data: {}
        }).send().then(res => {
            return res.data.data;
        })
    }

    async addFriend(email) {
        return new Request({
            url: '/socialize/addFriend',
            method: 'GET',
            params: {
                email: email
            },
            headers: {},
            data: {}
        }).send().then(res => {
            return res.data.status === 'success';
        });
    }

    async acceptFriend(friend_id) {
        return new Request({
            url: '/socialize/acceptFriend',
            method: 'GET',
            params: {
                friendID: friend_id
            },
            headers: {},
            data: {}
        }).send().then(res => {
            return res.data.status === 'success';
        });
    }

    async rejectFriend(friendID) {
        return new Request({
            url: '/socialize/rejectFriend',
            method: 'GET',
            params: {
                friendID: friendID
            },
            headers: {},
            data: {}
        }).send().then(res => {
            return res.data.status === 'success';
        });
    }

    getAcceptList() {
        return new Request({
            url: '/socialize/getAcceptList',
            method: 'GET',
            params: {},
            headers: {},
            data: {}
        }).send().then(res => {
            return res.data.data;
        });
    }

    getLongShareDownload(shareID) {
        return new Request({
            url: '/userFile/getLongShareDownload',
            method: 'GET',
            params: {
                shareID: shareID
            },
            headers: {},
            data: {}
        }).send().then(res => {
            return `${store.state.ROOT_URL}/download?token=${res.data.data}`;
        });

    }

    async shareSaveToDrive(share_id, rootFileID) {
        return new Request({
            url: '/userFile/shareSaveToDrive',
            method: 'GET',
            params: {
                shareID: share_id,
            },
            headers: {},
            data: {}
        }).send().then(res => {
            return res.data.status === 'success';
        })
    }

    async getFile(file_id) {
        return new Request({
            url: '/userFile/getFileChain',
            method: 'GET',
            params: {
                fileID: file_id
            },
            headers: {},
            data: {}
        }).send().then(res => {
            console.log("hello",res.data.data);
            return res.data.data;
        })
    }

    async getUser(id) {
        return new Request({
            url: '/getUser',
            method: 'GET',
            params: {
                userID: id
            },
            headers: {},
            data: {}
        }).send().then(res => {
            return res.data.data;
        })
    }
}

export default new Api();