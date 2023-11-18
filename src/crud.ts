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
import { assert } from 'oak-domain/lib/utils/assert';

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
    /* const userId = context.getCurrentUserId();
    if (!userId) {
        // operate默认必须用户登录
        throw new OakUnloggedInException();
    } */
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

/**
 * 因为有cascadeSelect，这里要按查询的要求build返回的结构树，告知每一层上相关的id/total/aggr信息
 * @param schema 
 * @param entity 
 * @param result 
 * @returns 
 */
function buildResultTree<ED extends BaseEntityDict & EntityDict, T extends keyof ED>(
    schema: StorageSchema<ED>, 
    entity: T, 
    result: Partial<ED[T]['Schema']>[]
) {
    const pruneInner = (e: keyof ED, r: Partial<ED[keyof ED]['Schema']>, tree: Record<string, any>) => {
        for (const attr in r) {
            if (attr.endsWith('$$aggr')) {
                tree[attr] = r[attr];
            }
            else if (typeof r[attr] === 'object') {
                const rel = judgeRelation(schema, e, attr);
                if (rel === 2 || typeof rel === 'string') {
                    const son = {}
                    pruneInner(rel === 2 ? attr : rel, r[attr]!, son);
                    if (Object.keys(son).length > 0) {
                        tree[attr] = son;
                    }
                }
                else if (rel instanceof Array) {
                    assert(r[attr] as any instanceof Array);
                    tree[attr] = {
                        data: {},
                    };
                    if (r[attr].hasOwnProperty('#total')) {
                        tree[attr].total = r[attr]['#total'];
                    }
                    r[attr].forEach(
                        (rr: any) => {
                            tree[attr].data[rr.id as string] = {};
                            pruneInner(rel[0], rr, tree[attr].data[rr.id as string]);
                        }
                    )
                }
            }
        }
    };

    const root = {
        data: {},
    } as {
        data: Record<string, any>;
        total?: number;
    }

    /**
     * 这个total是在cascadeStore的selectAsync处理的，有点古怪
     */
    if (result.hasOwnProperty('#total')) {
        root.total = (result as any)['#total'];
    }

    result.forEach(
        (row) => {
            root.data[row.id!] = {};
            pruneInner(entity, row, root.data[row.id!]);
        }
    );
    return root;
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
    const { entity, selection, option } = params;
    let selection2 = selection;
    
    const data = await context.select(
        entity,
        selection2,
        option || {}
    );

    return buildResultTree(context.getSchema(), entity, data);
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
