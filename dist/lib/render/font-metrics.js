"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FontMetrics = void 0;
const util_1 = require("../core/util");
const SAMPLE_TEXT = 'Hidden Text';
class FontMetrics {
    _data;
    _document;
    constructor(document) {
        this._data = {};
        this._document = document;
    }
    parseMetrics(fontFamily, fontSize) {
        const container = this._document.createElement('div');
        const img = this._document.createElement('img');
        const span = this._document.createElement('span');
        const body = this._document.body;
        container.style.visibility = 'hidden';
        container.style.fontFamily = fontFamily;
        container.style.fontSize = fontSize;
        container.style.margin = '0';
        container.style.padding = '0';
        container.style.whiteSpace = 'nowrap';
        body.appendChild(container);
        img.src = util_1.SMALL_IMAGE;
        img.width = 1;
        img.height = 1;
        img.style.margin = '0';
        img.style.padding = '0';
        img.style.verticalAlign = 'baseline';
        span.style.fontFamily = fontFamily;
        span.style.fontSize = fontSize;
        span.style.margin = '0';
        span.style.padding = '0';
        span.appendChild(this._document.createTextNode(SAMPLE_TEXT));
        container.appendChild(span);
        container.appendChild(img);
        const baseline = img.offsetTop - span.offsetTop + 2;
        container.removeChild(span);
        container.appendChild(this._document.createTextNode(SAMPLE_TEXT));
        container.style.lineHeight = 'normal';
        img.style.verticalAlign = 'super';
        const middle = img.offsetTop - container.offsetTop + 2;
        body.removeChild(container);
        return { baseline, middle };
    }
    getMetrics(fontFamily, fontSize) {
        const key = `${fontFamily} ${fontSize}`;
        if (typeof this._data[key] === 'undefined') {
            this._data[key] = this.parseMetrics(fontFamily, fontSize);
        }
        return this._data[key];
    }
}
exports.FontMetrics = FontMetrics;
