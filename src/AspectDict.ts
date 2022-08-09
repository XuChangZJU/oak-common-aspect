import { Context, EntityDict, OperateOption, SelectOption, OperationResult, SelectRowShape } from "oak-domain/lib/types";
import { AmapInstance } from "oak-external-sdk";

export type CommonAspectDict<ED extends EntityDict, Cxt extends Context<ED>> = {
    operate: <T extends keyof ED>(params: { entity: T, operation: ED[T]['Operation'] | ED[T]['Operation'][], option?: OperateOption }, context: Cxt) => Promise<OperationResult<ED>[] | OperationResult<ED>>,
    select: <T extends keyof ED, S extends ED[T]['Selection']>(params: { entity: T, selection: S, option?: SelectOption, getCount?: true }, context: Cxt) => Promise<{
        data: SelectRowShape<ED[T]['Schema'], S['data']>[],
        count?: number;
    }>,
    amap: <T extends 'getDrivingPath' | 'regeo' | 'ipLoc' | 'getDistrict' | 'geocode'>(params: {
        key: string;
        method: T;
        data: Parameters<AmapInstance[T]>[0];
    }) => Promise<any>,
    getTranslations: (params: {
        namespace: string | string[];
        locale: string;
    }) => Promise<any>,
};
