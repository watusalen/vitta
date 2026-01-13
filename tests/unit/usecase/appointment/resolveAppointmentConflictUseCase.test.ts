import ResolveAppointmentConflictUseCase from '@/usecase/appointment/status/resolveAppointmentConflictUseCase';
import { IAppointmentRepository } from '@/model/repositories/iAppointmentRepository';
import Appointment from '@/model/entities/appointment';
import ValidationError from '@/model/errors/validationError';

const createMockRepository = (): jest.Mocked<IAppointmentRepository> => ({
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
});

const createAppointment = (
    id: string,
    status: Appointment['status'] = 'cancelled',
    date: string = '2025-12-17',
    timeStart: string = '09:00',
    timeEnd: string = '11:00'
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

describe('Resolve Appointment Conflict Use Case', () => {
    it('deve lançar erro quando id é vazio', async () => {
        const repo = createMockRepository();
        const useCase = new ResolveAppointmentConflictUseCase(repo);

        await expect(useCase.resolveConflict('')).rejects.toThrow(ValidationError);
    });

    it('deve lançar erro quando consulta não existe', async () => {
        const repo = createMockRepository();
        repo.getById.mockResolvedValueOnce(null);
        const useCase = new ResolveAppointmentConflictUseCase(repo);

        await expect(useCase.resolveConflict('non-existent')).rejects.toThrow('Consulta não encontrada.');
    });

    it('deve lançar erro quando status não é cancelado ou aceito', async () => {
        const repo = createMockRepository();
        const appointment = createAppointment('appt-1', 'pending');
        repo.getById.mockResolvedValueOnce(appointment);
        const useCase = new ResolveAppointmentConflictUseCase(repo);

        await expect(useCase.resolveConflict('appt-1')).rejects.toThrow(
            'Apenas consultas canceladas ou aceitas podem ser reativadas.'
        );
    });

    it('deve cancelar appointments aceitos no mesmo horário', async () => {
        const repo = createMockRepository();
        const cancelled = createAppointment('appt-1', 'cancelled');
        const accepted1 = createAppointment('appt-2', 'accepted');
        const accepted2 = createAppointment('appt-3', 'accepted');

        repo.getById
            .mockResolvedValueOnce(cancelled)
            .mockResolvedValueOnce(cancelled);
        repo.listByDate.mockResolvedValueOnce([cancelled, accepted1, accepted2]);
        repo.updateStatus.mockResolvedValue(undefined);

        const useCase = new ResolveAppointmentConflictUseCase(repo);
        const result = await useCase.resolveConflict('appt-1');

        expect(repo.updateStatus).toHaveBeenCalledWith('appt-1', 'accepted');
        expect(repo.updateStatus).toHaveBeenCalledWith('appt-2', 'cancelled');
        expect(repo.updateStatus).toHaveBeenCalledWith('appt-3', 'cancelled');
        expect(result).toEqual(cancelled);
    });

    it('deve reativar consulta cancelada para accepted', async () => {
        const repo = createMockRepository();
        const cancelled = createAppointment('appt-1', 'cancelled');
        const reactivated = { ...cancelled, status: 'accepted' as const };

        repo.getById
            .mockResolvedValueOnce(cancelled)
            .mockResolvedValueOnce(reactivated);
        repo.listByDate.mockResolvedValueOnce([cancelled]);
        repo.updateStatus.mockResolvedValue(undefined);

        const useCase = new ResolveAppointmentConflictUseCase(repo);
        const result = await useCase.resolveConflict('appt-1');

        expect(repo.updateStatus).toHaveBeenCalledWith('appt-1', 'accepted');
        expect(result.status).toBe('accepted');
    });

    it('deve manter appointment aceito se já estava aceito', async () => {
        const repo = createMockRepository();
        const accepted = createAppointment('appt-1', 'accepted');

        repo.getById
            .mockResolvedValueOnce(accepted)
            .mockResolvedValueOnce(accepted);
        repo.listByDate.mockResolvedValueOnce([accepted]);
        repo.updateStatus.mockResolvedValue(undefined);

        const useCase = new ResolveAppointmentConflictUseCase(repo);
        const result = await useCase.resolveConflict('appt-1');

        expect(repo.updateStatus).not.toHaveBeenCalled();
        expect(result).toEqual(accepted);
    });

    it('deve ignorar appointments com diferentes horários', async () => {
        const repo = createMockRepository();
        const cancelled = createAppointment('appt-1', 'cancelled', '2025-12-17', '09:00', '11:00');
        const differentTime = createAppointment('appt-2', 'accepted', '2025-12-17', '13:00', '15:00');

        repo.getById
            .mockResolvedValueOnce(cancelled)
            .mockResolvedValueOnce(cancelled);
        repo.listByDate.mockResolvedValueOnce([cancelled, differentTime]);
        repo.updateStatus.mockResolvedValue(undefined);

        const useCase = new ResolveAppointmentConflictUseCase(repo);
        const result = await useCase.resolveConflict('appt-1');

        expect(repo.updateStatus).toHaveBeenCalledWith('appt-1', 'accepted');
        expect(repo.updateStatus).not.toHaveBeenCalledWith('appt-2', 'cancelled');
        expect(result).toEqual(cancelled);
    });

    it('deve ignorar appointments com status pendente ou rejeitado', async () => {
        const repo = createMockRepository();
        const cancelled = createAppointment('appt-1', 'cancelled');
        const pending = createAppointment('appt-2', 'pending');
        const rejected = createAppointment('appt-3', 'rejected');

        repo.getById
            .mockResolvedValueOnce(cancelled)
            .mockResolvedValueOnce(cancelled);
        repo.listByDate.mockResolvedValueOnce([cancelled, pending, rejected]);
        repo.updateStatus.mockResolvedValue(undefined);

        const useCase = new ResolveAppointmentConflictUseCase(repo);
        const result = await useCase.resolveConflict('appt-1');

        expect(repo.updateStatus).toHaveBeenCalledWith('appt-1', 'accepted');
        expect(repo.updateStatus).not.toHaveBeenCalledWith('appt-2', 'cancelled');
        expect(repo.updateStatus).not.toHaveBeenCalledWith('appt-3', 'cancelled');
    });

    it('deve resolver múltiplos conflitos em paralelo', async () => {
        const repo = createMockRepository();
        const cancelled = createAppointment('appt-1', 'cancelled');
        const accepted1 = createAppointment('appt-2', 'accepted');
        const accepted2 = createAppointment('appt-3', 'accepted');
        const accepted3 = createAppointment('appt-4', 'accepted');

        repo.getById
            .mockResolvedValueOnce(cancelled)
            .mockResolvedValueOnce(cancelled);
        repo.listByDate.mockResolvedValueOnce([cancelled, accepted1, accepted2, accepted3]);
        repo.updateStatus.mockResolvedValue(undefined);

        const useCase = new ResolveAppointmentConflictUseCase(repo);
        await useCase.resolveConflict('appt-1');

        expect(repo.updateStatus).toHaveBeenCalledTimes(4);
        expect(repo.updateStatus).toHaveBeenCalledWith('appt-1', 'accepted');
        expect(repo.updateStatus).toHaveBeenCalledWith('appt-2', 'cancelled');
        expect(repo.updateStatus).toHaveBeenCalledWith('appt-3', 'cancelled');
        expect(repo.updateStatus).toHaveBeenCalledWith('appt-4', 'cancelled');
    });
});
