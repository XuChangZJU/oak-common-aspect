import { operate, select, fetchRows, count, aggregate } from './crud';
import { amap } from './amap';
import { getTranslations } from './locales';
import { registerPorts, importEntity, exportEntity } from './port';
const aspectDict = {
    operate,
    select,
    count,
    aggregate,
    fetchRows,
    amap,
    getTranslations,
    importEntity,
    exportEntity,
};

export default aspectDict;
export * from './AspectDict';
export {
    registerPorts,
};