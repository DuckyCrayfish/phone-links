var regexDomain = /^[\w-]+:\/*\[?([\w\.:-]+)\]?(?::\d+)?/;

var defaultTelFormat = 'tel:+1-{1}-{2}-{3}';
var defaultTextFormat = '{0}';

document.addEventListener('DOMContentLoaded', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(arrayOfTabs) {
        var activeTab = arrayOfTabs[0];
        var domain = encodeURI(activeTab.url.match(regexDomain)[1]);
        var url = encodeURI(activeTab.url);

        document.getElementById("currentDomainLabel").innerHTML = domain;
        document.getElementById("currentURLLabel").innerHTML = activeTab.url;

        chrome.storage.local.get({
            ignoredDomains: [],
            ignoredURLS: [],
            useCustom: [],
            customTel: [],
            customText: []
        }, function(settings) {
            document.getElementById("filterDomain").checked = settings.ignoredDomains.indexOf(domain) > -1;
            document.getElementById("filterURL").checked = settings.ignoredURLS.indexOf(url) > -1;
            document.getElementById("domainReplacement").checked = settings.useCustom.indexOf(domain) > -1;
            if (settings.useCustom.indexOf(domain) > -1) {
                var domainIndex = settings.useCustom.indexOf(domain);
                document.getElementById("domainReplacementRow").style.visibility = "visible";
                document.getElementById("telLinkFormat").value = settings.customTel[domainIndex];
                document.getElementById("linkTextFormat").value = settings.customText[domainIndex];
            }
        });
    });

    document.getElementById("saveButton").addEventListener("click", function() {
        chrome.tabs.query({ active: true, currentWindow: true }, function(arrayOfTabs) {
            var activeTab = arrayOfTabs[0];
            var domain = encodeURI(activeTab.url.match(regexDomain)[1]);
            chrome.storage.local.get({
                useCustom: [],
                customTel: [],
                customText: []
            }, function(settings) {
                if (settings.useCustom.indexOf(domain) > -1) {
                    var domainIndex = settings.useCustom.indexOf(domain);
                    settings.customTel[domainIndex] = document.getElementById("telLinkFormat").value;
                    settings.customText[domainIndex] = document.getElementById("linkTextFormat").value;
                }
                chrome.storage.local.set({
                    customTel: settings.customTel,
                    customText: settings.customText
                }, function() {
                    chrome.tabs.query({ active: true, currentWindow: true }, function(arrayOfTabs) {
                        chrome.tabs.reload(arrayOfTabs[0].id);
                    });
                });
            });
        });
    });

    document.getElementById("domainReplacement").addEventListener("change", function() {
        chrome.tabs.query({ active: true, currentWindow: true }, function(arrayOfTabs) {
            var activeTab = arrayOfTabs[0];
            var domain = encodeURI(activeTab.url.match(regexDomain)[1]);
            chrome.storage.local.get({
                useCustom: [],
                customTel: [],
                customText: [],
                telLinkFormat: defaultTelFormat,
                linkTextFormat: defaultTextFormat
            }, function(settings) {
                var checked = document.getElementById("domainReplacement").checked;
                if (checked && settings.useCustom.indexOf(domain) < 0)
                    settings.useCustom.push(domain);
                else if (!checked && settings.useCustom.indexOf(domain) > -1) {
                    settings.customTel.splice(settings.useCustom.indexOf(domain), 1);
                    settings.customText.splice(settings.useCustom.indexOf(domain), 1);
                    settings.useCustom.splice(settings.useCustom.indexOf(domain), 1);
                }
                document.getElementById("domainReplacementRow").style.visibility = settings.useCustom.indexOf(domain) > -1 ? "visible" : "hidden";
                if (settings.useCustom.indexOf(domain) > -1) {
                    var domainIndex = settings.useCustom.indexOf(domain);
                    settings.customTel.splice(domainIndex, 0, settings.telLinkFormat);
                    settings.customText.splice(domainIndex, 0, settings.linkTextFormat);
                    document.getElementById("telLinkFormat").value = settings.customTel[domainIndex];
                    document.getElementById("linkTextFormat").value = settings.customText[domainIndex];
                }
                chrome.storage.local.set({
                    useCustom: settings.useCustom,
                    customTel: settings.customTel,
                    customText: settings.customText
                }, function() {
                    chrome.tabs.query({ active: true, currentWindow: true }, function(arrayOfTabs) {
                        chrome.tabs.reload(arrayOfTabs[0].id);
                    });
                });
            });
        });
    });

    document.getElementById("filterDomain").addEventListener("change", function() {
        chrome.tabs.query({ active: true, currentWindow: true }, function(arrayOfTabs) {
            var activeTab = arrayOfTabs[0];
            var domain = encodeURI(activeTab.url.match(regexDomain)[1]);
            chrome.storage.local.get({
                ignoredDomains: []
            }, function(settings) {
                var checked = document.getElementById("filterDomain").checked;
                if (checked && settings.ignoredDomains.indexOf(domain) < 0)
                    settings.ignoredDomains.push(domain);
                else if (!checked && settings.ignoredDomains.indexOf(domain) > -1)
                    settings.ignoredDomains.splice(settings.ignoredDomains.indexOf(domain), 1);
                chrome.storage.local.set({
                    ignoredDomains: settings.ignoredDomains
                }, function() {
                    chrome.tabs.query({ active: true, currentWindow: true }, function(arrayOfTabs) {
                        chrome.tabs.reload(arrayOfTabs[0].id);
                    });
                });
            });
        });
    });

    document.getElementById("filterURL").addEventListener("change", function() {
        chrome.tabs.query({ active: true, currentWindow: true }, function(arrayOfTabs) {
            var activeTab = arrayOfTabs[0];
            var url = encodeURI(activeTab.url);
            chrome.storage.local.get({
                ignoredURLS: []
            }, function(settings) {
                var checked = document.getElementById("filterURL").checked;
                if (checked && settings.ignoredURLS.indexOf(url) < 0)
                    settings.ignoredURLS.push(url);
                else if (!checked && settings.ignoredURLS.indexOf(url) > -1)
                    settings.ignoredURLS.splice(settings.ignoredURLS.indexOf(url), 1);
                chrome.storage.local.set({
                    ignoredURLS: settings.ignoredURLS
                }, function() {
                    chrome.tabs.query({ active: true, currentWindow: true }, function(arrayOfTabs) {
                        chrome.tabs.reload(arrayOfTabs[0].id);
                    });
                });
            });
        });
    });
});
