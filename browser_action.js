const regexDomain = /^[\w-]+:\/*\[?([\w\.:-]+)\]?(?::\d+)?/;

const defaultTelFormat = 'tel:+1-{1}-{2}-{3}';
const defaultTextFormat = '{0}';

const filterDomainCheckbox = document.getElementById('filterDomain');
const filterURLCheckbox = document.getElementById('filterURL');
const customFormatCheckbox = document.getElementById('customFormat');

const currentDomainLabel = document.getElementById('currentDomainLabel');
const currentURLLabel = document.getElementById('currentURLLabel');

const customFormatRow = document.getElementById('customFormatRow');
const telLinkFormat = document.getElementById('telLinkFormat');
const linkTextFormat = document.getElementById('linkTextFormat');

const saveButton = document.getElementById('saveButton');

let currentTab;


chrome.tabs.query({ active: true, currentWindow: true }, ([activeTab]) => initializeDOM(activeTab));
chrome.tabs.onActivated.addListener(activeInfo => chrome.tabs.get(activeInfo.tabId, initializeDOM));

function initializeDOM(activeTab) {
    currentTab = activeTab;
    const domain = encodeURI(activeTab.url.match(regexDomain)[1]);
    const url = encodeURI(activeTab.url);

    currentDomainLabel.textContent = domain;
    currentURLLabel.textContent = activeTab.url;

    chrome.storage.local.get({
        ignoredDomains: [],
        ignoredURLS: [],
        useCustom: [],
        customTel: [],
        customText: []
    }, function(settings) {
        filterURLCheckbox.checked = settings.ignoredURLS.indexOf(url) > -1;
        filterDomainCheckbox.checked = settings.ignoredDomains.indexOf(domain) > -1;
        let customIndex = settings.useCustom.indexOf(domain);
        customFormatCheckbox.checked = customIndex > -1;
        if (customIndex > -1) {
            customFormatRow.style.display = "block";
            telLinkFormat.value = settings.customTel[customIndex];
            linkTextFormat.value = settings.customText[customIndex];
        } else {
            customFormatRow.style.display = "none";
        }
    });
}

saveButton.addEventListener("click", function() {
    const activeTab = currentTab;
    const domain = encodeURI(activeTab.url.match(regexDomain)[1]);
    chrome.storage.local.get({
        useCustom: [],
        customTel: [],
        customText: []
    }, function(settings) {
        let customIndex = settings.useCustom.indexOf(domain);
        if (customIndex > -1) {
            settings.customTel[customIndex] = telLinkFormat.value;
            settings.customText[customIndex] = linkTextFormat.value;
        }
        chrome.storage.local.set({
            customTel: settings.customTel,
            customText: settings.customText
        }, chrome.tabs.reload);
    });
});

customFormatCheckbox.addEventListener("change", function() {
    const activeTab = currentTab;
    const domain = encodeURI(activeTab.url.match(regexDomain)[1]);
    chrome.storage.local.get({
        useCustom: [],
        customTel: [],
        customText: [],
        telLinkFormat: defaultTelFormat,
        linkTextFormat: defaultTextFormat
    }, function(settings) {
        let checked = customFormatCheckbox.checked;
        let customIndex = settings.useCustom.indexOf(domain);
        if (checked && customIndex < 0) {
            customIndex = settings.useCustom.push(domain) - 1;
            customFormatRow.style.display = "block";
            settings.customTel.splice(customIndex, 0, settings.telLinkFormat);
            settings.customText.splice(customIndex, 0, settings.linkTextFormat);
            telLinkFormat.value = settings.customTel[customIndex];
            linkTextFormat.value = settings.customText[customIndex];
        } else if (!checked && customIndex > -1) {
            settings.customTel.splice(customIndex, 1);
            settings.customText.splice(customIndex, 1);
            settings.useCustom.splice(customIndex, 1);
            customFormatRow.style.display = "none";
        }
        chrome.storage.local.set({
            useCustom: settings.useCustom,
            customTel: settings.customTel,
            customText: settings.customText
        }, chrome.tabs.reload);
    });
});

filterDomainCheckbox.addEventListener("change", function() {
    const activeTab = currentTab;
    const domain = encodeURI(activeTab.url.match(regexDomain)[1]);
    chrome.storage.local.get({
        ignoredDomains: []
    }, function(settings) {
        let checked = filterDomainCheckbox.checked;
        let domainIndex = settings.ignoredDomains.indexOf(domain);
        if (checked && domainIndex < 0)
            settings.ignoredDomains.push(domain);
        else if (!checked && domainIndex > -1)
            settings.ignoredDomains.splice(domainIndex, 1);
        chrome.storage.local.set({
            ignoredDomains: settings.ignoredDomains
        }, chrome.tabs.reload);
    });
});

filterURLCheckbox.addEventListener("change", function() {
    const activeTab = currentTab;
    const url = encodeURI(activeTab.url);
    chrome.storage.local.get({
        ignoredURLS: []
    }, function(settings) {
        let checked = filterURLCheckbox.checked;
        let urlIndex = settings.ignoredURLS.indexOf(url);
        if (checked && urlIndex < 0)
            settings.ignoredURLS.push(url);
        else if (!checked && urlIndex > -1)
            settings.ignoredURLS.splice(urlIndex, 1);
        chrome.storage.local.set({
            ignoredURLS: settings.ignoredURLS
        }, chrome.tabs.reload);
    });
});
