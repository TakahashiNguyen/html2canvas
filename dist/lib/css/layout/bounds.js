"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDocumentSize = exports.parseBounds = exports.Bounds = void 0;
class Bounds {
    left;
    top;
    width;
    height;
    constructor(left, top, width, height) {
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
    }
    add(x, y, w, h) {
        return new Bounds(this.left + x, this.top + y, this.width + w, this.height + h);
    }
    static fromClientRect(context, clientRect) {
        return new Bounds(clientRect.left + context.windowBounds.left, clientRect.top + context.windowBounds.top, clientRect.width, clientRect.height);
    }
    static fromDOMRectList(context, domRectList) {
        const domRect = Array.from(domRectList).find((rect) => rect.width !== 0);
        return domRect
            ? new Bounds(domRect.left + context.windowBounds.left, domRect.top + context.windowBounds.top, domRect.width, domRect.height)
            : Bounds.EMPTY;
    }
    static EMPTY = new Bounds(0, 0, 0, 0);
}
exports.Bounds = Bounds;
const parseBounds = (context, node) => {
    return Bounds.fromClientRect(context, node.getBoundingClientRect());
};
exports.parseBounds = parseBounds;
const parseDocumentSize = (document) => {
    const body = document.body;
    const documentElement = document.documentElement;
    if (!body || !documentElement) {
        throw new Error(`Unable to get document size`);
    }
    const width = Math.max(Math.max(body.scrollWidth, documentElement.scrollWidth), Math.max(body.offsetWidth, documentElement.offsetWidth), Math.max(body.clientWidth, documentElement.clientWidth));
    const height = Math.max(Math.max(body.scrollHeight, documentElement.scrollHeight), Math.max(body.offsetHeight, documentElement.offsetHeight), Math.max(body.clientHeight, documentElement.clientHeight));
    return new Bounds(0, 0, width, height);
};
exports.parseDocumentSize = parseDocumentSize;
