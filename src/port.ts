import assert from 'assert';
import { EntityDict, SelectOption } from 'oak-domain/lib/types/Entity';
import { Importation, Exportation } from 'oak-domain/lib/types/Port';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
import { read, utils, write } from 'xlsx';
import { buffer } from 'stream/consumers';
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
    console.log(Importations);
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
>(params: FormData, context: Cxt): Promise<NodeJS.ReadableStream | void> {
    const entity = params.get('entity') as keyof ED;
    const file = params.get('file') as File;
    const id = params.get('id') as string;
    const option = JSON.parse(params.get('option') as string);
    const importation = getImportation<ED, keyof ED>(id);
    const { fn } = importation;
    const arrayBuffer = await file.arrayBuffer();
    const workbook = read(arrayBuffer);
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
}, context: Cxt): Promise<NodeJS.ReadableStream> {
    throw new Error('export not implement yet');
}

export async function getImportationTemplate<
    ED extends EntityDict,
    Cxt extends AsyncContext<ED>
>(params: { id: string }, context: Cxt): Promise<NodeJS.ReadableStream> {
    throw new Error('not implement yet');
}
