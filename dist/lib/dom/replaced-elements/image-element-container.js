"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageElementContainer = void 0;
const element_container_1 = require("../element-container");
class ImageElementContainer extends element_container_1.ElementContainer {
    src;
    intrinsicWidth;
    intrinsicHeight;
    constructor(context, img) {
        super(context, img);
        this.src = img.currentSrc || img.src;
        this.intrinsicWidth = img.naturalWidth;
        this.intrinsicHeight = img.naturalHeight;
        this.context.cache.addImage(this.src);
    }
}
exports.ImageElementContainer = ImageElementContainer;
