"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isOpacityEffect = exports.isClipEffect = exports.isTransformEffect = exports.OpacityEffect = exports.ClipEffect = exports.TransformEffect = void 0;
class TransformEffect {
    offsetX;
    offsetY;
    matrix;
    type = 0 /* EffectType.TRANSFORM */;
    target = 2 /* EffectTarget.BACKGROUND_BORDERS */ | 4 /* EffectTarget.CONTENT */;
    constructor(offsetX, offsetY, matrix) {
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.matrix = matrix;
    }
}
exports.TransformEffect = TransformEffect;
class ClipEffect {
    path;
    target;
    type = 1 /* EffectType.CLIP */;
    constructor(path, target) {
        this.path = path;
        this.target = target;
    }
}
exports.ClipEffect = ClipEffect;
class OpacityEffect {
    opacity;
    type = 2 /* EffectType.OPACITY */;
    target = 2 /* EffectTarget.BACKGROUND_BORDERS */ | 4 /* EffectTarget.CONTENT */;
    constructor(opacity) {
        this.opacity = opacity;
    }
}
exports.OpacityEffect = OpacityEffect;
const isTransformEffect = (effect) => effect.type === 0 /* EffectType.TRANSFORM */;
exports.isTransformEffect = isTransformEffect;
const isClipEffect = (effect) => effect.type === 1 /* EffectType.CLIP */;
exports.isClipEffect = isClipEffect;
const isOpacityEffect = (effect) => effect.type === 2 /* EffectType.OPACITY */;
exports.isOpacityEffect = isOpacityEffect;
