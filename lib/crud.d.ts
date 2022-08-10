import { OperateOption, EntityDict, Context, SelectOption, SelectRowShape } from 'oak-domain/lib/types';
export declare function operate<ED extends EntityDict, T extends keyof ED, Cxt extends Context<ED>, OP extends OperateOption>(params: {
    entity: T;
    operation: ED[T]['Operation'] | ED[T]['Operation'][];
    option?: OP;
}, context: Cxt): Promise<import("oak-domain/lib/types").OperationResult<ED> | Awaited<import("oak-domain/lib/types").OperationResult<ED>>[]>;
export declare function select<ED extends EntityDict, T extends keyof ED, Cxt extends Context<ED>, S extends ED[T]['Selection'], OP extends SelectOption>(params: {
    entity: T;
    selection: S;
    option?: OP;
    getCount?: true;
    maxCount?: number;
}, context: Cxt): Promise<{
    data: SelectRowShape<ED[T]['Schema'], S['data']>[];
    count?: number | undefined;
}>;
