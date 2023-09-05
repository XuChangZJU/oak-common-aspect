import { EntityDict } from 'oak-domain/lib/types/Entity';
import { Importation, Exportation } from 'oak-domain/lib/types/Port';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
export declare function registerPorts<ED extends EntityDict>(importations: Importation<ED, keyof ED, any>[], exportations: Exportation<ED, keyof ED, any>[]): void;
export declare function clearPorts(): void;
export declare function importEntity<ED extends EntityDict, Cxt extends AsyncContext<ED>>(params: {
    entity: string;
    id: string;
    file: any;
    option: string;
}, context: Cxt): Promise<ArrayBuffer | void>;
export declare function exportEntity<ED extends EntityDict, T extends keyof ED, Cxt extends AsyncContext<ED>>(params: {
    entity: T;
    id: string;
    filter?: ED[T]['Selection']['filter'];
    properties?: Record<string, any>;
}, context: Cxt): Promise<ArrayBuffer>;
export declare function getImportationTemplate<ED extends EntityDict, Cxt extends AsyncContext<ED>>(params: {
    id: string;
}, context: Cxt): Promise<ArrayBuffer>;
