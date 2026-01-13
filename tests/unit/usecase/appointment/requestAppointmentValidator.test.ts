import {
    assertValidDate,
    assertSlotNotInPast,
    assertValidSlot,
} from "@/usecase/appointment/request/validator/requestAppointmentValidator";
import ValidationError from "@/model/errors/validationError";

describe("requestAppointmentValidator", () => {
    beforeAll(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(2025, 11, 17, 12, 0, 0));
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    it("deve impedir finais de semana", () => {
        expect(() => assertValidDate(new Date(2025, 11, 20, 12, 0, 0))).toThrow(ValidationError);
    });

    it("deve impedir datas passadas", () => {
        expect(() => assertValidDate(new Date(2025, 11, 16, 12, 0, 0))).toThrow(ValidationError);
    });

    it("deve impedir horário inválido", () => {
        expect(() => assertSlotNotInPast(new Date(2025, 11, 17, 12, 0, 0), "xx:yy")).toThrow(
            "Horário selecionado não está disponível."
        );
    });

    it("deve impedir horário no passado do mesmo dia", () => {
        expect(() => assertSlotNotInPast(new Date(2025, 11, 17, 12, 0, 0), "09:00")).toThrow(
            "Não é possível agendar consultas em horários passados."
        );
    });

    it("deve aceitar horário futuro no mesmo dia", () => {
        expect(() => assertSlotNotInPast(new Date(2025, 11, 17, 12, 0, 0), "14:00")).not.toThrow();
    });

    it("deve validar slot permitido", () => {
        expect(() => assertValidSlot("09:00", "11:00")).not.toThrow();
        expect(() => assertValidSlot("08:00", "10:00")).toThrow(ValidationError);
    });
});
