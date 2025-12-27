import User from "@/model/entities/user";
import AuthError from "@/model/errors/authError";
import { IAuthService } from "@/model/services/iAuthService"
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    User as FirebaseUser
} from "firebase/auth";
import { getAuthInstance } from "@/infra/firebase/config";

export default class FirebaseAuthService implements IAuthService {
    async login(email: string, password: string): Promise<Partial<User>> {
        try {
            const auth = getAuthInstance();
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return {
                id: userCredential.user.uid,
                email: userCredential.user.email ?? ''
            }
        } catch {
            throw new AuthError('Credenciais inválidas.');
        }
    }

    async signup(email: string, password: string): Promise<Partial<User>> {
        try {
            const auth = getAuthInstance();
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            return {
                id: userCredential.user.uid,
                email: userCredential.user.email ?? ''
            }
        } catch {
            throw new AuthError('Essa conta já existe.');
        }
    }

    async logout(): Promise<void> {
        try {
            await signOut(getAuthInstance());
        } catch {
            throw new AuthError('Não foi possível fazer logout.');
        }
    }

    async resetPassword(email: string): Promise<void> {
        try {
            await sendPasswordResetEmail(getAuthInstance(), email);
        } catch {
            throw new AuthError('Não foi possível enviar o email de recuperação.');
        }
    }

    onAuthStateChanged(callback: (user: Partial<User> | null) => void): () => void {
        return onAuthStateChanged(getAuthInstance(), (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser) {
                callback({
                    id: firebaseUser.uid,
                    email: firebaseUser.email ?? ''
                });
            } else {
                callback(null);
            }
        });
    }
}
