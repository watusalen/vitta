import { makeAppointment } from '../../../../src/model/factories/makeAppointment';
import Appointment from '../../../../src/model/entities/appointment';

describe('makeAppointment Factory', () => {
    const validInput = {
        patientId: 'patient-123',
        nutritionistId: 'nutri-1',
        date: '2025-12-20',
        timeStart: '09:00',
        timeEnd: '11:00',
    };

    describe('Basic Creation', () => {
        it('should create an Appointment with all required fields', () => {
            const appointment = makeAppointment(validInput);

            expect(appointment.patientId).toBe('patient-123');
            expect(appointment.nutritionistId).toBe('nutri-1');
            expect(appointment.date).toBe('2025-12-20');
            expect(appointment.timeStart).toBe('09:00');
            expect(appointment.timeEnd).toBe('11:00');
        });

        it('should generate a unique id when not provided', () => {
            const appointment1 = makeAppointment(validInput);
            const appointment2 = makeAppointment(validInput);

            expect(appointment1.id).toBeDefined();
            expect(appointment2.id).toBeDefined();
            expect(appointment1.id).not.toBe(appointment2.id);
        });

        it('should use provided id when given', () => {
            const appointment = makeAppointment({
                ...validInput,
                id: 'custom-id-123',
            });

            expect(appointment.id).toBe('custom-id-123');
        });

        it('should default status to pending', () => {
            const appointment = makeAppointment(validInput);

            expect(appointment.status).toBe('pending');
        });

        it('should use provided status when given', () => {
            const appointment = makeAppointment({
                ...validInput,
                status: 'accepted',
            });

            expect(appointment.status).toBe('accepted');
        });

        it('should set createdAt and updatedAt to current time', () => {
            const before = new Date();
            const appointment = makeAppointment(validInput);
            const after = new Date();

            expect(appointment.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
            expect(appointment.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
            expect(appointment.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
            expect(appointment.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
        });

        it('should have same createdAt and updatedAt on creation', () => {
            const appointment = makeAppointment(validInput);

            expect(appointment.createdAt).toEqual(appointment.updatedAt);
        });
    });

    describe('Optional Observations', () => {
        it('should include observations when provided', () => {
            const appointment = makeAppointment({
                ...validInput,
                observations: 'Primeira consulta - alergia a glúten',
            });

            expect(appointment.observations).toBe('Primeira consulta - alergia a glúten');
        });

        it('should have undefined observations when not provided', () => {
            const appointment = makeAppointment(validInput);

            expect(appointment.observations).toBeUndefined();
        });

        it('should handle empty string observations', () => {
            const appointment = makeAppointment({
                ...validInput,
                observations: '',
            });

            expect(appointment.observations).toBe('');
        });
    });

    describe('Status Types', () => {
        it('should accept pending status', () => {
            const appointment = makeAppointment({
                ...validInput,
                status: 'pending',
            });

            expect(appointment.status).toBe('pending');
        });

        it('should accept accepted status', () => {
            const appointment = makeAppointment({
                ...validInput,
                status: 'accepted',
            });

            expect(appointment.status).toBe('accepted');
        });

        it('should accept rejected status', () => {
            const appointment = makeAppointment({
                ...validInput,
                status: 'rejected',
            });

            expect(appointment.status).toBe('rejected');
        });

        it('should accept cancelled status', () => {
            const appointment = makeAppointment({
                ...validInput,
                status: 'cancelled',
            });

            expect(appointment.status).toBe('cancelled');
        });
    });

    describe('Type Compliance', () => {
        it('should return a valid Appointment interface', () => {
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

    describe('Data Integrity', () => {
        it('should preserve date format', () => {
            const appointment = makeAppointment({
                ...validInput,
                date: '2025-01-01',
            });

            expect(appointment.date).toBe('2025-01-01');
        });

        it('should preserve time format', () => {
            const appointment = makeAppointment({
                ...validInput,
                timeStart: '14:30',
                timeEnd: '16:30',
            });

            expect(appointment.timeStart).toBe('14:30');
            expect(appointment.timeEnd).toBe('16:30');
        });

        it('should handle different time slots', () => {
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
