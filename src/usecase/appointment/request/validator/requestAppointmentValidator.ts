import ValidationError from "@/model/errors/validationError";
import { isWeekday, AVAILABLE_TIME_SLOTS } from "@/model/utils/timeSlotUtils";
import { assertNonEmpty } from "@/usecase/utils/validationUtils";
import { RequestAppointmentInput } from "@/usecase/appointment/request/iRequestAppointmentUseCase";

export function assertValidIds(input: RequestAppointmentInput): void {
    assertNonEmpty(input.patientId, "Paciente inválido.");
    assertNonEmpty(input.nutritionistId, "Nutricionista inválida.");
}

export function assertValidTimes(input: RequestAppointmentInput): void {
    assertNonEmpty(input.timeStart, "Horário de início inválido.");
    assertNonEmpty(input.timeEnd, "Horário de término inválido.");
}

export function assertValidDate(date: Date): void {
    if (!isWeekday(date)) {
        throw new ValidationError("Consultas só podem ser agendadas de segunda a sexta-feira.");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const inputDate = new Date(date);
    inputDate.setHours(0, 0, 0, 0);

    if (inputDate < today) {
        throw new ValidationError("Não é possível agendar consultas em datas passadas.");
    }
}

export function assertSlotNotInPast(date: Date, timeStart: string): void {
    const [hours, minutes] = timeStart.split(":").map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
        throw new ValidationError("Horário selecionado não está disponível.");
    }

    const now = new Date();
    const slotStart = new Date(date);
    slotStart.setHours(hours, minutes, 0, 0);

    if (now > slotStart) {
        throw new ValidationError("Não é possível agendar consultas em horários passados.");
    }
}

export function assertValidSlot(timeStart: string, timeEnd: string): void {
    const isValidSlot = AVAILABLE_TIME_SLOTS.some(
        slot => slot.timeStart === timeStart && slot.timeEnd === timeEnd
    );

    if (!isValidSlot) {
        throw new ValidationError("Horário selecionado não está disponível.");
    }
}
