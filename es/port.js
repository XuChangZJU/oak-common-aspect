import { assert } from 'oak-domain/lib/utils/assert';
import { utils, write, readFile } from 'xlsx';
const Importations = {};
const Exportations = {};
export function registerPorts(importations, exportations) {
    for (const i of importations) {
        assert(!Importations.hasOwnProperty(i.id), `Importation中的id【${i.id}】重复了`);
        Object.assign(Importations, {
            [i.id]: i,
        });
    }
    for (const e of exportations) {
        assert(!Exportations.hasOwnProperty(e.id), `Exportation中的id【${e.id}】重复了`);
        Object.assign(Exportations, {
            [e.id]: e,
        });
    }
}
export function clearPorts() {
    for (const i in Importations) {
        delete Importations[i];
    }
    for (const e in Exportations) {
        delete Exportations[e];
    }
}
function getImportation(id) {
    assert(Importations.hasOwnProperty(id), `id为[${id}]的importation不存在`);
    return Importations[id];
}
function getExportation(id) {
    assert(Exportations.hasOwnProperty(id), `id为[${id}]的exportation不存在`);
    return Exportations[id];
}
export async function importEntity(params, context) {
    const entity = params.entity;
    const file = params.file;
    const id = params.id;
    const option = JSON.parse(params.option);
    const importation = getImportation(id);
    if (!importation) {
        throw new Error('尚不支持此数据的导入');
    }
    const { fn } = importation;
    // const arrayBuffer = await file.arrayBuffer();
    const workbook = readFile(file.filepath, { type: 'buffer' });
    const { SheetNames, Sheets } = workbook;
    const errorSheets = [];
    for (const sheetName of SheetNames) {
        const sheet = Sheets[sheetName];
        const dataList = utils.sheet_to_json(sheet);
        const errorMessageList = await fn(dataList, context, option);
        if (errorMessageList.length > 0) {
            errorSheets.push({
                sheetName,
                worksheet: utils.json_to_sheet(errorMessageList),
            });
        }
    }
    if (errorSheets.length > 0) {
        const errorWorkbook = utils.book_new();
        for (const sheetData of errorSheets) {
            utils.book_append_sheet(errorWorkbook, sheetData.worksheet, sheetData.sheetName);
        }
        return await write(errorWorkbook, { type: 'buffer' });
    }
    // throw new Error('not implement yet');
}
export async function exportEntity(params, context) {
    const id = params.id;
    const filter = params.filter;
    const properties = params.properties;
    const exportation = getExportation(id);
    if (!exportation) {
        throw new Error('尚不支持此数据的导出');
    }
    const { projection, headers, fn, entity, makeHeaders } = exportation;
    const dataList = await context.select(entity, {
        filter,
        data: projection,
    }, {});
    const headers2 = makeHeaders ? makeHeaders(dataList) : headers;
    assert(headers2 && headers2.length > 0, '导出未传入表头');
    const fittedDatalist = [];
    for (const data of dataList) {
        fittedDatalist.push(await fn(data, context, properties));
    }
    const exportSheet = utils.json_to_sheet(fittedDatalist, {
        header: headers2,
    });
    const exportBook = utils.book_new();
    utils.book_append_sheet(exportBook, exportSheet);
    return await write(exportBook, { type: 'buffer' });
    // throw new Error('export not implement yet');
}
export async function getImportationTemplate(params, context) {
    const id = params.id;
    const importation = getImportation(id);
    const { headers } = importation;
    if (!importation) {
        throw new Error('未找到对应的模板');
    }
    const exportSheet = utils.json_to_sheet([], { header: headers });
    const widthList = headers.map((ele) => {
        return {
            width: ele.length * 2.2,
        };
    });
    exportSheet['!cols'] = widthList;
    const exportBook = utils.book_new();
    utils.book_append_sheet(exportBook, exportSheet);
    return await write(exportBook, { type: 'buffer' });
    // throw new Error('not implement yet');
}
