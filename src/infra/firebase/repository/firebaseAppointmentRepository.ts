import Appointment, { AppointmentStatus } from "@/model/entities/appointment";
import { IAppointmentRepository } from "@/model/repositories/iAppointmentRepository";
import RepositoryError from "@/model/errors/repositoryError";
import { db } from "../config";
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
    QueryConstraint
} from "firebase/firestore";

export default class FirebaseAppointmentRepository implements IAppointmentRepository {
    private readonly collectionName = 'appointments';

    private toAppointment(id: string, data: Record<string, unknown>): Appointment {
        return {
            id,
            patientId: data.patientId as string,
            nutritionistId: data.nutritionistId as string,
            date: data.date as string,
            timeStart: data.timeStart as string,
            timeEnd: data.timeEnd as string,
            status: data.status as AppointmentStatus,
            observations: data.observations as string | undefined,
            createdAt: (data.createdAt as Timestamp).toDate(),
            updatedAt: (data.updatedAt as Timestamp).toDate(),
        };
    }

    private toFirestore(appointment: Appointment): Record<string, unknown> {
        const data: Record<string, unknown> = {
            patientId: appointment.patientId,
            nutritionistId: appointment.nutritionistId,
            date: appointment.date,
            timeStart: appointment.timeStart,
            timeEnd: appointment.timeEnd,
            status: appointment.status,
            createdAt: Timestamp.fromDate(appointment.createdAt),
            updatedAt: Timestamp.fromDate(appointment.updatedAt),
        };

        if (appointment.observations !== undefined) {
            data.observations = appointment.observations;
        }

        return data;
    }

    async create(appointment: Appointment): Promise<void> {
        try {
            const docRef = doc(db, this.collectionName, appointment.id);
            await setDoc(docRef, this.toFirestore(appointment));
        } catch (error) {
            throw new RepositoryError('Erro ao criar agendamento no Firestore.');
        }
    }

    async getById(id: string): Promise<Appointment | null> {
        try {
            const docRef = doc(db, this.collectionName, id);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                return null;
            }

            return this.toAppointment(docSnap.id, docSnap.data());
        } catch (error) {
            throw new RepositoryError('Erro ao buscar agendamento no Firestore.');
        }
    }

    async listByPatient(patientId: string): Promise<Appointment[]> {
        try {
            const collectionRef = collection(db, this.collectionName);
            const q = query(
                collectionRef,
                where('patientId', '==', patientId),
                orderBy('date', 'desc'),
                orderBy('timeStart', 'desc')
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => this.toAppointment(doc.id, doc.data()));
        } catch (error) {
            throw new RepositoryError('Erro ao listar agendamentos do paciente.');
        }
    }

    async listByDate(date: string, nutritionistId?: string): Promise<Appointment[]> {
        try {
            const collectionRef = collection(db, this.collectionName);
            const constraints: QueryConstraint[] = [
                where('date', '==', date),
                orderBy('timeStart', 'asc')
            ];

            if (nutritionistId) {
                constraints.unshift(where('nutritionistId', '==', nutritionistId));
            }

            const q = query(collectionRef, ...constraints);
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => this.toAppointment(doc.id, doc.data()));
        } catch (error) {
            throw new RepositoryError('Erro ao listar agendamentos por data.');
        }
    }

    async listByStatus(status: AppointmentStatus, nutritionistId?: string): Promise<Appointment[]> {
        try {
            const collectionRef = collection(db, this.collectionName);
            const constraints: QueryConstraint[] = [
                where('status', '==', status),
                orderBy('date', 'asc'),
                orderBy('timeStart', 'asc')
            ];

            if (nutritionistId) {
                constraints.unshift(where('nutritionistId', '==', nutritionistId));
            }

            const q = query(collectionRef, ...constraints);
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => this.toAppointment(doc.id, doc.data()));
        } catch (error) {
            throw new RepositoryError('Erro ao listar agendamentos por status.');
        }
    }

    async listAcceptedByDateRange(
        startDate: string,
        endDate: string,
        nutritionistId: string
    ): Promise<Appointment[]> {
        try {
            const collectionRef = collection(db, this.collectionName);
            const q = query(
                collectionRef,
                where('nutritionistId', '==', nutritionistId),
                where('status', '==', 'accepted'),
                where('date', '>=', startDate),
                where('date', '<=', endDate),
                orderBy('date', 'asc'),
                orderBy('timeStart', 'asc')
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => this.toAppointment(doc.id, doc.data()));
        } catch (error) {
            throw new RepositoryError('Erro ao listar agendamentos aceitos por período.');
        }
    }

    async updateStatus(id: string, status: AppointmentStatus): Promise<void> {
        try {
            const docRef = doc(db, this.collectionName, id);
            await updateDoc(docRef, {
                status,
                updatedAt: Timestamp.now()
            });
        } catch (error) {
            throw new RepositoryError('Erro ao atualizar status do agendamento.');
        }
    }

    onPatientAppointmentsChange(
        patientId: string,
        callback: (appointments: Appointment[]) => void
    ): () => void {
        const collectionRef = collection(db, this.collectionName);
        const q = query(
            collectionRef,
            where('patientId', '==', patientId),
            orderBy('date', 'desc'),
            orderBy('timeStart', 'desc')
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const appointments = snapshot.docs.map(doc =>
                    this.toAppointment(doc.id, doc.data())
                );
                callback(appointments);
            },
            (error) => {
                console.error('Erro ao escutar mudanças de agendamentos:', error);
            }
        );

        return unsubscribe;
    }

    onNutritionistPendingChange(
        nutritionistId: string,
        callback: (appointments: Appointment[]) => void
    ): () => void {
        const collectionRef = collection(db, this.collectionName);
        const q = query(
            collectionRef,
            where('nutritionistId', '==', nutritionistId),
            where('status', '==', 'pending'),
            orderBy('date', 'asc'),
            orderBy('timeStart', 'asc')
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const appointments = snapshot.docs.map(doc =>
                    this.toAppointment(doc.id, doc.data())
                );
                callback(appointments);
            },
            (error) => {
                console.error('Erro ao escutar solicitações pendentes:', error);
            }
        );

        return unsubscribe;
    }
}
