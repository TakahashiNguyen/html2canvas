"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.backgroundPosition = void 0;
const parser_1 = require("../syntax/parser");
const length_percentage_1 = require("../types/length-percentage");
exports.backgroundPosition = {
    name: 'background-position',
    initialValue: '0% 0%',
    type: 1 /* PropertyDescriptorParsingType.LIST */,
    prefix: false,
    parse: (_context, tokens) => {
        return (0, parser_1.parseFunctionArgs)(tokens)
            .map((values) => values.filter(length_percentage_1.isLengthPercentage))
            .map(length_percentage_1.parseLengthPercentageTuple);
    }
};
