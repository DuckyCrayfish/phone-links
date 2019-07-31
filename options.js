const defaultTelFormat = 'tel:+1-{1}-{2}-{3}';
const defaultTextFormat = '{0}';
let settings = {
    telLinkFormat: defaultTelFormat,
    linkTextFormat: defaultTextFormat,
    overrideLinks: true,
    ignoredDomains: [],
    ignoredURLS: []
};

const saveButton = document.getElementById("saveButton");
const telLinkFormat = document.getElementById("telLinkFormat");
const linkTextFormat = document.getElementById("linkTextFormat");
const overrideLinks = document.getElementById("overrideLinks");
const status = document.getElementById("status");
const filteredDomainsList = document.getElementById("filteredDomainsList");
const filteredDomainsTR = document.getElementById("filteredDomainsTR");
const filteredUrlList = document.getElementById("filteredURLList");
const filteredUrlsTR = document.getElementById("filteredURLSTR");


saveButton.addEventListener("click", saveOptions);
restoreOptions();

function restoreOptions() {
    chrome.storage.local.get(settings, items => {
        settings = items;
        telLinkFormat.value = items.telLinkFormat;
        linkTextFormat.value = items.linkTextFormat;
        overrideLinks.checked = items.overrideLinks;

        restoreDomains();
        restoreURLS();
    });
}

function saveOptions() {
    chrome.storage.local.set({
        telLinkFormat: telLinkFormat.value,
        linkTextFormat: linkTextFormat.value,
        overrideLinks: overrideLinks.value
    }, () => {
        // Update status to let user know options were saved.
        status.textContent = "Options Saved";
        setTimeout(() => { status.innerHTML = "&nbsp;"; }, 750);
    });
}

function restoreDomains() {
    if (settings.ignoredDomains.length == 0) {
        filteredDomainsTR.remove();
    } else {
        for (let i = 0; i < settings.ignoredDomains.length; i++) {
            let hideButton = document.createElement("div");
            hideButton.className = "hide-button";
            hideButton.appendChild(document.createTextNode("X"));
            let item = document.createElement("li");
            item.title = settings.ignoredDomains[i];
            item.appendChild(hideButton);
            item.appendChild(document.createTextNode(decodeURI(settings.ignoredDomains[i])));
            filteredDomainsList.appendChild(item);
            item.onclick = handleDomainRemoval;
        }
    }
}

function restoreURLS() {
    if (settings.ignoredURLS.length == 0) {
        filteredUrlsTR.remove();
    } else {
        for (let i = 0; i < settings.ignoredURLS.length; i++) {
            let hideButton = document.createElement("div");
            hideButton.className = "hide-button";
            hideButton.appendChild(document.createTextNode("X"));
            let item = document.createElement("li");
            item.title = settings.ignoredURLS[i];
            item.appendChild(hideButton);
            item.appendChild(document.createTextNode(decodeURI(settings.ignoredURLS[i])));
            filteredUrlList.appendChild(item);
            item.onclick = handleURLRemoval;
        }
    }
}

function handleDomainRemoval(event) {
    let data = event.target.textContent.substring(1);
    settings.ignoredDomains.splice(settings.ignoredDomains.indexOf(data), 1);
    chrome.storage.local.set({
        ignoredDomains: settings.ignoredDomains
    }, () => {
        event.target.remove();
        if (settings.ignoredDomains.length == 0)
            filteredDomainsTR.remove();
    });
}

function handleURLRemoval(event) {
    let data = event.target.textContent.substring(1);
    settings.ignoredURLS.splice(settings.ignoredURLS.indexOf(data), 1);
    chrome.storage.local.set({
        ignoredURLS: settings.ignoredURLS
    }, () => {
        event.target.remove();
        if (settings.ignoredURLS.length == 0)
            filteredUrlsTR.remove();
    });
}
