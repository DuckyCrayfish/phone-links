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


chrome.tabs.query({ active: true, currentWindow: true }, ([activeTab]) => initializeDOM(activeTab));
chrome.tabs.onActivated.addListener(activeInfo => chrome.tabs.get(activeInfo.tabId, initializeDOM));

function initializeDOM(activeTab) {
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
        filterDomainCheckbox.checked = settings.ignoredDomains.indexOf(domain) > -1;
        filterURLCheckbox.checked = settings.ignoredURLS.indexOf(url) > -1;
        customFormatCheckbox.checked = settings.useCustom.indexOf(domain) > -1;
        if (settings.useCustom.indexOf(domain) > -1) {
            let domainIndex = settings.useCustom.indexOf(domain);
            customFormatRow.style.display = "block";
            telLinkFormat.value = settings.customTel[domainIndex];
            linkTextFormat.value = settings.customText[domainIndex];
        }
    });
}

saveButton.addEventListener("click", function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(arrayOfTabs) {
        const activeTab = arrayOfTabs[0];
        const domain = encodeURI(activeTab.url.match(regexDomain)[1]);
        chrome.storage.local.get({
            useCustom: [],
            customTel: [],
            customText: []
        }, function(settings) {
            if (settings.useCustom.indexOf(domain) > -1) {
                let domainIndex = settings.useCustom.indexOf(domain);
                settings.customTel[domainIndex] = telLinkFormat.value;
                settings.customText[domainIndex] = linkTextFormat.value;
            }
            chrome.storage.local.set({
                customTel: settings.customTel,
                customText: settings.customText
            }, chrome.tabs.reload);
        });
    });
});

customFormatCheckbox.addEventListener("change", function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(arrayOfTabs) {
        const activeTab = arrayOfTabs[0];
        const domain = encodeURI(activeTab.url.match(regexDomain)[1]);
        chrome.storage.local.get({
            useCustom: [],
            customTel: [],
            customText: [],
            telLinkFormat: defaultTelFormat,
            linkTextFormat: defaultTextFormat
        }, function(settings) {
            let checked = customFormatCheckbox.checked;
            if (checked && settings.useCustom.indexOf(domain) < 0)
                settings.useCustom.push(domain);
            else if (!checked && settings.useCustom.indexOf(domain) > -1) {
                settings.customTel.splice(settings.useCustom.indexOf(domain), 1);
                settings.customText.splice(settings.useCustom.indexOf(domain), 1);
                settings.useCustom.splice(settings.useCustom.indexOf(domain), 1);
            }
            customFormatRow.style.display = settings.useCustom.indexOf(domain) > -1 ? "block" : "none";
            if (settings.useCustom.indexOf(domain) > -1) {
                let domainIndex = settings.useCustom.indexOf(domain);
                settings.customTel.splice(domainIndex, 0, settings.telLinkFormat);
                settings.customText.splice(domainIndex, 0, settings.linkTextFormat);
                telLinkFormat.value = settings.customTel[domainIndex];
                linkTextFormat.value = settings.customText[domainIndex];
            }
            chrome.storage.local.set({
                useCustom: settings.useCustom,
                customTel: settings.customTel,
                customText: settings.customText
            }, chrome.tabs.reload);
        });
    });
});

filterDomainCheckbox.addEventListener("change", function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(arrayOfTabs) {
        const activeTab = arrayOfTabs[0];
        const domain = encodeURI(activeTab.url.match(regexDomain)[1]);
        chrome.storage.local.get({
            ignoredDomains: []
        }, function(settings) {
            let checked = filterDomainCheckbox.checked;
            if (checked && settings.ignoredDomains.indexOf(domain) < 0)
                settings.ignoredDomains.push(domain);
            else if (!checked && settings.ignoredDomains.indexOf(domain) > -1)
                settings.ignoredDomains.splice(settings.ignoredDomains.indexOf(domain), 1);
            chrome.storage.local.set({
                ignoredDomains: settings.ignoredDomains
            }, chrome.tabs.reload);
        });
    });
});

filterURLCheckbox.addEventListener("change", function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(arrayOfTabs) {
        const activeTab = arrayOfTabs[0];
        const url = encodeURI(activeTab.url);
        chrome.storage.local.get({
            ignoredURLS: []
        }, function(settings) {
            let checked = filterURLCheckbox.checked;
            if (checked && settings.ignoredURLS.indexOf(url) < 0)
                settings.ignoredURLS.push(url);
            else if (!checked && settings.ignoredURLS.indexOf(url) > -1)
                settings.ignoredURLS.splice(settings.ignoredURLS.indexOf(url), 1);
            chrome.storage.local.set({
                ignoredURLS: settings.ignoredURLS
            }, chrome.tabs.reload);
        });
    });
});
