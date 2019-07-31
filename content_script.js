const regexSplit = /((?:[\s:]|\d+(?:-|\.)|^)\(?\d{3}\)?[- \.]?\d{3}[- \.]?\d{4}(?=<|\s|$))/g;
const regexPhone = /([\s:]|\d+(?:-|\.)|^)\(?(\d{3})\)?[- \.]?(\d{3})[- \.]?(\d{4})(?=<|\s|$)/g;
const regexDomain = /^[\w-]+:\/*\[?([\w\.:-]+)\]?(?::\d+)?/;
const regexFilter = /{(\d+)}/g;

const defaultTelFormat = 'tel:+1-{1}-{2}-{3}';
const defaultTextFormat = '{0}';
const telLinkerClassName = "telLinkerInserted";
const filteredTagNames = ["SCRIPT", "STYLE", "BUTTON", "HEAD", "TITLE", "JSL", "NOSCRIPT"];

let settings = {
    telLinkFormat: defaultTelFormat,
    linkTextFormat: defaultTextFormat,
    overrideLinks: true,
    ignoredDomains: [],
    ignoredURLS: [],
    useCustom: [],
    customTel: [],
    customText: []
};

//found this on stack overflow; makes it almost feel like we're in good ol' C#
if (!String.prototype.format) {
    String.prototype.format = function() {
        return this.replace(regexFilter, (match, number) => arguments[number] || match);
    };
}

//entry point? load the settings because there isn't a way to do this Synchronously
chrome.storage.local.get(settings, function(scopedSettings) {
    settings = scopedSettings;
    if (onFilterList()) return;

    checkCustomReplacement();
    //DOMNodeInserted is listed as deprecated, so might become unavailable soon, so lets use the newer mutationobserver class
    const mutationObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type == "childList")
                for (let i = 0; i < mutation.addedNodes.length; i++)
                    if (mutation.addedNodes[i].className != telLinkerClassName)
                        walkTheDOM(mutation.addedNodes[i], handleNode);
        });
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });
    //inserting on idle, so the DOM may or may not have already been loaded
    if (document.readyState == "loading")
        document.addEventListener("DOMContentLoaded", () => walkTheDOM(document.body, handleNode));
    else
        walkTheDOM(document.body, handleNode);
});

function onFilterList() {
    const domain = encodeURI(window.top.location.href.match(regexDomain)[1]);
    const url = encodeURI(window.top.location.href);
    return (settings.ignoredDomains.indexOf(domain) > -1 || settings.ignoredURLS.indexOf(url) > -1);
}

function checkCustomReplacement() {
    const domain = encodeURI(window.top.location.href.match(regexDomain)[1]);
    if (settings.useCustom.indexOf(domain) > -1) {
        settings.telLinkFormat = settings.customTel[settings.useCustom.indexOf(domain)];
        settings.linkTextFormat = settings.customText[settings.useCustom.indexOf(domain)];
    }
}

function handleNode(node) {
    //updated this so that we no longer override things inside of scripts nodes (stupid that these are counted as visible text, but there it is)
    if (node.nodeType != Node.TEXT_NODE || node.parentElement == null || filteredTagNames.indexOf(node.parentElement.tagName) > -1 || (node.parentElement.tagName == "A" && !settings.overrideLinks))
        return;
    if (node.parentNode.className == telLinkerClassName) return; //avoid the stack overflow!
    if (!regexPhone.test(node.data)) return;

    let newNode = document.createElement("span");
    newNode.className = telLinkerClassName;
    let parts = node.data.split(regexSplit);
    let count = 0;
    parts.forEach(part => {
        count++;
        if (count % 2 != 0)
            newNode.appendChild(document.createTextNode(part));
        else {
            part.replace(regexPhone, function(match, leadingChar, areaCode, threeDigits, fourDigits) {
                newNode.appendChild(document.createTextNode(leadingChar));
                match = match.substring(leadingChar.length);
                const formattedPhoneNumber = settings.telLinkFormat.format(match, areaCode, threeDigits, fourDigits);
                const formattedPhoneText = settings.linkTextFormat.format(match, areaCode, threeDigits, fourDigits);

                let link = document.createElement("A");
                link.className = telLinkerClassName;
                link.href = "javascript:void(0);";
                link.appendChild(document.createTextNode(formattedPhoneText));
                link.title = "Call: " + formattedPhoneText;
                link.onclick = () => doCall(formattedPhoneNumber);
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
        let nextNode = node.nextSibling;
        walkTheDOM(node, func);
        node = nextNode;
    }
}

function doCall(number) {
    window.location.href = number;
}
