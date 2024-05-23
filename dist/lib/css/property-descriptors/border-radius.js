"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.borderBottomLeftRadius = exports.borderBottomRightRadius = exports.borderTopRightRadius = exports.borderTopLeftRadius = void 0;
const length_percentage_1 = require("../types/length-percentage");
const borderRadiusForSide = (side) => ({
    name: `border-radius-${side}`,
    initialValue: '0 0',
    prefix: false,
    type: 1 /* PropertyDescriptorParsingType.LIST */,
    parse: (_context, tokens) => (0, length_percentage_1.parseLengthPercentageTuple)(tokens.filter(length_percentage_1.isLengthPercentage))
});
exports.borderTopLeftRadius = borderRadiusForSide('top-left');
exports.borderTopRightRadius = borderRadiusForSide('top-right');
exports.borderBottomRightRadius = borderRadiusForSide('bottom-right');
exports.borderBottomLeftRadius = borderRadiusForSide('bottom-left');