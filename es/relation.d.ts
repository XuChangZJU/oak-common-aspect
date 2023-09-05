import { EntityDict } from 'oak-domain/lib/types';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { AsyncContext } from 'oak-domain/lib/store/AsyncRowStore';
export declare function loadRelations<ED extends BaseEntityDict & EntityDict, Cxt extends AsyncContext<ED>>(params: {
    entities: (keyof ED)[];
}, context: Cxt): Promise<ED["userRelation"]["OpSchema"][]>;
