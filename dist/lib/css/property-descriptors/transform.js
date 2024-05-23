"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transform = void 0;
exports.transform = {
    name: 'transform',
    initialValue: 'none',
    prefix: true,
    type: 0 /* PropertyDescriptorParsingType.VALUE */,
    parse: (_context, token) => {
        if (token.type === 20 /* TokenType.IDENT_TOKEN */ && token.value === 'none') {
            return null;
        }
        if (token.type === 18 /* TokenType.FUNCTION */) {
            const transformFunction = SUPPORTED_TRANSFORM_FUNCTIONS[token.name];
            if (typeof transformFunction === 'undefined') {
                throw new Error(`Attempting to parse an unsupported transform function "${token.name}"`);
            }
            return transformFunction(token.values);
        }
        return null;
    }
};
const matrix = (args) => {
    // @ts-ignore
    const values = args.filter((arg) => arg.type === 17 /* TokenType.NUMBER_TOKEN */).map((arg) => arg.number);
    return values.length === 6 ? values : null;
};
// doesn't support 3D transforms at the moment
const matrix3d = (args) => {
    // @ts-ignore
    const values = args.filter((arg) => arg.type === 17 /* TokenType.NUMBER_TOKEN */).map((arg) => arg.number);
    const [a1, b1, {}, {}, a2, b2, {}, {}, {}, {}, {}, {}, a4, b4, {}, {}] = values;
    return values.length === 16 ? [a1, b1, a2, b2, a4, b4] : null;
};
const SUPPORTED_TRANSFORM_FUNCTIONS = {
    matrix: matrix,
    matrix3d: matrix3d
};
