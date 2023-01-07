import { operate, select, fetchRows, count, aggregate } from './crud';
import { amap } from './amap';
import { getTranslations } from './locales';
const aspectDict = {
    operate,
    select,
    count,
    aggregate,
    fetchRows,
    amap,
    getTranslations,
};

export default aspectDict;
export * from './AspectDict';