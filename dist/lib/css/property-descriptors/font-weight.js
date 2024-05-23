"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fontWeight = void 0;
const parser_1 = require("../syntax/parser");
exports.fontWeight = {
    name: 'font-weight',
    initialValue: 'normal',
    type: 0 /* PropertyDescriptorParsingType.VALUE */,
    prefix: false,
    parse: (_context, token) => {
        if ((0, parser_1.isNumberToken)(token)) {
            return token.number;
        }
        if ((0, parser_1.isIdentToken)(token)) {
            switch (token.value) {
                case 'bold':
                    return 700;
                case 'normal':
                default:
                    return 400;
            }
        }
        return 400;
    }
};
