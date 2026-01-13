import CasoDeUsoListarConsultasPendentes from '@/usecase/appointment/list/listPendingAppointmentsUseCase';
import { IListPendingAppointmentsUseCase } from '@/usecase/appointment/list/iListPendingAppointmentsUseCase';
import { IAppointmentRepository } from '@/model/repositories/iAppointmentRepository';
import Appointment from '@/model/entities/appointment';

const createMockAppointment = (
    id: string,
    date: string,
    timeStart: string,
    status: 'pending' | 'accepted' | 'rejected' | 'cancelled' = 'pending'
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

describe('Caso de Uso: Listar Consultas Pendentes', () => {
    let mockRepository: IAppointmentRepository;
    let useCase: IListPendingAppointmentsUseCase;

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

        useCase = new CasoDeUsoListarConsultasPendentes(mockRepository);
    });

    describe('listPendingByNutritionist', () => {
        it('deve retornar pending appointments for nutritionist', async () => {
            const pendingAppointments = [
                createMockAppointment('appt-1', '2025-01-20', '09:00'),
                createMockAppointment('appt-2', '2025-01-21', '11:00'),
            ];

            (mockRepository.listByStatus as jest.Mock).mockResolvedValue(pendingAppointments);

            const result = await useCase.listPendingByNutritionist('nutri-1');

            expect(mockRepository.listByStatus).toHaveBeenCalledWith('pending', 'nutri-1');
            expect(result).toHaveLength(2);
        });

        it('deve retornar array vazio quando não há consultas pendentes', async () => {
            (mockRepository.listByStatus as jest.Mock).mockResolvedValue([]);

            const result = await useCase.listPendingByNutritionist('nutri-1');

            expect(result).toHaveLength(0);
        });

        it('deve ordenar appointments by date ascending', async () => {
            const pendingAppointments = [
                createMockAppointment('appt-1', '2025-01-25', '09:00'),
                createMockAppointment('appt-2', '2025-01-20', '09:00'),
                createMockAppointment('appt-3', '2025-01-22', '09:00'),
            ];

            (mockRepository.listByStatus as jest.Mock).mockResolvedValue(pendingAppointments);

            const result = await useCase.listPendingByNutritionist('nutri-1');

            expect(result[0].date).toBe('2025-01-20');
            expect(result[1].date).toBe('2025-01-22');
            expect(result[2].date).toBe('2025-01-25');
        });

        it('deve ordenar por horário quando as datas são iguais', async () => {
            const pendingAppointments = [
                createMockAppointment('appt-1', '2025-01-20', '14:00'),
                createMockAppointment('appt-2', '2025-01-20', '09:00'),
                createMockAppointment('appt-3', '2025-01-20', '11:00'),
            ];

            (mockRepository.listByStatus as jest.Mock).mockResolvedValue(pendingAppointments);

            const result = await useCase.listPendingByNutritionist('nutri-1');

            expect(result[0].timeStart).toBe('09:00');
            expect(result[1].timeStart).toBe('11:00');
            expect(result[2].timeStart).toBe('14:00');
        });
    });
});
