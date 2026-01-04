import ListPatientAppointmentsUseCase from '../../../../src/usecase/appointment/list/listPatientAppointmentsUseCase';
import { IAppointmentRepository } from '../../../../src/model/repositories/iAppointmentRepository';
import Appointment from '../../../../src/model/entities/appointment';

// Helper para criar appointment mock
const createMockAppointment = (
    id: string,
    date: string,
    status: 'pending' | 'accepted' | 'rejected' | 'cancelled' = 'pending'
): Appointment => ({
    id,
    patientId: 'patient-1',
    nutritionistId: 'nutri-1',
    date,
    timeStart: '09:00',
    timeEnd: '11:00',
    status,
    createdAt: new Date(),
    updatedAt: new Date(),
});

// Mock do repositório
const createMockRepository = (appointments: Appointment[] = []): IAppointmentRepository => ({
    create: jest.fn(),
    getById: jest.fn(),
    listByPatient: jest.fn().mockResolvedValue(appointments),
    listByDate: jest.fn(),
    listByStatus: jest.fn(),
    listAcceptedByDateRange: jest.fn(),
    listAgendaByDateRange: jest.fn(),
    updateStatus: jest.fn(),
    updateCalendarEventIds: jest.fn(),
    onPatientAppointmentsChange: jest.fn((_, callback) => {
        // Simula chamada inicial com os appointments
        callback(appointments);
        return () => {};
    }),
    onNutritionistPendingChange: jest.fn(() => () => {}),
    onNutritionistAppointmentsChange: jest.fn(() => () => {}),
});

