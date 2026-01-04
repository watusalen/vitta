import CheckAppointmentConflictUseCase from '@/usecase/appointment/status/checkAppointmentConflictUseCase';
import { IAppointmentRepository } from '@/model/repositories/iAppointmentRepository';
import Appointment from '@/model/entities/appointment';
import ValidationError from '@/model/errors/validationError';

const createMockAppointment = (
    id: string,
    date: string,
    timeStart: string,
    timeEnd: string,
    status: 'pending' | 'accepted' | 'rejected' | 'cancelled' = 'accepted'
): Appointment => ({
    id,
    patientId: 'patient-1',
    nutritionistId: 'nutri-1',
    date,
    timeStart,
    timeEnd,
    status,
    createdAt: new Date(),
    updatedAt: new Date(),
});

const createMockRepository = (appointments: Appointment[] = []): IAppointmentRepository => ({
    create: jest.fn(),
    getById: jest.fn(),
    listByPatient: jest.fn(),
    listByDate: jest.fn().mockResolvedValue(appointments),
    listByStatus: jest.fn(),
    listAcceptedByDateRange: jest.fn(),
    listAgendaByDateRange: jest.fn(),
    updateStatus: jest.fn(),
    updateCalendarEventIds: jest.fn(),
    onPatientAppointmentsChange: jest.fn(() => () => {}),
    onNutritionistPendingChange: jest.fn(() => () => {}),
    onNutritionistAppointmentsChange: jest.fn(() => () => {}),
});

describe('CheckAppointmentConflictUseCase', () => {
    const input = {
        date: '2025-01-20',
        timeStart: '09:00',
        timeEnd: '11:00',
        nutritionistId: 'nutri-1',
    };

    it('should return false when no appointments on date', async () => {
        const mockRepo = createMockRepository([]);
        const useCase = new CheckAppointmentConflictUseCase(mockRepo);

        const result = await useCase.hasConflict(input);

        expect(result).toBe(false);
        expect(mockRepo.listByDate).toHaveBeenCalledWith(input.date, input.nutritionistId);
    });

    it('should return true when accepted appointment has same slot', async () => {
        const appointments = [
            createMockAppointment('appt-1', '2025-01-20', '09:00', '11:00', 'accepted'),
        ];
        const mockRepo = createMockRepository(appointments);
        const useCase = new CheckAppointmentConflictUseCase(mockRepo);

        const result = await useCase.hasConflict(input);

        expect(result).toBe(true);
    });

    it('should ignore non-accepted appointments', async () => {
        const appointments = [
            createMockAppointment('appt-1', '2025-01-20', '09:00', '11:00', 'pending'),
            createMockAppointment('appt-2', '2025-01-20', '09:00', '11:00', 'rejected'),
            createMockAppointment('appt-3', '2025-01-20', '09:00', '11:00', 'cancelled'),
        ];
        const mockRepo = createMockRepository(appointments);
        const useCase = new CheckAppointmentConflictUseCase(mockRepo);

        const result = await useCase.hasConflict(input);

        expect(result).toBe(false);
    });

    it('should ignore appointments with different slot', async () => {
        const appointments = [
            createMockAppointment('appt-1', '2025-01-20', '11:00', '13:00', 'accepted'),
        ];
        const mockRepo = createMockRepository(appointments);
        const useCase = new CheckAppointmentConflictUseCase(mockRepo);

        const result = await useCase.hasConflict(input);

        expect(result).toBe(false);
    });

    it('should ignore appointment with excluded id', async () => {
        const appointments = [
            createMockAppointment('appt-1', '2025-01-20', '09:00', '11:00', 'accepted'),
        ];
        const mockRepo = createMockRepository(appointments);
        const useCase = new CheckAppointmentConflictUseCase(mockRepo);

        const result = await useCase.hasConflict({
            ...input,
            excludeAppointmentId: 'appt-1',
        });

        expect(result).toBe(false);
    });

    it('should throw ValidationError when input is invalid', async () => {
        const mockRepo = createMockRepository([]);
        const useCase = new CheckAppointmentConflictUseCase(mockRepo);

        await expect(
            useCase.hasConflict({ ...input, date: '' })
        ).rejects.toThrow(ValidationError);

        await expect(
            useCase.hasConflict({ ...input, date: '20250120' })
        ).rejects.toThrow('Data inválida.');
    });
});
