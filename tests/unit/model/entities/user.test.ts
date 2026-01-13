import User from '../../../../src/model/entities/user';

describe('Entidade User Interface', () => {
  describe('Structure', () => {
    it('deve ter required properties', () => {
      const user: User = {
        id: 'user-1',
        name: 'João Silva',
        email: 'joao@example.com',
        role: 'patient',
        createdAt: new Date(),
      };

      expect(user.id).toBe('user-1');
      expect(user.name).toBe('João Silva');
      expect(user.email).toBe('joao@example.com');
      expect(user.role).toBe('patient');
      expect(user.createdAt).toBeDefined();
    });

    it('deve suportar nutritionist role', () => {
      const user: User = {
        id: 'nutri-1',
        name: 'Dra. Maria',
        email: 'maria@example.com',
        role: 'nutritionist',
        createdAt: new Date(),
      };

      expect(user.role).toBe('nutritionist');
    });

    it('deve suportar patient role', () => {
      const user: User = {
        id: 'patient-1',
        name: 'João',
        email: 'joao@example.com',
        role: 'patient',
        createdAt: new Date(),
      };

      expect(user.role).toBe('patient');
    });
  });

  describe('Type Safety', () => {
    it('deve apenas accept valid roles', () => {
      const roles: ('patient' | 'nutritionist')[] = ['patient', 'nutritionist'];
      
      roles.forEach((role) => {
        const user: User = {
          id: `user-${role}`,
          name: 'Test',
          email: 'test@example.com',
          role,
          createdAt: new Date(),
        };
        expect(user.role).toBe(role);
      });
    });

    it('deve ter required fields', () => {
      const user: User = {
        id: 'user-1',
        name: 'João',
        email: 'joao@example.com',
        role: 'patient',
        createdAt: new Date(),
      };

      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('role');
      expect(user).toHaveProperty('createdAt');
    });
  });
});
