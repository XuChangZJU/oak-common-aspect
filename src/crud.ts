import {
    OperateOption,
    EntityDict,
    SelectOption,
    OakUnloggedInException,
    OakUserUnpermittedException,
    StorageSchema,
} from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
import { judgeRelation } from 'oak-domain/lib/store/relation';
import { getCascadeEntityFilter } from 'oak-domain/lib/store/filter';
import assert from 'assert';

export async function operate<
    ED extends BaseEntityDict & EntityDict,
    T extends keyof ED,
    Cxt extends AsyncContext<ED>,
    OP extends OperateOption
>(
    params: {
        entity: T;
        operation: ED[T]['Operation'] | ED[T]['Operation'][];
        option?: OP;
    },
    context: Cxt
) {
    const { entity, operation, option } = params;
    const userId = context.getCurrentUserId();
    if (!userId) {
        // operate默认必须用户登录
        throw new OakUnloggedInException();
    }
    if (!context.allowUserUpdate()) {
        throw new OakUserUnpermittedException('您被禁更新');
    }

    if (operation instanceof Array) {
        const result = [];
        for (const oper of operation) {
            const r = await context.operate(
                entity,
                oper,
                option || {}
            );
            result.push(r);
        }
        return result;
    }
    return await context.operate(
        entity,
        operation,
        option || {}
    );
}

function pruneAggrResult<
    ED extends BaseEntityDict & EntityDict,
    T extends keyof ED>(schema: StorageSchema<ED>, entity: T, result: Partial<ED[T]['Schema']>[]) {
    
    const pruneInner = (e: keyof ED, r: Partial<ED[keyof ED]['Schema']>): Partial<ED[keyof ED]['Schema']> | undefined => {
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
                const rel = judgeRelation(schema, e, attr);
                if (rel === 2 || typeof rel === 'string') {
                    const rr = pruneInner(rel === 2 ? attr : rel, r[attr]!);
                    if (rr) {
                        hasAggr = true;
                        Object.assign(r2, {
                            [attr]: rr,
                        });
                    }
                }
                else if (rel instanceof Array) {
                    assert(r[attr] as any instanceof Array);
                    const rr = r[attr].map(
                        (ele: any) => pruneInner(rel[0], ele)
                    );
                    if (rr.find(
                        (ele: any) => !ele
                    )) {
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

    const result2 = result.map(
        (row) => pruneInner(entity, row)
    );
    if (result2.find(
        ele => !!ele
    )) {
        return result2;
    }
}

export async function select<
    ED extends BaseEntityDict & EntityDict,
    T extends keyof ED,
    Cxt extends AsyncContext<ED>,
    OP extends SelectOption
>(
    params: {
        entity: T;
        selection: ED[T]['Selection'];
        option?: OP;
        getCount?: true;
        maxCount?: number;
    },
    context: Cxt
) {
    const { entity, selection, option, getCount, maxCount } = params;
    const data = await context.select(
        entity,
        selection,
        option || {}
    );
    const result = {
        ids: data.map(ele => ele.id),
    } as {
        ids: string[];
        count?: number;
        aggr?: (Partial<ED[T]['Schema']> | undefined)[];
    };
    if (getCount) {
        const { filter } = selection;
        const count = await context.count(
            entity,
            Object.assign({}, { filter, count: maxCount || 1000 }),
            option || {}
        );
        Object.assign(result, {
            count,
        });
    }

    if (data.length === 0) {
        /**
         * 若selection的projection和filter中同时对某一个外键有限制，此时这条属性路径可能会有关于此对象的权限判定。
         * 若此时Data为空，则路径上的中间对象不会被返回，会导致前台的权限判定不完整
         * 如 sku的create权限（jichuang项目）, sku.companyService.company上有user relation
         * 如果sku为空，也应当试着把companyService数据返回给前台
         * by Xc 20230320
         */
        const { data, filter } = selection;
        for (const attr in data) {
            const rel = judgeRelation<ED>(context.getSchema(), entity, attr);
            if (rel === 2) {
                const f = filter && getCascadeEntityFilter(filter, attr);
                if (f) {
                    await context.select(attr, {
                        data: data[attr],
                        filter: f,
                        indexFrom: 0,
                        count: 1,           // 取一行应该就够了
                    },
                        option || {})
                }
            }
            else if (typeof rel === 'string') {
                const f = filter && getCascadeEntityFilter(filter, attr);
                if (f) {
                    await context.select(rel, {
                        data: data[attr],
                        filter: f,
                        indexFrom: 0,
                        count: 1,           // 取一行应该就够了
                    },
                        option || {})
                }
            }
        }
    }
    else {
        /**
         * selection的projection中可能有aggr，这个结果前台需要返回
         */
        const aggrData = pruneAggrResult(context.getSchema(), entity, data);
        if (aggrData) {
            result.aggr = aggrData;            
        }
    }
    return result;
}

export async function aggregate<
    ED extends BaseEntityDict & EntityDict,
    T extends keyof ED,
    Cxt extends AsyncContext<ED>,
    OP extends SelectOption
>(params: {
    entity: T,
    aggregation: ED[T]['Aggregation'],
    option?: OP,
}, context: Cxt) {
    const { entity, aggregation, option } = params;
    return context.aggregate(entity, aggregation, option || {});
}

export async function fetchRows<
    ED extends EntityDict & BaseEntityDict,
    OP extends SelectOption,
    Cxt extends AsyncContext<ED>,
    >(
        params: Array<{
            entity: keyof ED;
            selection: ED[keyof ED]['Selection'];
            option?: OP;
        }>,
        context: Cxt
    ) {
    await Promise.all(
        params.map((ele) =>
            context.select(
                ele.entity,
                ele.selection,
                ele.option || {}
            )
        )
    );
}

export async function count<
    ED extends EntityDict & BaseEntityDict,
    T extends keyof ED,
    Cxt extends AsyncContext<ED>,
    OP extends SelectOption
>(
    params: {
        entity: T;
        selection: Pick<ED[T]['Selection'], 'filter'>;
        option?: OP;
    },
    context: Cxt
) {
    const { entity, selection, option } = params;
    const { filter } = selection;
    const count = await context.count(
        entity,
        Object.assign({}, { filter }),
        option || {}
    );
    return count;
}

/* 
export type AspectDict<ED extends EntityDict> = {
    operation: <T extends keyof ED>(options: { entity: T, operation: ED[T]['Operation'], params?: OperateParams }, context: Context<ED>) => Promise<OperationResult>;
    select: <T extends keyof ED, S extends ED[T]['Selection']>( options: { entity: T, selection: S, params?: object }, context: Context<ED>) => Promise<SelectionResult2<ED[T]['Schema'], S>>;
}; */
