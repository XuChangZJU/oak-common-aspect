"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchPoi = void 0;
async function searchPoi(options) {
    const { value, areaCode, indexFrom, count } = options;
    const form = new FormData();
    form.set('stName', value);
    if (areaCode) {
        form.set('code', areaCode);
    }
    if (indexFrom && count) {
        form.set('page', `${indexFrom / count}`);
        form.set('size', `${count}`);
    }
    const result = await fetch('https://dmfw.mca.gov.cn/9095/stname/listPub', {
        method: 'post',
        body: form,
    });
    const { records } = await result.json();
    const pois = await Promise.all(records.map(async (ele) => {
        let { area, standard_name, gdm, id } = ele;
        // 对返回的area数据进行一些清洗，不规范
        if (area.length === 9) {
            if (area.endsWith('999')) {
                area = area.slice(0, 6);
            }
        }
        if (area === '000000') {
            // 搜索如长江这样的地理名称时会返回这样的数据，过滤掉
            return undefined;
        }
        return {
            id,
            areaId: area,
            poiName: standard_name,
            coordinate: gdm.coordinates[0],
        };
    }));
    return pois.filter(poi => !!poi);
}
exports.searchPoi = searchPoi;
