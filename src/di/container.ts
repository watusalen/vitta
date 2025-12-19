import AuthUseCases from "@/usecase/auth/authUseCases";
import { IAuthUseCases } from "@/usecase/auth/iAuthUseCases";
import FirebaseAuthService from "@/infra/firebase/service/firebaseAuthService";
import FirebaseUserRepository from "@/infra/firebase/repository/firebaseUserRepository";
import FirebaseAppointmentRepository from "@/infra/firebase/repository/firebaseAppointmentRepository";
import { IAppointmentRepository } from "@/model/repositories/iAppointmentRepository";
import { IUserRepository } from "@/model/repositories/iUserRepository";
import GetAvailableTimeSlotsUseCase, { IGetAvailableTimeSlotsUseCase } from "@/usecase/appointment/getAvailableTimeSlotsUseCase";
import RequestAppointmentUseCase, { IRequestAppointmentUseCase } from "@/usecase/appointment/requestAppointmentUseCase";
import ListPatientAppointmentsUseCase, { IListPatientAppointmentsUseCase } from "@/usecase/appointment/listPatientAppointmentsUseCase";
import GetAppointmentDetailsUseCase, { IGetAppointmentDetailsUseCase } from "@/usecase/appointment/getAppointmentDetailsUseCase";
import GetNutritionistUseCase, { IGetNutritionistUseCase } from "@/usecase/user/getNutritionistUseCase";
import AcceptAppointmentUseCase, { IAcceptAppointmentUseCase } from "@/usecase/appointment/acceptAppointmentUseCase";
import RejectAppointmentUseCase, { IRejectAppointmentUseCase } from "@/usecase/appointment/rejectAppointmentUseCase";
import ListNutritionistAgendaUseCase, { IListNutritionistAgendaUseCase } from "@/usecase/appointment/listNutritionistAgendaUseCase";

let authService: FirebaseAuthService;
let userRepository: IUserRepository;
let appointmentRepository: IAppointmentRepository;
let authUseCases: IAuthUseCases;
let getAvailableTimeSlotsUseCase: IGetAvailableTimeSlotsUseCase;
let requestAppointmentUseCase: IRequestAppointmentUseCase;
let listPatientAppointmentsUseCase: IListPatientAppointmentsUseCase;
let getAppointmentDetailsUseCase: IGetAppointmentDetailsUseCase;
let getNutritionistUseCase: IGetNutritionistUseCase;
let acceptAppointmentUseCase: IAcceptAppointmentUseCase;
let rejectAppointmentUseCase: IRejectAppointmentUseCase;
let listNutritionistAgendaUseCase: IListNutritionistAgendaUseCase;

try {
  authService = new FirebaseAuthService();
  userRepository = new FirebaseUserRepository();
  appointmentRepository = new FirebaseAppointmentRepository();

  authUseCases = new AuthUseCases(authService, userRepository);

  getAvailableTimeSlotsUseCase = new GetAvailableTimeSlotsUseCase(appointmentRepository);
  requestAppointmentUseCase = new RequestAppointmentUseCase(appointmentRepository);
  listPatientAppointmentsUseCase = new ListPatientAppointmentsUseCase(appointmentRepository);
  getAppointmentDetailsUseCase = new GetAppointmentDetailsUseCase(appointmentRepository);
  getNutritionistUseCase = new GetNutritionistUseCase(userRepository);
  acceptAppointmentUseCase = new AcceptAppointmentUseCase(appointmentRepository);
  rejectAppointmentUseCase = new RejectAppointmentUseCase(appointmentRepository);
  listNutritionistAgendaUseCase = new ListNutritionistAgendaUseCase(appointmentRepository);
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao inicializar container';
  console.error('Erro fatal ao inicializar dependências:', errorMessage);
  // Lança o erro para que seja capturado pelo ErrorBoundary no _layout.tsx
  throw new Error(`Falha ao inicializar aplicação: ${errorMessage}`);
}

export {
    authUseCases,
    userRepository,
    appointmentRepository,
    getAvailableTimeSlotsUseCase,
    requestAppointmentUseCase,
    listPatientAppointmentsUseCase,
    getAppointmentDetailsUseCase,
    getNutritionistUseCase,
    acceptAppointmentUseCase,
    rejectAppointmentUseCase,
    listNutritionistAgendaUseCase,
};

