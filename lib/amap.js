"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.amap = void 0;
const tslib_1 = require("tslib");
const AmapSDK_1 = tslib_1.__importDefault(require("oak-external-sdk/lib/AmapSDK"));
async function amap(options) {
    const { key, method, data } = options;
    const instance = AmapSDK_1.default.getInstance(key);
    const fn = instance[method];
    if (!fn) {
        throw new Error('method not implemented');
    }
    // data any后面再改
    return fn(data);
}
exports.amap = amap;
