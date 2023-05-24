"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearPorts = exports.registerPorts = void 0;
const tslib_1 = require("tslib");
const crud_1 = require("./crud");
const amap_1 = require("./amap");
const locales_1 = require("./locales");
const port_1 = require("./port");
Object.defineProperty(exports, "registerPorts", { enumerable: true, get: function () { return port_1.registerPorts; } });
Object.defineProperty(exports, "clearPorts", { enumerable: true, get: function () { return port_1.clearPorts; } });
const geo_1 = require("./geo");
const relation_1 = require("./relation");
const aspectDict = {
    operate: crud_1.operate,
    select: crud_1.select,
    count: crud_1.count,
    aggregate: crud_1.aggregate,
    fetchRows: crud_1.fetchRows,
    amap: amap_1.amap,
    getTranslations: locales_1.getTranslations,
    importEntity: port_1.importEntity,
    exportEntity: port_1.exportEntity,
    getImportationTemplate: port_1.getImportationTemplate,
    searchPoi: geo_1.searchPoi,
    loadRelations: relation_1.loadRelations,
};
exports.default = aspectDict;
tslib_1.__exportStar(require("./AspectDict"), exports);
