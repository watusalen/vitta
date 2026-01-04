import TimeSlot from "@/model/entities/timeSlot";
import Appointment from "@/model/entities/appointment";
import User from "@/model/entities/user";

export interface ScheduleState {
    selectedDate: Date | null;
    availableSlots: TimeSlot[];
    selectedSlot: TimeSlot | null;
    loading: boolean;
    submitting: boolean;
    error: string | null;
    successMessage: string | null;
    successRedirect: string | null;
    availabilityMap: Map<string, boolean>;
    nutritionist: User | null;
    nutritionistLoading: boolean;
    nutritionistError: string | null;
    navigationRoute: string | null;
    navigationMethod: "replace" | "push";
}

export interface ScheduleActions {
    selectDate: (date: Date, nutritionistId: string, patientId?: string) => Promise<void>;
    selectSlot: (slot: TimeSlot) => void;
    requestAppointment: (patientId: string, nutritionistId: string) => Promise<Appointment | null>;
    submitAppointment: (patientId: string) => Promise<Appointment | null>;
    loadMonthAvailability: (
        year: number,
        month: number,
        nutritionistId: string,
        patientId?: string
    ) => Promise<void>;
    loadNutritionist: () => Promise<void>;
    clearNutritionistError: () => void;
    clearError: () => void;
    clearSuccess: () => void;
    goBack: () => void;
    clearNavigation: () => void;
    confirmSuccessRedirect: () => void;
}
