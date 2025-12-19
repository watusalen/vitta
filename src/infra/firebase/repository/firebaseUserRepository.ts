import User from "@/model/entities/user";
import { IUserRepository } from "@/model/repositories/iUserRepository";
import RepositoryError from "@/model/errors/repositoryError";
import { db } from "../config";
import { doc, getDoc, setDoc, Timestamp, collection, query, where, getDocs } from "firebase/firestore";

export default class FirebaseUserRepository implements IUserRepository {
    private readonly collectionName = 'users';

    async createUser(user: User): Promise<void> {
        try {
            const userRef = doc(db, this.collectionName, user.id);
            await setDoc(userRef, {
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: Timestamp.fromDate(user.createdAt)
            });
        } catch (Error: any) {
            throw new RepositoryError('Erro ao criar usuário no Firestore.');
        }
    }

    async getUserByID(uID: string): Promise<User | null> {
        try {
            const userRef = doc(db, this.collectionName, uID);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                return null;
            }

            const data = userSnap.data();
            return {
                id: userSnap.id,
                name: data.name,
                email: data.email,
                role: data.role,
                createdAt: data.createdAt.toDate()
            };
        } catch (Error: any) {
            throw new RepositoryError('Erro ao buscar usuário no Firestore.');
        }
    }

    async getByRole(role: 'patient' | 'nutritionist'): Promise<User[]> {
        try {
            const collectionRef = collection(db, this.collectionName);
            const q = query(collectionRef, where('role', '==', role));
            const snapshot = await getDocs(q);

            return snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    name: data.name,
                    email: data.email,
                    role: data.role,
                    createdAt: data.createdAt?.toDate() || new Date()
                };
            });
        } catch (error: any) {
            console.error('getByRole error:', error);
            throw new RepositoryError('Erro ao buscar usuários por role no Firestore.');
        }
    }
}