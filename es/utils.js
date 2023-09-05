export async function crossBridge(params) {
    const { url } = params;
    const res = await fetch(url);
    return res.body;
}
