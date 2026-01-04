import AuthError from "@/model/errors/authError";
import Appointment, { AppointmentStatus } from "@/model/entities/appointment";
import User from "@/model/entities/user";
import { IAppointmentRepository } from "@/model/repositories/iAppointmentRepository";
import { IUserRepository } from "@/model/repositories/iUserRepository";
import { IAuthService } from "@/model/services/iAuthService";

type AuthRecord = {
    id: string;
    email: string;
    password: string;
};

type PatientSubscriber = (appointments: Appointment[]) => void;
type NutritionistSubscriber = (appointments: Appointment[]) => void;

export class InMemoryAuthService implements IAuthService {
    private usersByEmail = new Map<string, AuthRecord>();
    private currentUser: Partial<User> | null = null;
    private listeners = new Set<(user: Partial<User> | null) => void>();
    private nextId = 1;

    async login(email: string, password: string): Promise<Partial<User>> {
        const record = this.usersByEmail.get(email);
        if (!record || record.password !== password) {
            throw new AuthError("Credenciais inválidas");
        }
        this.currentUser = { id: record.id, email: record.email };
        this.notify();
        return { id: record.id, email: record.email };
    }

    async signup(email: string, password: string): Promise<Partial<User>> {
        if (this.usersByEmail.has(email)) {
            throw new AuthError("Email já cadastrado");
        }
        const id = `user-${this.nextId++}`;
        this.usersByEmail.set(email, { id, email, password });
        this.currentUser = { id, email };
        this.notify();
        return { id, email };
    }

    async logout(): Promise<void> {
        this.currentUser = null;
        this.notify();
    }

    async resetPassword(email: string): Promise<void> {
        if (!this.usersByEmail.has(email)) {
            throw new AuthError("Email não encontrado");
        }
    }

    onAuthStateChanged(callback: (user: Partial<User> | null) => void): () => void {
        this.listeners.add(callback);
        callback(this.currentUser);
        return () => {
            this.listeners.delete(callback);
        };
    }

    private notify(): void {
        for (const callback of this.listeners) {
            callback(this.currentUser);
        }
    }
}

export class InMemoryUserRepository implements IUserRepository {
    private usersById = new Map<string, User>();
    private pushTokensByUser = new Map<string, Set<string>>();

    async createUser(user: User): Promise<void> {
        this.usersById.set(user.id, user);
    }

    async getUserByID(uID: string): Promise<User | null> {
        return this.usersById.get(uID) ?? null;
    }

    async getByRole(role: "patient" | "nutritionist"): Promise<User[]> {
        return Array.from(this.usersById.values()).filter((user) => user.role === role);
    }

    async addPushToken(userId: string, token: string): Promise<void> {
        const current = this.pushTokensByUser.get(userId) ?? new Set<string>();
        current.add(token);
        this.pushTokensByUser.set(userId, current);
    }

    async removePushToken(userId: string, token: string): Promise<void> {
        const current = this.pushTokensByUser.get(userId);
        if (!current) return;
        current.delete(token);
    }

    async getPushTokens(userId: string): Promise<string[]> {
        const current = this.pushTokensByUser.get(userId);
        if (!current) return [];
        return Array.from(current);
    }
}

export class InMemoryAppointmentRepository implements IAppointmentRepository {
    private appointments: Appointment[] = [];
    private patientSubscribers = new Map<string, Set<PatientSubscriber>>();
    private nutritionistPendingSubscribers = new Map<string, Set<NutritionistSubscriber>>();
    private nutritionistSubscribers = new Map<string, Set<NutritionistSubscriber>>();

    async create(appointment: Appointment): Promise<void> {
        this.appointments.push(appointment);
        this.notifyPatient(appointment.patientId);
        this.notifyNutritionistPending(appointment.nutritionistId);
        this.notifyNutritionist(appointment.nutritionistId);
    }

    async getById(id: string): Promise<Appointment | null> {
        return this.appointments.find((appt) => appt.id === id) ?? null;
    }

    async listByPatient(patientId: string): Promise<Appointment[]> {
        return this.appointments.filter((appt) => appt.patientId === patientId);
    }

    async listByDate(date: string, nutritionistId?: string): Promise<Appointment[]> {
        return this.appointments.filter((appt) => {
            if (appt.date !== date) return false;
            if (nutritionistId && appt.nutritionistId !== nutritionistId) return false;
            return true;
        });
    }

