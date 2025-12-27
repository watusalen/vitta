import { IAppointmentRepository } from "@/model/repositories/iAppointmentRepository";
import ValidationError from "@/model/errors/validationError";
import { assertNonEmpty } from "@/usecase/utils/validationUtils";
import { ICheckAppointmentConflictUseCase, CheckAppointmentConflictInput } from "@/usecase/appointment/status/iCheckAppointmentConflictUseCase";

export default class CheckAppointmentConflictUseCase implements ICheckAppointmentConflictUseCase {
    private appointmentRepository: IAppointmentRepository;

    constructor(appointmentRepository: IAppointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    async hasConflict(input: CheckAppointmentConflictInput): Promise<boolean> {
        this.assertValidInput(input);

        const appointments = await this.appointmentRepository.listByDate(
            input.date,
            input.nutritionistId
        );

        return appointments.some(appt => {
            if (appt.id === input.excludeAppointmentId) {
                return false;
            }
            if (appt.timeStart !== input.timeStart || appt.timeEnd !== input.timeEnd) {
                return false;
            }
            return appt.status === 'accepted';
        });
    }

    private assertValidInput(input: CheckAppointmentConflictInput): void {
        assertNonEmpty(input.date, 'Data inválida.');
        assertNonEmpty(input.timeStart, 'Horário inicial inválido.');
        assertNonEmpty(input.timeEnd, 'Horário final inválido.');
        assertNonEmpty(input.nutritionistId, 'Nutricionista inválida.');

        if (!input.date.includes("-")) {
            throw new ValidationError('Data inválida.');
        }
    }
}
