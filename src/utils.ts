export async function crossBridge(params: {
    url: string;
}) {
    const { url } = params;

    const res = await fetch(url);
    return res.body;
}