const regexSplit = /((?:[\s:]|\d+(?:-|\.)|^)\(?\d{3}\)?[- \.]?\d{3}[- \.]?\d{4}(?=<|\s|$))/g;
const regexPhoneNumber = /([\s:]|\d+(?:-|\.)|^)\(?(\d{3})\)?[- \.]?(\d{3})[- \.]?(\d{4})(?=<|\s|$)/g;
const regexDomain = /^[\w-]+:\/*\[?([\w\.:-]+)\]?(?::\d+)?/;
const regexFilter = /{(\d+)}/g;
const defaultTelFormat = 'tel:+1-{1}-{2}-{3}';
const defaultTextFormat = '{0}';
