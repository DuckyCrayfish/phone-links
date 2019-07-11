var regexPatternSplit = /((?:[\s:]|\d+(?:-|\.)|^)\(?\d{3}\)?[- \.]?\d{3}[- \.]?\d{4}(?=<|\s|$))/g;
var regexPatternPhone = /([\s:]|\d+(?:-|\.)|^)\(?(\d{3})\)?[- \.]?(\d{3})[- \.]?(\d{4})(?=<|\s|$)/g;
var regexSplit = new RegExp(regexPatternSplit);
var regexPhone = new RegExp(regexPatternPhone);

var defaultTelFormat = 'tel:+1-{1}-{2}-{3}';
var defaultTextFormat = '{0}';
var telLinkerClassName = "telLinkerInserted";

var domainPattern = /^[\w-]+:\/*\[?([\w\.:-]+)\]?(?::\d+)?/;
var domainRegex = new RegExp(domainPattern);

var filteredTagNames = ["SCRIPT", "STYLE", "BUTTON", "HEAD", "TITLE", "JSL", "NOSCRIPT"];

var settings = null;

//found this on stack overflow; makes it almost feel like we're in good ol' C#
if (!String.prototype.format) {
    String.prototype.format = function() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] != 'undefined'
                ? args[number]
                : match
                ;
        });
    };
}
//entry point? load the settings because there isn't a way to do this Synchronously
chrome.storage.local.get({
    telLinkFormat: defaultTelFormat,
    linkTextFormat: defaultTextFormat,
    overrideLinks: true,
    ignoredDomains: [],
    ignoredURLS: [],
    useCustom: [],
    customTel: [],
    customText: []
}, function(scopedSettings) {
    settings = scopedSettings;
    if (onFilterList())
        return;

    checkCustomReplacement();
    //DOMNodeInserted is listed as deprecated, so might become unavailable soon, so lets use the newer mutationobserver class
    var mutationObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type == "childList")
                for (var i = 0; i < mutation.addedNodes.length; i++)
                    if (mutation.addedNodes[i].className != telLinkerClassName)
                        walkTheDOM(mutation.addedNodes[i], handleNode);
        });
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });
    //inserting on idle, so the DOM may or may not have already been loaded
    if (document.readyState == "loading")
        document.addEventListener("DOMContentLoaded", function() { walkTheDOM(document.body, handleNode); });
    else
        walkTheDOM(document.body, handleNode);
});

function onFilterList() {
    var domain = encodeURI(window.top.location.href.match(domainRegex)[1]);
    var url = encodeURI(window.top.location.href);
    if (settings.ignoredDomains.indexOf(domain) > -1 || settings.ignoredURLS.indexOf(url) > -1)
        return true;
    return false;
}

function checkCustomReplacement() {
    var domain = encodeURI(window.top.location.href.match(domainRegex)[1]);
    if (settings.useCustom.indexOf(domain) > -1) {
        settings.telLinkFormat = settings.customTel[settings.useCustom.indexOf(domain)];
        settings.linkTextFormat = settings.customText[settings.useCustom.indexOf(domain)];
    }
}

function handleNode(node) {
    //updated this so that we no longer override things inside of scripts nodes (stupid that these are counted as visible text, but there it is)
    if (node.nodeType != Node.TEXT_NODE || node.parentElement == null || filteredTagNames.indexOf(node.parentElement.tagName) > -1 || (node.parentElement.tagName == "A" && !settings.overrideLinks))
        return;

    if (node.parentNode.className == telLinkerClassName) //avoid the stack overflow!
        return;
    if (!regexPhone.test(node.data))
        return;
    var newNode = document.createElement("span");
    newNode.className = telLinkerClassName;
    var parts = node.data.split(regexSplit);
    var count = 0;
    parts.forEach(function(part) {
        count++;
        if (count % 2 != 0)
            newNode.appendChild(document.createTextNode(part));
        else {
            part.replace(regexPhone, function(match, leadingChar, areaCode, threeDigits, fourDigits) {
                newNode.appendChild(document.createTextNode(leadingChar));
                match = match.substring(leadingChar.length);
                var formattedPhoneNumber = settings.telLinkFormat.format(match, areaCode, threeDigits, fourDigits);
                var formattedPhoneText = settings.linkTextFormat.format(match, areaCode, threeDigits, fourDigits);

                var link = document.createElement("A");
                link.className = telLinkerClassName;
                link.href = "javascript:void(0);";
                link.appendChild(document.createTextNode(formattedPhoneText));
                link.title = "Call: " + formattedPhoneText;
                link.onclick = function() { doCall(formattedPhoneNumber); };
                newNode.appendChild(link);
            });
        }
    });
    if (node.parentElement.tagName != "A")
        node.parentNode.replaceChild(newNode, node);
    else
        node.parentNode.parentNode.replaceChild(newNode, node.parentNode);
}

function walkTheDOM(node, func) {
    func(node);
    node = node.firstChild;
    while (node) {
        var nextNode = node.nextSibling;
        walkTheDOM(node, func);
        node = nextNode;
    }
}

function doCall(number) {
    window.location.href = number;
}