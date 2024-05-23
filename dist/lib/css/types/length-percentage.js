"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAbsoluteValue = exports.getAbsoluteValueForTuple = exports.HUNDRED_PERCENT = exports.FIFTY_PERCENT = exports.ZERO_LENGTH = exports.parseLengthPercentageTuple = exports.isLengthPercentage = void 0;
const tokenizer_1 = require("../syntax/tokenizer");
const parser_1 = require("../syntax/parser");
const length_1 = require("./length");
const isLengthPercentage = (token) => token.type === 16 /* TokenType.PERCENTAGE_TOKEN */ || (0, length_1.isLength)(token);
exports.isLengthPercentage = isLengthPercentage;
const parseLengthPercentageTuple = (tokens) => tokens.length > 1 ? [tokens[0], tokens[1]] : [tokens[0]];
exports.parseLengthPercentageTuple = parseLengthPercentageTuple;
exports.ZERO_LENGTH = {
    type: 17 /* TokenType.NUMBER_TOKEN */,
    number: 0,
    flags: tokenizer_1.FLAG_INTEGER
};
exports.FIFTY_PERCENT = {
    type: 16 /* TokenType.PERCENTAGE_TOKEN */,
    number: 50,
    flags: tokenizer_1.FLAG_INTEGER
};
exports.HUNDRED_PERCENT = {
    type: 16 /* TokenType.PERCENTAGE_TOKEN */,
    number: 100,
    flags: tokenizer_1.FLAG_INTEGER
};
const getAbsoluteValueForTuple = (tuple, width, height) => {
    const [x, y] = tuple;
    return [(0, exports.getAbsoluteValue)(x, width), (0, exports.getAbsoluteValue)(typeof y !== 'undefined' ? y : x, height)];
};
exports.getAbsoluteValueForTuple = getAbsoluteValueForTuple;
const getAbsoluteValue = (token, parent) => {
    if (token.type === 16 /* TokenType.PERCENTAGE_TOKEN */) {
        return (token.number / 100) * parent;
    }
    if ((0, parser_1.isDimensionToken)(token)) {
        switch (token.unit) {
            case 'rem':
            case 'em':
                return 16 * token.number; // TODO use correct font-size
            case 'px':
            default:
                return token.number;
        }
    }
    return token.number;
};
exports.getAbsoluteValue = getAbsoluteValue;
