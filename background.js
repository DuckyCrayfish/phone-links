var defaultTelFormat = 'tel:+1-{1}-{2}-{3}';

chrome.runtime.onInstalled.addListener(function() {
    chrome.contextMenus.create({
        id: "call",
        title: "Call Number",
        contexts: ['selection'],
    });
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
    var regexPhoneNumber = /([\s:]|\d+(?:-|\.)|^)\(?(\d{3})\)?[- \.]?(\d{3})[- \.]?(\d{4})(?=<|\s|$)/g;

    var selectedText = info.selectionText;
    chrome.storage.local.get({
        telLinkFormat: defaultTelFormat
    }, function(settings) {
        if (!regexPhoneNumber.test(selectedText)) {
            chrome.tabs.update(tab.id, { url: settings.telLinkFormat.substring(0, settings.telLinkFormat.indexOf('{')) + encodeURIComponent(selectedText) });
            return;
        }
        var match = regexPhoneNumber.exec(selectedText);
        var formattedPhone = settings.telLinkFormat.format(match[0], match[2], match[3], match[4]);
        chrome.tabs.update(tab.id, { url: formattedPhone });
    });

});

if (!String.prototype.format) {
    String.prototype.format = function() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) {
            return (typeof args[number] != 'undefined') ? args[number] : match;
        });
    };
}