    async listByStatus(status: AppointmentStatus, nutritionistId?: string): Promise<Appointment[]> {
        return this.appointments.filter((appt) => {
            if (appt.status !== status) return false;
            if (nutritionistId && appt.nutritionistId !== nutritionistId) return false;
            return true;
        });
    }

    async listAcceptedByDateRange(
        startDate: string,
        endDate: string,
        nutritionistId: string
    ): Promise<Appointment[]> {
        return this.appointments.filter((appt) => {
            if (appt.nutritionistId !== nutritionistId) return false;
            if (appt.status !== "accepted") return false;
            return appt.date >= startDate && appt.date <= endDate;
        });
    }

    async listAgendaByDateRange(
        startDate: string,
        endDate: string,
        nutritionistId: string
    ): Promise<Appointment[]> {
        return this.appointments.filter((appt) => {
            if (appt.nutritionistId !== nutritionistId) return false;
            if (appt.status !== "accepted" && appt.status !== "cancelled") return false;
            return appt.date >= startDate && appt.date <= endDate;
        });
    }

    async updateStatus(id: string, status: AppointmentStatus): Promise<void> {
        const appointment = this.appointments.find((appt) => appt.id === id);
        if (!appointment) return;
        appointment.status = status;
        appointment.updatedAt = new Date();
        this.notifyPatient(appointment.patientId);
        this.notifyNutritionistPending(appointment.nutritionistId);
        this.notifyNutritionist(appointment.nutritionistId);
    }

    async updateCalendarEventIds(
        id: string,
        data: { calendarEventIdPatient?: string | null; calendarEventIdNutritionist?: string | null }
    ): Promise<void> {
        const appointment = this.appointments.find((appt) => appt.id === id);
        if (!appointment) return;

        if ("calendarEventIdPatient" in data) {
            appointment.calendarEventIdPatient = data.calendarEventIdPatient ?? undefined;
        }
        if ("calendarEventIdNutritionist" in data) {
            appointment.calendarEventIdNutritionist = data.calendarEventIdNutritionist ?? undefined;
        }
        appointment.updatedAt = new Date();
    }

    onPatientAppointmentsChange(
        patientId: string,
        callback: (appointments: Appointment[]) => void
    ): () => void {
        const subscribers = this.patientSubscribers.get(patientId) ?? new Set<PatientSubscriber>();
        subscribers.add(callback);
        this.patientSubscribers.set(patientId, subscribers);
        callback(this.appointments.filter((appt) => appt.patientId === patientId));
        return () => {
            subscribers.delete(callback);
        };
    }

    onNutritionistPendingChange(
        nutritionistId: string,
        callback: (appointments: Appointment[]) => void
    ): () => void {
        const subscribers =
            this.nutritionistPendingSubscribers.get(nutritionistId) ?? new Set<NutritionistSubscriber>();
        subscribers.add(callback);
        this.nutritionistPendingSubscribers.set(nutritionistId, subscribers);
        callback(this.appointments.filter((appt) => appt.nutritionistId === nutritionistId && appt.status === "pending"));
        return () => {
            subscribers.delete(callback);
        };
    }

    onNutritionistAppointmentsChange(
        nutritionistId: string,
        callback: (appointments: Appointment[]) => void
    ): () => void {
        const subscribers =
            this.nutritionistSubscribers.get(nutritionistId) ?? new Set<NutritionistSubscriber>();
        subscribers.add(callback);
        this.nutritionistSubscribers.set(nutritionistId, subscribers);
        callback(this.appointments.filter((appt) => appt.nutritionistId === nutritionistId));
        return () => {
            subscribers.delete(callback);
        };
    }

    private notifyPatient(patientId: string): void {
        const subscribers = this.patientSubscribers.get(patientId);
        if (!subscribers) return;
        const current = this.appointments.filter((appt) => appt.patientId === patientId);
        for (const callback of subscribers) {
            callback(current);
        }
    }

    private notifyNutritionistPending(nutritionistId: string): void {
        const subscribers = this.nutritionistPendingSubscribers.get(nutritionistId);
        if (!subscribers) return;
        const pending = this.appointments.filter(
            (appt) => appt.nutritionistId === nutritionistId && appt.status === "pending"
        );
        for (const callback of subscribers) {
            callback(pending);
        }
    }

    private notifyNutritionist(nutritionistId: string): void {
        const subscribers = this.nutritionistSubscribers.get(nutritionistId);
        if (!subscribers) return;
        const current = this.appointments.filter((appt) => appt.nutritionistId === nutritionistId);
        for (const callback of subscribers) {
            callback(current);
        }
    }
}

export const flushPromises = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));
