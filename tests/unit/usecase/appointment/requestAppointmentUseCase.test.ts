import RequestAppointmentUseCase from '../../../../src/usecase/appointment/request/requestAppointmentUseCase';
import { IAppointmentRepository } from '../../../../src/model/repositories/iAppointmentRepository';
import Appointment from '../../../../src/model/entities/appointment';
import ValidationError from '../../../../src/model/errors/validationError';

// Mock do repositório
const createMockRepository = (
    existingAppointments: Appointment[] = [],
    patientAppointments: Appointment[] = []
): IAppointmentRepository => ({
    create: jest.fn(),
    getById: jest.fn(),
    listByPatient: jest.fn().mockResolvedValue(patientAppointments),
    listByDate: jest.fn().mockResolvedValue(existingAppointments),
    listByStatus: jest.fn(),
    listAcceptedByDateRange: jest.fn(),
    listAgendaByDateRange: jest.fn(),
    updateStatus: jest.fn(),
    updateCalendarEventIds: jest.fn(),
    onPatientAppointmentsChange: jest.fn(() => () => {}),
    onNutritionistPendingChange: jest.fn(() => () => {}),
    onNutritionistAppointmentsChange: jest.fn(() => () => {}),
});

// Helper para criar datas locais
const createLocalDate = (year: number, month: number, day: number): Date => {
    return new Date(year, month - 1, day, 12, 0, 0);
};

// Helper para criar uma data futura
const createFutureWeekday = (): Date => {
    const date = new Date();
    date.setDate(date.getDate() + 7); // 1 semana no futuro
    // Garantir que é dia útil
    while (date.getDay() === 0 || date.getDay() === 6) {
        date.setDate(date.getDate() + 1);
    }
    return date;
};

// Helper para criar appointment mock
const createMockAppointment = (
    date: string,
    timeStart: string,
    timeEnd: string,
    status: 'pending' | 'accepted' | 'rejected' | 'cancelled' = 'accepted'
): Appointment => ({
    id: `appt-${Date.now()}`,
    patientId: 'patient-1',
    nutritionistId: 'nutri-1',
    date,
    timeStart,
    timeEnd,
    status,
    createdAt: new Date(),
    updatedAt: new Date(),
});

