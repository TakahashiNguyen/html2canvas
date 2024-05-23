"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseStackingContexts = exports.ElementPaint = exports.StackingContext = void 0;
const bitwise_1 = require("../core/bitwise");
const bound_curves_1 = require("./bound-curves");
const effects_1 = require("./effects");
const path_1 = require("./path");
const ol_element_container_1 = require("../dom/elements/ol-element-container");
const li_element_container_1 = require("../dom/elements/li-element-container");
const counter_1 = require("../css/types/functions/counter");
class StackingContext {
    element;
    negativeZIndex;
    zeroOrAutoZIndexOrTransformedOrOpacity;
    positiveZIndex;
    nonPositionedFloats;
    nonPositionedInlineLevel;
    inlineLevel;
    nonInlineLevel;
    constructor(container) {
        this.element = container;
        this.inlineLevel = [];
        this.nonInlineLevel = [];
        this.negativeZIndex = [];
        this.zeroOrAutoZIndexOrTransformedOrOpacity = [];
        this.positiveZIndex = [];
        this.nonPositionedFloats = [];
        this.nonPositionedInlineLevel = [];
    }
}
exports.StackingContext = StackingContext;
class ElementPaint {
    container;
    parent;
    effects = [];
    curves;
    listValue;
    constructor(container, parent) {
        this.container = container;
        this.parent = parent;
        this.curves = new bound_curves_1.BoundCurves(this.container);
        if (this.container.styles.opacity < 1) {
            this.effects.push(new effects_1.OpacityEffect(this.container.styles.opacity));
        }
        if (this.container.styles.transform !== null) {
            const offsetX = this.container.bounds.left + this.container.styles.transformOrigin[0].number;
            const offsetY = this.container.bounds.top + this.container.styles.transformOrigin[1].number;
            const matrix = this.container.styles.transform;
            this.effects.push(new effects_1.TransformEffect(offsetX, offsetY, matrix));
        }
        if (this.container.styles.overflowX !== 0 /* OVERFLOW.VISIBLE */) {
            const borderBox = (0, bound_curves_1.calculateBorderBoxPath)(this.curves);
            const paddingBox = (0, bound_curves_1.calculatePaddingBoxPath)(this.curves);
            if ((0, path_1.equalPath)(borderBox, paddingBox)) {
                this.effects.push(new effects_1.ClipEffect(borderBox, 2 /* EffectTarget.BACKGROUND_BORDERS */ | 4 /* EffectTarget.CONTENT */));
            }
            else {
                this.effects.push(new effects_1.ClipEffect(borderBox, 2 /* EffectTarget.BACKGROUND_BORDERS */));
                this.effects.push(new effects_1.ClipEffect(paddingBox, 4 /* EffectTarget.CONTENT */));
            }
        }
    }
    getEffects(target) {
        let inFlow = [2 /* POSITION.ABSOLUTE */, 3 /* POSITION.FIXED */].indexOf(this.container.styles.position) === -1;
        let parent = this.parent;
        const effects = this.effects.slice(0);
        while (parent) {
            const croplessEffects = parent.effects.filter((effect) => !(0, effects_1.isClipEffect)(effect));
            if (inFlow || parent.container.styles.position !== 0 /* POSITION.STATIC */ || !parent.parent) {
                effects.unshift(...croplessEffects);
                inFlow = [2 /* POSITION.ABSOLUTE */, 3 /* POSITION.FIXED */].indexOf(parent.container.styles.position) === -1;
                if (parent.container.styles.overflowX !== 0 /* OVERFLOW.VISIBLE */) {
                    const borderBox = (0, bound_curves_1.calculateBorderBoxPath)(parent.curves);
                    const paddingBox = (0, bound_curves_1.calculatePaddingBoxPath)(parent.curves);
                    if (!(0, path_1.equalPath)(borderBox, paddingBox)) {
                        effects.unshift(new effects_1.ClipEffect(paddingBox, 2 /* EffectTarget.BACKGROUND_BORDERS */ | 4 /* EffectTarget.CONTENT */));
                    }
                }
            }
            else {
                effects.unshift(...croplessEffects);
            }
            parent = parent.parent;
        }
        return effects.filter((effect) => (0, bitwise_1.contains)(effect.target, target));
    }
}
exports.ElementPaint = ElementPaint;
const parseStackTree = (parent, stackingContext, realStackingContext, listItems) => {
    parent.container.elements.forEach((child) => {
        const treatAsRealStackingContext = (0, bitwise_1.contains)(child.flags, 4 /* FLAGS.CREATES_REAL_STACKING_CONTEXT */);
        const createsStackingContext = (0, bitwise_1.contains)(child.flags, 2 /* FLAGS.CREATES_STACKING_CONTEXT */);
        const paintContainer = new ElementPaint(child, parent);
        if ((0, bitwise_1.contains)(child.styles.display, 2048 /* DISPLAY.LIST_ITEM */)) {
            listItems.push(paintContainer);
        }
        const listOwnerItems = (0, bitwise_1.contains)(child.flags, 8 /* FLAGS.IS_LIST_OWNER */) ? [] : listItems;
        if (treatAsRealStackingContext || createsStackingContext) {
            const parentStack = treatAsRealStackingContext || child.styles.isPositioned() ? realStackingContext : stackingContext;
            const stack = new StackingContext(paintContainer);
            if (child.styles.isPositioned() || child.styles.opacity < 1 || child.styles.isTransformed()) {
                const order = child.styles.zIndex.order;
                if (order < 0) {
                    let index = 0;
                    parentStack.negativeZIndex.some((current, i) => {
                        if (order > current.element.container.styles.zIndex.order) {
                            index = i;
                            return false;
                        }
                        else if (index > 0) {
                            return true;
                        }
                        return false;
                    });
                    parentStack.negativeZIndex.splice(index, 0, stack);
                }
                else if (order > 0) {
                    let index = 0;
                    parentStack.positiveZIndex.some((current, i) => {
                        if (order >= current.element.container.styles.zIndex.order) {
                            index = i + 1;
                            return false;
                        }
                        else if (index > 0) {
                            return true;
                        }
                        return false;
                    });
                    parentStack.positiveZIndex.splice(index, 0, stack);
                }
                else {
                    parentStack.zeroOrAutoZIndexOrTransformedOrOpacity.push(stack);
                }
            }
            else {
                if (child.styles.isFloating()) {
                    parentStack.nonPositionedFloats.push(stack);
                }
                else {
                    parentStack.nonPositionedInlineLevel.push(stack);
                }
            }
            parseStackTree(paintContainer, stack, treatAsRealStackingContext ? stack : realStackingContext, listOwnerItems);
        }
        else {
            if (child.styles.isInlineLevel()) {
                stackingContext.inlineLevel.push(paintContainer);
            }
            else {
                stackingContext.nonInlineLevel.push(paintContainer);
            }
            parseStackTree(paintContainer, stackingContext, realStackingContext, listOwnerItems);
        }
        if ((0, bitwise_1.contains)(child.flags, 8 /* FLAGS.IS_LIST_OWNER */)) {
            processListItems(child, listOwnerItems);
        }
    });
};
const processListItems = (owner, elements) => {
    let numbering = owner instanceof ol_element_container_1.OLElementContainer ? owner.start : 1;
    const reversed = owner instanceof ol_element_container_1.OLElementContainer ? owner.reversed : false;
    for (let i = 0; i < elements.length; i++) {
        const item = elements[i];
        if (item.container instanceof li_element_container_1.LIElementContainer &&
            typeof item.container.value === 'number' &&
            item.container.value !== 0) {
            numbering = item.container.value;
        }
        item.listValue = (0, counter_1.createCounterText)(numbering, item.container.styles.listStyleType, true);
        numbering += reversed ? -1 : 1;
    }
};
const parseStackingContexts = (container) => {
    const paintContainer = new ElementPaint(container, null);
    const root = new StackingContext(paintContainer);
    const listItems = [];
    parseStackTree(paintContainer, root, root, listItems);
    processListItems(paintContainer.container, listItems);
    return root;
};
exports.parseStackingContexts = parseStackingContexts;
