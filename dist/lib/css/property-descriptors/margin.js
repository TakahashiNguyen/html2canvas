"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.marginLeft = exports.marginBottom = exports.marginRight = exports.marginTop = void 0;
const marginForSide = (side) => ({
    name: `margin-${side}`,
    initialValue: '0',
    prefix: false,
    type: 4 /* PropertyDescriptorParsingType.TOKEN_VALUE */
});
exports.marginTop = marginForSide('top');
exports.marginRight = marginForSide('right');
exports.marginBottom = marginForSide('bottom');
exports.marginLeft = marginForSide('left');
