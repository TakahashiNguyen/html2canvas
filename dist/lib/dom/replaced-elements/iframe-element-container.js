"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IFrameElementContainer = void 0;
const element_container_1 = require("../element-container");
const node_parser_1 = require("../node-parser");
const color_1 = require("../../css/types/color");
class IFrameElementContainer extends element_container_1.ElementContainer {
    src;
    width;
    height;
    tree;
    backgroundColor;
    constructor(context, iframe) {
        super(context, iframe);
        this.src = iframe.src;
        this.width = parseInt(iframe.width, 10) || 0;
        this.height = parseInt(iframe.height, 10) || 0;
        this.backgroundColor = this.styles.backgroundColor;
        try {
            if (iframe.contentWindow && iframe.contentWindow.document && iframe.contentWindow.document.documentElement) {
                this.tree = (0, node_parser_1.parseTree)(context, iframe.contentWindow.document.documentElement);
                // http://www.w3.org/TR/css3-background/#special-backgrounds
                const documentBackgroundColor = iframe.contentWindow.document.documentElement
                    ? (0, color_1.parseColor)(context, getComputedStyle(iframe.contentWindow.document.documentElement).backgroundColor)
                    : color_1.COLORS.TRANSPARENT;
                const bodyBackgroundColor = iframe.contentWindow.document.body
                    ? (0, color_1.parseColor)(context, getComputedStyle(iframe.contentWindow.document.body).backgroundColor)
                    : color_1.COLORS.TRANSPARENT;
                this.backgroundColor = (0, color_1.isTransparent)(documentBackgroundColor)
                    ? (0, color_1.isTransparent)(bodyBackgroundColor)
                        ? this.styles.backgroundColor
                        : bodyBackgroundColor
                    : documentBackgroundColor;
            }
        }
        catch (e) { }
    }
}
exports.IFrameElementContainer = IFrameElementContainer;
