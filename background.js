chrome.runtime.onInstalled.addListener(({reason, version}) => {
    if (reason === chrome.runtime.OnInstalledReason.INSTALL) {
        showReadme();
    }
});

chrome.action.onClicked.addListener((tab) => {
    showReadme();
});

function showReadme(info, tab) {
    let url = chrome.runtime.getURL("pages/main.html");
    chrome.tabs.create({url});
}