describe('RequestAppointmentUseCase', () => {
    const validInput = {
        patientId: 'patient-123',
        nutritionistId: 'nutri-1',
        date: createFutureWeekday(),
        timeStart: '09:00',
        timeEnd: '11:00',
    };

    describe('Successful Request', () => {
        it('should create appointment with status pending', async () => {
            const mockRepo = createMockRepository([]);
            const useCase = new RequestAppointmentUseCase(mockRepo);

            const appointment = await useCase.requestAppointment(validInput);

            expect(appointment.status).toBe('pending');
        });

        it('should create appointment with correct patient and nutritionist', async () => {
            const mockRepo = createMockRepository([]);
            const useCase = new RequestAppointmentUseCase(mockRepo);

            const appointment = await useCase.requestAppointment(validInput);

            expect(appointment.patientId).toBe('patient-123');
            expect(appointment.nutritionistId).toBe('nutri-1');
        });

        it('should create appointment with correct time slot', async () => {
            const mockRepo = createMockRepository([]);
            const useCase = new RequestAppointmentUseCase(mockRepo);

            const appointment = await useCase.requestAppointment(validInput);

            expect(appointment.timeStart).toBe('09:00');
            expect(appointment.timeEnd).toBe('11:00');
        });

        it('should call repository.create with appointment', async () => {
            const mockRepo = createMockRepository([]);
            const useCase = new RequestAppointmentUseCase(mockRepo);

            const appointment = await useCase.requestAppointment(validInput);

            expect(mockRepo.create).toHaveBeenCalledTimes(1);
            expect(mockRepo.create).toHaveBeenCalledWith(appointment);
        });

        it('should generate unique id for appointment', async () => {
            const mockRepo = createMockRepository([]);
            const useCase = new RequestAppointmentUseCase(mockRepo);

            const appointment = await useCase.requestAppointment(validInput);

            expect(appointment.id).toBeDefined();
            expect(appointment.id.length).toBeGreaterThan(0);
        });

        it('should set createdAt and updatedAt', async () => {
            const mockRepo = createMockRepository([]);
            const useCase = new RequestAppointmentUseCase(mockRepo);

            const before = new Date();
            const appointment = await useCase.requestAppointment(validInput);
            const after = new Date();

            expect(appointment.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
            expect(appointment.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
        });
    });

    describe('Date Validation', () => {
        it('should throw ValidationError for Saturday', async () => {
            const mockRepo = createMockRepository([]);
            const useCase = new RequestAppointmentUseCase(mockRepo);

            // Saturday 2025-12-20
            const saturday = createLocalDate(2025, 12, 20);

            await expect(
                useCase.requestAppointment({ ...validInput, date: saturday })
            ).rejects.toThrow(ValidationError);

            await expect(
                useCase.requestAppointment({ ...validInput, date: saturday })
            ).rejects.toThrow('Consultas só podem ser agendadas de segunda a sexta-feira.');
        });

        it('should throw ValidationError for Sunday', async () => {
            const mockRepo = createMockRepository([]);
            const useCase = new RequestAppointmentUseCase(mockRepo);

            // Sunday 2025-12-21
            const sunday = createLocalDate(2025, 12, 21);

            await expect(
                useCase.requestAppointment({ ...validInput, date: sunday })
            ).rejects.toThrow(ValidationError);
        });

        it('should throw ValidationError for past date', async () => {
            const mockRepo = createMockRepository([]);
            const useCase = new RequestAppointmentUseCase(mockRepo);

            // Past date (1 week ago)
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - 7);
            // Ensure weekday
            while (pastDate.getDay() === 0 || pastDate.getDay() === 6) {
                pastDate.setDate(pastDate.getDate() - 1);
            }

            await expect(
                useCase.requestAppointment({ ...validInput, date: pastDate })
            ).rejects.toThrow('Não é possível agendar consultas em datas passadas.');
        });

        it('should accept today if it is a weekday', async () => {
            const mockRepo = createMockRepository([]);
            const useCase = new RequestAppointmentUseCase(mockRepo);

            const today = new Date();
            const isWeekday = today.getDay() !== 0 && today.getDay() !== 6;

            if (isWeekday) {
                jest.useFakeTimers();
                jest.setSystemTime(new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    today.getDate(),
                    8,
                    0,
                    0
                ));

                try {
                    const appointment = await useCase.requestAppointment({ ...validInput, date: today });
                    expect(appointment).toBeDefined();
                } finally {
                    jest.useRealTimers();
                }
            } else {
                await expect(
                    useCase.requestAppointment({ ...validInput, date: today })
                ).rejects.toThrow(ValidationError);
            }
        });
    });

    describe('Time Slot Validation', () => {
        it('should throw ValidationError for invalid time slot', async () => {
            const mockRepo = createMockRepository([]);
            const useCase = new RequestAppointmentUseCase(mockRepo);

            await expect(
                useCase.requestAppointment({
                    ...validInput,
                    timeStart: '10:00',
                    timeEnd: '12:00',
                })
            ).rejects.toThrow('Horário selecionado não está disponível.');
        });

        it('should accept valid time slot 09:00-11:00', async () => {
            const mockRepo = createMockRepository([]);
            const useCase = new RequestAppointmentUseCase(mockRepo);

            const appointment = await useCase.requestAppointment({
                ...validInput,
                timeStart: '09:00',
                timeEnd: '11:00',
            });

            expect(appointment.timeStart).toBe('09:00');
        });

        it('should accept valid time slot 11:00-13:00', async () => {
            const mockRepo = createMockRepository([]);
            const useCase = new RequestAppointmentUseCase(mockRepo);

            const appointment = await useCase.requestAppointment({
                ...validInput,
                timeStart: '11:00',
                timeEnd: '13:00',
            });

            expect(appointment.timeStart).toBe('11:00');
        });

        it('should accept valid time slot 13:00-15:00', async () => {
            const mockRepo = createMockRepository([]);
            const useCase = new RequestAppointmentUseCase(mockRepo);

            const appointment = await useCase.requestAppointment({
                ...validInput,
                timeStart: '13:00',
                timeEnd: '15:00',
            });

            expect(appointment.timeStart).toBe('13:00');
        });

        it('should accept valid time slot 14:00-16:00', async () => {
            const mockRepo = createMockRepository([]);
            const useCase = new RequestAppointmentUseCase(mockRepo);

            const appointment = await useCase.requestAppointment({
                ...validInput,
                timeStart: '14:00',
                timeEnd: '16:00',
            });

            expect(appointment.timeStart).toBe('14:00');
        });
    });

    describe('Slot Conflict Validation', () => {
        it('should throw ValidationError when slot is occupied by accepted appointment', async () => {
            const futureDate = createFutureWeekday();
            const dateStr = futureDate.toISOString().split('T')[0];

            const existingAppointments = [
                createMockAppointment(dateStr, '09:00', '11:00', 'accepted'),
            ];
            const mockRepo = createMockRepository(existingAppointments);
            const useCase = new RequestAppointmentUseCase(mockRepo);

            await expect(
                useCase.requestAppointment({
                    ...validInput,
                    date: futureDate,
                    timeStart: '09:00',
                    timeEnd: '11:00',
                })
            ).rejects.toThrow('Este horário já está ocupado. Por favor, escolha outro.');
        });

        it('should throw ValidationError when slot has pending appointment', async () => {
            const futureDate = createFutureWeekday();
            const dateStr = futureDate.toISOString().split('T')[0];

            const existingAppointments = [
                createMockAppointment(dateStr, '09:00', '11:00', 'pending'),
            ];
            const mockRepo = createMockRepository(existingAppointments);
            const useCase = new RequestAppointmentUseCase(mockRepo);

            await expect(
                useCase.requestAppointment({
                    ...validInput,
                    date: futureDate,
                    timeStart: '09:00',
                    timeEnd: '11:00',
                })
            ).rejects.toThrow('Este horário já está ocupado. Por favor, escolha outro.');
        });

        it('should allow booking when slot has rejected appointment', async () => {
            const futureDate = createFutureWeekday();
            const dateStr = futureDate.toISOString().split('T')[0];

            const existingAppointments = [
                createMockAppointment(dateStr, '09:00', '11:00', 'rejected'),
            ];
            const mockRepo = createMockRepository(existingAppointments);
            const useCase = new RequestAppointmentUseCase(mockRepo);

            const appointment = await useCase.requestAppointment({
                ...validInput,
                date: futureDate,
                timeStart: '09:00',
                timeEnd: '11:00',
            });

            expect(appointment).toBeDefined();
        });

        it('should allow booking when slot has cancelled appointment', async () => {
            const futureDate = createFutureWeekday();
            const dateStr = futureDate.toISOString().split('T')[0];

            const existingAppointments = [
                createMockAppointment(dateStr, '09:00', '11:00', 'cancelled'),
            ];
            const mockRepo = createMockRepository(existingAppointments);
            const useCase = new RequestAppointmentUseCase(mockRepo);

            const appointment = await useCase.requestAppointment({
                ...validInput,
                date: futureDate,
                timeStart: '09:00',
                timeEnd: '11:00',
            });

            expect(appointment).toBeDefined();
        });

        it('should allow booking different slot when one is occupied', async () => {
            const futureDate = createFutureWeekday();
            const dateStr = futureDate.toISOString().split('T')[0];

            const existingAppointments = [
                createMockAppointment(dateStr, '09:00', '11:00', 'accepted'),
            ];
            const mockRepo = createMockRepository(existingAppointments);
            const useCase = new RequestAppointmentUseCase(mockRepo);

            const appointment = await useCase.requestAppointment({
                ...validInput,
                date: futureDate,
                timeStart: '11:00',
                timeEnd: '13:00',
            });

            expect(appointment.timeStart).toBe('11:00');
        });
    });

    describe('Patient Duplicate Request Validation', () => {
        it('should throw ValidationError when patient has pending request for same slot', async () => {
            const futureDate = createFutureWeekday();
            const dateStr = futureDate.toISOString().split('T')[0];

            const patientPendingAppointment: Appointment = {
                id: 'appt-existing',
                patientId: 'patient-123',
                nutritionistId: 'nutri-1',
                date: dateStr,
                timeStart: '09:00',
                timeEnd: '11:00',
                status: 'pending',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const mockRepo = createMockRepository([], [patientPendingAppointment]);
            const useCase = new RequestAppointmentUseCase(mockRepo);

            await expect(
                useCase.requestAppointment({
                    ...validInput,
                    date: futureDate,
                    timeStart: '09:00',
                    timeEnd: '11:00',
                })
            ).rejects.toThrow(ValidationError);
            await expect(
                useCase.requestAppointment({
                    ...validInput,
                    date: futureDate,
                    timeStart: '09:00',
                    timeEnd: '11:00',
                })
            ).rejects.toThrow('Você já tem uma solicitação registrada para este horário.');
        });

        it('should allow request when patient has pending request for different slot', async () => {
            const futureDate = createFutureWeekday();
            const dateStr = futureDate.toISOString().split('T')[0];

            const patientPendingAppointment: Appointment = {
                id: 'appt-existing',
                patientId: 'patient-123',
                nutritionistId: 'nutri-1',
                date: dateStr,
                timeStart: '11:00',
                timeEnd: '13:00',
                status: 'pending',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const mockRepo = createMockRepository([], [patientPendingAppointment]);
            const useCase = new RequestAppointmentUseCase(mockRepo);

            const appointment = await useCase.requestAppointment({
                ...validInput,
                date: futureDate,
                timeStart: '09:00',
                timeEnd: '11:00',
            });

            expect(appointment).toBeDefined();
            expect(appointment.status).toBe('pending');
        });

        it('should allow request when patient has pending request for different date', async () => {
            const futureDate = createFutureWeekday();
            const differentDate = new Date(futureDate);
            differentDate.setDate(differentDate.getDate() + 1);
            while (differentDate.getDay() === 0 || differentDate.getDay() === 6) {
                differentDate.setDate(differentDate.getDate() + 1);
            }
            const differentDateStr = differentDate.toISOString().split('T')[0];

            const patientPendingAppointment: Appointment = {
                id: 'appt-existing',
                patientId: 'patient-123',
                nutritionistId: 'nutri-1',
                date: differentDateStr,
                timeStart: '09:00',
                timeEnd: '11:00',
                status: 'pending',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const mockRepo = createMockRepository([], [patientPendingAppointment]);
            const useCase = new RequestAppointmentUseCase(mockRepo);

            const appointment = await useCase.requestAppointment({
                ...validInput,
                date: futureDate,
                timeStart: '09:00',
                timeEnd: '11:00',
            });

            expect(appointment).toBeDefined();
        });

        it('should allow request when patient has cancelled request for same slot', async () => {
            const futureDate = createFutureWeekday();
            const dateStr = futureDate.toISOString().split('T')[0];

            const patientCancelledAppointment: Appointment = {
                id: 'appt-cancelled',
                patientId: 'patient-123',
                nutritionistId: 'nutri-1',
                date: dateStr,
                timeStart: '09:00',
                timeEnd: '11:00',
                status: 'cancelled',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const mockRepo = createMockRepository([], [patientCancelledAppointment]);
            const useCase = new RequestAppointmentUseCase(mockRepo);

            const appointment = await useCase.requestAppointment({
                ...validInput,
                date: futureDate,
                timeStart: '09:00',
                timeEnd: '11:00',
            });

            expect(appointment).toBeDefined();
            expect(appointment.status).toBe('pending');
        });
    });
});
