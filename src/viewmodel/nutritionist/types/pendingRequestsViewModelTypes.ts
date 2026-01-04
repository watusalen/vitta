export interface PendingAppointmentItem {
    id: string;
    patientId: string;
    patientName: string;
    dateFormatted: string;
    timeStart: string;
    timeEnd: string;
}

export interface PendingRequestsState {
    pendingAppointments: PendingAppointmentItem[];
    loading: boolean;
    processing: boolean;
    error: string | null;
    successMessage: string | null;
}

export interface PendingRequestsActions {
    acceptAppointment: (appointmentId: string) => Promise<boolean>;
    rejectAppointment: (appointmentId: string) => Promise<boolean>;
    clearError: () => void;
    clearSuccess: () => void;
}
