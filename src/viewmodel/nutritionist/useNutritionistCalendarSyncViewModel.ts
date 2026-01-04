import { useEffect, useRef } from "react";
import Appointment from "@/model/entities/appointment";
import { IListNutritionistAgendaUseCase } from "@/usecase/appointment/list/iListNutritionistAgendaUseCase";
import { IAppointmentCalendarSyncUseCase } from "@/usecase/calendar/iAppointmentCalendarSyncUseCase";

export default function useNutritionistCalendarSyncViewModel(
    listNutritionistAgendaUseCase: IListNutritionistAgendaUseCase,
    calendarSyncUseCase: IAppointmentCalendarSyncUseCase,
    nutritionistId: string
): void {
    const syncInFlightRef = useRef(new Set<string>());

    useEffect(() => {
        if (!nutritionistId) return;

        const syncAppointment = async (appointment: Appointment): Promise<void> => {
            const key = appointment.id;
            if (syncInFlightRef.current.has(key)) {
                return;
            }

            if (appointment.status === "accepted") {
                if (appointment.calendarEventIdNutritionist) {
                    return;
                }
                syncInFlightRef.current.add(key);
                try {
                    await calendarSyncUseCase.syncAccepted(appointment, "nutritionist");
                } finally {
                    syncInFlightRef.current.delete(key);
                }
                return;
            }

            if (appointment.status === "cancelled" || appointment.status === "rejected") {
                if (!appointment.calendarEventIdNutritionist) {
                    return;
                }
                syncInFlightRef.current.add(key);
                try {
                    await calendarSyncUseCase.syncCancelledOrRejected(appointment, "nutritionist");
                } finally {
                    syncInFlightRef.current.delete(key);
                }
            }
        };

        const unsubscribe = listNutritionistAgendaUseCase.subscribeToNutritionistAppointments(
            nutritionistId,
            (appointments) => {
                appointments.forEach((appointment) => {
                    void syncAppointment(appointment);
                });
            }
        );

        return () => unsubscribe();
    }, [nutritionistId, listNutritionistAgendaUseCase, calendarSyncUseCase]);
}
