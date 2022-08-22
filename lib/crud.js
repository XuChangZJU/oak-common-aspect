"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.select = exports.operate = void 0;
const types_1 = require("oak-domain/lib/types");
async function operate(params, context) {
    const { entity, operation, option } = params;
    const userId = await context.getCurrentUserId();
    if (!userId) {
        // operate默认必须用户登录
        throw new types_1.OakUnloggedInException();
    }
    if (operation instanceof Array) {
        const result = [];
        for (const oper of operation) {
            const r = await context.rowStore.operate(entity, oper, context, option);
            result.push(r);
        }
        return result;
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
