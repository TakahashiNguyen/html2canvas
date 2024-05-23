"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cache = exports.CacheStorage = void 0;
const features_1 = require("./features");
class CacheStorage {
    static _link;
    static _origin = 'about:blank';
    static getOrigin(url) {
        const link = CacheStorage._link;
        if (!link) {
            return 'about:blank';
        }
        link.href = url;
        return link.protocol + link.hostname + link.port;
    }
    static isSameOrigin(src) {
        return CacheStorage.getOrigin(src) === CacheStorage._origin;
    }
    static setContext(window) {
        CacheStorage._link = window.document.createElement('a');
        CacheStorage._origin = CacheStorage.getOrigin(window.location.href);
    }
}
exports.CacheStorage = CacheStorage;
class Cache {
    context;
    _options;
    _cache = {};
    constructor(context, _options) {
        this.context = context;
        this._options = _options;
    }
    addImage(src) {
        const result = Promise.resolve();
        if (this.has(src)) {
            return result;
        }
        if (isBlobImage(src) || isRenderable(src)) {
            (this._cache[src] = this.loadImage(src)).catch(() => {
                // prevent unhandled rejection
            });
            return result;
        }
        return result;
    }
    match(src) {
        return this._cache[src];
    }
    async loadImage(key) {
        const isSameOrigin = CacheStorage.isSameOrigin(key);
        const useCORS = !isInlineImage(key) && this._options.useCORS === true && features_1.FEATURES.SUPPORT_CORS_IMAGES && !isSameOrigin;
        const useProxy = !isInlineImage(key) &&
            !isSameOrigin &&
            !isBlobImage(key) &&
            typeof this._options.proxy === 'string' &&
            features_1.FEATURES.SUPPORT_CORS_XHR &&
            !useCORS;
        if (!isSameOrigin &&
            this._options.allowTaint === false &&
            !isInlineImage(key) &&
            !isBlobImage(key) &&
            !useProxy &&
            !useCORS) {
            return;
        }
        let src = key;
        if (useProxy) {
            src = await this.proxy(src);
        }
        this.context.logger.debug(`Added image ${key.substring(0, 256)}`);
        return await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            //ios safari 10.3 taints canvas with data urls unless crossOrigin is set to anonymous
            if (isInlineBase64Image(src) || useCORS) {
                img.crossOrigin = 'anonymous';
            }
            img.src = src;
            if (img.complete === true) {
                // Inline XML images may fail to parse, throwing an Error later on
                setTimeout(() => resolve(img), 500);
            }
            if (this._options.imageTimeout > 0) {
                setTimeout(() => reject(`Timed out (${this._options.imageTimeout}ms) loading image`), this._options.imageTimeout);
            }
        });
    }
    has(key) {
        return typeof this._cache[key] !== 'undefined';
    }
    keys() {
        return Promise.resolve(Object.keys(this._cache));
    }
    proxy(src) {
        const proxy = this._options.proxy;
        if (!proxy) {
            throw new Error('No proxy defined');
        }
        const key = src.substring(0, 256);
        return new Promise((resolve, reject) => {
            const responseType = features_1.FEATURES.SUPPORT_RESPONSE_TYPE ? 'blob' : 'text';
            const xhr = new XMLHttpRequest();
            xhr.onload = () => {
                if (xhr.status === 200) {
                    if (responseType === 'text') {
                        resolve(xhr.response);
                    }
                    else {
                        const reader = new FileReader();
                        reader.addEventListener('load', () => resolve(reader.result), false);
                        reader.addEventListener('error', (e) => reject(e), false);
                        reader.readAsDataURL(xhr.response);
                    }
                }
                else {
                    reject(`Failed to proxy resource ${key} with status code ${xhr.status}`);
                }
            };
            xhr.onerror = reject;
            const queryString = proxy.indexOf('?') > -1 ? '&' : '?';
            xhr.open('GET', `${proxy}${queryString}url=${encodeURIComponent(src)}&responseType=${responseType}`);
            if (responseType !== 'text' && xhr instanceof XMLHttpRequest) {
                xhr.responseType = responseType;
            }
            if (this._options.imageTimeout) {
                const timeout = this._options.imageTimeout;
                xhr.timeout = timeout;
                xhr.ontimeout = () => reject(`Timed out (${timeout}ms) proxying ${key}`);
            }
            xhr.send();
        });
    }
}
exports.Cache = Cache;
const INLINE_SVG = /^data:image\/svg\+xml/i;
const INLINE_BASE64 = /^data:image\/.*;base64,/i;
const INLINE_IMG = /^data:image\/.*/i;
const isRenderable = (src) => features_1.FEATURES.SUPPORT_SVG_DRAWING || !isSVG(src);
const isInlineImage = (src) => INLINE_IMG.test(src);
const isInlineBase64Image = (src) => INLINE_BASE64.test(src);
const isBlobImage = (src) => src.substr(0, 4) === 'blob';
const isSVG = (src) => src.substr(-3).toLowerCase() === 'svg' || INLINE_SVG.test(src);
