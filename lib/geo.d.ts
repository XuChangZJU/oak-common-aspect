export declare function searchPoi(options: {
    value: string;
    areaCode?: string;
    indexFrom?: number;
    count?: number;
    typeCode?: string;
}): Promise<{
    id: string;
    areaId: string;
    poiName: string;
    coordinate: [number, number];
}[]>;
