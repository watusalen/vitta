import { makeAppointment } from '../../../../src/model/factories/makeAppointment';
import Appointment from '../../../../src/model/entities/appointment';

describe('Factory makeAppointment', () => {
    const validInput = {
        patientId: 'patient-123',
        nutritionistId: 'nutri-1',
        date: '2025-12-20',
        timeStart: '09:00',
        timeEnd: '11:00',
    };

    describe('Criação Básica', () => {
        it('deve criar an Appointment with all required fields', () => {
            const appointment = makeAppointment(validInput);

            expect(appointment.patientId).toBe('patient-123');
            expect(appointment.nutritionistId).toBe('nutri-1');
            expect(appointment.date).toBe('2025-12-20');
            expect(appointment.timeStart).toBe('09:00');
            expect(appointment.timeEnd).toBe('11:00');
        });

        it('deve gerar a id único quando não informado', () => {
            const appointment1 = makeAppointment(validInput);
            const appointment2 = makeAppointment(validInput);

            expect(appointment1.id).toBeDefined();
            expect(appointment2.id).toBeDefined();
            expect(appointment1.id).not.toBe(appointment2.id);
        });

        it('deve usar id informado quando fornecido', () => {
            const appointment = makeAppointment({
                ...validInput,
                id: 'custom-id-123',
            });

            expect(appointment.id).toBe('custom-id-123');
        });

        it('deve padronizar status to pending', () => {
            const appointment = makeAppointment(validInput);

            expect(appointment.status).toBe('pending');
        });

        it('deve usar status informado quando fornecido', () => {
            const appointment = makeAppointment({
                ...validInput,
                status: 'accepted',
            });

            expect(appointment.status).toBe('accepted');
        });

        it('deve definir createdAt and updatedAt to current time', () => {
            const before = new Date();
            const appointment = makeAppointment(validInput);
            const after = new Date();

            expect(appointment.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
            expect(appointment.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
            expect(appointment.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
            expect(appointment.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
        });

        it('deve ter same createdAt and updatedAt on creation', () => {
            const appointment = makeAppointment(validInput);

            expect(appointment.createdAt).toEqual(appointment.updatedAt);
        });
    });

    describe('Status Types', () => {
        it('deve aceitar pending status', () => {
            const appointment = makeAppointment({
                ...validInput,
                status: 'pending',
            });

            expect(appointment.status).toBe('pending');
        });

        it('deve aceitar accepted status', () => {
            const appointment = makeAppointment({
                ...validInput,
                status: 'accepted',
            });

            expect(appointment.status).toBe('accepted');
        });

        it('deve aceitar rejected status', () => {
            const appointment = makeAppointment({
                ...validInput,
                status: 'rejected',
            });

            expect(appointment.status).toBe('rejected');
        });

        it('deve aceitar cancelled status', () => {
            const appointment = makeAppointment({
                ...validInput,
                status: 'cancelled',
            });

            expect(appointment.status).toBe('cancelled');
        });
    });

    describe('Conformidade de Tipos', () => {
        it('deve retornar a valid Appointment interface', () => {
            const appointment: Appointment = makeAppointment(validInput);

            expect(appointment).toHaveProperty('id');
            expect(appointment).toHaveProperty('patientId');
            expect(appointment).toHaveProperty('nutritionistId');
            expect(appointment).toHaveProperty('date');
            expect(appointment).toHaveProperty('timeStart');
            expect(appointment).toHaveProperty('timeEnd');
            expect(appointment).toHaveProperty('status');
            expect(appointment).toHaveProperty('createdAt');
            expect(appointment).toHaveProperty('updatedAt');
        });
    });

    describe('Integridade de Dados', () => {
        it('deve preserve date format', () => {
            const appointment = makeAppointment({
                ...validInput,
                date: '2025-01-01',
            });

            expect(appointment.date).toBe('2025-01-01');
        });

        it('deve preserve time format', () => {
            const appointment = makeAppointment({
                ...validInput,
                timeStart: '14:30',
                timeEnd: '16:30',
            });

            expect(appointment.timeStart).toBe('14:30');
            expect(appointment.timeEnd).toBe('16:30');
        });

        it('deve tratar different time slots', () => {
            const slots = [
                { timeStart: '09:00', timeEnd: '11:00' },
                { timeStart: '11:00', timeEnd: '13:00' },
                { timeStart: '13:00', timeEnd: '15:00' },
                { timeStart: '14:00', timeEnd: '16:00' },
            ];

            slots.forEach(slot => {
                const appointment = makeAppointment({
                    ...validInput,
                    ...slot,
                });

                expect(appointment.timeStart).toBe(slot.timeStart);
                expect(appointment.timeEnd).toBe(slot.timeEnd);
            });
        });
    });
});
