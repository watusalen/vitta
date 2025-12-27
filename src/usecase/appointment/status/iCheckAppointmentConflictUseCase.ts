export interface CheckAppointmentConflictInput {
    date: string;
    timeStart: string;
    timeEnd: string;
    nutritionistId: string;
    excludeAppointmentId?: string;
}

export interface ICheckAppointmentConflictUseCase {
    hasConflict(input: CheckAppointmentConflictInput): Promise<boolean>;
}
