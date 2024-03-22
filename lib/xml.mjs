'use strict';
const syntax = Object.create(null);
const predefinedEntities = Object.freeze(Object.assign(Object.create(null), {
    amp: '&',
    apos: "'",
    gt: '>',
    lt: '<',
    quot: '"'
}));
syntax['predefinedEntities'] = predefinedEntities;
function isNameChar(__char) {
    if (isNameStartChar(__char)) {
        return true;
    }
    let cp = getCodePoint(__char);
    return cp === 0x2D || cp === 0x2E || cp >= 0x30 && cp <= 0x39 || cp === 0xB7 || cp >= 0x300 && cp <= 0x36F || cp >= 0x203F && cp <= 0x2040;
}
syntax['isNameChar'] = isNameChar;
function isNameStartChar(__char) {
    let cp = getCodePoint(__char);
    return cp === 0x3A || cp === 0x5F || cp >= 0x41 && cp <= 0x5A || cp >= 0x61 && cp <= 0x7A || cp >= 0xC0 && cp <= 0xD6 || cp >= 0xD8 && cp <= 0xF6 || cp >= 0xF8 && cp <= 0x2FF || cp >= 0x370 && cp <= 0x37D || cp >= 0x37F && cp <= 0x1FFF || cp >= 0x200C && cp <= 0x200D || cp >= 0x2070 && cp <= 0x218F || cp >= 0x2C00 && cp <= 0x2FEF || cp >= 0x3001 && cp <= 0xD7FF || cp >= 0xF900 && cp <= 0xFDCF || cp >= 0xFDF0 && cp <= 0xFFFD || cp >= 0x10000 && cp <= 0xEFFFF;
}
syntax['isNameStartChar'] = isNameStartChar;
function isNotXmlChar(__char) {
    return !isXmlChar(__char);
}
syntax['isNotXmlChar'] = isNotXmlChar;
function isReferenceChar(__char) {
    return __char === '#' || isNameChar(__char);
}
syntax['isReferenceChar'] = isReferenceChar;
function isWhitespace(__char) {
    let cp = getCodePoint(__char);
    return cp === 0x20 || cp === 0x9 || cp === 0xA || cp === 0xD;
}
syntax['isWhitespace'] = isWhitespace;
function isXmlChar(__char) {
    let cp = getCodePoint(__char);
    return cp === 0x9 || cp === 0xA || cp === 0xD || cp >= 0x20 && cp <= 0xD7FF || cp >= 0xE000 && cp <= 0xFFFD || cp >= 0x10000 && cp <= 0x10FFFF;
}
syntax['isXmlChar'] = isXmlChar;
function getCodePoint(__char) {
    return __char.codePointAt(0) || -1;
}
const emptyString = '';
class StringScanner {
    constructor(string){
        this.chars = [
            ...string
        ];
        this.charCount = this.chars.length;
        this.charIndex = 0;
        this.charsToBytes = new Array(this.charCount);
        this.multiByteMode = false;
        this.string = string;
        let { chars, charCount, charsToBytes } = this;
        if (charCount === string.length) {
            for(let i = 0; i < charCount; ++i){
                charsToBytes[i] = i;
            }
        } else {
            for(let byteIndex = 0, charIndex = 0; charIndex < charCount; ++charIndex){
                charsToBytes[charIndex] = byteIndex;
                byteIndex += chars[charIndex].length;
            }
            this.multiByteMode = true;
        }
    }
    get isEnd() {
        return this.charIndex >= this.charCount;
    }
    _charLength(string) {
        let { length } = string;
        if (length < 2 || !this.multiByteMode) {
            return length;
        }
        return string.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '_').length;
    }
    advance(count = 1) {
        this.charIndex = Math.min(this.charCount, this.charIndex + count);
    }
    consume(count = 1) {
        let chars = this.peek(count);
        this.advance(count);
        return chars;
    }
    consumeMatch(regex) {
        if (!regex.sticky) {
            throw new Error('`regex` must have a sticky flag ("y")');
        }
        regex.lastIndex = this.charsToBytes[this.charIndex];
        let result = regex.exec(this.string);
        if (result === null) {
            return emptyString;
        }
        let match = result[0];
        this.advance(this._charLength(match));
        return match;
    }
    consumeMatchFn(fn) {
        let startIndex = this.charIndex;
        while(!this.isEnd && fn(this.peek())){
            this.advance();
        }
        return this.charIndex > startIndex ? this.string.slice(this.charsToBytes[startIndex], this.charsToBytes[this.charIndex]) : emptyString;
    }
    consumeString(stringToConsume) {
        if (this.consumeStringFast(stringToConsume)) {
            return stringToConsume;
        }
        if (!this.multiByteMode) {
            return emptyString;
        }
        let { length } = stringToConsume;
        let charLengthToMatch = this._charLength(stringToConsume);
        if (charLengthToMatch !== length && stringToConsume === this.peek(charLengthToMatch)) {
            this.advance(charLengthToMatch);
            return stringToConsume;
        }
        return emptyString;
    }
    consumeStringFast(stringToConsume) {
        if (this.peek() === stringToConsume[0]) {
            let { length } = stringToConsume;
            if (length === 1) {
                this.advance();
                return stringToConsume;
            }
            if (this.peek(length) === stringToConsume) {
                this.advance(length);
                return stringToConsume;
            }
        }
        return emptyString;
    }
    consumeUntilMatch(regex) {
        if (!regex.global) {
            throw new Error('`regex` must have a global flag ("g")');
        }
        let byteIndex = this.charsToBytes[this.charIndex];
        regex.lastIndex = byteIndex;
        let match = regex.exec(this.string);
        if (match === null || match.index === byteIndex) {
            return emptyString;
        }
        let result = this.string.slice(byteIndex, match.index);
        this.advance(this._charLength(result));
        return result;
    }
    consumeUntilString(searchString) {
        let { charIndex, charsToBytes, string } = this;
        let byteIndex = charsToBytes[charIndex];
        let matchByteIndex = string.indexOf(searchString, byteIndex);
        if (matchByteIndex <= 0) {
            return emptyString;
        }
        let result = string.slice(byteIndex, matchByteIndex);
        this.advance(this._charLength(result));
        return result;
    }
    peek(count = 1) {
        if (this.charIndex >= this.charCount) {
            return emptyString;
        }
        if (count === 1) {
            return this.chars[this.charIndex];
        }
        let { charsToBytes, charIndex } = this;
        return this.string.slice(charsToBytes[charIndex], charsToBytes[charIndex + count]);
    }
    reset(index = 0) {
        this.charIndex = index >= 0 ? Math.min(this.charCount, index) : Math.max(0, this.charIndex + index);
    }
}
class XmlNode {
    constructor(){
        this.parent = null;
    }
    get document() {
        return this.parent ? this.parent.document : null;
    }
    get isRootNode() {
        return this.parent ? this.parent === this.document : false;
    }
    get preserveWhitespace() {
        return Boolean(this.parent && this.parent.preserveWhitespace);
    }
    get type() {
        return '';
    }
    toJSON() {
        let json = {
            type: this.type
        };
        if (this.isRootNode) {
            json.isRootNode = true;
        }
        if (this.preserveWhitespace) {
            json.preserveWhitespace = true;
        }
        return json;
    }
}
XmlNode.TYPE_CDATA = 'cdata';
XmlNode.TYPE_COMMENT = 'comment';
XmlNode.TYPE_DOCUMENT = 'document';
XmlNode.TYPE_ELEMENT = 'element';
XmlNode.TYPE_PROCESSING_INSTRUCTION = 'pi';
XmlNode.TYPE_TEXT = 'text';
class XmlText extends XmlNode {
    constructor(text = ''){
        super();
        this.text = text;
    }
    get type() {
        return XmlNode.TYPE_TEXT;
    }
    toJSON() {
        return Object.assign(XmlNode.prototype.toJSON.call(this), {
            text: this.text
        });
    }
}
class XmlComment extends XmlNode {
    constructor(content = ''){
        super();
        this.content = content;
    }
    get type() {
        return XmlNode.TYPE_COMMENT;
    }
    toJSON() {
        return Object.assign(XmlNode.prototype.toJSON.call(this), {
            content: this.content
        });
    }
}
class XmlCdata extends XmlText {
    get type() {
        return XmlNode.TYPE_CDATA;
    }
}
class XmlProcessingInstruction extends XmlNode {
    constructor(name, content = ''){
        super();
        this.name = name;
        this.content = content;
    }
    get type() {
        return XmlNode.TYPE_PROCESSING_INSTRUCTION;
    }
    toJSON() {
        return Object.assign(XmlNode.prototype.toJSON.call(this), {
            name: this.name,
            content: this.content
        });
    }
}
class XmlElement extends XmlNode {
    constructor(name, attributes = Object.create(null), children = []){
        super();
        this.name = name;
        this.attributes = attributes;
        this.children = children;
    }
    get isEmpty() {
        return this.children.length === 0;
    }
    get preserveWhitespace() {
        let node = this;
        while(node instanceof XmlElement){
            if ('xml:space' in node.attributes) {
                return node.attributes['xml:space'] === 'preserve';
            }
            node = node.parent;
        }
        return false;
    }
    get text() {
        return this.children.map((child)=>'text' in child ? child.text : '').join('');
    }
    get type() {
        return XmlNode.TYPE_ELEMENT;
    }
    toJSON() {
        return Object.assign(XmlNode.prototype.toJSON.call(this), {
            name: this.name,
            attributes: this.attributes,
            children: this.children.map((child)=>child.toJSON())
        });
    }
}
class XmlDocument extends XmlNode {
    constructor(children = []){
        super();
        this.children = children;
    }
    get document() {
        return this;
    }
    get root() {
        return this.children.find((child)=>child instanceof XmlElement) || null;
    }
    get text() {
        return this.children.map((child)=>'text' in child ? child.text : '').join('');
    }
    get type() {
        return XmlNode.TYPE_DOCUMENT;
    }
    toJSON() {
        return Object.assign(XmlNode.prototype.toJSON.call(this), {
            children: this.children.map((child)=>child.toJSON())
        });
    }
}
class Parser {
    constructor(xml, options = Object.create(null)){
        this.document = new XmlDocument();
        this.currentNode = this.document;
        this.options = options;
        this.scanner = new StringScanner(normalizeXmlString(xml));
        this.consumeProlog();
        if (!this.consumeElement()) {
            this.error('Root element is missing or invalid');
        }
        while(this.consumeMisc()){}
        if (!this.scanner.isEnd) {
            this.error('Extra content at the end of the document');
        }
    }
    addNode(node) {
        node.parent = this.currentNode;
        this.currentNode.children.push(node);
    }
    addText(text) {
        let { children } = this.currentNode;
        if (children.length > 0) {
            let prevNode = children[children.length - 1];
            if (prevNode instanceof XmlText) {
                prevNode.text += text;
                return;
            }
        }
        this.addNode(new XmlText(text));
    }
    consumeAttributeValue() {
        let { scanner } = this;
        let quote = scanner.peek();
        if (quote !== '"' && quote !== "'") {
            return false;
        }
        scanner.advance();
        let chars;
        let isClosed = false;
        let value = emptyString;
        let regex = quote === '"' ? /[^"&<]+/y : /[^'&<]+/y;
        matchLoop: while(!scanner.isEnd){
            chars = scanner.consumeMatch(regex);
            if (chars) {
                this.validateChars(chars);
                value += chars.replace(/[\t\r\n]/g, ' ');
            }
            let nextChar = scanner.peek();
            switch(nextChar){
                case quote:
                    isClosed = true;
                    break matchLoop;
                case '&':
                    value += this.consumeReference();
                    continue;
                case '<':
                    this.error('Unescaped `<` is not allowed in an attribute value');
                    break;
                case emptyString:
                    this.error('Unclosed attribute');
                    break;
            }
        }
        if (!isClosed) {
            this.error('Unclosed attribute');
        }
        scanner.advance();
        return value;
    }
    consumeCdataSection() {
        let { scanner } = this;
        if (!scanner.consumeStringFast('<![CDATA[')) {
            return false;
        }
        let text = scanner.consumeUntilString(']]>');
        this.validateChars(text);
        if (!scanner.consumeStringFast(']]>')) {
            this.error('Unclosed CDATA section');
        }
        if (this.options.preserveCdata) {
            this.addNode(new XmlCdata(text));
        } else {
            this.addText(text);
        }
        return true;
    }
    consumeCharData() {
        let { scanner } = this;
        let charData = scanner.consumeUntilMatch(/<|&|]]>/g);
        if (!charData) {
            return false;
        }
        this.validateChars(charData);
        if (scanner.peek() === ']' && scanner.peek(3) === ']]>') {
            this.error('Element content may not contain the CDATA section close delimiter `]]>`');
        }
        this.addText(charData);
        return true;
    }
    consumeComment() {
        let { scanner } = this;
        if (!scanner.consumeStringFast('<!--')) {
            return false;
        }
        let content = scanner.consumeUntilString('--');
        this.validateChars(content);
        if (!scanner.consumeStringFast('-->')) {
            if (scanner.peek(2) === '--') {
                this.error("The string `--` isn't allowed inside a comment");
            } else {
                this.error('Unclosed comment');
            }
        }
        if (this.options.preserveComments) {
            this.addNode(new XmlComment(content.trim()));
        }
        return true;
    }
    consumeContentReference() {
        let ref = this.consumeReference();
        if (ref) {
            this.addText(ref);
            return true;
        }
        return false;
    }
    consumeDoctypeDeclaration() {
        let { scanner } = this;
        if (!scanner.consumeStringFast('<!DOCTYPE') || !this.consumeWhitespace()) {
            return false;
        }
        scanner.consumeMatch(/[^[>]+/y);
        if (scanner.consumeMatch(/\[[\s\S]+?\][\x20\t\r\n]*>/y)) {
            return true;
        }
        if (!scanner.consumeStringFast('>')) {
            this.error('Unclosed doctype declaration');
        }
        return true;
    }
    consumeElement() {
        let { scanner } = this;
        let mark = scanner.charIndex;
        if (scanner.peek() !== '<') {
            return false;
        }
        scanner.advance();
        let name = this.consumeName();
        if (!name) {
            scanner.reset(mark);
            return false;
        }
        let attributes = Object.create(null);
        while(this.consumeWhitespace()){
            let attrName = this.consumeName();
            if (!attrName) {
                continue;
            }
            let attrValue = this.consumeEqual() && this.consumeAttributeValue();
            if (attrValue === false) {
                this.error('Attribute value expected');
            }
            if (attrName in attributes) {
                this.error(`Duplicate attribute: ${attrName}`);
            }
            if (attrName === 'xml:space' && attrValue !== 'default' && attrValue !== 'preserve') {
                this.error('Value of the `xml:space` attribute must be "default" or "preserve"');
            }
            attributes[attrName] = attrValue;
        }
        if (this.options.sortAttributes) {
            let attrNames = Object.keys(attributes).sort();
            let sortedAttributes = Object.create(null);
            for(let i = 0; i < attrNames.length; ++i){
                let attrName = attrNames[i];
                sortedAttributes[attrName] = attributes[attrName];
            }
            attributes = sortedAttributes;
        }
        let isEmpty = Boolean(scanner.consumeStringFast('/>'));
        let element = new XmlElement(name, attributes);
        element.parent = this.currentNode;
        if (!isEmpty) {
            if (!scanner.consumeStringFast('>')) {
                this.error(`Unclosed start tag for element \`${name}\``);
            }
            this.currentNode = element;
            this.consumeCharData();
            while(this.consumeElement() || this.consumeContentReference() || this.consumeCdataSection() || this.consumeProcessingInstruction() || this.consumeComment()){
                this.consumeCharData();
            }
            let endTagMark = scanner.charIndex;
            let endTagName;
            if (!scanner.consumeStringFast('</') || !(endTagName = this.consumeName()) || endTagName !== name) {
                scanner.reset(endTagMark);
                this.error(`Missing end tag for element ${name}`);
            }
            this.consumeWhitespace();
            if (!scanner.consumeStringFast('>')) {
                this.error(`Unclosed end tag for element ${name}`);
            }
            this.currentNode = element.parent;
        }
        this.addNode(element);
        return true;
    }
    consumeEqual() {
        this.consumeWhitespace();
        if (this.scanner.consumeStringFast('=')) {
            this.consumeWhitespace();
            return true;
        }
        return false;
    }
    consumeMisc() {
        return this.consumeComment() || this.consumeProcessingInstruction() || this.consumeWhitespace();
    }
    consumeName() {
        return syntax.isNameStartChar(this.scanner.peek()) ? this.scanner.consumeMatchFn(syntax.isNameChar) : emptyString;
    }
    consumeProcessingInstruction() {
        let { scanner } = this;
        let mark = scanner.charIndex;
        if (!scanner.consumeStringFast('<?')) {
            return false;
        }
        let name = this.consumeName();
        if (name) {
            if (name.toLowerCase() === 'xml') {
                scanner.reset(mark);
                this.error("XML declaration isn't allowed here");
            }
        } else {
            this.error('Invalid processing instruction');
        }
        if (!this.consumeWhitespace()) {
            if (scanner.consumeStringFast('?>')) {
                this.addNode(new XmlProcessingInstruction(name));
                return true;
            }
            this.error('Whitespace is required after a processing instruction name');
        }
        let content = scanner.consumeUntilString('?>');
        this.validateChars(content);
        if (!scanner.consumeStringFast('?>')) {
            this.error('Unterminated processing instruction');
        }
        this.addNode(new XmlProcessingInstruction(name, content));
        return true;
    }
    consumeProlog() {
        let { scanner } = this;
        let mark = scanner.charIndex;
        this.consumeXmlDeclaration();
        while(this.consumeMisc()){}
        if (this.consumeDoctypeDeclaration()) {
            while(this.consumeMisc()){}
        }
        return mark < scanner.charIndex;
    }
    consumeReference() {
        let { scanner } = this;
        if (scanner.peek() !== '&') {
            return false;
        }
        scanner.advance();
        let ref = scanner.consumeMatchFn(syntax.isReferenceChar);
        if (scanner.consume() !== ';') {
            this.error('Unterminated reference (a reference must end with `;`)');
        }
        let parsedValue;
        if (ref[0] === '#') {
            let codePoint = ref[1] === 'x' ? parseInt(ref.slice(2), 16) : parseInt(ref.slice(1), 10);
            if (isNaN(codePoint)) {
                this.error('Invalid character reference');
            }
            parsedValue = String.fromCodePoint(codePoint);
            if (!syntax.isXmlChar(parsedValue)) {
                this.error('Character reference resolves to an invalid character');
            }
        } else {
            parsedValue = syntax.predefinedEntities[ref];
            if (parsedValue === undefined) {
                let { ignoreUndefinedEntities, resolveUndefinedEntity } = this.options;
                let wrappedRef = `&${ref};`;
                if (resolveUndefinedEntity) {
                    let resolvedValue = resolveUndefinedEntity(wrappedRef);
                    if (resolvedValue !== null && resolvedValue !== undefined) {
                        let type = typeof resolvedValue;
                        if (type !== 'string') {
                            throw new TypeError(`\`resolveUndefinedEntity()\` must return a string, \`null\`, or \`undefined\`, but returned a value of type ${type}`);
                        }
                        return resolvedValue;
                    }
                }
                if (ignoreUndefinedEntities) {
                    return wrappedRef;
                }
                scanner.reset(-wrappedRef.length);
                this.error(`Named entity isn't defined: ${wrappedRef}`);
            }
        }
        return parsedValue;
    }
    consumeSystemLiteral() {
        let { scanner } = this;
        let quote = scanner.consumeStringFast('"') || scanner.consumeStringFast("'");
        if (!quote) {
            return false;
        }
        let value = scanner.consumeUntilString(quote);
        this.validateChars(value);
        if (!scanner.consumeStringFast(quote)) {
            this.error('Missing end quote');
        }
        return value;
    }
    consumeWhitespace() {
        return Boolean(this.scanner.consumeMatchFn(syntax.isWhitespace));
    }
    consumeXmlDeclaration() {
        let { scanner } = this;
        if (!scanner.consumeStringFast('<?xml')) {
            return false;
        }
        if (!this.consumeWhitespace()) {
            this.error('Invalid XML declaration');
        }
        let version = Boolean(scanner.consumeStringFast('version')) && this.consumeEqual() && this.consumeSystemLiteral();
        if (version === false) {
            this.error('XML version is missing or invalid');
        } else if (!/^1\.[0-9]+$/.test(version)) {
            this.error('Invalid character in version number');
        }
        if (this.consumeWhitespace()) {
            let encoding = Boolean(scanner.consumeStringFast('encoding')) && this.consumeEqual() && this.consumeSystemLiteral();
            if (encoding) {
                this.consumeWhitespace();
            }
            let standalone = Boolean(scanner.consumeStringFast('standalone')) && this.consumeEqual() && this.consumeSystemLiteral();
            if (standalone) {
                if (standalone !== 'yes' && standalone !== 'no') {
                    this.error('Only "yes" and "no" are permitted as values of `standalone`');
                }
                this.consumeWhitespace();
            }
        }
        if (!scanner.consumeStringFast('?>')) {
            this.error('Invalid or unclosed XML declaration');
        }
        return true;
    }
    error(message) {
        let { charIndex, string: xml } = this.scanner;
        let column = 1;
        let excerpt = '';
        let line = 1;
        for(let i = 0; i < charIndex; ++i){
            let __char = xml[i];
            if (__char === '\n') {
                column = 1;
                excerpt = '';
                line += 1;
            } else {
                column += 1;
                excerpt += __char;
            }
        }
        let eol = xml.indexOf('\n', charIndex);
        excerpt += eol === -1 ? xml.slice(charIndex) : xml.slice(charIndex, eol);
        let excerptStart = 0;
        if (excerpt.length > 50) {
            if (column < 40) {
                excerpt = excerpt.slice(0, 50);
            } else {
                excerptStart = column - 20;
                excerpt = excerpt.slice(excerptStart, column + 30);
            }
        }
        let err = new Error(`${message} (line ${line}, column ${column})\n` + `  ${excerpt}\n` + ' '.repeat(column - excerptStart + 1) + '^\n');
        Object.assign(err, {
            column,
            excerpt,
            line,
            pos: charIndex
        });
        throw err;
    }
    validateChars(string) {
        let charIndex = 0;
        for (let __char of string){
            if (syntax.isNotXmlChar(__char)) {
                this.scanner.reset(-([
                    ...string
                ].length - charIndex));
                this.error('Invalid character');
            }
            charIndex += 1;
        }
    }
}
function normalizeXmlString(xml) {
    if (xml[0] === '\uFEFF') {
        xml = xml.slice(1);
    }
    return xml.replace(/\r\n?/g, '\n');
}
class XmlNamespaceStack {
    static forElement(element) {
        if (!(element instanceof XmlElement)) return null;
        let stack = new XmlNamespaceStack();
        do {
            stack.push(element);
            element = element.parent;
        }while (element instanceof XmlElement)
        const tmp = [];
        for (const e of stack.stack){
            tmp.unshift(e);
        }
        stack.stack = tmp;
        return stack;
    }
    constructor(){
        this.stack = [];
    }
    push(element) {
        const elementNamespaces = Object.create(null), attrNames = Object.keys(element.attributes);
        attrNames.filter((attrName)=>attrName.match(/^xmlns/)).forEach(function(attrName) {
            if (attrName.indexOf(':') !== -1) {
                elementNamespaces[attrName.split(':')[1]] = element.attributes[attrName];
            } else {
                elementNamespaces[''] = element.attributes[attrName];
            }
        });
        this.stack.unshift(elementNamespaces);
    }
    pop() {
        this.stack.shift();
    }
    get top() {
        return this.stack[0];
    }
    prefixFor(namespace, preferredPrefixes) {
        const isString = (e)=>typeof e === 'string', isArray = (e)=>e instanceof Array, prefixes = [];
        for (const nsItem of this.stack){
            if (!Object.values(nsItem).includes(namespace)) continue;
            Object.keys(nsItem).forEach(function(prefix) {
                if (nsItem[prefix] === namespace) prefixes.push(prefix);
            });
        }
        let prefix;
        prefixes.forEach(function(p) {
            if (!prefix || p.length < prefix.length) {
                prefix = p;
            }
        });
        if (isString(prefix)) return prefix;
        if (!isArray(preferredPrefixes)) return null;
        if (!isArray(preferredPrefixes) || preferredPrefixes.length === 0) {
            preferredPrefixes = [
                'ns'
            ];
        }
        let n = 0;
        do {
            for (const preferredPrefix of preferredPrefixes){
                let pref = preferredPrefix;
                if (!isString(pref) || !pref.match(/^[a-z]+$/)) {
                    pref = 'ns';
                }
                let p = `${pref}${n === 0 ? '' : n}`;
                let isNsTaken = false;
                for (const nsItem of this.stack){
                    if (!Object.keys(nsItem).includes(p)) continue;
                    isNsTaken = true;
                    break;
                }
                if (!isNsTaken) {
                    prefix = p;
                    break;
                }
            }
            n++;
        }while (!prefix)
        return prefix;
    }
    findNamespace(currentElementName) {
        const isString = (e)=>typeof e === 'string', elementName = currentElementName.indexOf(':') === -1 ? `:${currentElementName}` : currentElementName, prefix = elementName.split(':')[0];
        let result = null;
        for (const nsItem of this.stack){
            const ns = nsItem[prefix];
            if (isString(ns)) {
                result = ns;
                break;
            }
        }
        return result;
    }
    makeCurrentElementSerializable(currentElement) {
        const elementNamespaces = Object.create(null);
        for(let i = this.stack.length - 1; i >= 0; i--){
            const namespaces = this.stack[i];
            for(const prefix in namespaces){
                if (Object.hasOwnProperty.call(namespaces, prefix)) {
                    const namespace = namespaces[prefix];
                    elementNamespaces[prefix] = namespace;
                }
            }
        }
        for(const prefix in elementNamespaces){
            if (Object.hasOwnProperty.call(elementNamespaces, prefix)) {
                const namespace = elementNamespaces[prefix], xmlnsAttrName = XmlNamespaceStack.nsAttrName(prefix);
                currentElement.attributes[xmlnsAttrName] = namespace;
            }
        }
    }
    toString() {
        return this.stack.map((item)=>Object.entries(item)).map((item)=>`[${item}]`).join(', ');
    }
    static verifyNamespace(namespace, element, nsStack) {
        nsStack.push(element);
        const ns = nsStack.findNamespace(element.name);
        if (ns !== namespace) return false;
        if (!Array.isArray(element.children)) return true;
        let childrenAreOk = true;
        for(let i = 0; i < element.children.length; i++){
            const child = element.children[i];
            if (!(child instanceof XmlElement)) continue;
            childrenAreOk = childrenAreOk && this.verifyNamespace(namespace, child, nsStack);
            if (!childrenAreOk) break;
        }
        nsStack.pop();
        return childrenAreOk;
    }
    static getElementNameWithoutPrefix(elementName) {
        return elementName.match(/:/) ? elementName.split(':')[1] : elementName;
    }
    static makeElementSerializable(element) {
        if (!(element instanceof XmlElement)) return;
        const nsStack = XmlNamespaceStack.forElement(element);
        nsStack.makeCurrentElementSerializable(element);
    }
    static nsAttrName(nsPrefix) {
        const isString = (e)=>typeof e === 'string';
        if (!isString(nsPrefix)) nsPrefix = '';
        return nsPrefix === '' ? 'xmlns' : `xmlns:${nsPrefix}`;
    }
    static elementName(unqualifiedName, nsPrefix) {
        const isString = (e)=>typeof e === 'string';
        if (!isString(unqualifiedName)) return null;
        if (!isString(nsPrefix)) nsPrefix = '';
        return nsPrefix === '' ? unqualifiedName : `${nsPrefix}:${unqualifiedName}`;
    }
    static encodeXmlTextString(text) {
        const itemIsString = (i)=>typeof i === 'string', encodings = {
            '<': '&lt;',
            '>': '&gt;',
            '&': '&amp;',
            "'": '&apos;',
            '"': '&quot;'
        };
        if (!itemIsString(text)) return null;
        let result = '';
        for(let i = 0; i < text.length; i++){
            const __char = text.charAt(i);
            result += encodings[__char] || __char;
        }
        return result;
    }
}
class Writer {
    static elementToString(element) {
        if (!(element instanceof XmlElement)) return '';
        const nsStack = new XmlNamespaceStack();
        let attributes = '', contents = '';
        for (const [k, v] of Object.entries(element.attributes)){
            attributes += ` ${k}="${this._encodeXmlTextString(v)}"`;
        }
        for (const n of element.children){
            if (n instanceof XmlText) {
                contents += this._encodeXmlTextString(n.text);
                continue;
            }
            if (!(n instanceof XmlElement)) continue;
            nsStack.push(n);
            contents += this.elementToString(n, nsStack);
            nsStack.pop();
        }
        return `<${element.name}${attributes}>${contents}</${element.name}>`;
    }
    static _encodeXmlTextString(text) {
        const itemIsString = (i)=>typeof i === 'string', encodings = {
            '<': '&lt;',
            '>': '&gt;',
            '&': '&amp;',
            "'": '&apos;',
            '"': '&quot;'
        };
        if (!itemIsString(text)) return null;
        let result = '';
        for(let i = 0; i < text.length; i++){
            const __char = text.charAt(i);
            result += encodings[__char] || __char;
        }
        return result;
    }
}


export {
  XmlNamespaceStack, XmlDocument, XmlElement, XmlProcessingInstruction, XmlCdata, XmlComment, XmlText, XmlNode,
  Parser, Writer
};