describe('ListPatientAppointmentsUseCase', () => {
    const patientId = 'patient-1';

    describe('execute - Basic Functionality', () => {
        it('should return all appointments for a patient', async () => {
            const appointments = [
                createMockAppointment('1', '2025-12-20'),
                createMockAppointment('2', '2025-12-21'),
            ];
            const mockRepo = createMockRepository(appointments);
            const useCase = new ListPatientAppointmentsUseCase(mockRepo);

            const result = await useCase.listByPatient(patientId);

            expect(result).toHaveLength(2);
            expect(mockRepo.listByPatient).toHaveBeenCalledWith(patientId);
        });

        it('should return empty array when patient has no appointments', async () => {
            const mockRepo = createMockRepository([]);
            const useCase = new ListPatientAppointmentsUseCase(mockRepo);

            const result = await useCase.listByPatient(patientId);

            expect(result).toHaveLength(0);
        });
    });

    describe('execute - Status Filter', () => {
        it('should filter by pending status', async () => {
            const appointments = [
                createMockAppointment('1', '2025-12-20', 'pending'),
                createMockAppointment('2', '2025-12-21', 'accepted'),
                createMockAppointment('3', '2025-12-22', 'pending'),
            ];
            const mockRepo = createMockRepository(appointments);
            const useCase = new ListPatientAppointmentsUseCase(mockRepo);

            const result = await useCase.listByPatient(patientId, { status: 'pending' });

            expect(result).toHaveLength(2);
            result.forEach((appt: Appointment) => expect(appt.status).toBe('pending'));
        });

        it('should filter by accepted status', async () => {
            const appointments = [
                createMockAppointment('1', '2025-12-20', 'pending'),
                createMockAppointment('2', '2025-12-21', 'accepted'),
                createMockAppointment('3', '2025-12-22', 'accepted'),
            ];
            const mockRepo = createMockRepository(appointments);
            const useCase = new ListPatientAppointmentsUseCase(mockRepo);

            const result = await useCase.listByPatient(patientId, { status: 'accepted' });

            expect(result).toHaveLength(2);
            result.forEach((appt: Appointment) => expect(appt.status).toBe('accepted'));
        });

        it('should filter by rejected status', async () => {
            const appointments = [
                createMockAppointment('1', '2025-12-20', 'pending'),
                createMockAppointment('2', '2025-12-21', 'rejected'),
            ];
            const mockRepo = createMockRepository(appointments);
            const useCase = new ListPatientAppointmentsUseCase(mockRepo);

            const result = await useCase.listByPatient(patientId, { status: 'rejected' });

            expect(result).toHaveLength(1);
            expect(result[0].status).toBe('rejected');
        });

        it('should filter by cancelled status', async () => {
            const appointments = [
                createMockAppointment('1', '2025-12-20', 'cancelled'),
                createMockAppointment('2', '2025-12-21', 'accepted'),
            ];
            const mockRepo = createMockRepository(appointments);
            const useCase = new ListPatientAppointmentsUseCase(mockRepo);

            const result = await useCase.listByPatient(patientId, { status: 'cancelled' });

            expect(result).toHaveLength(1);
            expect(result[0].status).toBe('cancelled');
        });
    });

    describe('execute - Future Only Filter', () => {
        it('should filter only future appointments', async () => {
            const today = new Date();
            const futureDate = new Date();
            futureDate.setDate(today.getDate() + 7);
            const pastDate = new Date();
            pastDate.setDate(today.getDate() - 7);

            const formatDate = (d: Date) => d.toISOString().split('T')[0];

            const appointments = [
                createMockAppointment('1', formatDate(futureDate), 'pending'),
                createMockAppointment('2', formatDate(pastDate), 'accepted'),
                createMockAppointment('3', formatDate(today), 'pending'), // Today counts as future
            ];
            const mockRepo = createMockRepository(appointments);
            const useCase = new ListPatientAppointmentsUseCase(mockRepo);

            const result = await useCase.listByPatient(patientId, { futureOnly: true });

            expect(result).toHaveLength(2);
            result.forEach((appt: Appointment) => {
                expect(appt.date >= formatDate(today)).toBe(true);
            });
        });

        it('should return all when futureOnly is false', async () => {
            const today = new Date();
            const futureDate = new Date();
            futureDate.setDate(today.getDate() + 7);
            const pastDate = new Date();
            pastDate.setDate(today.getDate() - 7);

            const formatDate = (d: Date) => d.toISOString().split('T')[0];

            const appointments = [
                createMockAppointment('1', formatDate(futureDate), 'pending'),
                createMockAppointment('2', formatDate(pastDate), 'accepted'),
            ];
            const mockRepo = createMockRepository(appointments);
            const useCase = new ListPatientAppointmentsUseCase(mockRepo);

            const result = await useCase.listByPatient(patientId, { futureOnly: false });

            expect(result).toHaveLength(2);
        });
    });

    describe('execute - Combined Filters', () => {
        it('should apply both status and futureOnly filters', async () => {
            const today = new Date();
            const futureDate = new Date();
            futureDate.setDate(today.getDate() + 7);
            const pastDate = new Date();
            pastDate.setDate(today.getDate() - 7);

            const formatDate = (d: Date) => d.toISOString().split('T')[0];

            const appointments = [
                createMockAppointment('1', formatDate(futureDate), 'pending'),
                createMockAppointment('2', formatDate(futureDate), 'accepted'),
                createMockAppointment('3', formatDate(pastDate), 'pending'),
            ];
            const mockRepo = createMockRepository(appointments);
            const useCase = new ListPatientAppointmentsUseCase(mockRepo);

            const result = await useCase.listByPatient(patientId, { 
                status: 'pending', 
                futureOnly: true 
            });

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('1');
        });
    });

    describe('subscribe', () => {
        it('should call repository.onPatientAppointmentsChange', () => {
            const mockRepo = createMockRepository([]);
            const useCase = new ListPatientAppointmentsUseCase(mockRepo);
            const callback = jest.fn();

            useCase.subscribeToPatientAppointments(patientId, callback);

            expect(mockRepo.onPatientAppointmentsChange).toHaveBeenCalledWith(
                patientId,
                callback
            );
        });

        it('should return unsubscribe function', () => {
            const mockUnsubscribe = jest.fn();
            const mockRepo = {
                ...createMockRepository([]),
    updateCalendarEventIds: jest.fn(),
                onPatientAppointmentsChange: jest.fn(() => mockUnsubscribe),
            };
            const useCase = new ListPatientAppointmentsUseCase(mockRepo);
            const callback = jest.fn();

            const unsubscribe = useCase.subscribeToPatientAppointments(patientId, callback);
            unsubscribe();

            expect(mockUnsubscribe).toHaveBeenCalled();
        });
    });
});
