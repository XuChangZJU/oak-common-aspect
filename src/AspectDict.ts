import { EntityDict, OperateOption, SelectOption, OperationResult, AggregationResult } from "oak-domain/lib/types";
import { AmapInstance } from "oak-external-sdk";
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { AsyncContext } from "oak-domain/lib/store/AsyncRowStore";

export type CommonAspectDict<ED extends EntityDict & BaseEntityDict, Cxt extends AsyncContext<ED>> = {
    operate: <T extends keyof ED, OP extends OperateOption>(
        params: {
            entity: T;
            operation: ED[T]['Operation'] | ED[T]['Operation'][];
            option?: OP;
        },
        context: Cxt
    ) => Promise<OperationResult<ED>[] | OperationResult<ED>>;
    select: <
        T extends keyof ED,
        OP extends SelectOption
    >(
        params: { entity: T; selection: ED[T]['Selection']; option?: OP; getCount?: true },
        context: Cxt
    ) => Promise<{
        ids: string[];
        count?: number;
    }>;
    aggregate: <T extends keyof ED, OP extends SelectOption>(
        params: {
            entity: T;
            aggregation: ED[T]['Aggregation'];
            option?: OP;
        },
        context: Cxt
    ) => Promise<AggregationResult<ED[T]['Schema']>>;
    count: <
        T extends keyof ED,
        OP extends SelectOption
    >(
        params: { entity: T; selection: Pick<ED[T]['Selection'], 'filter'>; option?: OP },
        context: Cxt
    ) => Promise<number>;
    fetchRows: <OP extends SelectOption>(
        params: Array<{
            entity: keyof ED;
            selection: ED[keyof ED]['Selection'];
            option?: OP;
        }>,
        context: Cxt
    ) => Promise<void>;
    amap: <
        T extends
        | 'getDrivingPath'
        | 'regeo'
        | 'ipLoc'
        | 'getDistrict'
        | 'geocode'
    >(params: {
        key: string;
        method: T;
        data: Parameters<AmapInstance[T]>[0];
    }) => Promise<any>;
    getTranslations: (params: {
        namespace: string | string[];
        locale: string;
    }) => Promise<any>;
    importEntity: (params: FormData, context: Cxt) => Promise<void | ArrayBuffer>;
    exportEntity: <T extends keyof ED>(params: {
        entity: T;
        id: string;
        filter?: ED[T]['Selection']['filter'];
    }, context: Cxt) => Promise<ArrayBuffer>;
    getImportationTemplate: (params: { id: string }, context: Cxt) => Promise<ArrayBuffer>;
    searchPoi: (options: {
        value: string;
        areaCode?: string;
        indexFrom?: number;
        count?: number;
        typeCode?: string;
    }) => Promise<{ id: string; areaId: string; poiName: string; detail: string; coordinate: [number, number] }[]>;
};
