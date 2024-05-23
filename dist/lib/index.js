"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTML2CanvasClass = void 0;
const bounds_1 = require("./css/layout/bounds");
const color_1 = require("./css/types/color");
const document_cloner_1 = require("./dom/document-cloner");
const node_parser_1 = require("./dom/node-parser");
const cache_storage_1 = require("./core/cache-storage");
const canvas_renderer_1 = require("./render/canvas/canvas-renderer");
const foreignobject_renderer_1 = require("./render/canvas/foreignobject-renderer");
const context_1 = require("./core/context");
const three_1 = require("three");
const html2canvas = (element, options = {}) => {
    return new Promise(async (resolve) => {
        resolve((await HTML2CanvasClass.init(element, options)).render());
    });
};
exports.default = html2canvas;
if (typeof window !== 'undefined') {
    cache_storage_1.CacheStorage.setContext(window);
}
class HTML2CanvasClass {
    renderer;
    target;
    constructor(renderer, target) {
        this.renderer = renderer;
        this.target = target;
    }
    static async init(element, opts) {
        // @ts-ignore
        if (!element || typeof element !== 'object') {
            throw Error('Invalid element provided as first argument');
        }
        const ownerDocument = element.ownerDocument;
        if (!ownerDocument) {
            throw new Error(`Element is not attached to a Document`);
        }
        const defaultView = ownerDocument.defaultView;
        if (!defaultView) {
            throw new Error(`Document is not attached to a Window`);
        }
        const resourceOptions = {
            allowTaint: opts.allowTaint ?? false,
            imageTimeout: opts.imageTimeout ?? 15000,
            proxy: opts.proxy,
            useCORS: opts.useCORS ?? false
        };
        const contextOptions = {
            logging: opts.logging ?? true,
            cache: opts.cache,
            ...resourceOptions
        };
        const windowOptions = {
            windowWidth: opts.windowWidth ?? defaultView.innerWidth,
            windowHeight: opts.windowHeight ?? defaultView.innerHeight,
            scrollX: opts.scrollX ?? defaultView.pageXOffset,
            scrollY: opts.scrollY ?? defaultView.pageYOffset
        };
        const windowBounds = new bounds_1.Bounds(windowOptions.scrollX, windowOptions.scrollY, windowOptions.windowWidth, windowOptions.windowHeight);
        const context = new context_1.Context(contextOptions, windowBounds);
        const foreignObjectRendering = opts.foreignObjectRendering ?? false;
        const cloneOptions = {
            allowTaint: opts.allowTaint ?? false,
            onclone: opts.onclone,
            ignoreElements: opts.ignoreElements,
            inlineImages: foreignObjectRendering,
            copyStyles: foreignObjectRendering
        };
        context.logger.debug(`Starting document clone with size ${windowBounds.width}x${windowBounds.height} scrolled to ${-windowBounds.left},${-windowBounds.top}`);
        const documentCloner = new document_cloner_1.DocumentCloner(context, element, cloneOptions);
        const clonedElement = documentCloner.clonedReferenceElement;
        if (!clonedElement) {
            throw Error(`Unable to find element in cloned iframe`);
        }
        const container = await documentCloner.toIFrame(ownerDocument, windowBounds);
        const { width, height, left, top } = (0, node_parser_1.isBodyElement)(clonedElement) || (0, node_parser_1.isHTMLElement)(clonedElement)
            ? (0, bounds_1.parseDocumentSize)(clonedElement.ownerDocument)
            : (0, bounds_1.parseBounds)(context, clonedElement);
        const backgroundColor = parseBackgroundColor(context, clonedElement, opts.backgroundColor);
        const renderOptions = {
            canvas: opts.canvas,
            backgroundColor,
            scale: opts.scale ?? defaultView.devicePixelRatio ?? 1,
            x: (opts.x ?? 0) + left,
            y: (opts.y ?? 0) + top,
            size: opts.size ?? new three_1.Vector2(width, height)
        };
        let renderer, target;
        if (foreignObjectRendering) {
            context.logger.debug(`Document cloned, using foreign object rendering`);
            renderer = new foreignobject_renderer_1.ForeignObjectRenderer(context, renderOptions);
            target = clonedElement;
        }
        else {
            context.logger.debug(`Document cloned, element located at ${left},${top} with size ${width}x${height} using computed rendering`);
            context.logger.debug(`Starting DOM parsing`);
            const root = (0, node_parser_1.parseTree)(context, clonedElement);
            if (backgroundColor === root.styles.backgroundColor) {
                root.styles.backgroundColor = color_1.COLORS.TRANSPARENT;
            }
            context.logger.debug(`Starting renderer for element at ${renderOptions.x},${renderOptions.y} with size ${renderOptions.size.width}x${renderOptions.size.height}`);
            renderer = new canvas_renderer_1.CanvasRenderer(context, renderOptions);
            target = root;
        }
        if (opts.removeContainer ?? true) {
            if (!document_cloner_1.DocumentCloner.destroy(container)) {
                context.logger.error(`Cannot detach cloned iframe as it is not in the DOM anymore`);
            }
        }
        context.logger.debug(`Finished rendering`);
        return new HTML2CanvasClass(renderer, target);
    }
    async render() {
        // @ts-ignore
        return await this.renderer.render(this.target);
    }
}
exports.HTML2CanvasClass = HTML2CanvasClass;
const parseBackgroundColor = (context, element, backgroundColorOverride) => {
    const ownerDocument = element.ownerDocument;
    // http://www.w3.org/TR/css3-background/#special-backgrounds
    const documentBackgroundColor = ownerDocument.documentElement
        ? (0, color_1.parseColor)(context, getComputedStyle(ownerDocument.documentElement).backgroundColor)
        : color_1.COLORS.TRANSPARENT;
    const bodyBackgroundColor = ownerDocument.body
        ? (0, color_1.parseColor)(context, getComputedStyle(ownerDocument.body).backgroundColor)
        : color_1.COLORS.TRANSPARENT;
    const defaultBackgroundColor = typeof backgroundColorOverride === 'string'
        ? (0, color_1.parseColor)(context, backgroundColorOverride)
        : backgroundColorOverride === null
            ? color_1.COLORS.TRANSPARENT
            : 0xffffffff;
    return element === ownerDocument.documentElement
        ? (0, color_1.isTransparent)(documentBackgroundColor)
            ? (0, color_1.isTransparent)(bodyBackgroundColor)
                ? defaultBackgroundColor
                : bodyBackgroundColor
            : documentBackgroundColor
        : defaultBackgroundColor;
};
