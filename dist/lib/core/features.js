"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FEATURES = exports.loadSerializedSVG = exports.createForeignObjectSVG = void 0;
const css_line_break_1 = require("css-line-break");
const testRangeBounds = (document) => {
    const TEST_HEIGHT = 123;
    if (document.createRange) {
        const range = document.createRange();
        if (range.getBoundingClientRect) {
            const testElement = document.createElement('boundtest');
            testElement.style.height = `${TEST_HEIGHT}px`;
            testElement.style.display = 'block';
            document.body.appendChild(testElement);
            range.selectNode(testElement);
            const rangeBounds = range.getBoundingClientRect();
            const rangeHeight = Math.round(rangeBounds.height);
            document.body.removeChild(testElement);
            if (rangeHeight === TEST_HEIGHT) {
                return true;
            }
        }
    }
    return false;
};
const testIOSLineBreak = (document) => {
    const testElement = document.createElement('boundtest');
    testElement.style.width = '50px';
    testElement.style.display = 'block';
    testElement.style.fontSize = '12px';
    testElement.style.letterSpacing = '0px';
    testElement.style.wordSpacing = '0px';
    document.body.appendChild(testElement);
    const range = document.createRange();
    testElement.innerHTML = typeof ''.repeat === 'function' ? '&#128104;'.repeat(10) : '';
    const node = testElement.firstChild;
    const textList = (0, css_line_break_1.toCodePoints)(node.data).map((i) => (0, css_line_break_1.fromCodePoint)(i));
    let offset = 0;
    let prev = {};
    // ios 13 does not handle range getBoundingClientRect line changes correctly #2177
    const supports = textList.every((text, i) => {
        range.setStart(node, offset);
        range.setEnd(node, offset + text.length);
        const rect = range.getBoundingClientRect();
        offset += text.length;
        const boundAhead = rect.x > prev.x || rect.y > prev.y;
        prev = rect;
        if (i === 0) {
            return true;
        }
        return boundAhead;
    });
    document.body.removeChild(testElement);
    return supports;
};
const testCORS = () => typeof new Image().crossOrigin !== 'undefined';
const testResponseType = () => typeof new XMLHttpRequest().responseType === 'string';
const testSVG = (document) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        return false;
    }
    img.src = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'></svg>`;
    try {
        ctx.drawImage(img, 0, 0);
        canvas.toDataURL();
    }
    catch (e) {
        return false;
    }
    return true;
};
const isGreenPixel = (data) => data[0] === 0 && data[1] === 255 && data[2] === 0 && data[3] === 255;
const testForeignObject = (document) => {
    const canvas = document.createElement('canvas');
    const size = 100;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        return Promise.reject(false);
    }
    ctx.fillStyle = 'rgb(0, 255, 0)';
    ctx.fillRect(0, 0, size, size);
    const img = new Image();
    const greenImageSrc = canvas.toDataURL();
    img.src = greenImageSrc;
    const svg = (0, exports.createForeignObjectSVG)(size, size, 0, 0, img);
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, size, size);
    return (0, exports.loadSerializedSVG)(svg)
        .then((img) => {
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, size, size).data;
        ctx.fillStyle = 'red';
        ctx.fillRect(0, 0, size, size);
        const node = document.createElement('div');
        node.style.backgroundImage = `url(${greenImageSrc})`;
        node.style.height = `${size}px`;
        // Firefox 55 does not render inline <img /> tags
        return isGreenPixel(data)
            ? (0, exports.loadSerializedSVG)((0, exports.createForeignObjectSVG)(size, size, 0, 0, node))
            : Promise.reject(false);
    })
        .then((img) => {
        ctx.drawImage(img, 0, 0);
        // Edge does not render background-images
        return isGreenPixel(ctx.getImageData(0, 0, size, size).data);
    })
        .catch(() => false);
};
const createForeignObjectSVG = (width, height, x, y, node) => {
    const xmlns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(xmlns, 'svg');
    const foreignObject = document.createElementNS(xmlns, 'foreignObject');
    svg.setAttributeNS(null, 'width', width.toString());
    svg.setAttributeNS(null, 'height', height.toString());
    foreignObject.setAttributeNS(null, 'width', '100%');
    foreignObject.setAttributeNS(null, 'height', '100%');
    foreignObject.setAttributeNS(null, 'x', x.toString());
    foreignObject.setAttributeNS(null, 'y', y.toString());
    foreignObject.setAttributeNS(null, 'externalResourcesRequired', 'true');
    svg.appendChild(foreignObject);
    foreignObject.appendChild(node);
    return svg;
};
exports.createForeignObjectSVG = createForeignObjectSVG;
const loadSerializedSVG = (svg) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(svg))}`;
    });
};
exports.loadSerializedSVG = loadSerializedSVG;
exports.FEATURES = {
    get SUPPORT_RANGE_BOUNDS() {
        'use strict';
        const value = testRangeBounds(document);
        Object.defineProperty(exports.FEATURES, 'SUPPORT_RANGE_BOUNDS', { value });
        return value;
    },
    get SUPPORT_WORD_BREAKING() {
        'use strict';
        const value = exports.FEATURES.SUPPORT_RANGE_BOUNDS && testIOSLineBreak(document);
        Object.defineProperty(exports.FEATURES, 'SUPPORT_WORD_BREAKING', { value });
        return value;
    },
    get SUPPORT_SVG_DRAWING() {
        'use strict';
        const value = testSVG(document);
        Object.defineProperty(exports.FEATURES, 'SUPPORT_SVG_DRAWING', { value });
        return value;
    },
    get SUPPORT_FOREIGNOBJECT_DRAWING() {
        'use strict';
        const value = typeof Array.from === 'function' && typeof window.fetch === 'function'
            ? testForeignObject(document)
            : Promise.resolve(false);
        Object.defineProperty(exports.FEATURES, 'SUPPORT_FOREIGNOBJECT_DRAWING', { value });
        return value;
    },
    get SUPPORT_CORS_IMAGES() {
        'use strict';
        const value = testCORS();
        Object.defineProperty(exports.FEATURES, 'SUPPORT_CORS_IMAGES', { value });
        return value;
    },
    get SUPPORT_RESPONSE_TYPE() {
        'use strict';
        const value = testResponseType();
        Object.defineProperty(exports.FEATURES, 'SUPPORT_RESPONSE_TYPE', { value });
        return value;
    },
    get SUPPORT_CORS_XHR() {
        'use strict';
        const value = 'withCredentials' in new XMLHttpRequest();
        Object.defineProperty(exports.FEATURES, 'SUPPORT_CORS_XHR', { value });
        return value;
    },
    get SUPPORT_NATIVE_TEXT_SEGMENTATION() {
        'use strict';
        const value = !!(typeof Intl !== 'undefined' && Intl.Segmenter);
        Object.defineProperty(exports.FEATURES, 'SUPPORT_NATIVE_TEXT_SEGMENTATION', { value });
        return value;
    }
};