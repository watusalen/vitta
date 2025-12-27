export function generateId(prefix: string): string {
    if (typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.randomUUID === 'function') {
        return globalThis.crypto.randomUUID();
    }
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
