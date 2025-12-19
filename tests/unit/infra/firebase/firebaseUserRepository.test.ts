import FirebaseUserRepository from '@/infra/firebase/repository/firebaseUserRepository';
import RepositoryError from '@/model/errors/repositoryError';
import User from '@/model/entities/user';
import { doc, getDoc, setDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';

jest.mock('firebase/firestore', () => ({
    doc: jest.fn(),
    getDoc: jest.fn(),
    setDoc: jest.fn(),
    collection: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    getDocs: jest.fn(),
    Timestamp: {
        fromDate: jest.fn((date: Date) => ({ toDate: () => date })),
    },
}));
jest.mock('@/infra/firebase/config', () => ({
    db: {},
}));

const mockDoc = doc as jest.Mock;
const mockGetDoc = getDoc as jest.Mock;
const mockSetDoc = setDoc as jest.Mock;
const mockCollection = collection as jest.Mock;
const mockQuery = query as jest.Mock;
const mockWhere = where as jest.Mock;
const mockGetDocs = getDocs as jest.Mock;

describe('FirebaseUserRepository', () => {
    let repository: FirebaseUserRepository;

    beforeEach(() => {
        jest.clearAllMocks();
        repository = new FirebaseUserRepository();
        mockDoc.mockReturnValue({ id: 'doc-ref' });
        mockCollection.mockReturnValue({ id: 'collection-ref' });
        mockQuery.mockReturnValue({ id: 'query-ref' });
        mockWhere.mockReturnValue({ id: 'where-ref' });
    });

    describe('createUser', () => {
        it('deve criar usuário no Firestore com sucesso', async () => {
            mockSetDoc.mockResolvedValue(undefined);

            const user: User = {
                id: 'user-123',
                name: 'John Doe',
                email: 'john@email.com',
                role: 'patient',
                createdAt: new Date('2024-01-01'),
            };

            await expect(repository.createUser(user)).resolves.toBeUndefined();
            expect(mockDoc).toHaveBeenCalledWith({}, 'users', 'user-123');
            expect(mockSetDoc).toHaveBeenCalled();
        });

        it('deve lançar RepositoryError quando falha ao criar', async () => {
            mockSetDoc.mockRejectedValue(new Error('Firestore error'));

            const user: User = {
                id: 'user-123',
                name: 'John Doe',
                email: 'john@email.com',
                role: 'patient',
                createdAt: new Date(),
            };

            await expect(repository.createUser(user)).rejects.toThrow(RepositoryError);
            await expect(repository.createUser(user)).rejects.toThrow('Erro ao criar usuário no Firestore.');
        });
    });

    describe('getUserByID', () => {
        it('deve retornar usuário quando existe', async () => {
            const mockDate = new Date('2024-01-01');
            mockGetDoc.mockResolvedValue({
                exists: () => true,
                id: 'user-123',
                data: () => ({
                    name: 'John Doe',
                    email: 'john@email.com',
                    role: 'patient',
                    createdAt: { toDate: () => mockDate },
                }),
            });

            const result = await repository.getUserByID('user-123');

            expect(result).toEqual({
                id: 'user-123',
                name: 'John Doe',
                email: 'john@email.com',
                role: 'patient',
                createdAt: mockDate,
            });
        });

        it('deve retornar null quando usuário não existe', async () => {
            mockGetDoc.mockResolvedValue({
                exists: () => false,
            });

            const result = await repository.getUserByID('non-existent');

            expect(result).toBeNull();
        });

        it('deve lançar RepositoryError quando falha ao buscar', async () => {
            mockGetDoc.mockRejectedValue(new Error('Firestore error'));

            await expect(repository.getUserByID('user-123')).rejects.toThrow(RepositoryError);
            await expect(repository.getUserByID('user-123')).rejects.toThrow('Erro ao buscar usuário no Firestore.');
        });
    });

    describe('getByRole', () => {
        it('deve retornar lista de usuários por role', async () => {
            const mockDate = new Date('2024-01-01');
            mockGetDocs.mockResolvedValue({
                docs: [
                    {
                        id: 'user-1',
                        data: () => ({
                            name: 'Nutri 1',
                            email: 'nutri1@email.com',
                            role: 'nutritionist',
                            createdAt: { toDate: () => mockDate },
                        }),
                    },
                    {
                        id: 'user-2',
                        data: () => ({
                            name: 'Nutri 2',
                            email: 'nutri2@email.com',
                            role: 'nutritionist',
                            createdAt: { toDate: () => mockDate },
                        }),
                    },
                ],
            });

            const result = await repository.getByRole('nutritionist');

            expect(result).toHaveLength(2);
            expect(result[0].name).toBe('Nutri 1');
            expect(result[1].name).toBe('Nutri 2');
            expect(mockWhere).toHaveBeenCalledWith('role', '==', 'nutritionist');
        });

        it('deve retornar lista vazia quando não há usuários', async () => {
            mockGetDocs.mockResolvedValue({
                docs: [],
            });

            const result = await repository.getByRole('nutritionist');

            expect(result).toEqual([]);
        });

        it('deve usar data atual quando createdAt é undefined', async () => {
            mockGetDocs.mockResolvedValue({
                docs: [
                    {
                        id: 'user-1',
                        data: () => ({
                            name: 'Nutri',
                            email: 'nutri@email.com',
                            role: 'nutritionist',
                            createdAt: undefined,
                        }),
                    },
                ],
            });

            const result = await repository.getByRole('nutritionist');

            expect(result[0].createdAt).toBeInstanceOf(Date);
        });

        it('deve lançar RepositoryError quando falha ao buscar', async () => {
            mockGetDocs.mockRejectedValue(new Error('Firestore error'));

            await expect(repository.getByRole('nutritionist')).rejects.toThrow(RepositoryError);
            await expect(repository.getByRole('nutritionist')).rejects.toThrow(
                'Erro ao buscar usuários por role no Firestore.'
            );
        });
    });
});
