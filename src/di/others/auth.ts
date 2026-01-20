import AuthUseCases from "@/usecase/auth/authUseCases";
import { IAuthUseCases } from "@/usecase/auth/iAuthUseCases";
import DeleteAccountUseCase from "@/usecase/auth/deleteAccountUseCase";
import { IDeleteAccountUseCase } from "@/usecase/auth/iDeleteAccountUseCase";
import { getDeleteUserUseCase } from "@/di/others/user";
import { getAuthService, getUserRepository, getInitError } from "@/di/others/base";

let authUseCases: IAuthUseCases | null = null;
let deleteAccountUseCase: IDeleteAccountUseCase | null = null;
let initError: Error | null = null;

function initAuthUseCases() {
  if ((authUseCases && deleteAccountUseCase) || initError) {
    return;
  }

  try {
    const baseError = getInitError();
    if (baseError) {
      throw baseError;
    }
    authUseCases = new AuthUseCases(getAuthService(), getUserRepository());
    deleteAccountUseCase = new DeleteAccountUseCase(getAuthService(), getDeleteUserUseCase());
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao inicializar auth";
    console.error("Erro fatal ao inicializar dependências:", errorMessage);
    initError = new Error(`Falha ao inicializar aplicação: ${errorMessage}`);
  }
}

function getAuthUseCases() {
  initAuthUseCases();
  if (!authUseCases) {
    throw initError ?? new Error("Falha ao inicializar casos de uso de autenticação");
  }
  return authUseCases;
}

function getDeleteAccountUseCase() {
  initAuthUseCases();
  if (!deleteAccountUseCase) {
    throw initError ?? new Error("Falha ao inicializar casos de uso de autenticação");
  }
  return deleteAccountUseCase;
}

export { getAuthUseCases, getDeleteAccountUseCase };
