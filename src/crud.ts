import {
    OperateOption,
    EntityDict,
    SelectOption,
    OakUnloggedInException,
    OakUserUnpermittedException,
} from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';

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

export async function select<
    ED extends EntityDict,
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
        data,
    } as {
        data: Partial<ED[T]['Schema']>[];
        count?: number;
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
    return result;
}

export async function aggregate<
    ED extends EntityDict,
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
