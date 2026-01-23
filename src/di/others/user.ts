import GetNutritionistUseCase from "@/usecase/user/getNutritionistUseCase";
import { IGetNutritionistUseCase } from "@/usecase/user/iGetNutritionistUseCase";
import GetUserByIdUseCase from "@/usecase/user/getUserByIdUseCase";
import { IGetUserByIdUseCase } from "@/usecase/user/iGetUserByIdUseCase";
import DeleteUserUseCase from "@/usecase/user/deleteUserUseCase";
import { IDeleteUserUseCase } from "@/usecase/user/iDeleteUserUseCase";
import { getUserRepository, getInitError } from "@/di/others/base";

let nutritionistUseCase: IGetNutritionistUseCase | null = null;
let userByIdUseCase: IGetUserByIdUseCase | null = null;
let deleteUserUseCase: IDeleteUserUseCase | null = null;
let initError: Error | null = null;

function initUserUseCases(): void {
  if ((nutritionistUseCase && userByIdUseCase && deleteUserUseCase) || initError) {
    return;
  }

  try {
    const baseError = getInitError();
    if (baseError) {
      throw baseError;
    }
    const repository = getUserRepository();
    nutritionistUseCase = new GetNutritionistUseCase(repository);
    userByIdUseCase = new GetUserByIdUseCase(repository);
    deleteUserUseCase = new DeleteUserUseCase(repository);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao inicializar user";
    console.error("Erro fatal ao inicializar dependências:", errorMessage);
    initError = new Error(`Falha ao inicializar aplicação: ${errorMessage}`);
  }
}

function getNutritionistUseCase(): IGetNutritionistUseCase {
  initUserUseCases();
  if (!nutritionistUseCase) {
    throw initError ?? new Error("Falha ao inicializar casos de uso de usuário");
  }
  return nutritionistUseCase;
}

function getUserByIdUseCase(): IGetUserByIdUseCase {
  initUserUseCases();
  if (!userByIdUseCase) {
    throw initError ?? new Error("Falha ao inicializar casos de uso de usuário");
  }
  return userByIdUseCase;
}

function getDeleteUserUseCase(): IDeleteUserUseCase {
  initUserUseCases();
  if (!deleteUserUseCase) {
    throw initError ?? new Error("Falha ao inicializar casos de uso de usuário");
  }
  return deleteUserUseCase;
}

export { getNutritionistUseCase, getUserByIdUseCase, getDeleteUserUseCase };
