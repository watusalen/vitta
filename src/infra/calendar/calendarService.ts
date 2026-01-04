import { Linking, Platform } from "react-native";
import * as Calendar from "expo-calendar";
import { CalendarEventInput, CalendarPermissionStatus, ICalendarService } from "@/model/services/iCalendarService";

export default class CalendarService implements ICalendarService {
    async checkPermissions(): Promise<CalendarPermissionStatus> {
        const { status } = await Calendar.getCalendarPermissionsAsync();
        return this.mapPermissionStatus(status);
    }

    async requestPermissions(): Promise<CalendarPermissionStatus> {
        const { status } = await Calendar.requestCalendarPermissionsAsync();
        return this.mapPermissionStatus(status);
    }

    async openSettings(): Promise<void> {
        await Linking.openSettings();
    }

    async createEvent(input: CalendarEventInput): Promise<string> {
        const calendarId = await this.getDefaultCalendarId();
        const alarms = this.buildAlarms(input.reminderMinutesBefore);
        return Calendar.createEventAsync(calendarId, {
            title: input.title,
            startDate: new Date(input.startDate),
            endDate: new Date(input.endDate),
            location: input.location,
            notes: input.notes,
            alarms,
        });
    }

    async updateEvent(eventId: string, input: CalendarEventInput): Promise<string> {
        const alarms = this.buildAlarms(input.reminderMinutesBefore);
        await Calendar.updateEventAsync(eventId, {
            title: input.title,
            startDate: new Date(input.startDate),
            endDate: new Date(input.endDate),
            location: input.location,
            notes: input.notes,
            alarms,
        });
        return eventId;
    }

    async removeEvent(eventId: string): Promise<void> {
        await Calendar.deleteEventAsync(eventId);
    }

    private mapPermissionStatus(status: string): CalendarPermissionStatus {
        if (status === "granted") {
            return "authorized";
        }
        if (status === "denied") {
            return "denied";
        }
        return "undetermined";
    }

    private async getDefaultCalendarId(): Promise<string> {
        if (Platform.OS === "ios") {
            const defaultCalendar = await Calendar.getDefaultCalendarAsync();
            if (defaultCalendar?.id) {
                return defaultCalendar.id;
            }
        }

        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        const writable = calendars.find((calendar) => calendar.allowsModifications);
        if (writable?.id) {
            return writable.id;
        }
        if (calendars.length > 0) {
            return calendars[0].id;
        }

        throw new Error("Nenhum calendário disponível para salvar eventos.");
    }

    private buildAlarms(reminderMinutesBefore?: number[]) {
        if (!reminderMinutesBefore || reminderMinutesBefore.length === 0) {
            return undefined;
        }
        return reminderMinutesBefore.map((minutes) => ({
            relativeOffset: -Math.abs(minutes),
        }));
    }
}
