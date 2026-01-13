import { assertNonEmpty, assertValidRange } from "@/usecase/utils/validationUtils";
import ValidationError from "@/model/errors/validationError";

describe("validationUtils", () => {
    it("deve validar string não vazia", () => {
        expect(() => assertNonEmpty("ok", "erro")).not.toThrow();
        expect(() => assertNonEmpty("   ", "erro")).toThrow(ValidationError);
    });

    it("deve validar intervalo de datas", () => {
        const start = new Date("2025-12-10");
        const end = new Date("2025-12-11");
        expect(() => assertValidRange(start, end, "intervalo inválido")).not.toThrow();
        expect(() => assertValidRange(end, start, "intervalo inválido")).toThrow(ValidationError);
    });
});
