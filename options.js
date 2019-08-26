let settings = {
    telLinkFormat: defaultTelFormat,
    linkTextFormat: defaultTextFormat,
    ignoredDomains: [],
    ignoredURLS: []
};

const saveButton = document.getElementById("saveButton");
const telLinkFormat = document.getElementById("telLinkFormat");
const linkTextFormat = document.getElementById("linkTextFormat");
const status = document.getElementById("status");
const filteredDomainsList = document.getElementById("filteredDomainsList");
const filteredDomainsTR = document.getElementById("filteredDomainsTR");
const filteredUrlList = document.getElementById("filteredURLList");
const filteredUrlsTR = document.getElementById("filteredURLSTR");


// Entry point.
saveButton.addEventListener("click", saveOptions);
restoreOptions();

/**
 * Retrieve settings and apply them to DOM elements.
 */
function restoreOptions() {
    chrome.storage.local.get(settings, items => {
        settings = items;
        telLinkFormat.value = items.telLinkFormat;
        linkTextFormat.value = items.linkTextFormat;

        restoreDomains();
        restoreURLS();
    });
}

/**
 * Save all options, display feedback message.
 */
function saveOptions() {
    chrome.storage.local.set({
        telLinkFormat: telLinkFormat.value,
        linkTextFormat: linkTextFormat.value
    }, () => {
        // Update status to let user know options were saved.
        status.textContent = "Options Saved";
        setTimeout(() => { status.innerHTML = "&nbsp;"; }, 750);
    });
}

/**
 * Update domain filter list DOM to represent settings.
 */
function restoreDomains() {
    if (settings.ignoredDomains.length == 0) {
        filteredDomainsTR.remove();
    } else {
        for (const domain of settings.ignoredDomains) {
            // Create a list item for each filtered domain.
            const removeButton = document.createElement("div");
            removeButton.className = "hide-button";
            removeButton.appendChild(document.createTextNode("X"));
            const listItem = document.createElement("li");
            listItem.title = domain;
            listItem.appendChild(removeButton);
            listItem.appendChild(document.createTextNode(decodeURI(domain)));
            filteredDomainsList.appendChild(listItem);
            listItem.onclick = handleDomainRemoval;
        }
    }
}

/**
 * Update URL filter list DOM to represent settings.
 */
function restoreURLS() {
    if (settings.ignoredURLS.length == 0) {
        filteredUrlsTR.remove();
    } else {
        for (const url of settings.ignoredURLS) {
            // Create a list item for each filtered URL.
            const removeButton = document.createElement("div");
            removeButton.className = "hide-button";
            removeButton.appendChild(document.createTextNode("X"));
            const listItem = document.createElement("li");
            listItem.title = url;
            listItem.appendChild(removeButton);
            listItem.appendChild(document.createTextNode(decodeURI(url)));
            filteredUrlList.appendChild(listItem);
            listItem.onclick = handleURLRemoval;
        }
    }
}

/*
 * Click listener for domain filter listing. Deletes on click.
 */
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

/*
 * Click listener for URL filter listing. Deletes on click.
 */
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
