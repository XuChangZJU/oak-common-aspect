"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportEntity = exports.importEntity = exports.registerPorts = void 0;
const tslib_1 = require("tslib");
const assert_1 = tslib_1.__importDefault(require("assert"));
const Importations = {};
const Exportations = {};
function registerPorts(importations, exportations) {
    for (const i of importations) {
        Object.assign(Importations, {
            [i.id]: i,
        });
    }
    for (const e of exportations) {
        Object.assign(Exportations, {
            [e.id]: e,
        });
    }
}
exports.registerPorts = registerPorts;
function getImportation(id) {
    (0, assert_1.default)(Importations.hasOwnProperty(id), `id为[${id}]的importation不存在`);
    return Importations[id];
}
function getExportation(id) {
    (0, assert_1.default)(Exportations.hasOwnProperty(id), `id为[${id}]的exportation不存在`);
    return Exportations[id];
}
async function importEntity(params, context) {
    const entity = params.get('entity');
    const file = params.get('file');
    const id = params.get('id');
    throw new Error('not implement yet');
}
exports.importEntity = importEntity;
async function exportEntity(params, context) {
    throw new Error('not implement yet');
}
exports.exportEntity = exportEntity;
