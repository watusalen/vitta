import ValidadorAuth from '../../../../src/usecase/auth/validator/authValidator';
import ErroValidacao from '../../../../src/model/errors/validationError';

describe('ValidadorAuth', () => {
  describe('validateLogin', () => {
    it('deve validar correct login data', () => {
      expect(() => {
        ValidadorAuth.validateLogin('joao@example.com', 'password123');
      }).not.toThrow();
    });

    it('deve rejeitar empty email', () => {
      expect(() => {
        ValidadorAuth.validateLogin('', 'password123');
      }).toThrow(ErroValidacao);
    });

    it('deve rejeitar whitespace-only email', () => {
      expect(() => {
        ValidadorAuth.validateLogin('   ', 'password123');
      }).toThrow(ErroValidacao);
    });

    it('deve rejeitar empty password', () => {
      expect(() => {
        ValidadorAuth.validateLogin('joao@example.com', '');
      }).toThrow(ErroValidacao);
    });

    it('deve rejeitar whitespace-only password', () => {
      expect(() => {
        ValidadorAuth.validateLogin('joao@example.com', '   ');
      }).toThrow(ErroValidacao);
    });
  });

  describe('validateSignUp', () => {
    it('deve validar correct signup data', () => {
      expect(() => {
        ValidadorAuth.validateSignUp('João Silva', 'joao@example.com', 'password123');
      }).not.toThrow();
    });

    it('deve rejeitar empty name', () => {
      expect(() => {
        ValidadorAuth.validateSignUp('', 'joao@example.com', 'password123');
      }).toThrow(ErroValidacao);
    });

    it('deve rejeitar whitespace-only name', () => {
      expect(() => {
        ValidadorAuth.validateSignUp('   ', 'joao@example.com', 'password123');
      }).toThrow(ErroValidacao);
    });

    it('deve rejeitar empty email', () => {
      expect(() => {
        ValidadorAuth.validateSignUp('João', '', 'password123');
      }).toThrow(ErroValidacao);
    });

    it('deve rejeitar invalid email format', () => {
      expect(() => {
        ValidadorAuth.validateSignUp('João', 'invalid-email', 'password123');
      }).toThrow(ErroValidacao);
    });

    it('deve rejeitar short password (< 6 characters)', () => {
      expect(() => {
        ValidadorAuth.validateSignUp('João', 'joao@example.com', '12345');
      }).toThrow(ErroValidacao);
    });

    it('deve rejeitar empty password', () => {
      expect(() => {
        ValidadorAuth.validateSignUp('João', 'joao@example.com', '');
      }).toThrow(ErroValidacao);
    });

    it('deve aceitar exactly 6 character password', () => {
      expect(() => {
        ValidadorAuth.validateSignUp('João', 'joao@example.com', '123456');
      }).not.toThrow();
    });
  });

  describe('isValidEmail', () => {
    it('deve aceitar valid emails', () => {
      const validEmails = [
        'user@example.com',
        'test.email@domain.co.uk',
        'user+tag@example.com',
      ];

      validEmails.forEach((email) => {
        expect(() => {
          ValidadorAuth.validateSignUp('Test', email, 'password123');
        }).not.toThrow();
      });
    });

    it('deve rejeitar invalid email formats', () => {
      const invalidEmails = ['notanemail', 'missing@domain', '@example.com', 'user@'];

      invalidEmails.forEach((email) => {
        expect(() => {
          ValidadorAuth.validateSignUp('Test', email, 'password123');
        }).toThrow(ErroValidacao);
      });
    });
  });

  describe('Casos de Borda', () => {
    it('deve tratar unicode characters in name', () => {
      expect(() => {
        ValidadorAuth.validateSignUp('João José', 'test@example.com', 'password123');
      }).not.toThrow();
    });

    it('deve tratar very long passwords', () => {
      const longPassword = 'a'.repeat(100);
      expect(() => {
        ValidadorAuth.validateSignUp('Test', 'test@example.com', longPassword);
      }).not.toThrow();
    });

    it('deve rejeitar null values', () => {
      expect(() => {
        ValidadorAuth.validateLogin(null as any, 'password');
      }).toThrow();
    });

    it('deve rejeitar undefined values', () => {
      expect(() => {
        ValidadorAuth.validateLogin(undefined as any, 'password');
      }).toThrow();
    });
  });
});
