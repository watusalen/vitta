import ListNutritionistAgendaUseCase from '@/usecase/appointment/list/listNutritionistAgendaUseCase';
import { IListNutritionistAgendaUseCase } from '@/usecase/appointment/list/iListNutritionistAgendaUseCase';
import { IAppointmentRepository } from '@/model/repositories/iAppointmentRepository';
import Appointment from '@/model/entities/appointment';

// Helper para criar appointment mock
const createMockAppointment = (
    id: string,
    date: string,
    timeStart: string,
    status: 'pending' | 'accepted' | 'rejected' | 'cancelled' = 'accepted'
): Appointment => ({
    id,
    patientId: 'patient-1',
    nutritionistId: 'nutri-1',
    date,
    timeStart,
    timeEnd: '11:00',
    status,
    createdAt: new Date(),
    updatedAt: new Date(),
});

describe('ListNutritionistAgendaUseCase', () => {
    let mockRepository: IAppointmentRepository;
    let useCase: IListNutritionistAgendaUseCase;

    beforeEach(() => {
        mockRepository = {
            create: jest.fn(),
            getById: jest.fn(),
            listByPatient: jest.fn(),
            listByDate: jest.fn(),
            listByStatus: jest.fn(),
            listAcceptedByDateRange: jest.fn(),
            listAgendaByDateRange: jest.fn(),
            updateStatus: jest.fn(),
    updateCalendarEventIds: jest.fn(),
            onPatientAppointmentsChange: jest.fn(),
            onNutritionistPendingChange: jest.fn(),
            onNutritionistAppointmentsChange: jest.fn(),
        };

        useCase = new ListNutritionistAgendaUseCase(mockRepository);
    });

    describe('listAgenda', () => {
        it('should return appointments grouped by date', async () => {
            const appointments = [
                createMockAppointment('appt-1', '2025-01-20', '09:00'),
                createMockAppointment('appt-2', '2025-01-20', '11:00'),
                createMockAppointment('appt-3', '2025-01-21', '09:00'),
            ];

            (mockRepository.listAgendaByDateRange as jest.Mock).mockResolvedValue(appointments);

            const result = await useCase.listAgenda('nutri-1');

            expect(result).toHaveLength(2); // 2 datas diferentes
            expect(result[0].date).toBe('2025-01-20');
            expect(result[0].appointments).toHaveLength(2);
            expect(result[1].date).toBe('2025-01-21');
            expect(result[1].appointments).toHaveLength(1);
        });

        it('should return empty array when no accepted appointments', async () => {
            (mockRepository.listAgendaByDateRange as jest.Mock).mockResolvedValue([]);

            const result = await useCase.listAgenda('nutri-1');

            expect(result).toHaveLength(0);
        });

        it('should sort appointments by time within each date', async () => {
            const appointments = [
                createMockAppointment('appt-1', '2025-01-20', '14:00'),
                createMockAppointment('appt-2', '2025-01-20', '09:00'),
                createMockAppointment('appt-3', '2025-01-20', '11:00'),
            ];

            (mockRepository.listAgendaByDateRange as jest.Mock).mockResolvedValue(appointments);

            const result = await useCase.listAgenda('nutri-1');

            expect(result[0].appointments[0].timeStart).toBe('09:00');
            expect(result[0].appointments[1].timeStart).toBe('11:00');
            expect(result[0].appointments[2].timeStart).toBe('14:00');
        });

        it('should sort dates in ascending order', async () => {
            const appointments = [
                createMockAppointment('appt-1', '2025-01-25', '09:00'),
                createMockAppointment('appt-2', '2025-01-20', '09:00'),
                createMockAppointment('appt-3', '2025-01-22', '09:00'),
            ];

            (mockRepository.listAgendaByDateRange as jest.Mock).mockResolvedValue(appointments);

            const result = await useCase.listAgenda('nutri-1');

            expect(result[0].date).toBe('2025-01-20');
            expect(result[1].date).toBe('2025-01-22');
            expect(result[2].date).toBe('2025-01-25');
        });

        it('should use custom date range when provided', async () => {
            (mockRepository.listAgendaByDateRange as jest.Mock).mockResolvedValue([]);

            const startDate = new Date(2025, 0, 15);
            const endDate = new Date(2025, 0, 20);

            await useCase.listAgenda('nutri-1', startDate, endDate);

            expect(mockRepository.listAgendaByDateRange).toHaveBeenCalledWith(
                '2025-01-15',
                '2025-01-20',
                'nutri-1'
            );
        });
    });

    describe('listAcceptedByDate', () => {
        it('should return accepted and cancelled appointments for specific date', async () => {
            const appointments = [
                createMockAppointment('appt-1', '2025-01-20', '09:00', 'accepted'),
                createMockAppointment('appt-2', '2025-01-20', '11:00', 'pending'),
                createMockAppointment('appt-3', '2025-01-20', '14:00', 'accepted'),
                createMockAppointment('appt-4', '2025-01-20', '15:00', 'cancelled'),
            ];

            (mockRepository.listByDate as jest.Mock).mockResolvedValue(appointments);

            const result = await useCase.listAcceptedByDate('nutri-1', new Date(2025, 0, 20, 12, 0, 0));

            expect(result).toHaveLength(3);
            expect(result.every((appt: Appointment) => appt.status === 'accepted' || appt.status === 'cancelled')).toBe(true);
        });

        it('should sort appointments by time', async () => {
            const appointments = [
                createMockAppointment('appt-1', '2025-01-20', '14:00', 'accepted'),
                createMockAppointment('appt-2', '2025-01-20', '09:00', 'accepted'),
            ];

            (mockRepository.listByDate as jest.Mock).mockResolvedValue(appointments);

            const result = await useCase.listAcceptedByDate('nutri-1', new Date(2025, 0, 20));

            expect(result[0].timeStart).toBe('09:00');
            expect(result[1].timeStart).toBe('14:00');
        });

        it('should return empty array when no accepted or cancelled appointments on date', async () => {
            const appointments = [
                createMockAppointment('appt-1', '2025-01-20', '09:00', 'pending'),
            ];

            (mockRepository.listByDate as jest.Mock).mockResolvedValue(appointments);

            const result = await useCase.listAcceptedByDate('nutri-1', new Date(2025, 0, 20));

            expect(result).toHaveLength(0);
        });
    });
});
