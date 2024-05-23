"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanvasRenderer = void 0;
const stacking_context_1 = require("../stacking-context");
const color_1 = require("../../css/types/color");
const path_1 = require("../path");
const bound_curves_1 = require("../bound-curves");
const bezier_curve_1 = require("../bezier-curve");
const vector_1 = require("../vector");
const image_1 = require("../../css/types/image");
const border_1 = require("../border");
const background_1 = require("../background");
const parser_1 = require("../../css/syntax/parser");
const text_1 = require("../../css/layout/text");
const image_element_container_1 = require("../../dom/replaced-elements/image-element-container");
const box_sizing_1 = require("../box-sizing");
const canvas_element_container_1 = require("../../dom/replaced-elements/canvas-element-container");
const svg_element_container_1 = require("../../dom/replaced-elements/svg-element-container");
const effects_1 = require("../effects");
const bitwise_1 = require("../../core/bitwise");
const gradient_1 = require("../../css/types/functions/gradient");
const length_percentage_1 = require("../../css/types/length-percentage");
const font_metrics_1 = require("../font-metrics");
const bounds_1 = require("../../css/layout/bounds");
const line_height_1 = require("../../css/property-descriptors/line-height");
const input_element_container_1 = require("../../dom/replaced-elements/input-element-container");
const textarea_element_container_1 = require("../../dom/elements/textarea-element-container");
const select_element_container_1 = require("../../dom/elements/select-element-container");
const iframe_element_container_1 = require("../../dom/replaced-elements/iframe-element-container");
const renderer_1 = require("../renderer");
const three_1 = require("three");
const MASK_OFFSET = 10000;
class CanvasRenderer extends renderer_1.Renderer {
    canvas;
    ctx;
    _activeEffects = [];
    fontMetrics;
    constructor(context, options) {
        super(context, options);
        this.canvas = options.canvas ? options.canvas : document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        if (!options.canvas) {
            this.canvas.width = Math.floor(options.size.width * options.scale);
            this.canvas.height = Math.floor(options.size.height * options.scale);
            this.canvas.style.width = `${options.size.width}px`;
            this.canvas.style.height = `${options.size.height}px`;
        }
        this.fontMetrics = new font_metrics_1.FontMetrics(document);
        this.ctx.scale(this.options.scale, this.options.scale);
        this.ctx.translate(-options.x, -options.y);
        this.ctx.textBaseline = 'bottom';
        this._activeEffects = [];
        this.context.logger.debug(`Canvas renderer initialized (${options.size.width}x${options.size.height}) with scale ${options.scale}`);
    }
    applyEffects(effects) {
        while (this._activeEffects.length) {
            this.popEffect();
        }
        effects.forEach((effect) => this.applyEffect(effect));
    }
    applyEffect(effect) {
        this.ctx.save();
        if ((0, effects_1.isOpacityEffect)(effect)) {
            this.ctx.globalAlpha = effect.opacity;
        }
        if ((0, effects_1.isTransformEffect)(effect)) {
            this.ctx.translate(effect.offsetX, effect.offsetY);
            this.ctx.transform(effect.matrix[0], effect.matrix[1], effect.matrix[2], effect.matrix[3], effect.matrix[4], effect.matrix[5]);
            this.ctx.translate(-effect.offsetX, -effect.offsetY);
        }
        if ((0, effects_1.isClipEffect)(effect)) {
            this.path(effect.path);
            this.ctx.clip();
        }
        this._activeEffects.push(effect);
    }
    popEffect() {
        this._activeEffects.pop();
        this.ctx.restore();
    }
    async renderStack(stack) {
        const styles = stack.element.container.styles;
        if (styles.isVisible()) {
            await this.renderStackContent(stack);
        }
    }
    async renderNode(paint) {
        if ((0, bitwise_1.contains)(paint.container.flags, 16 /* FLAGS.DEBUG_RENDER */)) {
            debugger;
        }
        if (paint.container.styles.isVisible()) {
            await this.renderNodeBackgroundAndBorders(paint);
            await this.renderNodeContent(paint);
        }
    }
    renderTextWithLetterSpacing(text, letterSpacing, baseline) {
        if (letterSpacing === 0) {
            this.ctx.fillText(text.text, text.bounds.left, text.bounds.top + baseline);
        }
        else {
            const letters = (0, text_1.segmentGraphemes)(text.text);
            letters.reduce((left, letter) => {
                this.ctx.fillText(letter, left, text.bounds.top + baseline);
                return left + this.ctx.measureText(letter).width;
            }, text.bounds.left);
        }
    }
    createFontStyle(styles) {
        const fontVariant = styles.fontVariant
            .filter((variant) => variant === 'normal' || variant === 'small-caps')
            .join('');
        const fontFamily = fixIOSSystemFonts(styles.fontFamily).join(', ');
        const fontSize = (0, parser_1.isDimensionToken)(styles.fontSize)
            ? `${styles.fontSize.number}${styles.fontSize.unit}`
            : `${styles.fontSize.number}px`;
        return [[styles.fontStyle, fontVariant, styles.fontWeight, fontSize, fontFamily].join(' '), fontFamily, fontSize];
    }
    async renderTextNode(text, styles) {
        const [font, fontFamily, fontSize] = this.createFontStyle(styles);
        this.ctx.font = font;
        this.ctx.direction = styles.direction === 1 /* DIRECTION.RTL */ ? 'rtl' : 'ltr';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'alphabetic';
        const { baseline, middle } = this.fontMetrics.getMetrics(fontFamily, fontSize);
        const paintOrder = styles.paintOrder;
        text.textBounds.forEach((text) => {
            paintOrder.forEach((paintOrderLayer) => {
                switch (paintOrderLayer) {
                    case 0 /* PAINT_ORDER_LAYER.FILL */:
                        this.ctx.fillStyle = (0, color_1.asString)(styles.color);
                        this.renderTextWithLetterSpacing(text, styles.letterSpacing, baseline);
                        const textShadows = styles.textShadow;
                        if (textShadows.length && text.text.trim().length) {
                            textShadows
                                .slice(0)
                                .reverse()
                                .forEach((textShadow) => {
                                this.ctx.shadowColor = (0, color_1.asString)(textShadow.color);
                                this.ctx.shadowOffsetX = textShadow.offsetX.number * this.options.scale;
                                this.ctx.shadowOffsetY = textShadow.offsetY.number * this.options.scale;
                                this.ctx.shadowBlur = textShadow.blur.number;
                                this.renderTextWithLetterSpacing(text, styles.letterSpacing, baseline);
                            });
                            this.ctx.shadowColor = '';
                            this.ctx.shadowOffsetX = 0;
                            this.ctx.shadowOffsetY = 0;
                            this.ctx.shadowBlur = 0;
                        }
                        if (styles.textDecorationLine.length) {
                            this.ctx.fillStyle = (0, color_1.asString)(styles.textDecorationColor || styles.color);
                            styles.textDecorationLine.forEach((textDecorationLine) => {
                                switch (textDecorationLine) {
                                    case 1 /* TEXT_DECORATION_LINE.UNDERLINE */:
                                        // Draws a line at the baseline of the font
                                        // TODO As some browsers display the line as more than 1px if the font-size is big,
                                        // need to take that into account both in position and size
                                        this.ctx.fillRect(text.bounds.left, Math.round(text.bounds.top + baseline), text.bounds.width, 1);
                                        break;
                                    case 2 /* TEXT_DECORATION_LINE.OVERLINE */:
                                        this.ctx.fillRect(text.bounds.left, Math.round(text.bounds.top), text.bounds.width, 1);
                                        break;
                                    case 3 /* TEXT_DECORATION_LINE.LINE_THROUGH */:
                                        // TODO try and find exact position for line-through
                                        this.ctx.fillRect(text.bounds.left, Math.ceil(text.bounds.top + middle), text.bounds.width, 1);
                                        break;
                                }
                            });
                        }
                        break;
                    case 1 /* PAINT_ORDER_LAYER.STROKE */:
                        if (styles.webkitTextStrokeWidth && text.text.trim().length) {
                            this.ctx.strokeStyle = (0, color_1.asString)(styles.webkitTextStrokeColor);
                            this.ctx.lineWidth = styles.webkitTextStrokeWidth;
                            this.ctx.lineJoin = window.chrome ? 'miter' : 'round';
                            this.ctx.strokeText(text.text, text.bounds.left, text.bounds.top + baseline);
                        }
                        this.ctx.strokeStyle = '';
                        this.ctx.lineWidth = 0;
                        this.ctx.lineJoin = 'miter';
                        break;
                }
            });
        });
    }
    renderReplacedElement(container, curves, image) {
        if (image && container.intrinsicWidth > 0 && container.intrinsicHeight > 0) {
            const box = (0, box_sizing_1.contentBox)(container);
            const path = (0, bound_curves_1.calculatePaddingBoxPath)(curves);
            this.path(path);
            this.ctx.save();
            this.ctx.clip();
            this.ctx.drawImage(image, 0, 0, container.intrinsicWidth, container.intrinsicHeight, box.left, box.top, box.width, box.height);
            this.ctx.restore();
        }
    }
    async renderNodeContent(paint) {
        this.applyEffects(paint.getEffects(4 /* EffectTarget.CONTENT */));
        const container = paint.container;
        const curves = paint.curves;
        const styles = container.styles;
        for (const child of container.textNodes) {
            await this.renderTextNode(child, styles);
        }
        if (container instanceof image_element_container_1.ImageElementContainer) {
            try {
                const image = await this.context.cache.match(container.src);
                this.renderReplacedElement(container, curves, image);
            }
            catch (e) {
                this.context.logger.error(`Error loading image ${container.src}`);
            }
        }
        if (container instanceof canvas_element_container_1.CanvasElementContainer) {
            this.renderReplacedElement(container, curves, container.canvas);
        }
        if (container instanceof svg_element_container_1.SVGElementContainer) {
            try {
                const image = await this.context.cache.match(container.svg);
                this.renderReplacedElement(container, curves, image);
            }
            catch (e) {
                this.context.logger.error(`Error loading svg ${container.svg.substring(0, 255)}`);
            }
        }
        if (container instanceof iframe_element_container_1.IFrameElementContainer && container.tree) {
            const iframeRenderer = new CanvasRenderer(this.context, {
                scale: this.options.scale,
                backgroundColor: container.backgroundColor,
                x: 0,
                y: 0,
                size: new three_1.Vector2(container.width, container.height)
            });
            const canvas = await iframeRenderer.render(container.tree);
            if (container.width && container.height) {
                this.ctx.drawImage(canvas, 0, 0, container.width, container.height, container.bounds.left, container.bounds.top, container.bounds.width, container.bounds.height);
            }
        }
        if (container instanceof input_element_container_1.InputElementContainer) {
            const size = Math.min(container.bounds.width, container.bounds.height);
            if (container.type === input_element_container_1.CHECKBOX) {
                if (container.checked) {
                    this.ctx.save();
                    this.path([
                        new vector_1.Vector(container.bounds.left + size * 0.39363, container.bounds.top + size * 0.79),
                        new vector_1.Vector(container.bounds.left + size * 0.16, container.bounds.top + size * 0.5549),
                        new vector_1.Vector(container.bounds.left + size * 0.27347, container.bounds.top + size * 0.44071),
                        new vector_1.Vector(container.bounds.left + size * 0.39694, container.bounds.top + size * 0.5649),
                        new vector_1.Vector(container.bounds.left + size * 0.72983, container.bounds.top + size * 0.23),
                        new vector_1.Vector(container.bounds.left + size * 0.84, container.bounds.top + size * 0.34085),
                        new vector_1.Vector(container.bounds.left + size * 0.39363, container.bounds.top + size * 0.79)
                    ]);
                    this.ctx.fillStyle = (0, color_1.asString)(input_element_container_1.INPUT_COLOR);
                    this.ctx.fill();
                    this.ctx.restore();
                }
            }
            else if (container.type === input_element_container_1.RADIO) {
                if (container.checked) {
                    this.ctx.save();
                    this.ctx.beginPath();
                    this.ctx.arc(container.bounds.left + size / 2, container.bounds.top + size / 2, size / 4, 0, Math.PI * 2, true);
                    this.ctx.fillStyle = (0, color_1.asString)(input_element_container_1.INPUT_COLOR);
                    this.ctx.fill();
                    this.ctx.restore();
                }
            }
        }
        if (isTextInputElement(container) && container.value.length) {
            const [fontFamily, fontSize] = this.createFontStyle(styles);
            const { baseline } = this.fontMetrics.getMetrics(fontFamily, fontSize);
            this.ctx.font = fontFamily;
            this.ctx.fillStyle = (0, color_1.asString)(styles.color);
            this.ctx.textBaseline = 'alphabetic';
            this.ctx.textAlign = canvasTextAlign(container.styles.textAlign);
            const bounds = (0, box_sizing_1.contentBox)(container);
            let x = 0;
            switch (container.styles.textAlign) {
                case 1 /* TEXT_ALIGN.CENTER */:
                    x += bounds.width / 2;
                    break;
                case 2 /* TEXT_ALIGN.RIGHT */:
                    x += bounds.width;
                    break;
            }
            const textBounds = bounds.add(x, 0, 0, -bounds.height / 2 + 1);
            this.ctx.save();
            this.path([
                new vector_1.Vector(bounds.left, bounds.top),
                new vector_1.Vector(bounds.left + bounds.width, bounds.top),
                new vector_1.Vector(bounds.left + bounds.width, bounds.top + bounds.height),
                new vector_1.Vector(bounds.left, bounds.top + bounds.height)
            ]);
            this.ctx.clip();
            this.renderTextWithLetterSpacing(new text_1.TextBounds(container.value, textBounds), styles.letterSpacing, baseline);
            this.ctx.restore();
            this.ctx.textBaseline = 'alphabetic';
            this.ctx.textAlign = 'left';
        }
        if ((0, bitwise_1.contains)(container.styles.display, 2048 /* DISPLAY.LIST_ITEM */)) {
            if (container.styles.listStyleImage !== null) {
                const img = container.styles.listStyleImage;
                if (img.type === 0 /* CSSImageType.URL */) {
                    let image;
                    const url = img.url;
                    try {
                        image = await this.context.cache.match(url);
                        this.ctx.drawImage(image, container.bounds.left - (image.width + 10), container.bounds.top);
                    }
                    catch (e) {
                        this.context.logger.error(`Error loading list-style-image ${url}`);
                    }
                }
            }
            else if (paint.listValue && container.styles.listStyleType !== -1 /* LIST_STYLE_TYPE.NONE */) {
                const [fontFamily] = this.createFontStyle(styles);
                this.ctx.font = fontFamily;
                this.ctx.fillStyle = (0, color_1.asString)(styles.color);
                this.ctx.textBaseline = 'middle';
                this.ctx.textAlign = 'right';
                const bounds = new bounds_1.Bounds(container.bounds.left, container.bounds.top + (0, length_percentage_1.getAbsoluteValue)(container.styles.paddingTop, container.bounds.width), container.bounds.width, (0, line_height_1.computeLineHeight)(styles.lineHeight, styles.fontSize.number) / 2 + 1);
                this.renderTextWithLetterSpacing(new text_1.TextBounds(paint.listValue, bounds), styles.letterSpacing, (0, line_height_1.computeLineHeight)(styles.lineHeight, styles.fontSize.number) / 2 + 2);
                this.ctx.textBaseline = 'bottom';
                this.ctx.textAlign = 'left';
            }
        }
    }
    async renderStackContent(stack) {
        if ((0, bitwise_1.contains)(stack.element.container.flags, 16 /* FLAGS.DEBUG_RENDER */)) {
            debugger;
        }
        // https://www.w3.org/TR/css-position-3/#painting-order
        // 1. the background and borders of the element forming the stacking context.
        await this.renderNodeBackgroundAndBorders(stack.element);
        // 2. the child stacking contexts with negative stack levels (most negative first).
        for (const child of stack.negativeZIndex) {
            await this.renderStack(child);
        }
        // 3. For all its in-flow, non-positioned, block-level descendants in tree order:
        await this.renderNodeContent(stack.element);
        for (const child of stack.nonInlineLevel) {
            await this.renderNode(child);
        }
        // 4. All non-positioned floating descendants, in tree order. For each one of these,
        // treat the element as if it created a new stacking context, but any positioned descendants and descendants
        // which actually create a new stacking context should be considered part of the parent stacking context,
        // not this new one.
        for (const child of stack.nonPositionedFloats) {
            await this.renderStack(child);
        }
        // 5. the in-flow, inline-level, non-positioned descendants, including inline tables and inline blocks.
        for (const child of stack.nonPositionedInlineLevel) {
            await this.renderStack(child);
        }
        for (const child of stack.inlineLevel) {
            await this.renderNode(child);
        }
        // 6. All positioned, opacity or transform descendants, in tree order that fall into the following categories:
        //  All positioned descendants with 'z-index: auto' or 'z-index: 0', in tree order.
        //  For those with 'z-index: auto', treat the element as if it created a new stacking context,
        //  but any positioned descendants and descendants which actually create a new stacking context should be
        //  considered part of the parent stacking context, not this new one. For those with 'z-index: 0',
        //  treat the stacking context generated atomically.
        //
        //  All opacity descendants with opacity less than 1
        //
        //  All transform descendants with transform other than none
        for (const child of stack.zeroOrAutoZIndexOrTransformedOrOpacity) {
            await this.renderStack(child);
        }
        // 7. Stacking contexts formed by positioned descendants with z-indices greater than or equal to 1 in z-index
        // order (smallest first) then tree order.
        for (const child of stack.positiveZIndex) {
            await this.renderStack(child);
        }
    }
    mask(paths) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(this.canvas.width, 0);
        this.ctx.lineTo(this.canvas.width, this.canvas.height);
        this.ctx.lineTo(0, this.canvas.height);
        this.ctx.lineTo(0, 0);
        this.formatPath(paths.slice(0).reverse());
        this.ctx.closePath();
    }
    path(paths) {
        this.ctx.beginPath();
        this.formatPath(paths);
        this.ctx.closePath();
    }
    formatPath(paths) {
        paths.forEach((point, index) => {
            const start = (0, bezier_curve_1.isBezierCurve)(point) ? point.start : point;
            if (index === 0) {
                this.ctx.moveTo(start.x, start.y);
            }
            else {
                this.ctx.lineTo(start.x, start.y);
            }
            if ((0, bezier_curve_1.isBezierCurve)(point)) {
                this.ctx.bezierCurveTo(point.startControl.x, point.startControl.y, point.endControl.x, point.endControl.y, point.end.x, point.end.y);
            }
        });
    }
    renderRepeat(path, pattern, offsetX, offsetY) {
        this.path(path);
        this.ctx.fillStyle = pattern;
        this.ctx.translate(offsetX, offsetY);
        this.ctx.fill();
        this.ctx.translate(-offsetX, -offsetY);
    }
    resizeImage(image, width, height) {
        if (image.width === width && image.height === height) {
            return image;
        }
        const ownerDocument = this.canvas.ownerDocument ?? document;
        const canvas = ownerDocument.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height);
        return canvas;
    }
    async renderBackgroundImage(container) {
        let index = container.styles.backgroundImage.length - 1;
        for (const backgroundImage of container.styles.backgroundImage.slice(0).reverse()) {
            if (backgroundImage.type === 0 /* CSSImageType.URL */) {
                let image;
                const url = backgroundImage.url;
                try {
                    image = await this.context.cache.match(url);
                }
                catch (e) {
                    this.context.logger.error(`Error loading background-image ${url}`);
                }
                if (image) {
                    const [path, x, y, width, height] = (0, background_1.calculateBackgroundRendering)(container, index, [
                        image.width,
                        image.height,
                        image.width / image.height
                    ]);
                    const pattern = this.ctx.createPattern(this.resizeImage(image, width, height), 'repeat');
                    this.renderRepeat(path, pattern, x, y);
                }
            }
            else if ((0, image_1.isLinearGradient)(backgroundImage)) {
                const [path, x, y, width, height] = (0, background_1.calculateBackgroundRendering)(container, index, [null, null, null]);
                const [lineLength, x0, x1, y0, y1] = (0, gradient_1.calculateGradientDirection)(backgroundImage.angle, width, height);
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
                (0, gradient_1.processColorStops)(backgroundImage.stops, lineLength).forEach((colorStop) => gradient.addColorStop(colorStop.stop, (0, color_1.asString)(colorStop.color)));
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, width, height);
                if (width > 0 && height > 0) {
                    const pattern = this.ctx.createPattern(canvas, 'repeat');
                    this.renderRepeat(path, pattern, x, y);
                }
            }
            else if ((0, image_1.isRadialGradient)(backgroundImage)) {
                const [path, left, top, width, height] = (0, background_1.calculateBackgroundRendering)(container, index, [null, null, null]);
                const position = backgroundImage.position.length === 0 ? [length_percentage_1.FIFTY_PERCENT] : backgroundImage.position;
                const x = (0, length_percentage_1.getAbsoluteValue)(position[0], width);
                const y = (0, length_percentage_1.getAbsoluteValue)(position[position.length - 1], height);
                const [rx, ry] = (0, gradient_1.calculateRadius)(backgroundImage, x, y, width, height);
                if (rx > 0 && ry > 0) {
                    const radialGradient = this.ctx.createRadialGradient(left + x, top + y, 0, left + x, top + y, rx);
                    (0, gradient_1.processColorStops)(backgroundImage.stops, rx * 2).forEach((colorStop) => radialGradient.addColorStop(colorStop.stop, (0, color_1.asString)(colorStop.color)));
                    this.path(path);
                    this.ctx.fillStyle = radialGradient;
                    if (rx !== ry) {
                        // transforms for elliptical radial gradient
                        const midX = container.bounds.left + 0.5 * container.bounds.width;
                        const midY = container.bounds.top + 0.5 * container.bounds.height;
                        const f = ry / rx;
                        const invF = 1 / f;
                        this.ctx.save();
                        this.ctx.translate(midX, midY);
                        this.ctx.transform(1, 0, 0, f, 0, 0);
                        this.ctx.translate(-midX, -midY);
                        this.ctx.fillRect(left, invF * (top - midY) + midY, width, height * invF);
                        this.ctx.restore();
                    }
                    else {
                        this.ctx.fill();
                    }
                }
            }
            index--;
        }
    }
    async renderSolidBorder(color, side, curvePoints) {
        this.path((0, border_1.parsePathForBorder)(curvePoints, side));
        this.ctx.fillStyle = (0, color_1.asString)(color);
        this.ctx.fill();
    }
    async renderDoubleBorder(color, width, side, curvePoints) {
        if (width < 3) {
            await this.renderSolidBorder(color, side, curvePoints);
            return;
        }
        const outerPaths = (0, border_1.parsePathForBorderDoubleOuter)(curvePoints, side);
        this.path(outerPaths);
        this.ctx.fillStyle = (0, color_1.asString)(color);
        this.ctx.fill();
        const innerPaths = (0, border_1.parsePathForBorderDoubleInner)(curvePoints, side);
        this.path(innerPaths);
        this.ctx.fill();
    }
    async renderNodeBackgroundAndBorders(paint) {
        this.applyEffects(paint.getEffects(2 /* EffectTarget.BACKGROUND_BORDERS */));
        const styles = paint.container.styles;
        const hasBackground = !(0, color_1.isTransparent)(styles.backgroundColor) || styles.backgroundImage.length;
        const borders = [
            { style: styles.borderTopStyle, color: styles.borderTopColor, width: styles.borderTopWidth },
            { style: styles.borderRightStyle, color: styles.borderRightColor, width: styles.borderRightWidth },
            { style: styles.borderBottomStyle, color: styles.borderBottomColor, width: styles.borderBottomWidth },
            { style: styles.borderLeftStyle, color: styles.borderLeftColor, width: styles.borderLeftWidth }
        ];
        const backgroundPaintingArea = calculateBackgroundCurvedPaintingArea((0, background_1.getBackgroundValueForIndex)(styles.backgroundClip, 0), paint.curves);
        if (hasBackground || styles.boxShadow.length) {
            this.ctx.save();
            this.path(backgroundPaintingArea);
            this.ctx.clip();
            if (!(0, color_1.isTransparent)(styles.backgroundColor)) {
                this.ctx.fillStyle = (0, color_1.asString)(styles.backgroundColor);
                this.ctx.fill();
            }
            await this.renderBackgroundImage(paint.container);
            this.ctx.restore();
            styles.boxShadow
                .slice(0)
                .reverse()
                .forEach((shadow) => {
                this.ctx.save();
                const borderBoxArea = (0, bound_curves_1.calculateBorderBoxPath)(paint.curves);
                const maskOffset = shadow.inset ? 0 : MASK_OFFSET;
                const shadowPaintingArea = (0, path_1.transformPath)(borderBoxArea, -maskOffset + (shadow.inset ? 1 : -1) * shadow.spread.number, (shadow.inset ? 1 : -1) * shadow.spread.number, shadow.spread.number * (shadow.inset ? -2 : 2), shadow.spread.number * (shadow.inset ? -2 : 2));
                if (shadow.inset) {
                    this.path(borderBoxArea);
                    this.ctx.clip();
                    this.mask(shadowPaintingArea);
                }
                else {
                    this.mask(borderBoxArea);
                    this.ctx.clip();
                    this.path(shadowPaintingArea);
                }
                this.ctx.shadowOffsetX = shadow.offsetX.number + maskOffset;
                this.ctx.shadowOffsetY = shadow.offsetY.number;
                this.ctx.shadowColor = (0, color_1.asString)(shadow.color);
                this.ctx.shadowBlur = shadow.blur.number;
                this.ctx.fillStyle = shadow.inset ? (0, color_1.asString)(shadow.color) : 'rgba(0,0,0,1)';
                this.ctx.fill();
                this.ctx.restore();
            });
        }
        let side = 0;
        for (const border of borders) {
            if (border.style !== 0 /* BORDER_STYLE.NONE */ && !(0, color_1.isTransparent)(border.color) && border.width > 0) {
                if (border.style === 2 /* BORDER_STYLE.DASHED */) {
                    await this.renderDashedDottedBorder(border.color, border.width, side, paint.curves, 2 /* BORDER_STYLE.DASHED */);
                }
                else if (border.style === 3 /* BORDER_STYLE.DOTTED */) {
                    await this.renderDashedDottedBorder(border.color, border.width, side, paint.curves, 3 /* BORDER_STYLE.DOTTED */);
                }
                else if (border.style === 4 /* BORDER_STYLE.DOUBLE */) {
                    await this.renderDoubleBorder(border.color, border.width, side, paint.curves);
                }
                else {
                    await this.renderSolidBorder(border.color, side, paint.curves);
                }
            }
            side++;
        }
    }
    async renderDashedDottedBorder(color, width, side, curvePoints, style) {
        this.ctx.save();
        const strokePaths = (0, border_1.parsePathForBorderStroke)(curvePoints, side);
        const boxPaths = (0, border_1.parsePathForBorder)(curvePoints, side);
        if (style === 2 /* BORDER_STYLE.DASHED */) {
            this.path(boxPaths);
            this.ctx.clip();
        }
        let startX, startY, endX, endY;
        if ((0, bezier_curve_1.isBezierCurve)(boxPaths[0])) {
            startX = boxPaths[0].start.x;
            startY = boxPaths[0].start.y;
        }
        else {
            startX = boxPaths[0].x;
            startY = boxPaths[0].y;
        }
        if ((0, bezier_curve_1.isBezierCurve)(boxPaths[1])) {
            endX = boxPaths[1].end.x;
            endY = boxPaths[1].end.y;
        }
        else {
            endX = boxPaths[1].x;
            endY = boxPaths[1].y;
        }
        let length;
        if (side === 0 || side === 2) {
            length = Math.abs(startX - endX);
        }
        else {
            length = Math.abs(startY - endY);
        }
        this.ctx.beginPath();
        if (style === 3 /* BORDER_STYLE.DOTTED */) {
            this.formatPath(strokePaths);
        }
        else {
            this.formatPath(boxPaths.slice(0, 2));
        }
        let dashLength = width < 3 ? width * 3 : width * 2;
        let spaceLength = width < 3 ? width * 2 : width;
        if (style === 3 /* BORDER_STYLE.DOTTED */) {
            dashLength = width;
            spaceLength = width;
        }
        let useLineDash = true;
        if (length <= dashLength * 2) {
            useLineDash = false;
        }
        else if (length <= dashLength * 2 + spaceLength) {
            const multiplier = length / (2 * dashLength + spaceLength);
            dashLength *= multiplier;
            spaceLength *= multiplier;
        }
        else {
            const numberOfDashes = Math.floor((length + spaceLength) / (dashLength + spaceLength));
            const minSpace = (length - numberOfDashes * dashLength) / (numberOfDashes - 1);
            const maxSpace = (length - (numberOfDashes + 1) * dashLength) / numberOfDashes;
            spaceLength =
                maxSpace <= 0 || Math.abs(spaceLength - minSpace) < Math.abs(spaceLength - maxSpace) ? minSpace : maxSpace;
        }
        if (useLineDash) {
            if (style === 3 /* BORDER_STYLE.DOTTED */) {
                this.ctx.setLineDash([0, dashLength + spaceLength]);
            }
            else {
                this.ctx.setLineDash([dashLength, spaceLength]);
            }
        }
        if (style === 3 /* BORDER_STYLE.DOTTED */) {
            this.ctx.lineCap = 'round';
            this.ctx.lineWidth = width;
        }
        else {
            this.ctx.lineWidth = width * 2 + 1.1;
        }
        this.ctx.strokeStyle = (0, color_1.asString)(color);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        // dashed round edge gap
        if (style === 2 /* BORDER_STYLE.DASHED */) {
            if ((0, bezier_curve_1.isBezierCurve)(boxPaths[0])) {
                const path1 = boxPaths[3];
                const path2 = boxPaths[0];
                this.ctx.beginPath();
                this.formatPath([new vector_1.Vector(path1.end.x, path1.end.y), new vector_1.Vector(path2.start.x, path2.start.y)]);
                this.ctx.stroke();
            }
            if ((0, bezier_curve_1.isBezierCurve)(boxPaths[1])) {
                const path1 = boxPaths[1];
                const path2 = boxPaths[2];
                this.ctx.beginPath();
                this.formatPath([new vector_1.Vector(path1.end.x, path1.end.y), new vector_1.Vector(path2.start.x, path2.start.y)]);
                this.ctx.stroke();
            }
        }
        this.ctx.restore();
    }
    async render(element) {
        if (this.options.backgroundColor) {
            this.ctx.fillStyle = (0, color_1.asString)(this.options.backgroundColor);
            this.ctx.fillRect(this.options.x, this.options.y, this.options.size.width, this.options.size.height);
        }
        const stack = (0, stacking_context_1.parseStackingContexts)(element);
        await this.renderStack(stack);
        this.applyEffects([]);
        return this.canvas;
    }
}
exports.CanvasRenderer = CanvasRenderer;
const isTextInputElement = (container) => {
    if (container instanceof textarea_element_container_1.TextareaElementContainer) {
        return true;
    }
    else if (container instanceof select_element_container_1.SelectElementContainer) {
        return true;
    }
    else if (container instanceof input_element_container_1.InputElementContainer && container.type !== input_element_container_1.RADIO && container.type !== input_element_container_1.CHECKBOX) {
        return true;
    }
    return false;
};
const calculateBackgroundCurvedPaintingArea = (clip, curves) => {
    switch (clip) {
        case 0 /* BACKGROUND_CLIP.BORDER_BOX */:
            return (0, bound_curves_1.calculateBorderBoxPath)(curves);
        case 2 /* BACKGROUND_CLIP.CONTENT_BOX */:
            return (0, bound_curves_1.calculateContentBoxPath)(curves);
        case 1 /* BACKGROUND_CLIP.PADDING_BOX */:
        default:
            return (0, bound_curves_1.calculatePaddingBoxPath)(curves);
    }
};
const canvasTextAlign = (textAlign) => {
    switch (textAlign) {
        case 1 /* TEXT_ALIGN.CENTER */:
            return 'center';
        case 2 /* TEXT_ALIGN.RIGHT */:
            return 'right';
        case 0 /* TEXT_ALIGN.LEFT */:
        default:
            return 'left';
    }
};
// see https://github.com/niklasvh/html2canvas/pull/2645
const iOSBrokenFonts = ['-apple-system', 'system-ui'];
const fixIOSSystemFonts = (fontFamilies) => {
    return /iPhone OS 15_(0|1)/.test(window.navigator.userAgent)
        ? fontFamilies.filter((fontFamily) => iOSBrokenFonts.indexOf(fontFamily) === -1)
        : fontFamilies;
};
