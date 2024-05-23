"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listStyleImage = void 0;
const image_1 = require("../types/image");
exports.listStyleImage = {
    name: 'list-style-image',
    initialValue: 'none',
    type: 0 /* PropertyDescriptorParsingType.VALUE */,
    prefix: false,
    parse: (context, token) => {
        if (token.type === 20 /* TokenType.IDENT_TOKEN */ && token.value === 'none') {
            return null;
        }
        return image_1.image.parse(context, token);
    }
};