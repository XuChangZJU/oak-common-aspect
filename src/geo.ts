import { assert } from 'oak-domain/lib/utils/assert';

/**
 * 根据poiName搜索地理位置
 * @param options
 * https://dmfw.mca.gov.cn/interface.html
 */
type DmfwPoi = {
    id: string;
    area: string;
    standard_name: string;
    gdm: {
        coordinates: [[number, number]];
    };
    place_type: string;
    place_code: string;
    area_name: string;
    city_name: string;
    province_name: string;
};

export async function searchPoi(options: {
    value: string;
    areaCode?: string;
    indexFrom?: number;
    count?: number;
    typeCode?: string;
}): Promise<
    {
        id: string;
        areaId: string;
        poiName: string;
        coordinate: [number, number];
    }[]
> {
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
    const pois = await Promise.all(
        records.map(async (ele: DmfwPoi) => {
            let {
                area,
                standard_name,
                gdm,
                id,
                province_name,
                city_name,
                area_name,
                place_type,
            } = ele;
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
                detail: `${province_name}${city_name}${area_name}${standard_name}(${place_type})`,
            };
        })
    );
    return pois.filter((poi) => !!poi) as {
        id: string;
        areaId: string;
        poiName: string;
        coordinate: [number, number];
    }[];
}
