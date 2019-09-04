const phoneLinkClassName = "phone-link-inserted";
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
                for (let newNode of mutation.addedNodes)
                    findTextNodes(newNode, parseTextNode);
    });
    mutationObserver.observe(document.body, observerOptions);

    findTextNodes(document.body, parseTextNode);
});

/**
 * Check if the current page/domain is on the filter list.
 */
function onFilterList() {
    const domain = encodeURI(window.top.location.href.match(regexDomain)[1]);
    const url = encodeURI(window.top.location.href);
    return (settings.ignoredDomains.includes(domain) || settings.ignoredURLS.includes(url));
}

/**
 * Retrieve the phone number format for this domain.
 */
function getCustomFormat() {
    const domain = encodeURI(window.top.location.href.match(regexDomain)[1]);
    const domainIndex = settings.useCustom.indexOf(domain);
    if (domainIndex > -1) {
        settings.telLinkFormat = settings.customTel[domainIndex];
        settings.linkTextFormat = settings.customText[domainIndex];
    }
}

/**
 * Finds a phone number in the text node and substitutes it with a link.
 * @param {Node} node A text node to parse.
 */
function parseTextNode(node) {
    // Only accept text nodes.
    if (node.nodeType !== Node.TEXT_NODE) return;

    // Search for a phone number.
    let match = regexPhoneNumber.exec(node.data);
    if (match === null) return;

    // Parse a phone number.
    let [matchedText, prefix, leadingChars, areaCode, threeDigit, fourDigit] = match;
    matchedText = matchedText.substr(prefix.length); // Remove prefix (This is a work around for JavaScripts lack of look-behind support).
    const formattedPhoneNumber = settings.telLinkFormat.format(matchedText, areaCode, threeDigit, fourDigit);
    const formattedPhoneText = settings.linkTextFormat.format(matchedText, areaCode, threeDigit, fourDigit);

    // Split text around phone number.
    let tempNode = node.splitText(match.index + prefix.length);
    tempNode.splitText(matchedText.length);

    // Replace phone number with link.
    let link = createLink(formattedPhoneText, formattedPhoneNumber);
    node.parentNode.replaceChild(link, tempNode);
}

/**
 * Creates a link for a phone number.
 * @param {string} text The link's inner text to display. Also shown in the tool-tip title.
 * @param {string} number The URL of the phone number to link to.
 */
function createLink(text, number) {
    let link = document.createElement('A');
    link.className = phoneLinkClassName;
    link.href = "javascript:void(0);";
    link.title = `Call: ${text}`;
    link.onclick = () => call(number);
    link.appendChild(document.createTextNode(text));
    return link;
}

/**
 * Recurses through all children of node, ignoring filtered elements, and calls func on any text nodes found.
 * @param {Node} node The root node to traverse through.
 * @param { function(Node) } func A function to be called on each text node found.
 */
function findTextNodes(node, func) {
    if (node.parentElement == null) return; // Ignore orphaned nodes.

    if (node.nodeType === Node.TEXT_NODE) {
        // Text node found. Text nodes can not have children.
        func(node);
    } else if(node.nodeType === node.ELEMENT_NODE && !filteredTagNames.includes(node.tagName) && !node.classList.contains(phoneLinkClassName)) { // Filter elements.
        // Node is an element. Recurse through children.
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
