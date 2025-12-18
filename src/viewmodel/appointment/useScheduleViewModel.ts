import { useState, useCallback, useEffect } from "react";
import TimeSlot from "@/model/entities/timeSlot";
import Appointment from "@/model/entities/appointment";
import { IGetAvailableTimeSlotsUseCase } from "@/usecase/appointment/getAvailableTimeSlotsUseCase";
import { IRequestAppointmentUseCase, RequestAppointmentInput } from "@/usecase/appointment/requestAppointmentUseCase";
import ValidationError from "@/model/errors/validationError";
import RepositoryError from "@/model/errors/repositoryError";

export interface ScheduleState {
    selectedDate: Date | null;
    availableSlots: TimeSlot[];
    selectedSlot: TimeSlot | null;
    observations: string;
    loading: boolean;
    submitting: boolean;
    error: string | null;
    successMessage: string | null;
    availabilityMap: Map<string, boolean>;
}

export interface ScheduleActions {
    selectDate: (date: Date, nutritionistId: string) => Promise<void>;
    selectSlot: (slot: TimeSlot) => void;
    setObservations: (text: string) => void;
    requestAppointment: (patientId: string, nutritionistId: string) => Promise<Appointment | null>;
    loadMonthAvailability: (year: number, month: number, nutritionistId: string) => Promise<void>;
    clearError: () => void;
    clearSuccess: () => void;
    reset: () => void;
}

export default function useScheduleViewModel(
    getAvailableTimeSlotsUseCase: IGetAvailableTimeSlotsUseCase,
    requestAppointmentUseCase: IRequestAppointmentUseCase
): ScheduleState & ScheduleActions {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
    const [observations, setObservationsState] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [availabilityMap, setAvailabilityMap] = useState<Map<string, boolean>>(new Map());

    const selectDate = useCallback(async (date: Date, nutritionistId: string): Promise<void> => {
        setSelectedDate(date);
        setSelectedSlot(null);
        setError(null);
        setLoading(true);

        try {
            const slots = await getAvailableTimeSlotsUseCase.execute(date, nutritionistId);
            setAvailableSlots(slots);
        } catch (err) {
            if (err instanceof RepositoryError) {
                setError(err.message);
            } else {
                setError('Erro ao carregar horários disponíveis.');
            }
            setAvailableSlots([]);
        } finally {
            setLoading(false);
        }
    }, [getAvailableTimeSlotsUseCase]);

    const selectSlot = useCallback((slot: TimeSlot): void => {
        setSelectedSlot(slot);
        setError(null);
    }, []);

    const setObservations = useCallback((text: string): void => {
        setObservationsState(text);
    }, []);

    const requestAppointment = useCallback(async (
        patientId: string, 
        nutritionistId: string
    ): Promise<Appointment | null> => {
        if (!selectedDate || !selectedSlot) {
            setError('Selecione uma data e horário para continuar.');
            return null;
        }

        setSubmitting(true);
        setError(null);

        try {
            const input: RequestAppointmentInput = {
                patientId,
                nutritionistId,
                date: selectedDate,
                timeStart: selectedSlot.timeStart,
                timeEnd: selectedSlot.timeEnd,
                observations: observations.trim() || undefined,
            };

            const appointment = await requestAppointmentUseCase.execute(input);
            
            setSuccessMessage('Consulta solicitada com sucesso! Aguarde a confirmação da nutricionista.');
            
            setSelectedSlot(null);
            setObservationsState('');
            
            if (selectedDate) {
                const slots = await getAvailableTimeSlotsUseCase.execute(selectedDate, nutritionistId);
                setAvailableSlots(slots);
            }

            return appointment;
        } catch (err) {
            if (err instanceof ValidationError) {
                setError(err.message);
            } else if (err instanceof RepositoryError) {
                setError(err.message);
            } else {
                setError('Erro ao solicitar consulta. Tente novamente.');
            }
            return null;
        } finally {
            setSubmitting(false);
        }
    }, [selectedDate, selectedSlot, observations, requestAppointmentUseCase, getAvailableTimeSlotsUseCase]);

    const loadMonthAvailability = useCallback(async (
        year: number, 
        month: number, 
        nutritionistId: string
    ): Promise<void> => {
        const startDate = new Date(year, month - 1, 1, 12, 0, 0);
        const endDate = new Date(year, month, 0, 12, 0, 0); // Último dia do mês

        try {
            const slotsMap = await getAvailableTimeSlotsUseCase.executeForRange(
                startDate, 
                endDate, 
                nutritionistId
            );

            const newAvailabilityMap = new Map<string, boolean>();
            slotsMap.forEach((slots, dateStr) => {
                newAvailabilityMap.set(dateStr, slots.length > 0);
            });

            setAvailabilityMap(newAvailabilityMap);
        } catch (err) {
            console.error('Erro ao carregar disponibilidade do mês:', err);
        }
    }, [getAvailableTimeSlotsUseCase]);

    const clearError = useCallback((): void => {
        setError(null);
    }, []);

    const clearSuccess = useCallback((): void => {
        setSuccessMessage(null);
    }, []);

    const reset = useCallback((): void => {
        setSelectedDate(null);
        setAvailableSlots([]);
        setSelectedSlot(null);
        setObservationsState('');
        setError(null);
        setSuccessMessage(null);
    }, []);

    return {
        selectedDate,
        availableSlots,
        selectedSlot,
        observations,
        loading,
        submitting,
        error,
        successMessage,
        availabilityMap,
        selectDate,
        selectSlot,
        setObservations,
        requestAppointment,
        loadMonthAvailability,
        clearError,
        clearSuccess,
        reset,
    };
}
