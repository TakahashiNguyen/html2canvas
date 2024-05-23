"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyCSSStyles = exports.DocumentCloner = void 0;
const node_parser_1 = require("./node-parser");
const parser_1 = require("../css/syntax/parser");
const counter_1 = require("../css/types/functions/counter");
const list_style_type_1 = require("../css/property-descriptors/list-style-type");
const index_1 = require("../css/index");
const quotes_1 = require("../css/property-descriptors/quotes");
const debugger_1 = require("../core/debugger");
const IGNORE_ATTRIBUTE = 'data-html2canvas-ignore';
class DocumentCloner {
    context;
    options;
    scrolledElements;
    referenceElement;
    clonedReferenceElement;
    documentElement;
    counters;
    quoteDepth;
    constructor(context, element, options) {
        this.context = context;
        this.options = options;
        this.scrolledElements = [];
        this.referenceElement = element;
        this.counters = new counter_1.CounterState();
        this.quoteDepth = 0;
        if (!element.ownerDocument) {
            throw new Error('Cloned element does not have an owner document');
        }
        this.documentElement = this.cloneNode(element.ownerDocument.documentElement, false);
    }
    toIFrame(ownerDocument, windowSize) {
        const iframe = createIFrameContainer(ownerDocument, windowSize);
        if (!iframe.contentWindow) {
            return Promise.reject(`Unable to find iframe window`);
        }
        const scrollX = ownerDocument.defaultView.pageXOffset;
        const scrollY = ownerDocument.defaultView.pageYOffset;
        const cloneWindow = iframe.contentWindow;
        const documentClone = cloneWindow.document;
        /* Chrome doesn't detect relative background-images assigned in inline <style> sheets when fetched through getComputedStyle
         if window url is about:blank, we can assign the url to current by writing onto the document
         */
        const iframeLoad = iframeLoader(iframe).then(async () => {
            // @ts-ignore
            this.scrolledElements.forEach(restoreNodeScroll);
            if (cloneWindow) {
                cloneWindow.scrollTo(windowSize.left, windowSize.top);
                if (/(iPad|iPhone|iPod)/g.test(navigator.userAgent) &&
                    (cloneWindow.scrollY !== windowSize.top || cloneWindow.scrollX !== windowSize.left)) {
                    this.context.logger.warn('Unable to restore scroll position for cloned document');
                    this.context.windowBounds = this.context.windowBounds.add(cloneWindow.scrollX - windowSize.left, cloneWindow.scrollY - windowSize.top, 0, 0);
                }
            }
            const onclone = this.options.onclone;
            const referenceElement = this.clonedReferenceElement;
            if (typeof referenceElement === 'undefined') {
                return Promise.reject(`Error finding the ${this.referenceElement.nodeName} in the cloned document`);
            }
            if (documentClone.fonts && documentClone.fonts.ready) {
                await documentClone.fonts.ready;
            }
            if (/(AppleWebKit)/g.test(navigator.userAgent)) {
                await imagesReady(documentClone);
            }
            if (typeof onclone === 'function') {
                return Promise.resolve()
                    .then(() => onclone(documentClone, referenceElement))
                    .then(() => iframe);
            }
            return iframe;
        });
        documentClone.open();
        documentClone.write(`${serializeDoctype(document.doctype)}<html></html>`);
        // Chrome scrolls the parent document for some reason after the write to the cloned window???
        restoreOwnerScroll(this.referenceElement.ownerDocument, scrollX, scrollY);
        documentClone.replaceChild(documentClone.adoptNode(this.documentElement), documentClone.documentElement);
        documentClone.close();
        return iframeLoad;
    }
    createElementClone(node) {
        if ((0, debugger_1.isDebugging)(node, 2 /* DebuggerType.CLONE */)) {
            debugger;
        }
        if ((0, node_parser_1.isCanvasElement)(node)) {
            return this.createCanvasClone(node);
        }
        if ((0, node_parser_1.isVideoElement)(node)) {
            return this.createVideoClone(node);
        }
        if ((0, node_parser_1.isStyleElement)(node)) {
            return this.createStyleClone(node);
        }
        const clone = node.cloneNode(false);
        if ((0, node_parser_1.isImageElement)(clone)) {
            if ((0, node_parser_1.isImageElement)(node) && node.currentSrc && node.currentSrc !== node.src) {
                clone.src = node.currentSrc;
                clone.srcset = '';
            }
            if (clone.loading === 'lazy') {
                clone.loading = 'eager';
            }
        }
        if ((0, node_parser_1.isCustomElement)(clone)) {
            return this.createCustomElementClone(clone);
        }
        return clone;
    }
    createCustomElementClone(node) {
        const clone = document.createElement('html2canvascustomelement');
        (0, exports.copyCSSStyles)(node.style, clone);
        return clone;
    }
    createStyleClone(node) {
        try {
            const sheet = node.sheet;
            if (sheet && sheet.cssRules) {
                const css = [].slice.call(sheet.cssRules, 0).reduce((css, rule) => {
                    if (rule && typeof rule.cssText === 'string') {
                        return css + rule.cssText;
                    }
                    return css;
                }, '');
                const style = node.cloneNode(false);
                style.textContent = css;
                return style;
            }
        }
        catch (e) {
            // accessing node.sheet.cssRules throws a DOMException
            this.context.logger.error('Unable to access cssRules property', e);
            // @ts-ignore
            if (e.name !== 'SecurityError') {
                throw e;
            }
        }
        return node.cloneNode(false);
    }
    createCanvasClone(canvas) {
        if (this.options.inlineImages && canvas.ownerDocument) {
            const img = canvas.ownerDocument.createElement('img');
            try {
                img.src = canvas.toDataURL();
                return img;
            }
            catch (e) {
                this.context.logger.info(`Unable to inline canvas contents, canvas is tainted`, canvas);
            }
        }
        const clonedCanvas = canvas.cloneNode(false);
        try {
            clonedCanvas.width = canvas.width;
            clonedCanvas.height = canvas.height;
            const ctx = canvas.getContext('2d');
            const clonedCtx = clonedCanvas.getContext('2d');
            if (clonedCtx) {
                if (!this.options.allowTaint && ctx) {
                    clonedCtx.putImageData(ctx.getImageData(0, 0, canvas.width, canvas.height), 0, 0);
                }
                else {
                    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
                    if (gl) {
                        const attribs = gl.getContextAttributes();
                        if (attribs?.preserveDrawingBuffer === false) {
                            this.context.logger.warn('Unable to clone WebGL context as it has preserveDrawingBuffer=false', canvas);
                        }
                    }
                    clonedCtx.drawImage(canvas, 0, 0);
                }
            }
            return clonedCanvas;
        }
        catch (e) {
            this.context.logger.info(`Unable to clone canvas as it is tainted`, canvas);
        }
        return clonedCanvas;
    }
    createVideoClone(video) {
        const canvas = video.ownerDocument.createElement('canvas');
        canvas.width = video.offsetWidth;
        canvas.height = video.offsetHeight;
        const ctx = canvas.getContext('2d');
        try {
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                if (!this.options.allowTaint) {
                    ctx.getImageData(0, 0, canvas.width, canvas.height);
                }
            }
            return canvas;
        }
        catch (e) {
            this.context.logger.info(`Unable to clone video as it is tainted`, video);
        }
        const blankCanvas = video.ownerDocument.createElement('canvas');
        blankCanvas.width = video.offsetWidth;
        blankCanvas.height = video.offsetHeight;
        return blankCanvas;
    }
    appendChildNode(clone, child, copyStyles) {
        if (!(0, node_parser_1.isElementNode)(child) ||
            (!(0, node_parser_1.isScriptElement)(child) &&
                !child.hasAttribute(IGNORE_ATTRIBUTE) &&
                (typeof this.options.ignoreElements !== 'function' || !this.options.ignoreElements(child)))) {
            if (!this.options.copyStyles || !(0, node_parser_1.isElementNode)(child) || !(0, node_parser_1.isStyleElement)(child)) {
                clone.appendChild(this.cloneNode(child, copyStyles));
            }
        }
    }
    cloneChildNodes(node, clone, copyStyles) {
        for (let child = node.shadowRoot ? node.shadowRoot.firstChild : node.firstChild; child; child = child.nextSibling) {
            if ((0, node_parser_1.isElementNode)(child) && (0, node_parser_1.isSlotElement)(child) && typeof child.assignedNodes === 'function') {
                const assignedNodes = child.assignedNodes();
                if (assignedNodes.length) {
                    assignedNodes.forEach((assignedNode) => this.appendChildNode(clone, assignedNode, copyStyles));
                }
            }
            else {
                this.appendChildNode(clone, child, copyStyles);
            }
        }
    }
    cloneNode(node, copyStyles) {
        if ((0, node_parser_1.isTextNode)(node)) {
            return document.createTextNode(node.data);
        }
        if (!node.ownerDocument) {
            return node.cloneNode(false);
        }
        const window = node.ownerDocument.defaultView;
        if (window && (0, node_parser_1.isElementNode)(node) && ((0, node_parser_1.isHTMLElementNode)(node) || (0, node_parser_1.isSVGElementNode)(node))) {
            const clone = this.createElementClone(node);
            clone.style.transitionProperty = 'none';
            const style = window.getComputedStyle(node);
            const styleBefore = window.getComputedStyle(node, ':before');
            const styleAfter = window.getComputedStyle(node, ':after');
            if (this.referenceElement === node && (0, node_parser_1.isHTMLElementNode)(clone)) {
                this.clonedReferenceElement = clone;
            }
            if ((0, node_parser_1.isBodyElement)(clone)) {
                createPseudoHideStyles(clone);
            }
            const counters = this.counters.parse(new index_1.CSSParsedCounterDeclaration(this.context, style));
            const before = this.resolvePseudoContent(node, clone, styleBefore, PseudoElementType.BEFORE);
            if ((0, node_parser_1.isCustomElement)(node)) {
                copyStyles = true;
            }
            if (!(0, node_parser_1.isVideoElement)(node)) {
                this.cloneChildNodes(node, clone, copyStyles);
            }
            if (before) {
                clone.insertBefore(before, clone.firstChild);
            }
            const after = this.resolvePseudoContent(node, clone, styleAfter, PseudoElementType.AFTER);
            if (after) {
                clone.appendChild(after);
            }
            this.counters.pop(counters);
            if ((style && (this.options.copyStyles || (0, node_parser_1.isSVGElementNode)(node)) && !(0, node_parser_1.isIFrameElement)(node)) || copyStyles) {
                (0, exports.copyCSSStyles)(style, clone);
            }
            if (node.scrollTop !== 0 || node.scrollLeft !== 0) {
                this.scrolledElements.push([clone, node.scrollLeft, node.scrollTop]);
            }
            if (((0, node_parser_1.isTextareaElement)(node) || (0, node_parser_1.isSelectElement)(node)) && ((0, node_parser_1.isTextareaElement)(clone) || (0, node_parser_1.isSelectElement)(clone))) {
                clone.value = node.value;
            }
            return clone;
        }
        return node.cloneNode(false);
    }
    resolvePseudoContent(node, clone, style, pseudoElt) {
        if (!style) {
            return;
        }
        const value = style.content;
        const document = clone.ownerDocument;
        if (!document || !value || value === 'none' || value === '-moz-alt-content' || style.display === 'none') {
            return;
        }
        this.counters.parse(new index_1.CSSParsedCounterDeclaration(this.context, style));
        const declaration = new index_1.CSSParsedPseudoDeclaration(this.context, style);
        const anonymousReplacedElement = document.createElement('html2canvaspseudoelement');
        (0, exports.copyCSSStyles)(style, anonymousReplacedElement);
        declaration.content.forEach((token) => {
            if (token.type === 0 /* TokenType.STRING_TOKEN */) {
                anonymousReplacedElement.appendChild(document.createTextNode(token.value));
            }
            else if (token.type === 22 /* TokenType.URL_TOKEN */) {
                const img = document.createElement('img');
                img.src = token.value;
                img.style.opacity = '1';
                anonymousReplacedElement.appendChild(img);
            }
            else if (token.type === 18 /* TokenType.FUNCTION */) {
                if (token.name === 'attr') {
                    const attr = token.values.filter(parser_1.isIdentToken);
                    if (attr.length) {
                        anonymousReplacedElement.appendChild(document.createTextNode(node.getAttribute(attr[0].value) || ''));
                    }
                }
                else if (token.name === 'counter') {
                    const [counter, counterStyle] = token.values.filter(parser_1.nonFunctionArgSeparator);
                    if (counter && (0, parser_1.isIdentToken)(counter)) {
                        const counterState = this.counters.getCounterValue(counter.value);
                        const counterType = counterStyle && (0, parser_1.isIdentToken)(counterStyle)
                            ? list_style_type_1.listStyleType.parse(this.context, counterStyle.value)
                            : 3 /* LIST_STYLE_TYPE.DECIMAL */;
                        anonymousReplacedElement.appendChild(document.createTextNode((0, counter_1.createCounterText)(counterState, counterType, false)));
                    }
                }
                else if (token.name === 'counters') {
                    const [counter, delim, counterStyle] = token.values.filter(parser_1.nonFunctionArgSeparator);
                    if (counter && (0, parser_1.isIdentToken)(counter)) {
                        const counterStates = this.counters.getCounterValues(counter.value);
                        const counterType = counterStyle && (0, parser_1.isIdentToken)(counterStyle)
                            ? list_style_type_1.listStyleType.parse(this.context, counterStyle.value)
                            : 3 /* LIST_STYLE_TYPE.DECIMAL */;
                        const separator = delim && delim.type === 0 /* TokenType.STRING_TOKEN */ ? delim.value : '';
                        const text = counterStates.map((value) => (0, counter_1.createCounterText)(value, counterType, false)).join(separator);
                        anonymousReplacedElement.appendChild(document.createTextNode(text));
                    }
                }
                else {
                    //   console.log('FUNCTION_TOKEN', token);
                }
            }
            else if (token.type === 20 /* TokenType.IDENT_TOKEN */) {
                switch (token.value) {
                    case 'open-quote':
                        anonymousReplacedElement.appendChild(document.createTextNode((0, quotes_1.getQuote)(declaration.quotes, this.quoteDepth++, true)));
                        break;
                    case 'close-quote':
                        anonymousReplacedElement.appendChild(document.createTextNode((0, quotes_1.getQuote)(declaration.quotes, --this.quoteDepth, false)));
                        break;
                    default:
                        // safari doesn't parse string tokens correctly because of lack of quotes
                        anonymousReplacedElement.appendChild(document.createTextNode(token.value));
                }
            }
        });
        anonymousReplacedElement.className = `${PSEUDO_HIDE_ELEMENT_CLASS_BEFORE} ${PSEUDO_HIDE_ELEMENT_CLASS_AFTER}`;
        const newClassName = pseudoElt === PseudoElementType.BEFORE
            ? ` ${PSEUDO_HIDE_ELEMENT_CLASS_BEFORE}`
            : ` ${PSEUDO_HIDE_ELEMENT_CLASS_AFTER}`;
        if ((0, node_parser_1.isSVGElementNode)(clone)) {
            clone.className.baseValue += newClassName;
        }
        else {
            clone.className += newClassName;
        }
        return anonymousReplacedElement;
    }
    static destroy(container) {
        if (container.parentNode) {
            container.parentNode.removeChild(container);
            return true;
        }
        return false;
    }
}
exports.DocumentCloner = DocumentCloner;
var PseudoElementType;
(function (PseudoElementType) {
    PseudoElementType[PseudoElementType["BEFORE"] = 0] = "BEFORE";
    PseudoElementType[PseudoElementType["AFTER"] = 1] = "AFTER";
})(PseudoElementType || (PseudoElementType = {}));
const createIFrameContainer = (ownerDocument, bounds) => {
    const cloneIframeContainer = ownerDocument.createElement('iframe');
    cloneIframeContainer.className = 'html2canvas-container';
    cloneIframeContainer.style.visibility = 'hidden';
    cloneIframeContainer.style.position = 'fixed';
    cloneIframeContainer.style.left = '-10000px';
    cloneIframeContainer.style.top = '0px';
    cloneIframeContainer.style.border = '0';
    cloneIframeContainer.width = bounds.width.toString();
    cloneIframeContainer.height = bounds.height.toString();
    cloneIframeContainer.scrolling = 'no'; // ios won't scroll without it
    cloneIframeContainer.setAttribute(IGNORE_ATTRIBUTE, 'true');
    ownerDocument.body.appendChild(cloneIframeContainer);
    return cloneIframeContainer;
};
const imageReady = (img) => {
    return new Promise((resolve) => {
        if (img.complete) {
            resolve();
            return;
        }
        if (!img.src) {
            resolve();
            return;
        }
        img.onload = resolve;
        img.onerror = resolve;
    });
};
const imagesReady = (document) => {
    return Promise.all([].slice.call(document.images, 0).map(imageReady));
};
const iframeLoader = (iframe) => {
    return new Promise((resolve, reject) => {
        const cloneWindow = iframe.contentWindow;
        if (!cloneWindow) {
            return reject(`No window assigned for iframe`);
        }
        const documentClone = cloneWindow.document;
        cloneWindow.onload = iframe.onload = () => {
            cloneWindow.onload = iframe.onload = null;
            const interval = setInterval(() => {
                if (documentClone.body.childNodes.length > 0 && documentClone.readyState === 'complete') {
                    clearInterval(interval);
                    resolve(iframe);
                }
            }, 50);
        };
    });
};
const ignoredStyleProperties = [
    'all', // #2476
    'd', // #2483
    'content' // Safari shows pseudoelements if content is set
];
const copyCSSStyles = (style, target) => {
    // Edge does not provide value for cssText
    for (let i = style.length - 1; i >= 0; i--) {
        const property = style.item(i);
        if (ignoredStyleProperties.indexOf(property) === -1) {
            target.style.setProperty(property, style.getPropertyValue(property));
        }
    }
    return target;
};
exports.copyCSSStyles = copyCSSStyles;
const serializeDoctype = (doctype) => {
    let str = '';
    if (doctype) {
        str += '<!DOCTYPE ';
        if (doctype.name) {
            str += doctype.name;
        }
        if (doctype.internalSubset) {
            str += doctype.internalSubset;
        }
        if (doctype.publicId) {
            str += `"${doctype.publicId}"`;
        }
        if (doctype.systemId) {
            str += `"${doctype.systemId}"`;
        }
        str += '>';
    }
    return str;
};
const restoreOwnerScroll = (ownerDocument, x, y) => {
    if (ownerDocument &&
        ownerDocument.defaultView &&
        (x !== ownerDocument.defaultView.pageXOffset || y !== ownerDocument.defaultView.pageYOffset)) {
        ownerDocument.defaultView.scrollTo(x, y);
    }
};
const restoreNodeScroll = ([element, x, y]) => {
    element.scrollLeft = x;
    element.scrollTop = y;
};
const PSEUDO_BEFORE = ':before';
const PSEUDO_AFTER = ':after';
const PSEUDO_HIDE_ELEMENT_CLASS_BEFORE = '___html2canvas___pseudoelement_before';
const PSEUDO_HIDE_ELEMENT_CLASS_AFTER = '___html2canvas___pseudoelement_after';
const PSEUDO_HIDE_ELEMENT_STYLE = `{
    content: "" !important;
    display: none !important;
}`;
const createPseudoHideStyles = (body) => {
    createStyles(body, `.${PSEUDO_HIDE_ELEMENT_CLASS_BEFORE}${PSEUDO_BEFORE}${PSEUDO_HIDE_ELEMENT_STYLE}
         .${PSEUDO_HIDE_ELEMENT_CLASS_AFTER}${PSEUDO_AFTER}${PSEUDO_HIDE_ELEMENT_STYLE}`);
};
const createStyles = (body, styles) => {
    const document = body.ownerDocument;
    if (document) {
        const style = document.createElement('style');
        style.textContent = styles;
        body.appendChild(style);
    }
};
