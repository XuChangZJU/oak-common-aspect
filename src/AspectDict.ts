import { Context, EntityDict, OperateParams, OperationResult, SelectionResult } from "oak-domain/lib/types";
import { AmapInstance } from "oak-external-sdk";

export type CommonAspectDict<ED extends EntityDict, Cxt extends Context<ED>> = {
    operate: <T extends keyof ED>(options: { entity: T, operation: ED[T]['Operation'] | ED[T]['Operation'][], params?: OperateParams }, context: Cxt) => Promise<OperationResult<ED>[] | OperationResult<ED>>,
    select: <T extends keyof ED, S extends ED[T]['Selection']>(options: { entity: T, selection: ED[T]['Selection'], params?: object }, context: Cxt) => Promise<SelectionResult<ED[T]['Schema'], S['data']>>,
    amap: <T extends 'getDrivingPath' | 'regeo' | 'ipLoc' | 'getDistrict' | 'geocode'>(options: {
        key: string;
        method: T;
        data: Parameters<AmapInstance[T]>[0];
    }) => Promise<any>,
    getTranslations: (options: {
        namespace: string | string[];
        locale: string;
    }) => Promise<any>,
};
