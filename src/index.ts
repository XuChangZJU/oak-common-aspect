import { operate, select, fetchRows, count, aggregate } from './crud';
import { amap } from './amap';
import { getTranslations } from './locales';
import { registerPorts, clearPorts, importEntity, exportEntity, getImportationTemplate } from './port';
import { searchPoi } from './geo';
import { loadRelations } from './relation';
import { crossBridge } from './utils';

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
    searchPoi,
    loadRelations,
    crossBridge,
};

export default aspectDict;
export * from './AspectDict';
export {
    registerPorts,
    clearPorts,
};