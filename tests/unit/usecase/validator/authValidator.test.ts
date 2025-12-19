import AuthValidator from '../../../../src/usecase/auth/validator/authValidator';
import ValidationError from '../../../../src/model/errors/validationError';

describe('AuthValidator', () => {
  describe('validateLogin', () => {
    it('should validate correct login data', () => {
      expect(() => {
        AuthValidator.validateLogin('joao@example.com', 'password123');
      }).not.toThrow();
    });

    it('should reject empty email', () => {
      expect(() => {
        AuthValidator.validateLogin('', 'password123');
      }).toThrow(ValidationError);
    });

    it('should reject whitespace-only email', () => {
      expect(() => {
        AuthValidator.validateLogin('   ', 'password123');
      }).toThrow(ValidationError);
    });

    it('should reject empty password', () => {
      expect(() => {
        AuthValidator.validateLogin('joao@example.com', '');
      }).toThrow(ValidationError);
    });

    it('should reject whitespace-only password', () => {
      expect(() => {
        AuthValidator.validateLogin('joao@example.com', '   ');
      }).toThrow(ValidationError);
    });
  });

  describe('validateSignUp', () => {
    it('should validate correct signup data', () => {
      expect(() => {
        AuthValidator.validateSignUp('João Silva', 'joao@example.com', 'password123');
      }).not.toThrow();
    });

    it('should reject empty name', () => {
      expect(() => {
        AuthValidator.validateSignUp('', 'joao@example.com', 'password123');
      }).toThrow(ValidationError);
    });

    it('should reject whitespace-only name', () => {
      expect(() => {
        AuthValidator.validateSignUp('   ', 'joao@example.com', 'password123');
      }).toThrow(ValidationError);
    });

    it('should reject empty email', () => {
      expect(() => {
        AuthValidator.validateSignUp('João', '', 'password123');
      }).toThrow(ValidationError);
    });

    it('should reject invalid email format', () => {
      expect(() => {
        AuthValidator.validateSignUp('João', 'invalid-email', 'password123');
      }).toThrow(ValidationError);
    });

    it('should reject short password (< 6 characters)', () => {
      expect(() => {
        AuthValidator.validateSignUp('João', 'joao@example.com', '12345');
      }).toThrow(ValidationError);
    });

    it('should reject empty password', () => {
      expect(() => {
        AuthValidator.validateSignUp('João', 'joao@example.com', '');
      }).toThrow(ValidationError);
    });

    it('should accept exactly 6 character password', () => {
      expect(() => {
        AuthValidator.validateSignUp('João', 'joao@example.com', '123456');
      }).not.toThrow();
    });
  });

  describe('isValidEmail', () => {
    it('should accept valid emails', () => {
      const validEmails = [
        'user@example.com',
        'test.email@domain.co.uk',
        'user+tag@example.com',
      ];

      validEmails.forEach((email) => {
        expect(() => {
          AuthValidator.validateSignUp('Test', email, 'password123');
        }).not.toThrow();
      });
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = ['notanemail', 'missing@domain', '@example.com', 'user@'];

      invalidEmails.forEach((email) => {
        expect(() => {
          AuthValidator.validateSignUp('Test', email, 'password123');
        }).toThrow(ValidationError);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle unicode characters in name', () => {
      expect(() => {
        AuthValidator.validateSignUp('João José', 'test@example.com', 'password123');
      }).not.toThrow();
    });

    it('should handle very long passwords', () => {
      const longPassword = 'a'.repeat(100);
      expect(() => {
        AuthValidator.validateSignUp('Test', 'test@example.com', longPassword);
      }).not.toThrow();
    });

    it('should reject null values', () => {
      expect(() => {
        AuthValidator.validateLogin(null as any, 'password');
      }).toThrow();
    });

    it('should reject undefined values', () => {
      expect(() => {
        AuthValidator.validateLogin(undefined as any, 'password');
      }).toThrow();
    });
  });
});
