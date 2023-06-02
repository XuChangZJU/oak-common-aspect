"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crossBridge = void 0;
async function crossBridge(params) {
    const { url } = params;
    const res = await fetch(url);
    return res.body;
}
exports.crossBridge = crossBridge;
