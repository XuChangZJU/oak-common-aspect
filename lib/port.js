"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImportationTemplate = exports.exportEntity = exports.importEntity = exports.clearPorts = exports.registerPorts = void 0;
const tslib_1 = require("tslib");
const assert_1 = tslib_1.__importDefault(require("assert"));
const xlsx_1 = require("xlsx");
const Importations = {};
const Exportations = {};
function registerPorts(importations, exportations) {
    for (const i of importations) {
        (0, assert_1.default)(!Importations.hasOwnProperty(i.id), `Importation中的id【${i.id}】重复了`);
        Object.assign(Importations, {
            [i.id]: i,
        });
    }
    for (const e of exportations) {
        (0, assert_1.default)(!Exportations.hasOwnProperty(e.id), `Exportation中的id【${e.id}】重复了`);
        Object.assign(Exportations, {
            [e.id]: e,
        });
    }
}
exports.registerPorts = registerPorts;
function clearPorts() {
    for (const i in Importations) {
        delete Importations[i];
    }
    for (const e in Exportations) {
        delete Exportations[e];
    }
}
exports.clearPorts = clearPorts;
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
    const arrayBuffer = await file.arrayBuffer();
    const workbook = (0, xlsx_1.read)(arrayBuffer);
    const { SheetNames, Sheets } = workbook;
    for (const sheetName of SheetNames) {
        const sheet = Sheets[sheetName];
        const dataList = xlsx_1.utils.sheet_to_json(sheet);
        console.log(dataList);
    }
    // throw new Error('not implement yet');
}
exports.importEntity = importEntity;
async function exportEntity(params, context) {
    throw new Error('export not implement yet');
}
exports.exportEntity = exportEntity;
async function getImportationTemplate(params, context) {
    throw new Error('not implement yet');
}
exports.getImportationTemplate = getImportationTemplate;
