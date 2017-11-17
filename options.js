document.addEventListener("DOMContentLoaded", function (event) {
    restore_options();
    document.getElementById("saveButton").addEventListener("click", save_options);
});

var settings = null;

function save_options() {
    var linkFormatValue = document.getElementById("telLinkFormat").value;
    var linkTextFormatValue = document.getElementById("linkTextFormat").value;
    var overrideValue = document.getElementById("overrideLinks").checked;
    chrome.storage.local.set({
        telLinkFormat: linkFormatValue,
        linkTextFormat: linkTextFormatValue,
        overrideLinks: overrideValue
    }, function () {
        // Update status to let user know options were saved.
        var status = document.getElementById("status");
        status.textContent = "Options Saved";
        setTimeout(function () {
            status.innerHTML = "&nbsp;";
        }, 750);
    });
}


function restore_options() {
    chrome.storage.local.get({
        telLinkFormat: "tel:+1-{1}-{2}-{3}",
        linkTextFormat: "{0}",
        overrideLinks: true,
        ignoredDomains: [],
        ignoredURLS: []
    }, function (items) {
        settings = items;
        document.getElementById("telLinkFormat").value = items.telLinkFormat;
        document.getElementById("linkTextFormat").value = items.linkTextFormat;
        document.getElementById("overrideLinks").checked = items.overrideLinks;

        restoreDomains();
        restoreURLS();
    });
}

function restoreDomains()
{
    if (settings.ignoredDomains.length == 0) {
        document.getElementById("filteredDomainsTR").remove();
    }
    else {
        var domainList = document.getElementById("filteredDomainsList");
        for (var i = 0; i < settings.ignoredDomains.length; i++) {
            var item = document.createElement("li");
            var hideButton = document.createElement("div");
            hideButton.className = "hide-button";
            hideButton.appendChild(document.createTextNode("X"));
            item.title = settings.ignoredDomains[i];
            item.appendChild(hideButton);
            item.appendChild(document.createTextNode(decodeURI(settings.ignoredDomains[i])));
            domainList.appendChild(item);
            item.onclick = handleDomainRemoval;
        }
    }
}

function restoreURLS()
{
    if (settings.ignoredURLS.length == 0) {
        document.getElementById("filteredURLSTR").remove();
    }
    else {
        var urlList = document.getElementById("filteredURLList");
        for (var i = 0; i < settings.ignoredURLS.length; i++) {
            var item = document.createElement("li");
            var hideButton = document.createElement("div");
            hideButton.className = "hide-button";
            hideButton.appendChild(document.createTextNode("X"));
            item.title = settings.ignoredURLS[i];
            item.appendChild(hideButton);
            item.appendChild(document.createTextNode(decodeURI(settings.ignoredURLS[i])));
            urlList.appendChild(item);
            item.onclick = handleURLRemoval;
        }
    }
}

function handleDomainRemoval(event)
{
    var data = event.target.textContent.substring(1);
    settings.ignoredDomains.splice(settings.ignoredDomains.indexOf(data), 1);
    chrome.storage.local.set({
        ignoredDomains: settings.ignoredDomains
    }, function () {
        event.target.remove();
        if (settings.ignoredDomains.length == 0)
            document.getElementById("filteredDomainsTR").remove();
    });
}

function handleURLRemoval(event)
{
    var data = event.target.textContent.substring(1);
    settings.ignoredURLS.splice(settings.ignoredURLS.indexOf(data), 1);
    chrome.storage.local.set({
        ignoredURLS: settings.ignoredURLS
    }, function () {
        event.target.remove();
        if (settings.ignoredURLS.length == 0)
            document.getElementById("filteredURLSTR").remove();
    });
}