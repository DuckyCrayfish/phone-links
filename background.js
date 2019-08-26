const contextMenu = {
    id: "call",
    title: "Call Number",
    contexts: ['selection'],
};


// Create the context menu item.
chrome.runtime.onInstalled.addListener(() => chrome.contextMenus.create(contextMenu));

// Context menu click listener.
chrome.contextMenus.onClicked.addListener(({ selectionText }, tab) => {
    chrome.storage.local.get({ telLinkFormat: defaultTelFormat }, settings => {
        let url;
        let match = regexPhoneNumber.exec(selectionText);
        if (match == null)
            url = settings.telLinkFormat.substring(0, settings.telLinkFormat.indexOf('{')) + encodeURIComponent(selectionText);
        else
            url = settings.telLinkFormat.format(match[0], match[2], match[3], match[4]);
        chrome.tabs.update(tab.id, { url });
    });
});
