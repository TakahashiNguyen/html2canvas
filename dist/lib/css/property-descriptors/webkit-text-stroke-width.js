"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webkitTextStrokeWidth = void 0;
const parser_1 = require("../syntax/parser");
exports.webkitTextStrokeWidth = {
    name: `-webkit-text-stroke-width`,
    initialValue: '0',
    type: 0 /* PropertyDescriptorParsingType.VALUE */,
    prefix: false,
    parse: (_context, token) => {
        if ((0, parser_1.isDimensionToken)(token)) {
            return token.number;
        }
        return 0;
    }
};
