const telLinkerClassName = "telLinkerInserted";
const filteredTagNames = ["SCRIPT", "STYLE", "BUTTON", "HEAD", "TITLE", "JSL", "NOSCRIPT"];

let settings = {
    telLinkFormat: defaultTelFormat,
    linkTextFormat: defaultTextFormat,
    ignoredDomains: [],
    ignoredURLS: [],
    useCustom: [],
    customTel: [],
    customText: []
};

// Entry point. Load settings then parse for changes.
chrome.storage.local.get(settings, function(scopedSettings) {
    settings = scopedSettings;
    if (onFilterList()) return;
    getCustomFormat();

    // Observe DOM additions to parse for phone numbers.
    const observerOptions = { childList: true, subtree: true };
    const mutationObserver = new MutationObserver(mutations => {
        for(let mutation of mutations)
            if (mutation.addedNodes)
                for (newNode of mutation.addedNodes)
                    findTextNodes(newNode, parseTextNode);
    });
    mutationObserver.observe(document.body, observerOptions);

    findTextNodes(document.body, parseTextNode);
});

/*
 * Check if the current page/domain is on the filter list.
 */
function onFilterList() {
    const domain = encodeURI(window.top.location.href.match(regexDomain)[1]);
    const url = encodeURI(window.top.location.href);
    return (settings.ignoredDomains.indexOf(domain) > -1 || settings.ignoredURLS.indexOf(url) > -1);
}

/*
 * Retrieve the phone number format for this domain.
 */
function getCustomFormat() {
    const domain = encodeURI(window.top.location.href.match(regexDomain)[1]);
    if (settings.useCustom.indexOf(domain) > -1) {
        settings.telLinkFormat = settings.customTel[settings.useCustom.indexOf(domain)];
        settings.linkTextFormat = settings.customText[settings.useCustom.indexOf(domain)];
    }
}

function parseTextNode(node) {
    // Only accept text nodes.
    if (node.nodeType !== Node.TEXT_NODE) return;

    // Search for a phone number.
    let match = regexPhoneNumber.exec(node.data);
    if (match === null) return;

    // Parse a phone number.
    let [matchedText, leadingChars, areaCode, threeDigit, fourDigit] = match;
    const formattedPhoneNumber = settings.telLinkFormat.format(matchedText, areaCode, threeDigit, fourDigit);
    const formattedPhoneText = settings.linkTextFormat.format(matchedText, areaCode, threeDigit, fourDigit);

    // Split text around phone number.
    let tempNode = node.splitText(match.index);
    tempNode.splitText(matchedText.length);

    // Replace phone number with link.
    let link = createLink(formattedPhoneText, formattedPhoneNumber);
    node.parentNode.replaceChild(link, tempNode);
}

/*
 * Creates a link for a phone number.
 */
function createLink(text, number) {
    let link = document.createElement('A');
    link.className = telLinkerClassName;
    link.href = "javascript:void(0);";
    link.title = `Call: ${text}`;
    link.onclick = () => call(number);
    link.appendChild(document.createTextNode(text));
    return link;
}

/*
 * Recurses through all children of node, ignoring filtered elements, and runs func on any text nodes found.
 */
function findTextNodes(node, func) {
    if (node.parentElement == null) return; // Ignore orphaned nodes.

    if (node.nodeType === Node.TEXT_NODE) {
        // Text node found. Text nodes can not have children.
        func(node);
    } else if(!filteredTagNames.includes(node.tagName) && !node.classList.contains(telLinkerClassName)) { // Filter elements.
        // Node is not a text node. Recurse through children.
        node = node.firstChild;
        while (node) {
            let nextNode = node.nextSibling;
            findTextNodes(node, func);
            node = nextNode;
        }
    }
}

// Place a call.
function call(number) {
    window.location.href = number;
}
