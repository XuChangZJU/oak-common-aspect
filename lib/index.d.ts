import { operate, select, fetchRows, count, aggregate } from './crud';
import { amap } from './amap';
import { getTranslations } from './locales';
declare const aspectDict: {
    operate: typeof operate;
    select: typeof select;
    count: typeof count;
    aggregate: typeof aggregate;
    fetchRows: typeof fetchRows;
    amap: typeof amap;
    getTranslations: typeof getTranslations;
};
export default aspectDict;
export * from './AspectDict';
