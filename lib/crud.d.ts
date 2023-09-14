import { OperateOption, EntityDict, SelectOption } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
export declare function operate<ED extends BaseEntityDict & EntityDict, T extends keyof ED, Cxt extends AsyncContext<ED>, OP extends OperateOption>(params: {
    entity: T;
    operation: ED[T]['Operation'] | ED[T]['Operation'][];
    option?: OP;
}, context: Cxt): Promise<import("oak-domain/lib/types").OperationResult<ED> | import("oak-domain/lib/types").OperationResult<ED>[]>;
export declare function select<ED extends BaseEntityDict & EntityDict, T extends keyof ED, Cxt extends AsyncContext<ED>, OP extends SelectOption>(params: {
    entity: T;
    selection: ED[T]['Selection'];
    option?: OP;
    getCount?: true;
    maxCount?: number;
}, context: Cxt): Promise<{
    ids: string[];
    count?: number | undefined;
    aggr?: (Partial<ED[T]["Schema"]> | undefined)[] | undefined;
}>;
export declare function aggregate<ED extends BaseEntityDict & EntityDict, T extends keyof ED, Cxt extends AsyncContext<ED>, OP extends SelectOption>(params: {
    entity: T;
    aggregation: ED[T]['Aggregation'];
    option?: OP;
}, context: Cxt): Promise<import("oak-domain/lib/types").AggregationResult<ED[T]["Schema"]>>;
export declare function fetchRows<ED extends EntityDict & BaseEntityDict, OP extends SelectOption, Cxt extends AsyncContext<ED>>(params: Array<{
    entity: keyof ED;
    selection: ED[keyof ED]['Selection'];
    option?: OP;
}>, context: Cxt): Promise<void>;
export declare function count<ED extends EntityDict & BaseEntityDict, T extends keyof ED, Cxt extends AsyncContext<ED>, OP extends SelectOption>(params: {
    entity: T;
    selection: Pick<ED[T]['Selection'], 'filter'>;
    option?: OP;
}, context: Cxt): Promise<number>;
