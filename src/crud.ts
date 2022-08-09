import { OperateOption, EntityDict, Context, SelectOption, SelectRowShape } from 'oak-domain/lib/types';

export async function operate<ED extends EntityDict, T extends keyof ED, Cxt extends Context<ED>>(
    params: { entity: T, operation: ED[T]['Operation'] | ED[T]['Operation'][], option?: OperateOption }, context: Cxt) {
    const { entity, operation, option } = params;
    if (operation instanceof Array) {
        return await Promise.all(operation.map(
            (oper) => context.rowStore.operate(entity, oper, context, option)
        ));
    }
    return await context.rowStore.operate(entity, operation, context, option);
}

export async function select<ED extends EntityDict, T extends keyof ED, Cxt extends Context<ED>, S extends ED[T]['Selection']>(
    params: { entity: T, selection: S, option?: SelectOption, getCount?: true }, context: Cxt) {
    const { entity, selection, option, getCount } = params;
    const { result: data } = await context.rowStore.select(entity, selection, context, option);
    const result = {
        data,
    } as {
        data: SelectRowShape<ED[T]['Schema'], S['data']>[],
        count?: number;
    };
    if (getCount) {
        const { filter } = selection;
        const count = await context.rowStore.count(entity, Object.assign({}, { filter, count: 1000 }), context, option);
        Object.assign(result, {
            count,
        });
    }
    return result;
}

/* 
export type AspectDict<ED extends EntityDict> = {
    operation: <T extends keyof ED>(options: { entity: T, operation: ED[T]['Operation'], params?: OperateParams }, context: Context<ED>) => Promise<OperationResult>;
    select: <T extends keyof ED, S extends ED[T]['Selection']>( options: { entity: T, selection: S, params?: object }, context: Context<ED>) => Promise<SelectionResult2<ED[T]['Schema'], S>>;
}; */
