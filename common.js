const regexSplit = /((?:[\s:]|\d+(?:-|\.)|^)\(?\d{3}\)?[- \.]?\d{3}[- \.]?\d{4}(?=<|\s|$))/g;
const regexPhoneNumber = /([\s:]|\d+(?:-|\.)|^)\(?(\d{3})\)?[- \.]?(\d{3})[- \.]?(\d{4})(?=<|\s|$)/g;
const regexDomain = /^[\w-]+:\/*\[?([\w\.:-]+)\]?(?::\d+)?/;
const regexFilter = /{(\d+)}/g;
const defaultTelFormat = 'tel:+1-{1}-{2}-{3}';
const defaultTextFormat = '{0}';

//found this on stack overflow; makes it almost feel like we're in good ol' C#
if (!String.prototype.format) {
    String.prototype.format = function() {
        return this.replace(regexFilter, (match, number) => arguments[number] || match);
    };
}
