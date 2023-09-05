export declare function getTranslations(options: {
    namespace: string | string[];
    locale: string;
}): Promise<{
    common: {
        action: {
            confirm: string;
        };
    };
}>;
