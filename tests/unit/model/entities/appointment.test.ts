import Appointment from '../../../../src/model/entities/appointment';

describe('Appointment Entity Interface', () => {
  describe('Structure', () => {
    it('should have required properties', () => {
      const appointment: Appointment = {
        id: 'apt-1',
        patientId: 'patient-1',
        nutritionistId: 'nutri-1',
        date: '2025-12-25',
        timeStart: '14:30',
        timeEnd: '15:30',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(appointment.id).toBe('apt-1');
      expect(appointment.patientId).toBe('patient-1');
      expect(appointment.status).toBe('pending');
    });

    it('should support optional observations', () => {
      const appointment: Appointment = {
        id: 'apt-1',
        patientId: 'patient-1',
        nutritionistId: 'nutri-1',
        date: '2025-12-25',
        timeStart: '14:30',
        timeEnd: '15:30',
        status: 'pending',
        observations: 'Alergia a glúten',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(appointment.observations).toBe('Alergia a glúten');
    });

    it('should support all status types', () => {
      const statuses: ('pending' | 'accepted' | 'rejected' | 'cancelled')[] = [
        'pending',
        'accepted',
        'rejected',
        'cancelled',
      ];

      statuses.forEach((status) => {
        const appointment: Appointment = {
          id: `apt-${status}`,
          patientId: 'p1',
          nutritionistId: 'n1',
          date: '2025-12-25',
          timeStart: '14:30',
          timeEnd: '15:30',
          status,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        expect(appointment.status).toBe(status);
      });
    });
  });

  describe('Type Safety', () => {
    it('should have required fields', () => {
      const appointment: Appointment = {
        id: 'apt-1',
        patientId: 'patient-1',
        nutritionistId: 'nutri-1',
        date: '2025-12-25',
        timeStart: '14:30',
        timeEnd: '15:30',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

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

    it('should track create and update timestamps', () => {
      const now = new Date();
      const appointment: Appointment = {
        id: 'apt-1',
        patientId: 'p1',
        nutritionistId: 'n1',
        date: '2025-12-25',
        timeStart: '14:30',
        timeEnd: '15:30',
        status: 'pending',
        createdAt: now,
        updatedAt: now,
      };

      expect(appointment.createdAt).toEqual(now);
      expect(appointment.updatedAt).toEqual(now);
    });
  });

  describe('Data Validation Examples', () => {
    it('should validate timeStart < timeEnd', () => {
      // Exemplo de validação que deveria ser implementada no serviço
      const appointment: Appointment = {
        id: 'apt-1',
        patientId: 'p1',
        nutritionistId: 'n1',
        date: '2025-12-25',
        timeStart: '14:30',
        timeEnd: '15:30',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const [startHour, startMin] = appointment.timeStart.split(':').map(Number);
      const [endHour, endMin] = appointment.timeEnd.split(':').map(Number);
      const startTime = startHour * 60 + startMin;
      const endTime = endHour * 60 + endMin;

      expect(startTime).toBeLessThan(endTime);
    });

    it('should validate future dates', () => {
      // Exemplo de validação que deveria ser implementada no serviço
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const dateString = futureDate.toISOString().split('T')[0];

      const appointment: Appointment = {
        id: 'apt-1',
        patientId: 'p1',
        nutritionistId: 'n1',
        date: dateString,
        timeStart: '14:30',
        timeEnd: '15:30',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const appointmentDate = new Date(appointment.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      expect(appointmentDate.getTime()).toBeGreaterThanOrEqual(today.getTime());
    });
  });
});
