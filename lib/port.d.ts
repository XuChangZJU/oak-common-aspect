/// <reference types="node" />
import { Importation, Exportation, EntityDict } from 'oak-domain/lib/types/Entity';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
export declare function registerPorts<ED extends EntityDict>(importations: Importation<ED, keyof ED, any>[], exportations: Exportation<ED, keyof ED, any>[]): void;
export declare function clearPorts(): void;
export declare function importEntity<ED extends EntityDict, Cxt extends AsyncContext<ED>>(params: FormData, context: Cxt): Promise<void>;
export declare function exportEntity<ED extends EntityDict, T extends keyof ED, Cxt extends AsyncContext<ED>>(params: {
    entity: T;
    id: string;
    filter?: ED[T]['Selection']['filter'];
}, context: Cxt): Promise<NodeJS.ReadableStream>;
