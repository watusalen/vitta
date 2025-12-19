import GetNutritionistUseCase from '@/usecase/user/getNutritionistUseCase';
import { IUserRepository } from '@/model/repositories/iUserRepository';
import User from '@/model/entities/user';
import RepositoryError from '@/model/errors/repositoryError';

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

        const result = await getNutritionistUseCase.execute();

        expect(result).toEqual(mockNutritionist);
        expect(mockUserRepository.getByRole).toHaveBeenCalledWith('nutritionist');
    });

    it('should return null when no nutritionist is found', async () => {
        mockUserRepository.getByRole.mockResolvedValueOnce([]);

        const result = await getNutritionistUseCase.execute();

        expect(result).toBeNull();
        expect(mockUserRepository.getByRole).toHaveBeenCalledWith('nutritionist');
    });

    it('should return first nutritionist when multiple exist (MVP)', async () => {
        const secondNutritionist: User = {
            ...mockNutritionist,
            id: 'nutri-456',
            name: 'Dr. Outro Nutricionista',
        };

        mockUserRepository.getByRole.mockResolvedValueOnce([mockNutritionist, secondNutritionist]);

        const result = await getNutritionistUseCase.execute();

        expect(result).toEqual(mockNutritionist);
    });

    it('should throw RepositoryError when repository fails', async () => {
        mockUserRepository.getByRole.mockRejectedValueOnce(
            new RepositoryError('Database connection failed')
        );

        await expect(getNutritionistUseCase.execute()).rejects.toThrow(RepositoryError);
    });

    it('should throw RepositoryError for unexpected errors', async () => {
        mockUserRepository.getByRole.mockRejectedValueOnce(new Error('Unexpected'));

        await expect(getNutritionistUseCase.execute()).rejects.toThrow(RepositoryError);
        await expect(getNutritionistUseCase.execute()).rejects.toThrow('Erro ao buscar nutricionista.');
    });
});
