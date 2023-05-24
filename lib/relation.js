"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadRelations = void 0;
const types_1 = require("oak-domain/lib/types");
const lodash_1 = require("oak-domain/lib/utils/lodash");
async function loadRelations(params, context) {
    const { entities } = params;
    const userId = context.getCurrentUserId();
    if (!userId) {
        throw new types_1.OakUnloggedInException();
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
            entity: {
                $in: entities,
            },
        },
    }, {});
    const result = userRelations.map((userRelation) => (0, lodash_1.omit)(userRelation, 'relation'));
    return result;
}
exports.loadRelations = loadRelations;
