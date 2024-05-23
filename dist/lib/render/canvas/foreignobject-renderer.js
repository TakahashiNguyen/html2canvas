"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadSerializedSVG = exports.ForeignObjectRenderer = void 0;
const features_1 = require("../../core/features");
const color_1 = require("../../css/types/color");
const renderer_1 = require("../renderer");
class ForeignObjectRenderer extends renderer_1.Renderer {
    canvas;
    ctx;
    options;
    constructor(context, options) {
        super(context, options);
        this.canvas = options.canvas ? options.canvas : document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.options = options;
        this.canvas.width = Math.floor(options.size.width * options.scale);
        this.canvas.height = Math.floor(options.size.height * options.scale);
        this.canvas.style.width = `${options.size.width}px`;
        this.canvas.style.height = `${options.size.height}px`;
        this.ctx.scale(this.options.scale, this.options.scale);
        this.ctx.translate(-options.x, -options.y);
        this.context.logger.debug(`EXPERIMENTAL ForeignObject renderer initialized (${options.size.width}x${options.size.height} at ${options.x},${options.y}) with scale ${options.scale}`);
    }
    async render(element) {
        const svg = (0, features_1.createForeignObjectSVG)(this.options.size.width * this.options.scale, this.options.size.height * this.options.scale, this.options.scale, this.options.scale, element);
        const img = await (0, exports.loadSerializedSVG)(svg);
        if (this.options.backgroundColor) {
            this.ctx.fillStyle = (0, color_1.asString)(this.options.backgroundColor);
            this.ctx.fillRect(0, 0, this.options.size.width * this.options.scale, this.options.size.height * this.options.scale);
        }
        this.ctx.drawImage(img, -this.options.x * this.options.scale, -this.options.y * this.options.scale);
        return this.canvas;
    }
}
exports.ForeignObjectRenderer = ForeignObjectRenderer;
const loadSerializedSVG = (svg) => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
        resolve(img);
    };
    img.onerror = reject;
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(svg))}`;
});
exports.loadSerializedSVG = loadSerializedSVG;
