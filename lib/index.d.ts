import { operate, select, fetchRows, count, aggregate } from './crud';
import { amap } from './amap';
import { getTranslations } from './locales';
import { registerPorts, clearPorts, importEntity, exportEntity, getImportationTemplate } from './port';
declare const aspectDict: {
    operate: typeof operate;
    select: typeof select;
    count: typeof count;
    aggregate: typeof aggregate;
    fetchRows: typeof fetchRows;
    amap: typeof amap;
    getTranslations: typeof getTranslations;
    importEntity: typeof importEntity;
    exportEntity: typeof exportEntity;
    getImportationTemplate: typeof getImportationTemplate;
};
export default aspectDict;
export * from './AspectDict';
export { registerPorts, clearPorts, };
