"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const crud_1 = require("./crud");
const amap_1 = require("./amap");
const locales_1 = require("./locales");
const aspectDict = {
    operate: crud_1.operate,
    select: crud_1.select,
    count: crud_1.count,
    aggregate: crud_1.aggregate,
    fetchRows: crud_1.fetchRows,
    amap: amap_1.amap,
    getTranslations: locales_1.getTranslations,
};
exports.default = aspectDict;
tslib_1.__exportStar(require("./AspectDict"), exports);
