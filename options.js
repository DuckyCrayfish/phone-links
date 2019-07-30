var defaultTelFormat = 'tel:+1-{1}-{2}-{3}';
var defaultTextFormat = '{0}';
var settings = {
    telLinkFormat: defaultTelFormat,
    linkTextFormat: defaultTextFormat,
    overrideLinks: true,
    ignoredDomains: [],
    ignoredURLS: []
};

var saveButton = document.getElementById("saveButton");
var telLinkFormat = document.getElementById("telLinkFormat");
var linkTextFormat = document.getElementById("linkTextFormat");
var overrideLinks = document.getElementById("overrideLinks");
var status = document.getElementById("status");
var filteredDomainsList = document.getElementById("filteredDomainsList");
var filteredDomainsTR = document.getElementById("filteredDomainsTR");
var filteredUrlList = document.getElementById("filteredURLList");
var filteredUrlsTR = document.getElementById("filteredURLSTR");

document.addEventListener("DOMContentLoaded", function(event) {
    restoreOptions();
    saveButton.addEventListener("click", saveOptions);
});

function saveOptions() {
    chrome.storage.local.set({
        telLinkFormat: telLinkFormat.value,
        linkTextFormat: linkTextFormat.value,
        overrideLinks: overrideLinks.value
    }, function() {
        // Update status to let user know options were saved.
        status.textContent = "Options Saved";
        setTimeout(function() {
            status.innerHTML = "&nbsp;";
        }, 750);
    });
}


function restoreOptions() {
    chrome.storage.local.get(settings, function(items) {
        settings = items;
        telLinkFormat.value = items.telLinkFormat;
        linkTextFormat.value = items.linkTextFormat;
        overrideLinks.checked = items.overrideLinks;

        restoreDomains();
        restoreURLS();
    });
}

function restoreDomains() {
    if (settings.ignoredDomains.length == 0) {
        filteredDomainsTR.remove();
    } else {
        for (var i = 0; i < settings.ignoredDomains.length; i++) {
            var item = document.createElement("li");
            var hideButton = document.createElement("div");
            hideButton.className = "hide-button";
            hideButton.appendChild(document.createTextNode("X"));
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
        for (var i = 0; i < settings.ignoredURLS.length; i++) {
            var item = document.createElement("li");
            var hideButton = document.createElement("div");
            hideButton.className = "hide-button";
            hideButton.appendChild(document.createTextNode("X"));
            item.title = settings.ignoredURLS[i];
            item.appendChild(hideButton);
            item.appendChild(document.createTextNode(decodeURI(settings.ignoredURLS[i])));
            filteredUrlList.appendChild(item);
            item.onclick = handleURLRemoval;
        }
    }
}

function handleDomainRemoval(event) {
    var data = event.target.textContent.substring(1);
    settings.ignoredDomains.splice(settings.ignoredDomains.indexOf(data), 1);
    chrome.storage.local.set({
        ignoredDomains: settings.ignoredDomains
    }, function() {
        event.target.remove();
        if (settings.ignoredDomains.length == 0)
            filteredDomainsTR.remove();
    });
}

function handleURLRemoval(event) {
    var data = event.target.textContent.substring(1);
    settings.ignoredURLS.splice(settings.ignoredURLS.indexOf(data), 1);
    chrome.storage.local.set({
        ignoredURLS: settings.ignoredURLS
    }, function() {
        event.target.remove();
        if (settings.ignoredURLS.length == 0)
            filteredUrlsTR.remove();
    });
}
