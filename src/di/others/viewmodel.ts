import useHomeViewModel from "@/viewmodel/auth/useHomeViewModel";
import useCalendarPermissionViewModelHook from "@/viewmodel/calendar/useCalendarPermissionViewModel";
import usePushPermissionViewModelHook from "@/viewmodel/notifications/usePushPermissionViewModel";
import useLoginViewModel from "@/viewmodel/auth/useLoginViewModel";
import useSignUpViewModel from "@/viewmodel/auth/useSignUpViewModel";
import useAppointmentDetailsViewModel from "@/viewmodel/appointment/useAppointmentDetailsViewModel";
import useMyAppointmentsViewModel from "@/viewmodel/appointment/useMyAppointmentsViewModel";
import useScheduleViewModel from "@/viewmodel/appointment/useScheduleViewModel";
import useNutritionistAgendaViewModelHook from "@/viewmodel/nutritionist/useNutritionistAgendaViewModel";
import useNutritionistAppointmentDetailsViewModelHook from "@/viewmodel/nutritionist/useNutritionistAppointmentDetailsViewModel";
import useNutritionistConflictResolutionViewModelHook from "@/viewmodel/nutritionist/useNutritionistConflictResolutionViewModel";
import useNutritionistCalendarSyncViewModelHook from "@/viewmodel/nutritionist/useNutritionistCalendarSyncViewModel";
import useNutritionistHomeViewModelHook from "@/viewmodel/nutritionist/useNutritionistHomeViewModel";
import usePendingRequestsViewModelHook from "@/viewmodel/nutritionist/usePendingRequestsViewModel";
import usePatientHomeViewModelHook from "@/viewmodel/patient/usePatientHomeViewModel";
import usePatientCalendarSyncViewModelHook from "@/viewmodel/patient/usePatientCalendarSyncViewModel";
import { getAuthUseCases } from "@/di/others/auth";
import { getAppointmentCalendarSyncUseCase, getCalendarPermissionUseCase } from "@/di/others/calendar";
import { getAppointmentPushNotificationUseCase, getPushPermissionUseCase, getPushTokenUseCase } from "@/di/others/notifications";
import {
    getAcceptAppointmentUseCase,
    getCancelAppointmentUseCase,
    getReactivateAppointmentUseCase,
    getResolveAppointmentConflictUseCase,
    getListAppointmentConflictsUseCase,
    getAppointmentDetailsUseCase,
    getAvailableTimeSlotsUseCase,
    getListNutritionistAgendaUseCase,
    getListPatientAppointmentsUseCase,
    getListPendingAppointmentsUseCase,
    getRejectAppointmentUseCase,
    getRequestAppointmentUseCase,
} from "@/di/others/appointment";
import { getNutritionistUseCase, getUserByIdUseCase } from "@/di/others/user";

export function useAuthHomeViewModel() {
    return useHomeViewModel(
        getAuthUseCases(),
        getCalendarPermissionUseCase(),
        getPushPermissionUseCase(),
        getPushTokenUseCase()
    );
}

export function useAuthLoginViewModel() {
    return useLoginViewModel(getAuthUseCases());
}

export function useAuthSignUpViewModel() {
    return useSignUpViewModel(getAuthUseCases());
}

export function useCalendarPermissionViewModel() {
    return useCalendarPermissionViewModelHook(getCalendarPermissionUseCase());
}

export function usePushPermissionViewModel() {
    return usePushPermissionViewModelHook(getPushPermissionUseCase());
}

export function usePatientScheduleViewModel() {
    return useScheduleViewModel(
        getAvailableTimeSlotsUseCase(),
        getRequestAppointmentUseCase(),
        getAppointmentPushNotificationUseCase(),
        getNutritionistUseCase()
    );
}

export function usePatientAppointmentsViewModel(patientId: string) {
    return useMyAppointmentsViewModel(
        getListPatientAppointmentsUseCase(),
        getAppointmentCalendarSyncUseCase(),
        patientId
    );
}

export function usePatientAppointmentDetailsViewModel() {
    return useAppointmentDetailsViewModel(
        getAppointmentDetailsUseCase(),
        getUserByIdUseCase(),
        getCancelAppointmentUseCase(),
        getAppointmentPushNotificationUseCase()
    );
}

export function usePatientHomeViewModel() {
    return usePatientHomeViewModelHook();
}

export function usePatientCalendarSyncViewModel(patientId: string) {
    return usePatientCalendarSyncViewModelHook(
        getListPatientAppointmentsUseCase(),
        getAppointmentCalendarSyncUseCase(),
        patientId
    );
}

export function useNutritionistCalendarSyncViewModel(nutritionistId: string) {
    return useNutritionistCalendarSyncViewModelHook(
        getListNutritionistAgendaUseCase(),
        getAppointmentCalendarSyncUseCase(),
        nutritionistId
    );
}

export function useNutritionistAgendaViewModel(nutritionistId: string) {
    return useNutritionistAgendaViewModelHook(getListNutritionistAgendaUseCase(), getUserByIdUseCase(), nutritionistId);
}

export function useNutritionistPendingRequestsViewModel(nutritionistId: string) {
    return usePendingRequestsViewModelHook(
        getListPendingAppointmentsUseCase(),
        getAcceptAppointmentUseCase(),
        getRejectAppointmentUseCase(),
        getUserByIdUseCase(),
        getAppointmentCalendarSyncUseCase(),
        getAppointmentPushNotificationUseCase(),
        nutritionistId
    );
}

export function useNutritionistHomeViewModel(nutritionistId: string) {
    return useNutritionistHomeViewModelHook(
        getListPendingAppointmentsUseCase(),
        getListNutritionistAgendaUseCase(),
        getUserByIdUseCase(),
        nutritionistId
    );
}

export function useNutritionistAppointmentDetailsViewModel() {
    return useNutritionistAppointmentDetailsViewModelHook(
        getAppointmentDetailsUseCase(),
        getAcceptAppointmentUseCase(),
        getRejectAppointmentUseCase(),
        getCancelAppointmentUseCase(),
        getReactivateAppointmentUseCase(),
        getUserByIdUseCase(),
        getAppointmentCalendarSyncUseCase(),
        getAppointmentPushNotificationUseCase()
    );
}

export function useNutritionistConflictResolutionViewModel() {
    return useNutritionistConflictResolutionViewModelHook(
        getAppointmentDetailsUseCase(),
        getListAppointmentConflictsUseCase(),
        getResolveAppointmentConflictUseCase(),
        getUserByIdUseCase(),
        getAppointmentCalendarSyncUseCase(),
        getAppointmentPushNotificationUseCase()
    );
}
