"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElementContainer = void 0;
const index_1 = require("../css/index");
const bounds_1 = require("../css/layout/bounds");
const node_parser_1 = require("./node-parser");
const debugger_1 = require("../core/debugger");
class ElementContainer {
    context;
    styles;
    textNodes = [];
    elements = [];
    bounds;
    flags = 0;
    constructor(context, element) {
        this.context = context;
        if ((0, debugger_1.isDebugging)(element, 3 /* DebuggerType.PARSE */)) {
            debugger;
        }
        this.styles = new index_1.CSSParsedDeclaration(context, window.getComputedStyle(element, null));
        if ((0, node_parser_1.isHTMLElementNode)(element)) {
            if (this.styles.animationDuration.some((duration) => duration > 0)) {
                element.style.animationDuration = '0s';
            }
            if (this.styles.transform !== null) {
                // getBoundingClientRect takes transforms into account
                element.style.transform = 'none';
            }
        }
        this.bounds = (0, bounds_1.parseBounds)(this.context, element);
        if ((0, debugger_1.isDebugging)(element, 4 /* DebuggerType.RENDER */)) {
            this.flags |= 16 /* FLAGS.DEBUG_RENDER */;
        }
    }
}
exports.ElementContainer = ElementContainer;
