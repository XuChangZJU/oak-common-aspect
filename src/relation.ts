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
import { omit } from 'oak-domain/lib/utils/lodash';

export async function loadRelations<
    ED extends BaseEntityDict & EntityDict,
    Cxt extends AsyncContext<ED>
>(params: {
    entities: (keyof ED)[],
}, context: Cxt) {
    const { entities } = params;
    const userId = context.getCurrentUserId();
    if (!userId) {
        throw new OakUnloggedInException();
    }
    const userRelations = await context.select('userRelation', {
        data: {
            id: 1,
            userId: 1,
            relationId: 1,
            entity: 1,
            entityId: 1,
            relation: {
                id: 1,
                entity: 1,
                entityId: 1,
                name: 1,
                display: 1,
                actionAuth$relation: {
                    $entity: 'actionAuth',
                    data: {
                        id: 1,
                        path: 1,
                        destEntity: 1,
                        deActions: 1,
                    },
                },
                relationAuth$sourceRelation: {
                    $entity: 'relationAuth',
                    data: {
                        id: 1,
                        sourceRelationId: 1,
                        destRelationId: 1,
                        destRelation: {
                            id: 1,
                            entity: 1,
                            entityId: 1,
                            name: 1,
                            display: 1,                            
                        },
                        path: 1,
                    },
                }
            },
        },
        filter: {
            userId,
            /* entity: {
                $in: entities as string[],
            }, */
        },
    }, {});
    const result = userRelations.map(
        (userRelation) => omit(userRelation, 'relation')
    );
    return result as ED['userRelation']['OpSchema'][];
}