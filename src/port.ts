import assert from 'assert';
import { Importation, Exportation, EntityDict, SelectOption } from 'oak-domain/lib/types/Entity';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';

const Importations: Record<string, any> = {};
const Exportations: Record<string, any> = {};

export function registerPorts<ED extends EntityDict>(importations: Importation<ED, keyof ED, any>[], exportations: Exportation<ED, keyof ED, any>[]) {
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
