import { operate, select, fetchRows } from './crud';
import { amap } from './amap';
import { getTranslations } from './locales';
const aspectDict = {
    operate,
    select,
    fetchRows,
    amap,
    getTranslations,
};

export default aspectDict;
export * from './AspectDict';