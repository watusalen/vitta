import FirebaseAuthService from "@/infra/firebase/service/firebaseAuthService";
import FirebaseUserRepository from "@/infra/firebase/repository/firebaseUserRepository";
import FirebaseAppointmentRepository from "@/infra/firebase/repository/firebaseAppointmentRepository";
import { IAppointmentRepository } from "@/model/repositories/iAppointmentRepository";
import { IUserRepository } from "@/model/repositories/iUserRepository";

let authService: FirebaseAuthService | null = null;
let userRepository: IUserRepository | null = null;
let appointmentRepository: IAppointmentRepository | null = null;
let initError: Error | null = null;

function initBase(): void {
  if (authService && userRepository && appointmentRepository) {
    return;
  }
  if (initError) {
    return;
  }

  try {
    authService = new FirebaseAuthService();
    userRepository = new FirebaseUserRepository();
    appointmentRepository = new FirebaseAppointmentRepository();
  } catch (error) {
    const errorMessage : string = error instanceof Error ? error.message : "Erro desconhecido ao inicializar base";
    initError = new Error(`Falha ao inicializar aplicação: ${errorMessage}`);
  }
}

function getInitError(): Error | null {
  initBase();
  return initError;
}

function getAuthService(): FirebaseAuthService {
  initBase();
  if (!authService) {
    throw initError ?? new Error("Falha ao inicializar serviço de autenticação");
  }
  return authService;
}

function getUserRepository(): IUserRepository {
  initBase();
  if (!userRepository) {
    throw initError ?? new Error("Falha ao inicializar repositório de usuários");
  }
  return userRepository;
}

function getAppointmentRepository(): IAppointmentRepository {
  initBase();
  if (!appointmentRepository) {
    throw initError ?? new Error("Falha ao inicializar repositório de consultas");
  }
  return appointmentRepository;
}

export { getAuthService, getUserRepository, getAppointmentRepository, getInitError };