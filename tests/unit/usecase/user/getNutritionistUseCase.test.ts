import GetNutritionistUseCase from '@/usecase/user/getNutritionistUseCase';
import { IUserRepository } from '@/model/repositories/iUserRepository';
import User from '@/model/entities/user';
import RepositoryError from '@/model/errors/repositoryError';
import ValidationError from '@/model/errors/validationError';

describe('GetNutritionistUseCase', () => {
    let getNutritionistUseCase: GetNutritionistUseCase;
    let mockUserRepository: jest.Mocked<IUserRepository>;

    const mockNutritionist: User = {
        id: 'nutri-123',
        name: 'Dra. Jesseane Andrade',
        email: 'jesseane@vitta.com',
        role: 'nutritionist',
        createdAt: new Date('2025-01-01'),
    };

    beforeEach(() => {
        mockUserRepository = {
            getUserByID: jest.fn(),
            createUser: jest.fn(),
            getByRole: jest.fn(),
        };

        getNutritionistUseCase = new GetNutritionistUseCase(mockUserRepository);
    });

    it('should return the nutritionist when found', async () => {
        mockUserRepository.getByRole.mockResolvedValueOnce([mockNutritionist]);

        const result = await getNutritionistUseCase.getNutritionist();

        expect(result).toEqual(mockNutritionist);
        expect(mockUserRepository.getByRole).toHaveBeenCalledWith('nutritionist');
    });

    it('should throw ValidationError when no nutritionist is found', async () => {
        mockUserRepository.getByRole.mockResolvedValueOnce([]);

        const promise = getNutritionistUseCase.getNutritionist();

        await expect(promise).rejects.toThrow(ValidationError);
        await expect(promise).rejects.toThrow('Nenhuma nutricionista cadastrada.');
    });

    it('should throw ValidationError when multiple nutritionists exist', async () => {
        const secondNutritionist: User = {
            ...mockNutritionist,
            id: 'nutri-456',
            name: 'Dr. Outro Nutricionista',
        };

        mockUserRepository.getByRole.mockResolvedValueOnce([mockNutritionist, secondNutritionist]);

        const promise = getNutritionistUseCase.getNutritionist();

        await expect(promise).rejects.toThrow(ValidationError);
        await expect(promise).rejects.toThrow('Existem múltiplas nutricionistas cadastradas.');
    });

    it('should throw RepositoryError when repository fails', async () => {
        mockUserRepository.getByRole.mockRejectedValueOnce(
            new RepositoryError('Database connection failed')
        );

        await expect(getNutritionistUseCase.getNutritionist()).rejects.toThrow(RepositoryError);
    });

    it('should throw RepositoryError for unexpected errors', async () => {
        mockUserRepository.getByRole.mockRejectedValueOnce(new Error('Unexpected'));

        await expect(getNutritionistUseCase.getNutritionist()).rejects.toThrow(RepositoryError);
        await expect(getNutritionistUseCase.getNutritionist()).rejects.toThrow('Erro ao buscar nutricionista.');
    });
});
