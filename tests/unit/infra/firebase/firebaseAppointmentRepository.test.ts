import FirebaseAppointmentRepository from '@/infra/firebase/repository/firebaseAppointmentRepository';
import RepositoryError from '@/model/errors/repositoryError';
import Appointment from '@/model/entities/appointment';
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    collection,
    query,
    where,
    orderBy,
    getDocs,
    onSnapshot,
    Timestamp,
} from 'firebase/firestore';

jest.mock('firebase/firestore', () => ({
    doc: jest.fn(),
    getDoc: jest.fn(),
    setDoc: jest.fn(),
    updateDoc: jest.fn(),
    collection: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    orderBy: jest.fn(),
    getDocs: jest.fn(),
    onSnapshot: jest.fn(),
    Timestamp: {
        fromDate: jest.fn((date) => ({ toDate: () => date })),
        now: jest.fn(() => ({ toDate: () => new Date() })),
    },
}));
jest.mock('@/infra/firebase/config', () => ({
    getDbInstance: jest.fn(() => ({})),
}));

const mockDoc = doc as jest.Mock;
const mockGetDoc = getDoc as jest.Mock;
const mockSetDoc = setDoc as jest.Mock;
const mockUpdateDoc = updateDoc as jest.Mock;
const mockCollection = collection as jest.Mock;
const mockQuery = query as jest.Mock;
const mockWhere = where as jest.Mock;
const mockOrderBy = orderBy as jest.Mock;
const mockGetDocs = getDocs as jest.Mock;
const mockOnSnapshot = onSnapshot as jest.Mock;

