import AmapSDK from 'oak-external-sdk/lib/AmapSDK';
export async function amap(options) {
    const { key, method, data } = options;
    const instance = AmapSDK.getInstance(key);
    const fn = instance[method];
    if (!fn) {
        throw new Error('method not implemented');
    }
    // data any后面再改
    return fn(data);
}
