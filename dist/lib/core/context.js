"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Context = void 0;
const logger_1 = require("./logger");
const cache_storage_1 = require("./cache-storage");
class Context {
    windowBounds;
    static instanceCount = 1;
    instanceName = `#${Context.instanceCount++}`;
    logger;
    cache;
    constructor(options, windowBounds) {
        this.windowBounds = windowBounds;
        this.logger = new logger_1.Logger({ id: this.instanceName, enabled: options.logging });
        this.cache = options.cache ?? new cache_storage_1.Cache(this, options);
    }
}
exports.Context = Context;
