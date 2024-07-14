import axios from "axios";
axios.defaults.baseURL = 'http://localhost:3000';

chrome.storage.sync.get('token', function(data) {
    if(data.token){
        axios.defaults.headers.Authorization = `${data.token}`;
    }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.action == 'login') {
        axios.post('/api/user/login', request.data, {withCredentials: "true"}).then(response => {
            chrome.storage.sync.set({token: response.token});
            chrome.storage.sync.set({token: response.token});
            axios.defaults.headers.Authorization = `${response.token}`;
            sendResponse(response.data);
        }).catch(error => {
            sendResponse({error: error.response.data.message});
        });
        return true;
    }
    if(request.action == 'logout') {
        axios.post('/api/user/logout', {withCredentials: true}).then(response => {
            chrome.storage.sync.remove('token');
            chrome.storage.sync.remove('login');
            axios.defaults.headers.Authorization = '';
            sendResponse(response.data);
        }).catch(error => {
            sendResponse({error: error.response.data.message});
        });
        return true;
    }
    if(request.action == 'getNotes') {
        axios.get(`/api/note?videoId=${request.data.vid}`).then(response => {
            console.log(response.data);
            sendResponse(response.data);
        }).catch(error => {
            sendResponse({error: error.response.data.message});
        });
        return true;
    }
});