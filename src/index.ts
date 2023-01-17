import { operate, select, fetchRows, count, aggregate } from './crud';
import { amap } from './amap';
import { getTranslations } from './locales';
import { registerPorts, clearPorts, importEntity, exportEntity, getImportationTemplate } from './port';

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
    getImportationTemplate,
};

export default aspectDict;
export * from './AspectDict';
export {
    registerPorts,
    clearPorts,
};