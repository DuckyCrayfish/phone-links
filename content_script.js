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
                    walkTheDOM(newNode, handleNode);
    });
    mutationObserver.observe(document.body, observerOptions);

    walkTheDOM(document.body, handleNode);
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

function handleNode(node) {
    // Validate the node.
    if (node.nodeType != Node.TEXT_NODE
        || node.parentElement == null // Ignore orphaned leaves.
        || filteredTagNames.indexOf(node.parentElement.tagName) > -1 // Ignore filtered elements.
        || (node.parentElement.tagName == "A" && !settings.overrideLinks)
        || node.parentElement.classList.contains(telLinkerClassName)) // Avoid the stack overflow.
        return;

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

function walkTheDOM(node, func) {
    func(node);
    node = node.firstChild;
    while (node) {
        let nextNode = node.nextSibling;
        walkTheDOM(node, func);
        node = nextNode;
    }
}

function call(number) {
    window.location.href = number;
}
