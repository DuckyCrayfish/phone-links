const contextMenu = {
    id: "call",
    title: "Call Number",
    contexts: ['selection'],
};


chrome.runtime.onInstalled.addListener(() => chrome.contextMenus.create(contextMenu));

chrome.contextMenus.onClicked.addListener(function(info, tab) {
    const selectedText = info.selectionText;

    chrome.storage.local.get({ telLinkFormat: defaultTelFormat }, settings => {
        let match = regexPhoneNumber.exec(selectedText);
        if (match == null) {
            chrome.tabs.update(tab.id, { url: settings.telLinkFormat.substring(0, settings.telLinkFormat.indexOf('{')) + encodeURIComponent(selectedText) });
            return;
        }
        let formattedPhone = settings.telLinkFormat.format(match[0], match[2], match[3], match[4]);
        chrome.tabs.update(tab.id, { url: formattedPhone });
    });
});
