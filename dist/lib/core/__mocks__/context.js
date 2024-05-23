"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Context = void 0;
const logger_1 = require("./logger");
class Context {
    logger = logger_1.logger;
    _cache = {};
    cache;
    constructor() {
        this.cache = {
            addImage: jest.fn().mockImplementation((src) => {
                const result = Promise.resolve();
                this._cache[src] = result;
                return result;
            })
        };
    }
}
exports.Context = Context;
