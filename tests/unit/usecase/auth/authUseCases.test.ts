import AuthUseCases from '../../../../src/usecase/auth/authUseCases';
import { IAuthService } from '@/model/services/iAuthService';
import { IUserRepository } from '@/model/repositories/iUserRepository';
import User from '@/model/entities/user';
import AuthError from '@/model/errors/authError';
import ValidationError from '@/model/errors/validationError';
import RepositoryError from '@/model/errors/repositoryError';

describe('AuthUseCases', () => {
  let authUseCases: AuthUseCases;
  let mockAuthService: jest.Mocked<IAuthService>;
  let mockUserRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockAuthService = {
      login: jest.fn(),
      signup: jest.fn(),
      logout: jest.fn(),
      resetPassword: jest.fn(),
      onAuthStateChanged: jest.fn(),
    };

    mockUserRepository = {
      getUserByID: jest.fn(),
      createUser: jest.fn(),
      getByRole: jest.fn(),
      addPushToken: jest.fn(),
      removePushToken: jest.fn(),
      getPushTokens: jest.fn(),
    };

    authUseCases = new AuthUseCases(mockAuthService, mockUserRepository);
  });

  describe('Login', () => {
    it('should login user successfully', async () => {
      const credentials = { email: 'joao@example.com', password: 'password123' };
      const mockUser: User = {
        id: 'user-1',
        name: 'João Silva',
        email: 'joao@example.com',
        role: 'patient',
        createdAt: new Date(),
      };

      mockAuthService.login.mockResolvedValueOnce(mockUser);
      mockUserRepository.getUserByID.mockResolvedValueOnce(mockUser);

      const result = await authUseCases.login(credentials.email, credentials.password);

      expect(result).toEqual(mockUser);
      expect(mockAuthService.login).toHaveBeenCalledWith(
        credentials.email,
        credentials.password
      );
    });

    it('should throw ValidationError on empty email', async () => {
      await expect(
        authUseCases.login('', 'password123')
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError on empty password', async () => {
      await expect(
        authUseCases.login('joao@example.com', '')
      ).rejects.toThrow(ValidationError);
    });

    it('should throw AuthError when user not found', async () => {
      mockAuthService.login.mockResolvedValueOnce({
        id: 'user-1',
        name: 'João',
        email: 'joao@example.com',
        role: 'patient',
        createdAt: new Date(),
      });
      mockUserRepository.getUserByID.mockResolvedValueOnce(null);

      await expect(
        authUseCases.login('joao@example.com', 'password123')
      ).rejects.toThrow(AuthError);
    });

    it('should throw AuthError when auth service fails', async () => {
      mockAuthService.login.mockRejectedValueOnce(
        new AuthError('Invalid credentials')
      );

      await expect(
        authUseCases.login('joao@example.com', 'password123')
      ).rejects.toThrow(AuthError);
    });

    it('should throw RepositoryError when repository fails', async () => {
      mockAuthService.login.mockResolvedValueOnce({
        id: 'user-1',
        name: 'João',
        email: 'joao@example.com',
        role: 'patient',
        createdAt: new Date(),
      });
      mockUserRepository.getUserByID.mockRejectedValueOnce(new RepositoryError('Erro'));

      await expect(
        authUseCases.login('joao@example.com', 'password123')
      ).rejects.toThrow(RepositoryError);
    });

    it('should throw generic error when unexpected failure happens', async () => {
      mockAuthService.login.mockRejectedValueOnce(new Error('Unexpected'));

      await expect(
        authUseCases.login('joao@example.com', 'password123')
      ).rejects.toThrow('Erro interno no login');
    });
  });

  describe('SignUp', () => {
    it('should signup user successfully', async () => {
      const signupData = {
        name: 'João Silva',
        email: 'joao@example.com',
        password: 'password123',
      };

      const mockAuthUser: User = {
        id: 'user-1',
        name: signupData.name,
        email: signupData.email,
        role: 'patient',
        createdAt: new Date(),
      };

      mockAuthService.signup.mockResolvedValueOnce(mockAuthUser);
      mockUserRepository.createUser.mockResolvedValueOnce(undefined);

      const result = await authUseCases.signUp(
        signupData.name,
        signupData.email,
        signupData.password
      );

      expect(result).toBeDefined();
      expect(mockAuthService.signup).toHaveBeenCalled();
      expect(mockUserRepository.createUser).toHaveBeenCalled();
    });

    it('should throw ValidationError on invalid email', async () => {
      await expect(
        authUseCases.signUp('João', 'invalid', 'password123')
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError on weak password', async () => {
      await expect(
        authUseCases.signUp('João', 'joao@example.com', '123')
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError on empty name', async () => {
      await expect(
        authUseCases.signUp('', 'joao@example.com', 'password123')
      ).rejects.toThrow(ValidationError);
    });

    it('should throw AuthError when auth service fails', async () => {
      mockAuthService.signup.mockRejectedValueOnce(
        new AuthError('Email already in use')
      );

      await expect(
        authUseCases.signUp('João', 'joao@example.com', 'password123')
      ).rejects.toThrow(AuthError);
    });

    it('should throw RepositoryError when repository fails', async () => {
      mockAuthService.signup.mockResolvedValueOnce({
        id: 'user-1',
        name: 'João',
        email: 'joao@example.com',
        role: 'patient',
        createdAt: new Date(),
      });
      mockUserRepository.createUser.mockRejectedValueOnce(new RepositoryError('Erro'));

      await expect(
        authUseCases.signUp('João', 'joao@example.com', 'password123')
      ).rejects.toThrow(RepositoryError);
    });

    it('should throw generic error when unexpected failure happens', async () => {
      mockAuthService.signup.mockRejectedValueOnce(new Error('Unexpected'));

      await expect(
        authUseCases.signUp('João', 'joao@example.com', 'password123')
      ).rejects.toThrow('Erro interno no registro');
    });
  });

  describe('Logout', () => {
    it('should logout user successfully', async () => {
      mockAuthService.logout.mockResolvedValueOnce(undefined);

      await authUseCases.logout();

      expect(mockAuthService.logout).toHaveBeenCalled();
    });

    it('should throw error when logout fails', async () => {
      mockAuthService.logout.mockRejectedValueOnce(
        new AuthError('Logout failed')
      );

      await expect(authUseCases.logout()).rejects.toThrow(AuthError);
    });

    it('should throw generic error when logout fails unexpectedly', async () => {
      mockAuthService.logout.mockRejectedValueOnce(new Error('Unexpected'));

      await expect(authUseCases.logout()).rejects.toThrow('Erro interno no logout');
    });
  });

  describe('ResetPassword', () => {
    it('should call resetPassword successfully', async () => {
      mockAuthService.resetPassword.mockResolvedValueOnce(undefined);

      await authUseCases.resetPassword('joao@example.com');

      expect(mockAuthService.resetPassword).toHaveBeenCalledWith('joao@example.com');
    });

    it('should throw ValidationError on invalid email', async () => {
      await expect(authUseCases.resetPassword('invalid')).rejects.toThrow(ValidationError);
    });

    it('should throw AuthError when resetPassword fails', async () => {
      mockAuthService.resetPassword.mockRejectedValueOnce(new AuthError('Erro'));

      await expect(authUseCases.resetPassword('joao@example.com')).rejects.toThrow(AuthError);
    });

    it('should throw generic error when resetPassword fails unexpectedly', async () => {
      mockAuthService.resetPassword.mockRejectedValueOnce(new Error('Unexpected'));

      await expect(authUseCases.resetPassword('joao@example.com')).rejects.toThrow(
        'Erro interno ao enviar email de recuperação'
      );
    });
  });

  describe('OnAuthStateChanged', () => {
    it('should call listener when auth state changes', (done) => {
      const mockUser: User = {
        id: 'user-1',
        name: 'João Silva',
        email: 'joao@example.com',
        role: 'patient',
        createdAt: new Date(),
      };

      const listener = jest.fn();

      mockUserRepository.getUserByID.mockResolvedValueOnce(mockUser);
      mockAuthService.onAuthStateChanged.mockImplementationOnce((cb) => {
        cb(mockUser);
        return () => {};
      });

      authUseCases.onAuthStateChanged(listener);

      setTimeout(() => {
        expect(listener).toHaveBeenCalledWith(mockUser);
        done();
      }, 100);
    });

    it('should handle null user (logged out)', (done) => {
      const listener = jest.fn();

      mockAuthService.onAuthStateChanged.mockImplementationOnce((cb) => {
        cb(null);
        return () => {};
      });

      authUseCases.onAuthStateChanged(listener);

      setTimeout(() => {
        expect(listener).toHaveBeenCalledWith(null);
        done();
      }, 0);
    });

    it('should call listener with null on repository error', (done) => {
      const listener = jest.fn();

      mockUserRepository.getUserByID.mockRejectedValueOnce(new Error('Erro'));
      mockAuthService.onAuthStateChanged.mockImplementationOnce((cb) => {
        cb({ id: 'user-1' } as User);
        return () => {};
      });

      authUseCases.onAuthStateChanged(listener);

      setTimeout(() => {
        expect(listener).toHaveBeenCalledWith(null);
        done();
      }, 0);
    });

    it('should call listener with null when authUser has no id', (done) => {
      const listener = jest.fn();

      mockAuthService.onAuthStateChanged.mockImplementationOnce((cb) => {
        cb({} as User);
        return () => {};
      });

      authUseCases.onAuthStateChanged(listener);

      setTimeout(() => {
        expect(listener).toHaveBeenCalledWith(null);
        done();
      }, 0);
    });
  });
});
