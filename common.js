const regexPhoneNumber = /(^|[^\w\d\+])(\+?(?:001|1)[- \.]?)?\(?(\d{3})\)?[- \.]?(\d{3})[- \.]?(\d{4})(?![\w\d])/;
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
