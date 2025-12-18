import { useState, useEffect, useCallback } from "react";
import Appointment from "@/model/entities/appointment";
import { IGetAppointmentDetailsUseCase } from "@/usecase/appointment/getAppointmentDetailsUseCase";
import RepositoryError from "@/model/errors/repositoryError";

/**
 * Estado do ViewModel de Detalhes da Consulta
 */
export interface AppointmentDetailsState {
    /** Consulta carregada */
    appointment: Appointment | null;
    /** Indica se está carregando */
    loading: boolean;
    /** Mensagem de erro */
    error: string | null;
    /** Indica se a consulta foi encontrada */
    notFound: boolean;
}

/**
 * Ações do ViewModel de Detalhes da Consulta
 */
export interface AppointmentDetailsActions {
    /** Carrega os detalhes da consulta */
    loadAppointment: (appointmentId: string) => Promise<void>;
    /** Recarrega os detalhes */
    reload: () => Promise<void>;
    /** Limpa erro */
    clearError: () => void;
}

/**
 * ViewModel para tela de detalhes de uma consulta
 * 
 * Responsabilidades:
 * - Carregar detalhes de uma consulta específica
 * - Gerenciar estados de loading/erro
 * - Indicar quando consulta não é encontrada
 */
export default function useAppointmentDetailsViewModel(
    getAppointmentDetailsUseCase: IGetAppointmentDetailsUseCase
): AppointmentDetailsState & AppointmentDetailsActions {
    // Estado
    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notFound, setNotFound] = useState(false);
    const [currentId, setCurrentId] = useState<string | null>(null);

    /**
     * Carrega os detalhes da consulta
     */
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

    /**
     * Recarrega os detalhes da consulta atual
     */
    const reload = useCallback(async (): Promise<void> => {
        if (currentId) {
            await loadAppointment(currentId);
        }
    }, [currentId, loadAppointment]);

    /**
     * Limpa erro
     */
    const clearError = useCallback((): void => {
        setError(null);
    }, []);

    return {
        // Estado
        appointment,
        loading,
        error,
        notFound,

        // Ações
        loadAppointment,
        reload,
        clearError,
    };
}
