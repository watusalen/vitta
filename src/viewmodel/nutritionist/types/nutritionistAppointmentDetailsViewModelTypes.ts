import Appointment from "@/model/entities/appointment";

export interface NutritionistAppointmentDetailsState {
    appointment: Appointment | null;
    patientName: string | null;
    loading: boolean;
    processing: boolean;
    error: string | null;
    successMessage: string | null;
    notFound: boolean;
    canHandle: boolean;
    canCancel: boolean;
    canReactivate: boolean;
    conflictAlertOpen: boolean;
    conflictMessage: string | null;
    navigationRoute: string | null;
    navigationMethod: "replace" | "push";
}

export interface NutritionistAppointmentDetailsActions {
    loadAppointment: (appointmentId: string) => Promise<void>;
    acceptAppointment: (appointmentId: string) => Promise<void>;
    rejectAppointment: (appointmentId: string) => Promise<void>;
    cancelAppointment: (appointmentId: string) => Promise<void>;
    reactivateAppointment: (appointmentId: string) => Promise<void>;
    clearError: () => void;
    clearSuccess: () => void;
    dismissConflictAlert: () => void;
    resolveConflict: (appointmentId: string) => void;
    clearNavigation: () => void;
}
