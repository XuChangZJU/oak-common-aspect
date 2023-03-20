"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.count = exports.fetchRows = exports.aggregate = exports.select = exports.operate = void 0;
const types_1 = require("oak-domain/lib/types");
const relation_1 = require("oak-domain/lib/store/relation");
const filter_1 = require("oak-domain/lib/store/filter");
async function operate(params, context) {
    const { entity, operation, option } = params;
    const userId = context.getCurrentUserId();
    if (!userId) {
        // operate默认必须用户登录
        throw new types_1.OakUnloggedInException();
    }
    if (!context.allowUserUpdate()) {
        throw new types_1.OakUserUnpermittedException('您被禁更新');
    }
    if (operation instanceof Array) {
        const result = [];
        for (const oper of operation) {
            const r = await context.operate(entity, oper, option || {});
            result.push(r);
        }
        return result;
    }
    return await context.operate(entity, operation, option || {});
}
exports.operate = operate;
async function select(params, context) {
    const { entity, selection, option, getCount, maxCount } = params;
    const data = await context.select(entity, selection, option || {});
    const result = {
        data,
    };
    if (getCount) {
        const { filter } = selection;
        const count = await context.count(entity, Object.assign({}, { filter, count: maxCount || 1000 }), option || {});
        Object.assign(result, {
            count,
        });
    }
    /**
     * 若selection的projection和filter中同时对某一个外键有限制，此时这条属性路径可能会有关于此对象的权限判定。
     * 若此时Data为空，则路径上的中间对象不会被返回，会导致前台的权限判定不完整
     * 如 sku的create权限（jichuang项目）, sku.companyService.company上有user relation
     * 如果sku为空，也应当试着把companyService数据返回给前台
     * by Xc 20230320
     */
    if (data.length === 0) {
        const { data, filter } = selection;
        for (const attr in data) {
            const rel = (0, relation_1.judgeRelation)(context.getSchema(), entity, attr);
            if (rel === 2) {
                const f = filter && (0, filter_1.getCascadeEntityFilter)(filter, attr);
                if (f) {
                    await context.select(attr, {
                        data: data[attr],
                        filter: f,
                        indexFrom: 0,
                        count: 1, // 取一行应该就够了
                    }, option || {});
                }
            }
            else if (typeof rel === 'string') {
                const f = filter && (0, filter_1.getCascadeEntityFilter)(filter, attr);
                if (f) {
                    await context.select(rel, {
                        data: data[attr],
                        filter: f,
                        indexFrom: 0,
                        count: 1, // 取一行应该就够了
                    }, option || {});
                }
            }
        }
    }
    return result;
}
exports.select = select;
async function aggregate(params, context) {
    const { entity, aggregation, option } = params;
    return context.aggregate(entity, aggregation, option || {});
}
exports.aggregate = aggregate;
async function fetchRows(params, context) {
    await Promise.all(params.map((ele) => context.select(ele.entity, ele.selection, ele.option || {})));
}
exports.fetchRows = fetchRows;
async function count(params, context) {
    const { entity, selection, option } = params;
    const { filter } = selection;
    const count = await context.count(entity, Object.assign({}, { filter }), option || {});
    return count;
}
exports.count = count;
/*
export type AspectDict<ED extends EntityDict> = {
    operation: <T extends keyof ED>(options: { entity: T, operation: ED[T]['Operation'], params?: OperateParams }, context: Context<ED>) => Promise<OperationResult>;
    select: <T extends keyof ED, S extends ED[T]['Selection']>( options: { entity: T, selection: S, params?: object }, context: Context<ED>) => Promise<SelectionResult2<ED[T]['Schema'], S>>;
}; */
