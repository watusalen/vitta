export default interface User {
    id: string;
    name: string;
    email: string;
    role: 'patient' | 'nutritionist';
    createdAt: Date;
}