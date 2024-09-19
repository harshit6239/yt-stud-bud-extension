import axios from "axios";
axios.defaults.baseURL = "http://localhost:3000";

chrome.storage.sync.get("token", function (data) {
    console.log(data);
    if (data.token) {
        axios.defaults.headers.Authorization = `${data.token}`;
        console.log("Token set");
    }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action == "login") {
        axios
            .post("/api/user/login", request.data, {
                withCredentials: true,
            })
            .then((response) => {
                console.log(response);
                chrome.storage.sync.set({ token: response.data.token });
                axios.defaults.headers.Authorization = `${response.data.token}`;
                sendResponse({ auth: true });
            })
            .catch((error) => {
                sendResponse({ error: error.response.data.message });
            });
        return true;
    } else if (request.action == "logout") {
        chrome.storage.sync.remove("token");
        axios.defaults.headers.Authorization = "";
        sendResponse({ auth: false });
        return true;
    } else if (request.action == "getNotes") {
        axios
            .get(`/api/note?videoId=${request.data.vid}`)
            .then((response) => {
                console.log("axios ", response);
                sendResponse(response.data); // Send the response correctly
            })
            .catch((error) => {
                sendResponse({ error: error.response.data.message });
            });
        // Indicate that the response will be sent asynchronously
        return true;
    }
});
