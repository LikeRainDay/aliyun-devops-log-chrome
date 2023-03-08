let data = {};
chrome.runtime.onInstalled.addListener(({reason, version}) => {
    if (reason === chrome.runtime.OnInstalledReason.INSTALL) {
        showReadme();
    }
});

chrome.action.onClicked.addListener((tab) => {
    showReadme();
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.message === 'init_cookies') {
        getCookies(request.url, request.name).then(res => {
            data[request.name] = res.value;
        });
    }
    sendResponse({data: data});
});

async function getCookies(url, name) {
    return await chrome.cookies.get({url: url, name: name});
}

function showReadme(info, tab) {
    let url = chrome.runtime.getURL("pages/main.html");
    chrome.tabs.create({url});
}

