import CasoDeUsoObterNutricionista from '@/usecase/user/getNutritionistUseCase';
import { IUserRepository } from '@/model/repositories/iUserRepository';
import User from '@/model/entities/user';
import ErroRepositorio from '@/model/errors/repositoryError';
import ErroValidacao from '@/model/errors/validationError';

describe('Caso de Uso: Obter Nutricionista', () => {
    let getNutritionistUseCase: CasoDeUsoObterNutricionista;
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
            addPushToken: jest.fn(),
            removePushToken: jest.fn(),
            getPushTokens: jest.fn(),
        };

        getNutritionistUseCase = new CasoDeUsoObterNutricionista(mockUserRepository);
    });

    it('deve retornar o nutricionista quando encontrado', async () => {
        mockUserRepository.getByRole.mockResolvedValueOnce([mockNutritionist]);

        const result = await getNutritionistUseCase.getNutritionist();

        expect(result).toEqual(mockNutritionist);
        expect(mockUserRepository.getByRole).toHaveBeenCalledWith('nutritionist');
    });

    it('deve lançar ErroValidacao quando nenhum nutricionista é encontrado', async () => {
        mockUserRepository.getByRole.mockResolvedValueOnce([]);

        const promise = getNutritionistUseCase.getNutritionist();

        await expect(promise).rejects.toThrow(ErroValidacao);
        await expect(promise).rejects.toThrow('Nenhuma nutricionista cadastrada.');
    });

    it('deve lançar ErroValidacao quando existem múltiplos nutricionistas', async () => {
        const secondNutritionist: User = {
            ...mockNutritionist,
            id: 'nutri-456',
            name: 'Dr. Outro Nutricionista',
        };

        mockUserRepository.getByRole.mockResolvedValueOnce([mockNutritionist, secondNutritionist]);

        const promise = getNutritionistUseCase.getNutritionist();

        await expect(promise).rejects.toThrow(ErroValidacao);
        await expect(promise).rejects.toThrow('Existem múltiplas nutricionistas cadastradas.');
    });

    it('deve lançar ErroRepositorio quando o repositório falha', async () => {
        mockUserRepository.getByRole.mockRejectedValueOnce(
            new ErroRepositorio('Database connection failed')
        );

        await expect(getNutritionistUseCase.getNutritionist()).rejects.toThrow(ErroRepositorio);
    });

    it('deve lançar ErroRepositorio quando ocorre erro inesperado', async () => {
        mockUserRepository.getByRole.mockRejectedValueOnce(new Error('Unexpected'));

        await expect(getNutritionistUseCase.getNutritionist()).rejects.toThrow(ErroRepositorio);
        await expect(getNutritionistUseCase.getNutritionist()).rejects.toThrow('Erro ao buscar nutricionista.');
    });
});
