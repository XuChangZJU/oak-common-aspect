import { operate, select, fetchRows } from './crud';
import { amap } from './amap';
import { getTranslations } from './locales';
declare const aspectDict: {
    operate: typeof operate;
    select: typeof select;
    fetchRows: typeof fetchRows;
    amap: typeof amap;
    getTranslations: typeof getTranslations;
};
export default aspectDict;
export * from './AspectDict';
