"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.count = exports.fetchRows = exports.aggregate = exports.select = exports.operate = void 0;
const tslib_1 = require("tslib");
const types_1 = require("oak-domain/lib/types");
const relation_1 = require("oak-domain/lib/store/relation");
const assert_1 = tslib_1.__importDefault(require("assert"));
async function operate(params, context) {
    const { entity, operation, option } = params;
    /* const userId = context.getCurrentUserId();
    if (!userId) {
        // operate默认必须用户登录
        throw new OakUnloggedInException();
    } */
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
function pruneAggrResult(schema, entity, result) {
    const pruneInner = (e, r) => {
        const r2 = {};
        let hasAggr = false;
        for (const attr in r) {
            if (attr.endsWith('$$aggr')) {
                hasAggr = true;
                Object.assign(r2, {
                    [attr]: r[attr],
                });
            }
            else if (typeof r[attr] === 'object') {
                const rel = (0, relation_1.judgeRelation)(schema, e, attr);
                if (rel === 2 || typeof rel === 'string') {
                    const rr = pruneInner(rel === 2 ? attr : rel, r[attr]);
                    if (rr) {
                        hasAggr = true;
                        Object.assign(r2, {
                            [attr]: rr,
                        });
                    }
                }
                else if (rel instanceof Array) {
                    (0, assert_1.default)(r[attr] instanceof Array);
                    const rr = r[attr].map((ele) => pruneInner(rel[0], ele));
                    if (rr.find((ele) => !ele)) {
                        hasAggr = true;
                        Object.assign(r2, {
                            [attr]: rr,
                        });
                    }
                }
            }
        }
        if (hasAggr) {
            return r2;
        }
        return;
    };
    const result2 = result.map((row) => pruneInner(entity, row));
    if (result2.find(ele => !!ele)) {
        return result2;
    }
}
async function select(params, context) {
    const { entity, selection, option, getCount, maxCount } = params;
    const { randomRange, count } = selection;
    let selection2 = selection;
    if (randomRange) {
        // 如果是随机取值，这里就从randomRange的ids中随机取
        const idSelection = Object.assign({}, selection, {
            indexFrom: 0,
            count: randomRange,
            data: {
                id: 1,
            },
        });
        const idResults = await context.select(entity, idSelection, option || {});
        const possibility = count / idResults.length;
        let reduced = idResults.length - count;
        const ids2 = idResults.map(ele => ele.id).filter((id) => {
            const rand = Math.random();
            if (rand > possibility && reduced) {
                reduced--;
                return false;
            }
            return true;
        });
        selection2.filter = {
            id: {
                $in: ids2,
            },
        };
    }
    const data = await context.select(entity, selection2, option || {});
    const result = {
        ids: data.map(ele => ele.id),
    };
    if (getCount && !randomRange) {
        const { filter } = selection;
        const count = await context.count(entity, Object.assign({}, { filter, count: maxCount || 1000 }), option || {});
        Object.assign(result, {
            count,
        });
    }
    if (data.length === 0) {
    }
    else {
        const aggrData = pruneAggrResult(context.getSchema(), entity, data);
        if (aggrData) {
            result.aggr = aggrData;
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
