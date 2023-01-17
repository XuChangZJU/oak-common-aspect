import assert from 'assert';
import { EntityDict, SelectOption } from 'oak-domain/lib/types/Entity';
import { Importation, Exportation } from 'oak-domain/lib/types/Port';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';

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
>(params: FormData, context: Cxt): Promise<void> {
    const entity = params.get('entity') as keyof ED;
    const file = params.get('file') as File;
    const id = params.get('id') as string;
    const option = params.get('option') as Object;
    
    throw new Error('not implement yet');
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
    throw new Error('not implement yet');
}

export async function getImportationTemplate<
ED extends EntityDict,
Cxt extends AsyncContext<ED>
>(params: { id: string } , context: Cxt): Promise<NodeJS.ReadableStream>  {
    throw new Error('not implement yet');
}