describe('FirebaseAppointmentRepository', () => {
    let repository: FirebaseAppointmentRepository;
    const mockTimestamp = {
        toDate: () => new Date('2024-01-15T10:00:00Z'),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        repository = new FirebaseAppointmentRepository();
        mockDoc.mockReturnValue({ id: 'doc-ref' });
        mockCollection.mockReturnValue({ id: 'collection-ref' });
        mockQuery.mockReturnValue({ id: 'query-ref' });
        mockWhere.mockReturnValue({ id: 'where-ref' });
        mockOrderBy.mockReturnValue({ id: 'orderby-ref' });
    });

    const createMockAppointment = (overrides?: Partial<Appointment>): Appointment => ({
        id: 'appt-123',
        patientId: 'patient-1',
        nutritionistId: 'nutri-1',
        date: '2024-01-15',
        timeStart: '09:00',
        timeEnd: '11:00',
        status: 'pending',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10'),
        ...overrides,
    });

    describe('create', () => {
        it('deve criar agendamento com sucesso', async () => {
            mockSetDoc.mockResolvedValue(undefined);

            const appointment = createMockAppointment();

            await expect(repository.create(appointment)).resolves.toBeUndefined();
            expect(mockDoc).toHaveBeenCalledWith({}, 'appointments', 'appt-123');
            expect(mockSetDoc).toHaveBeenCalled();
        });

        it('deve lançar RepositoryError quando falha', async () => {
            mockSetDoc.mockRejectedValue(new Error('Firestore error'));

            const appointment = createMockAppointment();

            await expect(repository.create(appointment)).rejects.toThrow(RepositoryError);
            await expect(repository.create(appointment)).rejects.toThrow('Erro ao criar agendamento no Firestore.');
        });
    });

    describe('getById', () => {
        it('deve retornar agendamento quando existe', async () => {
            mockGetDoc.mockResolvedValue({
                exists: () => true,
                id: 'appt-123',
                data: () => ({
                    patientId: 'patient-1',
                    nutritionistId: 'nutri-1',
                    date: '2024-01-15',
                    timeStart: '09:00',
                    timeEnd: '11:00',
                    status: 'pending',
                    createdAt: mockTimestamp,
                    updatedAt: mockTimestamp,
                }),
            });

            const result = await repository.getById('appt-123');

            expect(result).not.toBeNull();
            expect(result?.id).toBe('appt-123');
            expect(result?.patientId).toBe('patient-1');
        });

        it('deve retornar null quando não existe', async () => {
            mockGetDoc.mockResolvedValue({
                exists: () => false,
            });

            const result = await repository.getById('non-existent');

            expect(result).toBeNull();
        });

        it('deve lançar RepositoryError quando falha', async () => {
            mockGetDoc.mockRejectedValue(new Error('Firestore error'));

            await expect(repository.getById('appt-123')).rejects.toThrow(RepositoryError);
            await expect(repository.getById('appt-123')).rejects.toThrow('Erro ao buscar agendamento no Firestore.');
        });
    });

    describe('listByPatient', () => {
        it('deve retornar lista de agendamentos do paciente', async () => {
            mockGetDocs.mockResolvedValue({
                docs: [
                    {
                        id: 'appt-1',
                        data: () => ({
                            patientId: 'patient-1',
                            nutritionistId: 'nutri-1',
                            date: '2024-01-15',
                            timeStart: '09:00',
                            timeEnd: '11:00',
                            status: 'pending',
                            createdAt: mockTimestamp,
                            updatedAt: mockTimestamp,
                        }),
                    },
                ],
            });

            const result = await repository.listByPatient('patient-1');

            expect(result).toHaveLength(1);
            expect(result[0].patientId).toBe('patient-1');
            expect(mockWhere).toHaveBeenCalledWith('patientId', '==', 'patient-1');
        });

        it('deve lançar RepositoryError quando falha', async () => {
            mockGetDocs.mockRejectedValue(new Error('Firestore error'));

            await expect(repository.listByPatient('patient-1')).rejects.toThrow(RepositoryError);
            await expect(repository.listByPatient('patient-1')).rejects.toThrow(
                'Erro ao listar agendamentos do paciente.'
            );
        });
    });

    describe('listByDate', () => {
        it('deve retornar agendamentos por data', async () => {
            mockGetDocs.mockResolvedValue({
                docs: [
                    {
                        id: 'appt-1',
                        data: () => ({
                            patientId: 'patient-1',
                            nutritionistId: 'nutri-1',
                            date: '2024-01-15',
                            timeStart: '09:00',
                            timeEnd: '11:00',
                            status: 'accepted',
                            createdAt: mockTimestamp,
                            updatedAt: mockTimestamp,
                        }),
                    },
                ],
            });

            const result = await repository.listByDate('2024-01-15');

            expect(result).toHaveLength(1);
            expect(mockWhere).toHaveBeenCalledWith('date', '==', '2024-01-15');
        });

        it('deve filtrar por nutritionistId quando fornecido', async () => {
            mockGetDocs.mockResolvedValue({ docs: [] });

            await repository.listByDate('2024-01-15', 'nutri-1');

            expect(mockWhere).toHaveBeenCalledWith('nutritionistId', '==', 'nutri-1');
        });

        it('deve lançar RepositoryError quando falha', async () => {
            mockGetDocs.mockRejectedValue(new Error('Firestore error'));

            await expect(repository.listByDate('2024-01-15')).rejects.toThrow(RepositoryError);
            await expect(repository.listByDate('2024-01-15')).rejects.toThrow(
                'Erro ao listar agendamentos por data.'
            );
        });
    });

    describe('listByStatus', () => {
        it('deve retornar agendamentos por status', async () => {
            mockGetDocs.mockResolvedValue({
                docs: [
                    {
                        id: 'appt-1',
                        data: () => ({
                            patientId: 'patient-1',
                            nutritionistId: 'nutri-1',
                            date: '2024-01-15',
                            timeStart: '09:00',
                            timeEnd: '11:00',
                            status: 'pending',
                            createdAt: mockTimestamp,
                            updatedAt: mockTimestamp,
                        }),
                    },
                ],
            });

            const result = await repository.listByStatus('pending');

            expect(result).toHaveLength(1);
            expect(mockWhere).toHaveBeenCalledWith('status', '==', 'pending');
        });

        it('deve filtrar por nutritionistId quando fornecido', async () => {
            mockGetDocs.mockResolvedValue({ docs: [] });

            await repository.listByStatus('pending', 'nutri-1');

            expect(mockWhere).toHaveBeenCalledWith('nutritionistId', '==', 'nutri-1');
        });

        it('deve lançar RepositoryError quando falha', async () => {
            mockGetDocs.mockRejectedValue(new Error('Firestore error'));

            await expect(repository.listByStatus('pending')).rejects.toThrow(RepositoryError);
            await expect(repository.listByStatus('pending')).rejects.toThrow(
                'Erro ao listar agendamentos por status.'
            );
        });
    });

    describe('listAcceptedByDateRange', () => {
        it('deve retornar agendamentos aceitos no período', async () => {
            mockGetDocs.mockResolvedValue({
                docs: [
                    {
                        id: 'appt-1',
                        data: () => ({
                            patientId: 'patient-1',
                            nutritionistId: 'nutri-1',
                            date: '2024-01-15',
                            timeStart: '09:00',
                            timeEnd: '11:00',
                            status: 'accepted',
                            createdAt: mockTimestamp,
                            updatedAt: mockTimestamp,
                        }),
                    },
                ],
            });

            const result = await repository.listAcceptedByDateRange('2024-01-01', '2024-01-31', 'nutri-1');

            expect(result).toHaveLength(1);
            expect(mockWhere).toHaveBeenCalledWith('status', '==', 'accepted');
        });

        it('deve lançar RepositoryError quando falha', async () => {
            mockGetDocs.mockRejectedValue(new Error('Firestore error'));

            await expect(repository.listAcceptedByDateRange('2024-01-01', '2024-01-31', 'nutri-1')).rejects.toThrow(
                RepositoryError
            );
            await expect(repository.listAcceptedByDateRange('2024-01-01', '2024-01-31', 'nutri-1')).rejects.toThrow(
                'Erro ao listar agendamentos aceitos por período.'
            );
        });
    });

    describe('updateStatus', () => {
        it('deve atualizar status com sucesso', async () => {
            mockUpdateDoc.mockResolvedValue(undefined);

            await expect(repository.updateStatus('appt-123', 'accepted')).resolves.toBeUndefined();
            expect(mockDoc).toHaveBeenCalledWith({}, 'appointments', 'appt-123');
            expect(mockUpdateDoc).toHaveBeenCalled();
        });

        it('deve lançar RepositoryError quando falha', async () => {
            mockUpdateDoc.mockRejectedValue(new Error('Firestore error'));

            await expect(repository.updateStatus('appt-123', 'accepted')).rejects.toThrow(RepositoryError);
            await expect(repository.updateStatus('appt-123', 'accepted')).rejects.toThrow(
                'Erro ao atualizar status do agendamento.'
            );
        });
    });

    describe('onPatientAppointmentsChange', () => {
        it('deve configurar listener e retornar unsubscribe', () => {
            const mockCallback = jest.fn();
            const mockUnsubscribe = jest.fn();

            mockOnSnapshot.mockImplementation((query, onSuccess, onError) => {
                onSuccess({
                    docs: [
                        {
                            id: 'appt-1',
                            data: () => ({
                                patientId: 'patient-1',
                                nutritionistId: 'nutri-1',
                                date: '2024-01-15',
                                timeStart: '09:00',
                                timeEnd: '11:00',
                                status: 'pending',
                                createdAt: mockTimestamp,
                                updatedAt: mockTimestamp,
                            }),
                        },
                    ],
                });
                return mockUnsubscribe;
            });

            const unsubscribe = repository.onPatientAppointmentsChange('patient-1', mockCallback);

            expect(mockCallback).toHaveBeenCalled();
            expect(mockCallback.mock.calls[0][0]).toHaveLength(1);
            expect(unsubscribe).toBe(mockUnsubscribe);
        });

        it('deve tratar erro no listener', () => {
            const mockCallback = jest.fn();
            const mockUnsubscribe = jest.fn();

            mockOnSnapshot.mockImplementation((query, onSuccess, onError) => {
                onError(new Error('Listener error'));
                return mockUnsubscribe;
            });

            const unsubscribe = repository.onPatientAppointmentsChange('patient-1', mockCallback);

            expect(mockCallback).not.toHaveBeenCalled();
            expect(unsubscribe).toBe(mockUnsubscribe);
        });
    });

    describe('onNutritionistPendingChange', () => {
        it('deve configurar listener para consultas pendentes da nutricionista', () => {
            const mockCallback = jest.fn();
            const mockUnsubscribe = jest.fn();

            mockOnSnapshot.mockImplementation((query, onSuccess, onError) => {
                onSuccess({
                    docs: [
                        {
                            id: 'appt-1',
                            data: () => ({
                                patientId: 'patient-1',
                                nutritionistId: 'nutri-1',
                                date: '2024-01-15',
                                timeStart: '09:00',
                                timeEnd: '11:00',
                                status: 'pending',
                                createdAt: mockTimestamp,
                                updatedAt: mockTimestamp,
                            }),
                        },
                    ],
                });
                return mockUnsubscribe;
            });

            const unsubscribe = repository.onNutritionistPendingChange('nutri-1', mockCallback);

            expect(mockCallback).toHaveBeenCalled();
            expect(mockCallback.mock.calls[0][0]).toHaveLength(1);
            expect(mockCallback.mock.calls[0][0][0].status).toBe('pending');
            expect(unsubscribe).toBe(mockUnsubscribe);
        });

        it('deve retornar unsubscribe function', () => {
            const mockCallback = jest.fn();
            const mockUnsubscribe = jest.fn();

            mockOnSnapshot.mockImplementation((query, onSuccess, onError) => {
                onSuccess({ docs: [] });
                return mockUnsubscribe;
            });

            const unsubscribe = repository.onNutritionistPendingChange('nutri-1', mockCallback);

            expect(typeof unsubscribe).toBe('function');
            expect(unsubscribe).toBe(mockUnsubscribe);
        });
    });
});
