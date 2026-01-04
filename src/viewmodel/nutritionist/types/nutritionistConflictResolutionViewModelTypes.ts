import Appointment from "@/model/entities/appointment";

export type ConflictAppointmentItem = {
    id: string;
    patientName: string;
    date: string;
    timeStart: string;
    timeEnd: string;
    status: Extract<Appointment["status"], "accepted" | "cancelled">;
};

export interface NutritionistConflictResolutionState {
    appointments: ConflictAppointmentItem[];
    selectedAppointmentId: string | null;
    loading: boolean;
    processing: boolean;
    error: string | null;
    successMessage: string | null;
    notFound: boolean;
    navigationRoute: string | null;
    navigationMethod: "replace" | "push";
}

export interface NutritionistConflictResolutionActions {
    loadConflict: (appointmentId: string) => Promise<void>;
    selectAppointment: (appointmentId: string) => void;
    resolveConflict: () => Promise<void>;
    clearError: () => void;
    clearSuccess: () => void;
    clearNavigation: () => void;
}
