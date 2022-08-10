"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.select = exports.operate = void 0;
async function operate(params, context) {
    const { entity, operation, option } = params;
    if (operation instanceof Array) {
        return await Promise.all(operation.map((oper) => context.rowStore.operate(entity, oper, context, option)));
    }
    return await context.rowStore.operate(entity, operation, context, option);
}
exports.operate = operate;
async function select(params, context) {
    const { entity, selection, option, getCount, maxCount } = params;
    const { result: data } = await context.rowStore.select(entity, selection, context, option);
    const result = {
        data,
    };
    if (getCount) {
        const { filter } = selection;
        const count = await context.rowStore.count(entity, Object.assign({}, { filter, count: maxCount || 1000 }), context, option);
        Object.assign(result, {
            count,
        });
    }
    return result;
}
exports.select = select;
/*
export type AspectDict<ED extends EntityDict> = {
    operation: <T extends keyof ED>(options: { entity: T, operation: ED[T]['Operation'], params?: OperateParams }, context: Context<ED>) => Promise<OperationResult>;
    select: <T extends keyof ED, S extends ED[T]['Selection']>( options: { entity: T, selection: S, params?: object }, context: Context<ED>) => Promise<SelectionResult2<ED[T]['Schema'], S>>;
}; */
