import { ICalendarService } from "@/model/services/iCalendarService";
import { ICalendarPermissionUseCase } from "@/usecase/calendar/iCalendarPermissionUseCase";

export default class CalendarPermissionUseCase implements ICalendarPermissionUseCase {
    constructor(private calendarService: ICalendarService) {}

    async checkPermission() {
        return this.calendarService.checkPermissions();
    }

    async requestPermission() {
        return this.calendarService.requestPermissions();
    }

    async openSettings() {
        return this.calendarService.openSettings();
    }
}
