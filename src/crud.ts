import {
    OperateOption,
    EntityDict,
    Context,
    SelectOption,
    SelectRowShape,
    OakUnloggedInException,
} from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';

export async function operate<
    ED extends BaseEntityDict & EntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>,
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
    const userId = await context.getCurrentUserId();
    if (!userId) {
        // operate默认必须用户登录
        throw new OakUnloggedInException();
    }

    if (operation instanceof Array) {
        const result = [];
        for (const oper of operation) {
            const r = await context.rowStore.operate(
                entity,
                oper,
                context,
                option || {}
            );
            result.push(r);
        }
        return result;
    }
    return await context.rowStore.operate(
        entity,
        operation,
        context,
        option || {}
    );
}

export async function select<
    ED extends EntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>,
    S extends ED[T]['Selection'],
    OP extends SelectOption
>(
    params: {
        entity: T;
        selection: S;
        option?: OP;
        getCount?: true;
        maxCount?: number;
    },
    context: Cxt
) {
    const { entity, selection, option, getCount, maxCount } = params;
    const { result: data } = await context.rowStore.select(
        entity,
        selection,
        context,
        option || {}
    );
    const result = {
        data,
    } as {
        data: SelectRowShape<ED[T]['Schema'], S['data']>[];
        count?: number;
    };
    if (getCount) {
        const { filter } = selection;
        const count = await context.rowStore.count(
            entity,
            Object.assign({}, { filter, count: maxCount || 1000 }),
            context,
            option || {}
        );
        Object.assign(result, {
            count,
        });
    }
    return result;
}

export async function fetchRows<
    ED extends EntityDict & BaseEntityDict,
    OP extends SelectOption,
    Cxt extends Context<ED>
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
            context.rowStore.select(
                ele.entity,
                ele.selection,
                context,
                ele.option || {}
            )
        )
    );
}

export async function count<
    ED extends EntityDict & BaseEntityDict,
    T extends keyof ED,
    Cxt extends Context<ED>,
    S extends ED[T]['Selection'],
    OP extends SelectOption
>(
    params: {
        entity: T;
        selection: S;
        option?: OP;
    },
    context: Cxt
) {
    const { entity, selection, option } = params;
    const { filter } = selection;
    const count = await context.rowStore.count(
        entity,
        Object.assign({}, { filter }),
        context,
        option || {}
    );
    return count;
}

/* 
export type AspectDict<ED extends EntityDict> = {
    operation: <T extends keyof ED>(options: { entity: T, operation: ED[T]['Operation'], params?: OperateParams }, context: Context<ED>) => Promise<OperationResult>;
    select: <T extends keyof ED, S extends ED[T]['Selection']>( options: { entity: T, selection: S, params?: object }, context: Context<ED>) => Promise<SelectionResult2<ED[T]['Schema'], S>>;
}; */
