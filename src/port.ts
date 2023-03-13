import assert from 'assert';
import { EntityDict, SelectOption } from 'oak-domain/lib/types/Entity';
import { Importation, Exportation } from 'oak-domain/lib/types/Port';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
import { read, utils, write, readFile } from 'xlsx';
import { buffer } from 'stream/consumers';
import { Duplex } from 'stream';
const Importations: Record<string, any> = {};
const Exportations: Record<string, any> = {};

export function registerPorts<ED extends EntityDict>(importations: Importation<ED, keyof ED, any>[], exportations: Exportation<ED, keyof ED, any>[]) {
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

function getImportation<ED extends EntityDict, T extends keyof ED>(id: string) {
    assert(Importations.hasOwnProperty(id), `id为[${id}]的importation不存在`);
    return Importations[id] as Importation<ED, T, any>;
}

function getExportation<ED extends EntityDict, T extends keyof ED>(id: string) {
    assert(Exportations.hasOwnProperty(id), `id为[${id}]的exportation不存在`);
    return Exportations[id] as Exportation<ED, T, any>;
}

export async function importEntity<
    ED extends EntityDict,
    Cxt extends AsyncContext<ED>
>(params: {
    entity: string,
    id: string,
    file: any,    // 是否链接后台的file类型不一致，暂时无法解决
    option: string,
}, context: Cxt): Promise<ArrayBuffer | void> {
    const entity = params.entity;
    const file = params.file;
    const id = params.id;
    const option = JSON.parse(params.option);
    const importation = getImportation<ED, keyof ED>(id);
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
        const dataList = utils.sheet_to_json(
            sheet
        );
        const errorMessageList = await fn(dataList as Record<string, string | number | boolean>[], context, option);
        if (errorMessageList.length > 0) {
            errorSheets.push(
                {
                    sheetName,
                    worksheet: utils.json_to_sheet(errorMessageList),
                }
            );
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

export async function exportEntity<
    ED extends EntityDict,
    T extends keyof ED,
    Cxt extends AsyncContext<ED>
>(params: {
    entity: T;
    id: string;
    filter?: ED[T]['Selection']['filter'];
}, context: Cxt): Promise<ArrayBuffer> {
    const id = params.id;
    const filter = params.filter;
    const exportation = getExportation<ED, keyof ED>(id);
    if (!exportation) {
        throw new Error('尚不支持此数据的导出');
    }
    const { projection, headers, fn, entity } = exportation;
    const dataList = await context.select(
        entity,
        {
            filter,
            data: projection,
        },
        {}
    );
    const fittedDatalist = []
    for (const data of dataList) {
        fittedDatalist.push(fn(data as ED[keyof ED]['Schema']));
    }
    const exportSheet = utils.json_to_sheet(fittedDatalist, { header: headers });
    const exportBook = utils.book_new();
    utils.book_append_sheet(exportBook, exportSheet);
    return await write(exportBook, { type: 'buffer' });
    // throw new Error('export not implement yet');
}

export async function getImportationTemplate<
    ED extends EntityDict,
    Cxt extends AsyncContext<ED>
>(params: { id: string }, context: Cxt): Promise<ArrayBuffer> {
    const id = params.id;
    const importation = getImportation<ED, keyof ED>(id);
    const { headers } = importation;
    if (!importation) {
        throw new Error('未找到对应的模板');
    }
    const exportSheet = utils.json_to_sheet([], { header: headers });
    const widthList = headers.map(
        (ele: string) => {
            return {
                width: ele.length * 2.2,
            };
        }
    )
    exportSheet['!cols'] = widthList;
    const exportBook = utils.book_new();
    utils.book_append_sheet(exportBook, exportSheet);
    return await write(exportBook, { type: 'buffer' });
    // throw new Error('not implement yet');
}
