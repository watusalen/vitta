import { useState, useEffect, useCallback } from "react";
import Appointment from "@/model/entities/appointment";
import { IGetAppointmentDetailsUseCase } from "@/usecase/appointment/getAppointmentDetailsUseCase";
import RepositoryError from "@/model/errors/repositoryError";

export interface AppointmentDetailsState {
    appointment: Appointment | null;
    loading: boolean;
    error: string | null;
    notFound: boolean;
}

export interface AppointmentDetailsActions {
    loadAppointment: (appointmentId: string) => Promise<void>;
    reload: () => Promise<void>;
    clearError: () => void;
}

export default function useAppointmentDetailsViewModel(
    getAppointmentDetailsUseCase: IGetAppointmentDetailsUseCase
): AppointmentDetailsState & AppointmentDetailsActions {
    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notFound, setNotFound] = useState(false);
    const [currentId, setCurrentId] = useState<string | null>(null);

    const loadAppointment = useCallback(async (appointmentId: string): Promise<void> => {
        setCurrentId(appointmentId);
        setLoading(true);
        setError(null);
        setNotFound(false);

        try {
            const result = await getAppointmentDetailsUseCase.execute(appointmentId);
            
            if (result === null) {
                setNotFound(true);
                setAppointment(null);
            } else {
                setAppointment(result);
            }
        } catch (err) {
            if (err instanceof RepositoryError) {
                setError(err.message);
            } else {
                setError('Erro ao carregar detalhes da consulta.');
            }
            setAppointment(null);
        } finally {
            setLoading(false);
        }
    }, [getAppointmentDetailsUseCase]);

    const reload = useCallback(async (): Promise<void> => {
        if (currentId) {
            await loadAppointment(currentId);
        }
    }, [currentId, loadAppointment]);

    const clearError = useCallback((): void => {
        setError(null);
    }, []);

    return {
        appointment,
        loading,
        error,
        notFound,
        loadAppointment,
        reload,
        clearError,
    };
}
