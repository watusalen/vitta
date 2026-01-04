import Constants from "expo-constants";

type ExtraEnv = Record<string, string | undefined>;

function getExtraEnv(): ExtraEnv {
    const expoExtra = Constants.expoConfig?.extra ?? Constants.easConfig?.extra ?? {};
    return expoExtra as ExtraEnv;
}

export function getPublicEnv(key: string): string | undefined {
    return process.env[key] ?? getExtraEnv()[key];
}
