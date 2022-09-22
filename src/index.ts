import { operate, select, fetchRows, count } from './crud';
import { amap } from './amap';
import { getTranslations } from './locales';
const aspectDict = {
    operate,
    select,
    count,
    fetchRows,
    amap,
    getTranslations,
};

export default aspectDict;
export * from './AspectDict';