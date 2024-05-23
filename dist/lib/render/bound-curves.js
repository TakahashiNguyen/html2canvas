"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePaddingBoxPath = exports.calculateContentBoxPath = exports.calculateBorderBoxPath = exports.BoundCurves = void 0;
const length_percentage_1 = require("../css/types/length-percentage");
const vector_1 = require("./vector");
const bezier_curve_1 = require("./bezier-curve");
class BoundCurves {
    topLeftBorderDoubleOuterBox;
    topRightBorderDoubleOuterBox;
    bottomRightBorderDoubleOuterBox;
    bottomLeftBorderDoubleOuterBox;
    topLeftBorderDoubleInnerBox;
    topRightBorderDoubleInnerBox;
    bottomRightBorderDoubleInnerBox;
    bottomLeftBorderDoubleInnerBox;
    topLeftBorderStroke;
    topRightBorderStroke;
    bottomRightBorderStroke;
    bottomLeftBorderStroke;
    topLeftBorderBox;
    topRightBorderBox;
    bottomRightBorderBox;
    bottomLeftBorderBox;
    topLeftPaddingBox;
    topRightPaddingBox;
    bottomRightPaddingBox;
    bottomLeftPaddingBox;
    topLeftContentBox;
    topRightContentBox;
    bottomRightContentBox;
    bottomLeftContentBox;
    constructor(element) {
        const styles = element.styles;
        const bounds = element.bounds;
        let [tlh, tlv] = (0, length_percentage_1.getAbsoluteValueForTuple)(styles.borderTopLeftRadius, bounds.width, bounds.height);
        let [trh, trv] = (0, length_percentage_1.getAbsoluteValueForTuple)(styles.borderTopRightRadius, bounds.width, bounds.height);
        let [brh, brv] = (0, length_percentage_1.getAbsoluteValueForTuple)(styles.borderBottomRightRadius, bounds.width, bounds.height);
        let [blh, blv] = (0, length_percentage_1.getAbsoluteValueForTuple)(styles.borderBottomLeftRadius, bounds.width, bounds.height);
        const factors = [];
        factors.push((tlh + trh) / bounds.width);
        factors.push((blh + brh) / bounds.width);
        factors.push((tlv + blv) / bounds.height);
        factors.push((trv + brv) / bounds.height);
        const maxFactor = Math.max(...factors);
        if (maxFactor > 1) {
            tlh /= maxFactor;
            tlv /= maxFactor;
            trh /= maxFactor;
            trv /= maxFactor;
            brh /= maxFactor;
            brv /= maxFactor;
            blh /= maxFactor;
            blv /= maxFactor;
        }
        const topWidth = bounds.width - trh;
        const rightHeight = bounds.height - brv;
        const bottomWidth = bounds.width - brh;
        const leftHeight = bounds.height - blv;
        const borderTopWidth = styles.borderTopWidth;
        const borderRightWidth = styles.borderRightWidth;
        const borderBottomWidth = styles.borderBottomWidth;
        const borderLeftWidth = styles.borderLeftWidth;
        const paddingTop = (0, length_percentage_1.getAbsoluteValue)(styles.paddingTop, element.bounds.width);
        const paddingRight = (0, length_percentage_1.getAbsoluteValue)(styles.paddingRight, element.bounds.width);
        const paddingBottom = (0, length_percentage_1.getAbsoluteValue)(styles.paddingBottom, element.bounds.width);
        const paddingLeft = (0, length_percentage_1.getAbsoluteValue)(styles.paddingLeft, element.bounds.width);
        this.topLeftBorderDoubleOuterBox =
            tlh > 0 || tlv > 0
                ? getCurvePoints(bounds.left + borderLeftWidth / 3, bounds.top + borderTopWidth / 3, tlh - borderLeftWidth / 3, tlv - borderTopWidth / 3, CORNER.TOP_LEFT)
                : new vector_1.Vector(bounds.left + borderLeftWidth / 3, bounds.top + borderTopWidth / 3);
        this.topRightBorderDoubleOuterBox =
            tlh > 0 || tlv > 0
                ? getCurvePoints(bounds.left + topWidth, bounds.top + borderTopWidth / 3, trh - borderRightWidth / 3, trv - borderTopWidth / 3, CORNER.TOP_RIGHT)
                : new vector_1.Vector(bounds.left + bounds.width - borderRightWidth / 3, bounds.top + borderTopWidth / 3);
        this.bottomRightBorderDoubleOuterBox =
            brh > 0 || brv > 0
                ? getCurvePoints(bounds.left + bottomWidth, bounds.top + rightHeight, brh - borderRightWidth / 3, brv - borderBottomWidth / 3, CORNER.BOTTOM_RIGHT)
                : new vector_1.Vector(bounds.left + bounds.width - borderRightWidth / 3, bounds.top + bounds.height - borderBottomWidth / 3);
        this.bottomLeftBorderDoubleOuterBox =
            blh > 0 || blv > 0
                ? getCurvePoints(bounds.left + borderLeftWidth / 3, bounds.top + leftHeight, blh - borderLeftWidth / 3, blv - borderBottomWidth / 3, CORNER.BOTTOM_LEFT)
                : new vector_1.Vector(bounds.left + borderLeftWidth / 3, bounds.top + bounds.height - borderBottomWidth / 3);
        this.topLeftBorderDoubleInnerBox =
            tlh > 0 || tlv > 0
                ? getCurvePoints(bounds.left + (borderLeftWidth * 2) / 3, bounds.top + (borderTopWidth * 2) / 3, tlh - (borderLeftWidth * 2) / 3, tlv - (borderTopWidth * 2) / 3, CORNER.TOP_LEFT)
                : new vector_1.Vector(bounds.left + (borderLeftWidth * 2) / 3, bounds.top + (borderTopWidth * 2) / 3);
        this.topRightBorderDoubleInnerBox =
            tlh > 0 || tlv > 0
                ? getCurvePoints(bounds.left + topWidth, bounds.top + (borderTopWidth * 2) / 3, trh - (borderRightWidth * 2) / 3, trv - (borderTopWidth * 2) / 3, CORNER.TOP_RIGHT)
                : new vector_1.Vector(bounds.left + bounds.width - (borderRightWidth * 2) / 3, bounds.top + (borderTopWidth * 2) / 3);
        this.bottomRightBorderDoubleInnerBox =
            brh > 0 || brv > 0
                ? getCurvePoints(bounds.left + bottomWidth, bounds.top + rightHeight, brh - (borderRightWidth * 2) / 3, brv - (borderBottomWidth * 2) / 3, CORNER.BOTTOM_RIGHT)
                : new vector_1.Vector(bounds.left + bounds.width - (borderRightWidth * 2) / 3, bounds.top + bounds.height - (borderBottomWidth * 2) / 3);
        this.bottomLeftBorderDoubleInnerBox =
            blh > 0 || blv > 0
                ? getCurvePoints(bounds.left + (borderLeftWidth * 2) / 3, bounds.top + leftHeight, blh - (borderLeftWidth * 2) / 3, blv - (borderBottomWidth * 2) / 3, CORNER.BOTTOM_LEFT)
                : new vector_1.Vector(bounds.left + (borderLeftWidth * 2) / 3, bounds.top + bounds.height - (borderBottomWidth * 2) / 3);
        this.topLeftBorderStroke =
            tlh > 0 || tlv > 0
                ? getCurvePoints(bounds.left + borderLeftWidth / 2, bounds.top + borderTopWidth / 2, tlh - borderLeftWidth / 2, tlv - borderTopWidth / 2, CORNER.TOP_LEFT)
                : new vector_1.Vector(bounds.left + borderLeftWidth / 2, bounds.top + borderTopWidth / 2);
        this.topRightBorderStroke =
            tlh > 0 || tlv > 0
                ? getCurvePoints(bounds.left + topWidth, bounds.top + borderTopWidth / 2, trh - borderRightWidth / 2, trv - borderTopWidth / 2, CORNER.TOP_RIGHT)
                : new vector_1.Vector(bounds.left + bounds.width - borderRightWidth / 2, bounds.top + borderTopWidth / 2);
        this.bottomRightBorderStroke =
            brh > 0 || brv > 0
                ? getCurvePoints(bounds.left + bottomWidth, bounds.top + rightHeight, brh - borderRightWidth / 2, brv - borderBottomWidth / 2, CORNER.BOTTOM_RIGHT)
                : new vector_1.Vector(bounds.left + bounds.width - borderRightWidth / 2, bounds.top + bounds.height - borderBottomWidth / 2);
        this.bottomLeftBorderStroke =
            blh > 0 || blv > 0
                ? getCurvePoints(bounds.left + borderLeftWidth / 2, bounds.top + leftHeight, blh - borderLeftWidth / 2, blv - borderBottomWidth / 2, CORNER.BOTTOM_LEFT)
                : new vector_1.Vector(bounds.left + borderLeftWidth / 2, bounds.top + bounds.height - borderBottomWidth / 2);
        this.topLeftBorderBox =
            tlh > 0 || tlv > 0
                ? getCurvePoints(bounds.left, bounds.top, tlh, tlv, CORNER.TOP_LEFT)
                : new vector_1.Vector(bounds.left, bounds.top);
        this.topRightBorderBox =
            trh > 0 || trv > 0
                ? getCurvePoints(bounds.left + topWidth, bounds.top, trh, trv, CORNER.TOP_RIGHT)
                : new vector_1.Vector(bounds.left + bounds.width, bounds.top);
        this.bottomRightBorderBox =
            brh > 0 || brv > 0
                ? getCurvePoints(bounds.left + bottomWidth, bounds.top + rightHeight, brh, brv, CORNER.BOTTOM_RIGHT)
                : new vector_1.Vector(bounds.left + bounds.width, bounds.top + bounds.height);
        this.bottomLeftBorderBox =
            blh > 0 || blv > 0
                ? getCurvePoints(bounds.left, bounds.top + leftHeight, blh, blv, CORNER.BOTTOM_LEFT)
                : new vector_1.Vector(bounds.left, bounds.top + bounds.height);
        this.topLeftPaddingBox =
            tlh > 0 || tlv > 0
                ? getCurvePoints(bounds.left + borderLeftWidth, bounds.top + borderTopWidth, Math.max(0, tlh - borderLeftWidth), Math.max(0, tlv - borderTopWidth), CORNER.TOP_LEFT)
                : new vector_1.Vector(bounds.left + borderLeftWidth, bounds.top + borderTopWidth);
        this.topRightPaddingBox =
            trh > 0 || trv > 0
                ? getCurvePoints(bounds.left + Math.min(topWidth, bounds.width - borderRightWidth), bounds.top + borderTopWidth, topWidth > bounds.width + borderRightWidth ? 0 : Math.max(0, trh - borderRightWidth), Math.max(0, trv - borderTopWidth), CORNER.TOP_RIGHT)
                : new vector_1.Vector(bounds.left + bounds.width - borderRightWidth, bounds.top + borderTopWidth);
        this.bottomRightPaddingBox =
            brh > 0 || brv > 0
                ? getCurvePoints(bounds.left + Math.min(bottomWidth, bounds.width - borderLeftWidth), bounds.top + Math.min(rightHeight, bounds.height - borderBottomWidth), Math.max(0, brh - borderRightWidth), Math.max(0, brv - borderBottomWidth), CORNER.BOTTOM_RIGHT)
                : new vector_1.Vector(bounds.left + bounds.width - borderRightWidth, bounds.top + bounds.height - borderBottomWidth);
        this.bottomLeftPaddingBox =
            blh > 0 || blv > 0
                ? getCurvePoints(bounds.left + borderLeftWidth, bounds.top + Math.min(leftHeight, bounds.height - borderBottomWidth), Math.max(0, blh - borderLeftWidth), Math.max(0, blv - borderBottomWidth), CORNER.BOTTOM_LEFT)
                : new vector_1.Vector(bounds.left + borderLeftWidth, bounds.top + bounds.height - borderBottomWidth);
        this.topLeftContentBox =
            tlh > 0 || tlv > 0
                ? getCurvePoints(bounds.left + borderLeftWidth + paddingLeft, bounds.top + borderTopWidth + paddingTop, Math.max(0, tlh - (borderLeftWidth + paddingLeft)), Math.max(0, tlv - (borderTopWidth + paddingTop)), CORNER.TOP_LEFT)
                : new vector_1.Vector(bounds.left + borderLeftWidth + paddingLeft, bounds.top + borderTopWidth + paddingTop);
        this.topRightContentBox =
            trh > 0 || trv > 0
                ? getCurvePoints(bounds.left + Math.min(topWidth, bounds.width + borderLeftWidth + paddingLeft), bounds.top + borderTopWidth + paddingTop, topWidth > bounds.width + borderLeftWidth + paddingLeft ? 0 : trh - borderLeftWidth + paddingLeft, trv - (borderTopWidth + paddingTop), CORNER.TOP_RIGHT)
                : new vector_1.Vector(bounds.left + bounds.width - (borderRightWidth + paddingRight), bounds.top + borderTopWidth + paddingTop);
        this.bottomRightContentBox =
            brh > 0 || brv > 0
                ? getCurvePoints(bounds.left + Math.min(bottomWidth, bounds.width - (borderLeftWidth + paddingLeft)), bounds.top + Math.min(rightHeight, bounds.height + borderTopWidth + paddingTop), Math.max(0, brh - (borderRightWidth + paddingRight)), brv - (borderBottomWidth + paddingBottom), CORNER.BOTTOM_RIGHT)
                : new vector_1.Vector(bounds.left + bounds.width - (borderRightWidth + paddingRight), bounds.top + bounds.height - (borderBottomWidth + paddingBottom));
        this.bottomLeftContentBox =
            blh > 0 || blv > 0
                ? getCurvePoints(bounds.left + borderLeftWidth + paddingLeft, bounds.top + leftHeight, Math.max(0, blh - (borderLeftWidth + paddingLeft)), blv - (borderBottomWidth + paddingBottom), CORNER.BOTTOM_LEFT)
                : new vector_1.Vector(bounds.left + borderLeftWidth + paddingLeft, bounds.top + bounds.height - (borderBottomWidth + paddingBottom));
    }
}
exports.BoundCurves = BoundCurves;
var CORNER;
(function (CORNER) {
    CORNER[CORNER["TOP_LEFT"] = 0] = "TOP_LEFT";
    CORNER[CORNER["TOP_RIGHT"] = 1] = "TOP_RIGHT";
    CORNER[CORNER["BOTTOM_RIGHT"] = 2] = "BOTTOM_RIGHT";
    CORNER[CORNER["BOTTOM_LEFT"] = 3] = "BOTTOM_LEFT";
})(CORNER || (CORNER = {}));
const getCurvePoints = (x, y, r1, r2, position) => {
    const kappa = 4 * ((Math.sqrt(2) - 1) / 3);
    const ox = r1 * kappa; // control point offset horizontal
    const oy = r2 * kappa; // control point offset vertical
    const xm = x + r1; // x-middle
    const ym = y + r2; // y-middle
    switch (position) {
        case CORNER.TOP_LEFT:
            return new bezier_curve_1.BezierCurve(new vector_1.Vector(x, ym), new vector_1.Vector(x, ym - oy), new vector_1.Vector(xm - ox, y), new vector_1.Vector(xm, y));
        case CORNER.TOP_RIGHT:
            return new bezier_curve_1.BezierCurve(new vector_1.Vector(x, y), new vector_1.Vector(x + ox, y), new vector_1.Vector(xm, ym - oy), new vector_1.Vector(xm, ym));
        case CORNER.BOTTOM_RIGHT:
            return new bezier_curve_1.BezierCurve(new vector_1.Vector(xm, y), new vector_1.Vector(xm, y + oy), new vector_1.Vector(x + ox, ym), new vector_1.Vector(x, ym));
        case CORNER.BOTTOM_LEFT:
        default:
            return new bezier_curve_1.BezierCurve(new vector_1.Vector(xm, ym), new vector_1.Vector(xm - ox, ym), new vector_1.Vector(x, y + oy), new vector_1.Vector(x, y));
    }
};
const calculateBorderBoxPath = (curves) => {
    return [curves.topLeftBorderBox, curves.topRightBorderBox, curves.bottomRightBorderBox, curves.bottomLeftBorderBox];
};
exports.calculateBorderBoxPath = calculateBorderBoxPath;
const calculateContentBoxPath = (curves) => {
    return [
        curves.topLeftContentBox,
        curves.topRightContentBox,
        curves.bottomRightContentBox,
        curves.bottomLeftContentBox
    ];
};
exports.calculateContentBoxPath = calculateContentBoxPath;
const calculatePaddingBoxPath = (curves) => {
    return [
        curves.topLeftPaddingBox,
        curves.topRightPaddingBox,
        curves.bottomRightPaddingBox,
        curves.bottomLeftPaddingBox
    ];
};
exports.calculatePaddingBoxPath = calculatePaddingBoxPath;
