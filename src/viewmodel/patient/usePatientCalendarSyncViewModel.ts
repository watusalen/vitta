import { useEffect, useRef } from "react";
import Appointment from "@/model/entities/appointment";
import { IListPatientAppointmentsUseCase } from "@/usecase/appointment/list/iListPatientAppointmentsUseCase";
import { IAppointmentCalendarSyncUseCase } from "@/usecase/calendar/iAppointmentCalendarSyncUseCase";

export default function usePatientCalendarSyncViewModel(
    listPatientAppointmentsUseCase: IListPatientAppointmentsUseCase,
    calendarSyncUseCase: IAppointmentCalendarSyncUseCase,
    patientId: string
): void {
    const syncInFlightRef = useRef(new Set<string>());

    useEffect(() => {
        if (!patientId) return;

        const syncAppointment = async (appointment: Appointment): Promise<void> => {
            const key = appointment.id;
            if (syncInFlightRef.current.has(key)) {
                return;
            }

            if (appointment.status === "accepted") {
                if (appointment.calendarEventIdPatient) {
                    return;
                }
                syncInFlightRef.current.add(key);
                try {
                    await calendarSyncUseCase.syncAccepted(appointment, "patient");
                } finally {
                    syncInFlightRef.current.delete(key);
                }
                return;
            }

            if (appointment.status === "cancelled" || appointment.status === "rejected") {
                if (!appointment.calendarEventIdPatient) {
                    return;
                }
                syncInFlightRef.current.add(key);
                try {
                    await calendarSyncUseCase.syncCancelledOrRejected(appointment, "patient");
                } finally {
                    syncInFlightRef.current.delete(key);
                }
            }
        };

        const unsubscribe = listPatientAppointmentsUseCase.subscribeToPatientAppointments(
            patientId,
            (appointments) => {
                appointments.forEach((appointment) => {
                    void syncAppointment(appointment);
                });
            }
        );

        return () => unsubscribe();
    }, [patientId, listPatientAppointmentsUseCase, calendarSyncUseCase]);
}
