import ErroAuth from '../../../../src/model/errors/authError';
import ErroValidacao from '../../../../src/model/errors/validationError';
import ErroRepositorio from '../../../../src/model/errors/repositoryError';

describe('Custom Error Classes', () => {
  describe('ErroAuth', () => {
    it('deve criar auth error', () => {
      const error = new ErroAuth('Invalid credentials');

      expect(error.message).toBe('Invalid credentials');
      expect(error).toBeInstanceOf(Error);
    });

    it('deve ter correct prototype', () => {
      const error = new ErroAuth('Test');
      expect(error instanceof ErroAuth).toBe(true);
    });

    it('deve incluir stack trace', () => {
      const error = new ErroAuth('Test error');
      expect(error.stack).toBeDefined();
    });
  });

  describe('ErroValidacao', () => {
    it('deve criar validation error', () => {
      const error = new ErroValidacao('Invalid email');

      expect(error.message).toBe('Invalid email');
      expect(error).toBeInstanceOf(Error);
    });

    it('deve ter correct prototype', () => {
      const error = new ErroValidacao('Test');
      expect(error instanceof ErroValidacao).toBe(true);
    });

    it('deve incluir stack trace', () => {
      const error = new ErroValidacao('Test error');
      expect(error.stack).toBeDefined();
    });
  });

  describe('ErroRepositorio', () => {
    it('deve criar repository error', () => {
      const error = new ErroRepositorio('Database connection failed');

      expect(error.message).toBe('Database connection failed');
      expect(error).toBeInstanceOf(Error);
    });

    it('deve ter correct prototype', () => {
      const error = new ErroRepositorio('Test');
      expect(error instanceof ErroRepositorio).toBe(true);
    });

    it('deve incluir stack trace', () => {
      const error = new ErroRepositorio('Test error');
      expect(error.stack).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('deve lançar and catch ErroAuth', () => {
      const throwError = () => {
        throw new ErroAuth('Auth failed');
      };

      expect(throwError).toThrow(ErroAuth);
    });

    it('deve lançar and catch ErroValidacao', () => {
      const throwError = () => {
        throw new ErroValidacao('Invalid data');
      };

      expect(throwError).toThrow(ErroValidacao);
    });

    it('deve lançar and catch ErroRepositorio', () => {
      const throwError = () => {
        throw new ErroRepositorio('DB error');
      };

      expect(throwError).toThrow(ErroRepositorio);
    });

    it('deve distinguish different error types in array', () => {
      const errors = [
        new ErroAuth('Auth'),
        new ErroValidacao('Validation'),
        new ErroRepositorio('Repository'),
      ];

      const authErros = errors.filter((e) => e instanceof ErroAuth);
      const valErros = errors.filter((e) => e instanceof ErroValidacao);
      const repoErros = errors.filter((e) => e instanceof ErroRepositorio);

      expect(authErros).toHaveLength(1);
      expect(valErros).toHaveLength(1);
      expect(repoErros).toHaveLength(1);
    });
  });

  describe('Error Messages', () => {
    it('deve preserve custom error messages', () => {
      const messages = [
        'Custom auth message',
        'Custom validation message',
        'Custom repository message',
      ];

      const authError = new ErroAuth(messages[0]);
      const valError = new ErroValidacao(messages[1]);
      const repoError = new ErroRepositorio(messages[2]);

      expect(authError.message).toBe(messages[0]);
      expect(valError.message).toBe(messages[1]);
      expect(repoError.message).toBe(messages[2]);
    });
  });
});
