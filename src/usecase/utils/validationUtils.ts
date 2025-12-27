import ValidationError from "@/model/errors/validationError";

export function assertNonEmpty(value: string, message: string): void {
    if (!value || value.trim().length === 0) {
        throw new ValidationError(message);
    }
}

export function assertValidRange(startDate: Date, endDate: Date, message: string): void {
    if (endDate < startDate) {
        throw new ValidationError(message);
    }
}