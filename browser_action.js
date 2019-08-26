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


// Entry point
// Get active tab and initialize the popup DOM.
chrome.tabs.query({ active: true, currentWindow: true }, ([activeTab]) => initializeDOM(activeTab));
// Listen for tab switches to update the popup DOM.
chrome.tabs.onActivated.addListener(activeInfo => chrome.tabs.get(activeInfo.tabId, initializeDOM));
// Add popup settings DOM event listeners.
filterURLCheckbox.addEventListener("change", onUrlCheckboxChanged);
filterDomainCheckbox.addEventListener("change", onDomainCheckboxChanged);
customFormatCheckbox.addEventListener("change", onFormatCheckboxChanged);
saveButton.addEventListener("click", onSaveButtonClicked);

/**
 * Initialize the pop-up window with the settings for the tab activeTab.
 * @param {Object} activeTab The tab to update the pop-up settings for.
 */
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
        filterURLCheckbox.checked = settings.ignoredURLS.includes(url);
        filterDomainCheckbox.checked = settings.ignoredDomains.includes(domain);

        // Update custom format elements.
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

/**
 * Update the URL settings based on the popup checkbox.
 * Runs when the 'URL filter' checkbox is changed.
 */
function onUrlCheckboxChanged() {
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
}

/**
 * Update the domain settings based on the popup checkbox.
 * Runs when the 'domain filter' checkbox is changed.
 */
function onDomainCheckboxChanged() {
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
}

/**
 * Update the domain custom format settings based on the popup.
 * Runs when the 'custom format' checkbox is changed.
 */
function onFormatCheckboxChanged() {
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
}

/**
 * Update the domain custom format settings based on the popup.
 * Runs when the 'custom format' save button is pressed.
 */
function onSaveButtonClicked() {
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
}
