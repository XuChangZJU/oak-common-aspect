import { EntityDict, OperateOption, SelectOption, OperationResult } from "oak-domain/lib/types";
import { AmapInstance } from "oak-external-sdk";
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { AsyncContext } from "oak-domain/lib/store/AsyncRowStore";
export declare type CommonAspectDict<ED extends EntityDict & BaseEntityDict, Cxt extends AsyncContext<ED>> = {
    operate: <T extends keyof ED, OP extends OperateOption>(params: {
        entity: T;
        operation: ED[T]['Operation'] | ED[T]['Operation'][];
        option?: OP;
    }, context: Cxt) => Promise<OperationResult<ED>[] | OperationResult<ED>>;
    select: <T extends keyof ED, S extends ED[T]['Selection'], OP extends SelectOption>(params: {
        entity: T;
        selection: S;
        option?: OP;
        getCount?: true;
    }, context: Cxt) => Promise<{
        data: Partial<ED[T]['Schema']>[];
        count?: number;
    }>;
    count: <T extends keyof ED, S extends ED[T]['Selection'], OP extends SelectOption>(params: {
        entity: T;
        selection: S;
        option?: OP;
    }, context: Cxt) => Promise<number>;
    fetchRows: <OP extends SelectOption>(params: Array<{
        entity: keyof ED;
        selection: ED[keyof ED]['Selection'];
        option?: OP;
    }>, context: Cxt) => Promise<void>;
    amap: <T extends 'getDrivingPath' | 'regeo' | 'ipLoc' | 'getDistrict' | 'geocode'>(params: {
        key: string;
        method: T;
        data: Parameters<AmapInstance[T]>[0];
    }) => Promise<any>;
    getTranslations: (params: {
        namespace: string | string[];
        locale: string;
    }) => Promise<any>;
};
