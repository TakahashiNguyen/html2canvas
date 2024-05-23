"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCustomElement = exports.isSlotElement = exports.isSelectElement = exports.isTextareaElement = exports.isScriptElement = exports.isStyleElement = exports.isIFrameElement = exports.isImageElement = exports.isVideoElement = exports.isCanvasElement = exports.isBodyElement = exports.isSVGElement = exports.isHTMLElement = exports.isInputElement = exports.isOLElement = exports.isLIElement = exports.isSVGElementNode = exports.isHTMLElementNode = exports.isElementNode = exports.isTextNode = exports.parseTree = void 0;
const element_container_1 = require("./element-container");
const text_container_1 = require("./text-container");
const image_element_container_1 = require("./replaced-elements/image-element-container");
const canvas_element_container_1 = require("./replaced-elements/canvas-element-container");
const svg_element_container_1 = require("./replaced-elements/svg-element-container");
const li_element_container_1 = require("./elements/li-element-container");
const ol_element_container_1 = require("./elements/ol-element-container");
const input_element_container_1 = require("./replaced-elements/input-element-container");
const select_element_container_1 = require("./elements/select-element-container");
const textarea_element_container_1 = require("./elements/textarea-element-container");
const iframe_element_container_1 = require("./replaced-elements/iframe-element-container");
const LIST_OWNERS = ['OL', 'UL', 'MENU'];
const parseNodeTree = (context, node, parent, root) => {
    for (let childNode = node.firstChild, nextNode; childNode; childNode = nextNode) {
        nextNode = childNode.nextSibling;
        if ((0, exports.isTextNode)(childNode) && childNode.data.trim().length > 0) {
            parent.textNodes.push(new text_container_1.TextContainer(context, childNode, parent.styles));
        }
        else if ((0, exports.isElementNode)(childNode)) {
            if ((0, exports.isSlotElement)(childNode) && childNode.assignedNodes) {
                childNode.assignedNodes().forEach((childNode) => parseNodeTree(context, childNode, parent, root));
            }
            else {
                const container = createContainer(context, childNode);
                if (container.styles.isVisible()) {
                    if (createsRealStackingContext(childNode, container, root)) {
                        container.flags |= 4 /* FLAGS.CREATES_REAL_STACKING_CONTEXT */;
                    }
                    else if (createsStackingContext(container.styles)) {
                        container.flags |= 2 /* FLAGS.CREATES_STACKING_CONTEXT */;
                    }
                    if (LIST_OWNERS.indexOf(childNode.tagName) !== -1) {
                        container.flags |= 8 /* FLAGS.IS_LIST_OWNER */;
                    }
                    parent.elements.push(container);
                    childNode.slot;
                    if (childNode.shadowRoot) {
                        parseNodeTree(context, childNode.shadowRoot, container, root);
                    }
                    else if (!(0, exports.isTextareaElement)(childNode) && !(0, exports.isSVGElement)(childNode) && !(0, exports.isSelectElement)(childNode)) {
                        parseNodeTree(context, childNode, container, root);
                    }
                }
            }
        }
    }
};
const createContainer = (context, element) => {
    if ((0, exports.isImageElement)(element)) {
        return new image_element_container_1.ImageElementContainer(context, element);
    }
    if ((0, exports.isCanvasElement)(element)) {
        return new canvas_element_container_1.CanvasElementContainer(context, element);
    }
    if ((0, exports.isSVGElement)(element)) {
        return new svg_element_container_1.SVGElementContainer(context, element);
    }
    if ((0, exports.isLIElement)(element)) {
        return new li_element_container_1.LIElementContainer(context, element);
    }
    if ((0, exports.isOLElement)(element)) {
        return new ol_element_container_1.OLElementContainer(context, element);
    }
    if ((0, exports.isInputElement)(element)) {
        return new input_element_container_1.InputElementContainer(context, element);
    }
    if ((0, exports.isSelectElement)(element)) {
        return new select_element_container_1.SelectElementContainer(context, element);
    }
    if ((0, exports.isTextareaElement)(element)) {
        return new textarea_element_container_1.TextareaElementContainer(context, element);
    }
    if ((0, exports.isIFrameElement)(element)) {
        return new iframe_element_container_1.IFrameElementContainer(context, element);
    }
    return new element_container_1.ElementContainer(context, element);
};
const parseTree = (context, element) => {
    const container = createContainer(context, element);
    container.flags |= 4 /* FLAGS.CREATES_REAL_STACKING_CONTEXT */;
    parseNodeTree(context, element, container, container);
    return container;
};
exports.parseTree = parseTree;
const createsRealStackingContext = (node, container, root) => {
    return (container.styles.isPositionedWithZIndex() ||
        container.styles.opacity < 1 ||
        container.styles.isTransformed() ||
        ((0, exports.isBodyElement)(node) && root.styles.isTransparent()));
};
const createsStackingContext = (styles) => styles.isPositioned() || styles.isFloating();
const isTextNode = (node) => node.nodeType === Node.TEXT_NODE;
exports.isTextNode = isTextNode;
const isElementNode = (node) => node.nodeType === Node.ELEMENT_NODE;
exports.isElementNode = isElementNode;
const isHTMLElementNode = (node) => (0, exports.isElementNode)(node) && typeof node.style !== 'undefined' && !(0, exports.isSVGElementNode)(node);
exports.isHTMLElementNode = isHTMLElementNode;
const isSVGElementNode = (element) => typeof element.className === 'object';
exports.isSVGElementNode = isSVGElementNode;
const isLIElement = (node) => node.tagName === 'LI';
exports.isLIElement = isLIElement;
const isOLElement = (node) => node.tagName === 'OL';
exports.isOLElement = isOLElement;
const isInputElement = (node) => node.tagName === 'INPUT';
exports.isInputElement = isInputElement;
const isHTMLElement = (node) => node.tagName === 'HTML';
exports.isHTMLElement = isHTMLElement;
const isSVGElement = (node) => node.tagName === 'svg';
exports.isSVGElement = isSVGElement;
const isBodyElement = (node) => node.tagName === 'BODY';
exports.isBodyElement = isBodyElement;
const isCanvasElement = (node) => node.tagName === 'CANVAS';
exports.isCanvasElement = isCanvasElement;
const isVideoElement = (node) => node.tagName === 'VIDEO';
exports.isVideoElement = isVideoElement;
const isImageElement = (node) => node.tagName === 'IMG';
exports.isImageElement = isImageElement;
const isIFrameElement = (node) => node.tagName === 'IFRAME';
exports.isIFrameElement = isIFrameElement;
const isStyleElement = (node) => node.tagName === 'STYLE';
exports.isStyleElement = isStyleElement;
const isScriptElement = (node) => node.tagName === 'SCRIPT';
exports.isScriptElement = isScriptElement;
const isTextareaElement = (node) => node.tagName === 'TEXTAREA';
exports.isTextareaElement = isTextareaElement;
const isSelectElement = (node) => node.tagName === 'SELECT';
exports.isSelectElement = isSelectElement;
const isSlotElement = (node) => node.tagName === 'SLOT';
exports.isSlotElement = isSlotElement;
// https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name
const isCustomElement = (node) => node.tagName.indexOf('-') > 0;
exports.isCustomElement = isCustomElement;
