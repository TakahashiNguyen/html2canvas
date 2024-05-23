"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CSSParsedCounterDeclaration = exports.CSSParsedPseudoDeclaration = exports.CSSParsedDeclaration = void 0;
const background_clip_1 = require("./property-descriptors/background-clip");
const background_color_1 = require("./property-descriptors/background-color");
const background_image_1 = require("./property-descriptors/background-image");
const background_origin_1 = require("./property-descriptors/background-origin");
const background_position_1 = require("./property-descriptors/background-position");
const background_repeat_1 = require("./property-descriptors/background-repeat");
const background_size_1 = require("./property-descriptors/background-size");
const border_color_1 = require("./property-descriptors/border-color");
const border_radius_1 = require("./property-descriptors/border-radius");
const border_style_1 = require("./property-descriptors/border-style");
const border_width_1 = require("./property-descriptors/border-width");
const color_1 = require("./property-descriptors/color");
const direction_1 = require("./property-descriptors/direction");
const display_1 = require("./property-descriptors/display");
const float_1 = require("./property-descriptors/float");
const letter_spacing_1 = require("./property-descriptors/letter-spacing");
const line_break_1 = require("./property-descriptors/line-break");
const line_height_1 = require("./property-descriptors/line-height");
const list_style_image_1 = require("./property-descriptors/list-style-image");
const list_style_position_1 = require("./property-descriptors/list-style-position");
const list_style_type_1 = require("./property-descriptors/list-style-type");
const margin_1 = require("./property-descriptors/margin");
const overflow_1 = require("./property-descriptors/overflow");
const overflow_wrap_1 = require("./property-descriptors/overflow-wrap");
const padding_1 = require("./property-descriptors/padding");
const text_align_1 = require("./property-descriptors/text-align");
const position_1 = require("./property-descriptors/position");
const text_shadow_1 = require("./property-descriptors/text-shadow");
const text_transform_1 = require("./property-descriptors/text-transform");
const transform_1 = require("./property-descriptors/transform");
const transform_origin_1 = require("./property-descriptors/transform-origin");
const visibility_1 = require("./property-descriptors/visibility");
const word_break_1 = require("./property-descriptors/word-break");
const z_index_1 = require("./property-descriptors/z-index");
const parser_1 = require("./syntax/parser");
const tokenizer_1 = require("./syntax/tokenizer");
const color_2 = require("./types/color");
const angle_1 = require("./types/angle");
const image_1 = require("./types/image");
const time_1 = require("./types/time");
const opacity_1 = require("./property-descriptors/opacity");
const text_decoration_color_1 = require("./property-descriptors/text-decoration-color");
const text_decoration_line_1 = require("./property-descriptors/text-decoration-line");
const length_percentage_1 = require("./types/length-percentage");
const font_family_1 = require("./property-descriptors/font-family");
const font_size_1 = require("./property-descriptors/font-size");
const length_1 = require("./types/length");
const font_weight_1 = require("./property-descriptors/font-weight");
const font_variant_1 = require("./property-descriptors/font-variant");
const font_style_1 = require("./property-descriptors/font-style");
const bitwise_1 = require("../core/bitwise");
const content_1 = require("./property-descriptors/content");
const counter_increment_1 = require("./property-descriptors/counter-increment");
const counter_reset_1 = require("./property-descriptors/counter-reset");
const duration_1 = require("./property-descriptors/duration");
const quotes_1 = require("./property-descriptors/quotes");
const box_shadow_1 = require("./property-descriptors/box-shadow");
const paint_order_1 = require("./property-descriptors/paint-order");
const webkit_text_stroke_color_1 = require("./property-descriptors/webkit-text-stroke-color");
const webkit_text_stroke_width_1 = require("./property-descriptors/webkit-text-stroke-width");
class CSSParsedDeclaration {
    animationDuration;
    backgroundClip;
    backgroundColor;
    backgroundImage;
    backgroundOrigin;
    backgroundPosition;
    backgroundRepeat;
    backgroundSize;
    borderTopColor;
    borderRightColor;
    borderBottomColor;
    borderLeftColor;
    borderTopLeftRadius;
    borderTopRightRadius;
    borderBottomRightRadius;
    borderBottomLeftRadius;
    borderTopStyle;
    borderRightStyle;
    borderBottomStyle;
    borderLeftStyle;
    borderTopWidth;
    borderRightWidth;
    borderBottomWidth;
    borderLeftWidth;
    boxShadow;
    color;
    direction;
    display;
    float;
    fontFamily;
    fontSize;
    fontStyle;
    fontVariant;
    fontWeight;
    letterSpacing;
    lineBreak;
    lineHeight;
    listStyleImage;
    listStylePosition;
    listStyleType;
    marginTop;
    marginRight;
    marginBottom;
    marginLeft;
    opacity;
    overflowX;
    overflowY;
    overflowWrap;
    paddingTop;
    paddingRight;
    paddingBottom;
    paddingLeft;
    paintOrder;
    position;
    textAlign;
    textDecorationColor;
    textDecorationLine;
    textShadow;
    textTransform;
    transform;
    transformOrigin;
    visibility;
    webkitTextStrokeColor;
    webkitTextStrokeWidth;
    wordBreak;
    zIndex;
    constructor(context, declaration) {
        this.animationDuration = parse(context, duration_1.duration, declaration.animationDuration);
        this.backgroundClip = parse(context, background_clip_1.backgroundClip, declaration.backgroundClip);
        this.backgroundColor = parse(context, background_color_1.backgroundColor, declaration.backgroundColor);
        this.backgroundImage = parse(context, background_image_1.backgroundImage, declaration.backgroundImage);
        this.backgroundOrigin = parse(context, background_origin_1.backgroundOrigin, declaration.backgroundOrigin);
        this.backgroundPosition = parse(context, background_position_1.backgroundPosition, declaration.backgroundPosition);
        this.backgroundRepeat = parse(context, background_repeat_1.backgroundRepeat, declaration.backgroundRepeat);
        this.backgroundSize = parse(context, background_size_1.backgroundSize, declaration.backgroundSize);
        this.borderTopColor = parse(context, border_color_1.borderTopColor, declaration.borderTopColor);
        this.borderRightColor = parse(context, border_color_1.borderRightColor, declaration.borderRightColor);
        this.borderBottomColor = parse(context, border_color_1.borderBottomColor, declaration.borderBottomColor);
        this.borderLeftColor = parse(context, border_color_1.borderLeftColor, declaration.borderLeftColor);
        this.borderTopLeftRadius = parse(context, border_radius_1.borderTopLeftRadius, declaration.borderTopLeftRadius);
        this.borderTopRightRadius = parse(context, border_radius_1.borderTopRightRadius, declaration.borderTopRightRadius);
        this.borderBottomRightRadius = parse(context, border_radius_1.borderBottomRightRadius, declaration.borderBottomRightRadius);
        this.borderBottomLeftRadius = parse(context, border_radius_1.borderBottomLeftRadius, declaration.borderBottomLeftRadius);
        this.borderTopStyle = parse(context, border_style_1.borderTopStyle, declaration.borderTopStyle);
        this.borderRightStyle = parse(context, border_style_1.borderRightStyle, declaration.borderRightStyle);
        this.borderBottomStyle = parse(context, border_style_1.borderBottomStyle, declaration.borderBottomStyle);
        this.borderLeftStyle = parse(context, border_style_1.borderLeftStyle, declaration.borderLeftStyle);
        this.borderTopWidth = parse(context, border_width_1.borderTopWidth, declaration.borderTopWidth);
        this.borderRightWidth = parse(context, border_width_1.borderRightWidth, declaration.borderRightWidth);
        this.borderBottomWidth = parse(context, border_width_1.borderBottomWidth, declaration.borderBottomWidth);
        this.borderLeftWidth = parse(context, border_width_1.borderLeftWidth, declaration.borderLeftWidth);
        this.boxShadow = parse(context, box_shadow_1.boxShadow, declaration.boxShadow);
        this.color = parse(context, color_1.color, declaration.color);
        this.direction = parse(context, direction_1.direction, declaration.direction);
        this.display = parse(context, display_1.display, declaration.display);
        this.float = parse(context, float_1.float, declaration.cssFloat);
        this.fontFamily = parse(context, font_family_1.fontFamily, declaration.fontFamily);
        this.fontSize = parse(context, font_size_1.fontSize, declaration.fontSize);
        this.fontStyle = parse(context, font_style_1.fontStyle, declaration.fontStyle);
        this.fontVariant = parse(context, font_variant_1.fontVariant, declaration.fontVariant);
        this.fontWeight = parse(context, font_weight_1.fontWeight, declaration.fontWeight);
        this.letterSpacing = parse(context, letter_spacing_1.letterSpacing, declaration.letterSpacing);
        this.lineBreak = parse(context, line_break_1.lineBreak, declaration.lineBreak);
        this.lineHeight = parse(context, line_height_1.lineHeight, declaration.lineHeight);
        this.listStyleImage = parse(context, list_style_image_1.listStyleImage, declaration.listStyleImage);
        this.listStylePosition = parse(context, list_style_position_1.listStylePosition, declaration.listStylePosition);
        this.listStyleType = parse(context, list_style_type_1.listStyleType, declaration.listStyleType);
        this.marginTop = parse(context, margin_1.marginTop, declaration.marginTop);
        this.marginRight = parse(context, margin_1.marginRight, declaration.marginRight);
        this.marginBottom = parse(context, margin_1.marginBottom, declaration.marginBottom);
        this.marginLeft = parse(context, margin_1.marginLeft, declaration.marginLeft);
        this.opacity = parse(context, opacity_1.opacity, declaration.opacity);
        const overflowTuple = parse(context, overflow_1.overflow, declaration.overflow);
        this.overflowX = overflowTuple[0];
        this.overflowY = overflowTuple[overflowTuple.length > 1 ? 1 : 0];
        this.overflowWrap = parse(context, overflow_wrap_1.overflowWrap, declaration.overflowWrap);
        this.paddingTop = parse(context, padding_1.paddingTop, declaration.paddingTop);
        this.paddingRight = parse(context, padding_1.paddingRight, declaration.paddingRight);
        this.paddingBottom = parse(context, padding_1.paddingBottom, declaration.paddingBottom);
        this.paddingLeft = parse(context, padding_1.paddingLeft, declaration.paddingLeft);
        this.paintOrder = parse(context, paint_order_1.paintOrder, declaration.paintOrder);
        this.position = parse(context, position_1.position, declaration.position);
        this.textAlign = parse(context, text_align_1.textAlign, declaration.textAlign);
        this.textDecorationColor = parse(context, text_decoration_color_1.textDecorationColor, declaration.textDecorationColor ?? declaration.color);
        this.textDecorationLine = parse(context, text_decoration_line_1.textDecorationLine, declaration.textDecorationLine ?? declaration.textDecoration);
        this.textShadow = parse(context, text_shadow_1.textShadow, declaration.textShadow);
        this.textTransform = parse(context, text_transform_1.textTransform, declaration.textTransform);
        this.transform = parse(context, transform_1.transform, declaration.transform);
        this.transformOrigin = parse(context, transform_origin_1.transformOrigin, declaration.transformOrigin);
        this.visibility = parse(context, visibility_1.visibility, declaration.visibility);
        this.webkitTextStrokeColor = parse(context, webkit_text_stroke_color_1.webkitTextStrokeColor, declaration.webkitTextStrokeColor);
        this.webkitTextStrokeWidth = parse(context, webkit_text_stroke_width_1.webkitTextStrokeWidth, declaration.webkitTextStrokeWidth);
        this.wordBreak = parse(context, word_break_1.wordBreak, declaration.wordBreak);
        this.zIndex = parse(context, z_index_1.zIndex, declaration.zIndex);
    }
    isVisible() {
        return this.display > 0 && this.opacity > 0 && this.visibility === 0 /* VISIBILITY.VISIBLE */;
    }
    isTransparent() {
        return (0, color_2.isTransparent)(this.backgroundColor);
    }
    isTransformed() {
        return this.transform !== null;
    }
    isPositioned() {
        return this.position !== 0 /* POSITION.STATIC */;
    }
    isPositionedWithZIndex() {
        return this.isPositioned() && !this.zIndex.auto;
    }
    isFloating() {
        return this.float !== 0 /* FLOAT.NONE */;
    }
    isInlineLevel() {
        return ((0, bitwise_1.contains)(this.display, 4 /* DISPLAY.INLINE */) ||
            (0, bitwise_1.contains)(this.display, 33554432 /* DISPLAY.INLINE_BLOCK */) ||
            (0, bitwise_1.contains)(this.display, 268435456 /* DISPLAY.INLINE_FLEX */) ||
            (0, bitwise_1.contains)(this.display, 536870912 /* DISPLAY.INLINE_GRID */) ||
            (0, bitwise_1.contains)(this.display, 67108864 /* DISPLAY.INLINE_LIST_ITEM */) ||
            (0, bitwise_1.contains)(this.display, 134217728 /* DISPLAY.INLINE_TABLE */));
    }
}
exports.CSSParsedDeclaration = CSSParsedDeclaration;
class CSSParsedPseudoDeclaration {
    content;
    quotes;
    constructor(context, declaration) {
        this.content = parse(context, content_1.content, declaration.content);
        this.quotes = parse(context, quotes_1.quotes, declaration.quotes);
    }
}
exports.CSSParsedPseudoDeclaration = CSSParsedPseudoDeclaration;
class CSSParsedCounterDeclaration {
    counterIncrement;
    counterReset;
    constructor(context, declaration) {
        this.counterIncrement = parse(context, counter_increment_1.counterIncrement, declaration.counterIncrement);
        this.counterReset = parse(context, counter_reset_1.counterReset, declaration.counterReset);
    }
}
exports.CSSParsedCounterDeclaration = CSSParsedCounterDeclaration;
const parse = (context, descriptor, style) => {
    const tokenizer = new tokenizer_1.Tokenizer();
    const value = style !== null && typeof style !== 'undefined' ? style.toString() : descriptor.initialValue;
    tokenizer.write(value);
    const parser = new parser_1.Parser(tokenizer.read());
    switch (descriptor.type) {
        case 2 /* PropertyDescriptorParsingType.IDENT_VALUE */:
            const token = parser.parseComponentValue();
            return descriptor.parse(context, (0, parser_1.isIdentToken)(token) ? token.value : descriptor.initialValue);
        case 0 /* PropertyDescriptorParsingType.VALUE */:
            return descriptor.parse(context, parser.parseComponentValue());
        case 1 /* PropertyDescriptorParsingType.LIST */:
            return descriptor.parse(context, parser.parseComponentValues());
        case 4 /* PropertyDescriptorParsingType.TOKEN_VALUE */:
            return parser.parseComponentValue();
        case 3 /* PropertyDescriptorParsingType.TYPE_VALUE */:
            switch (descriptor.format) {
                case 'angle':
                    return angle_1.angle.parse(context, parser.parseComponentValue());
                case 'color':
                    return color_2.color.parse(context, parser.parseComponentValue());
                case 'image':
                    return image_1.image.parse(context, parser.parseComponentValue());
                case 'length':
                    const length = parser.parseComponentValue();
                    return (0, length_1.isLength)(length) ? length : length_percentage_1.ZERO_LENGTH;
                case 'length-percentage':
                    const value = parser.parseComponentValue();
                    return (0, length_percentage_1.isLengthPercentage)(value) ? value : length_percentage_1.ZERO_LENGTH;
                case 'time':
                    return time_1.time.parse(context, parser.parseComponentValue());
            }
            break;
    }
};
