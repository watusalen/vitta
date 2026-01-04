import React from "react";
import { View, Dimensions, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, borderRadius, spacing } from "@/view/themes/theme";
import ScreenHeader from "@/view/components/ScreenHeader";
import AlertModal from "@/view/components/AlertModal";
import "@/view/config/calendarLocale";
import ScheduleCalendar from "@/view/pages/patient/components/ScheduleCalendar";
import ScheduleSlotsSection from "@/view/pages/patient/components/ScheduleSlotsSection";
import ScheduleBottomBar from "@/view/pages/patient/components/ScheduleBottomBar";
import useScheduleAlertState from "@/view/pages/patient/hooks/useScheduleAlertState";
import useScheduleDerivedState from "@/view/pages/patient/hooks/useScheduleDerivedState";
import useScheduleLifecycle from "@/view/pages/patient/hooks/useScheduleLifecycle";
import useRedirectEffect from "@/view/hooks/useRedirectEffect";
import { useAuthHomeViewModel, usePatientScheduleViewModel } from "@/di/container";
const SCREEN_W = Dimensions.get("window").width;

export default function ScheduleScreen() {
  const insets = useSafeAreaInsets();
  const { user, unauthenticatedRedirect, calendarPermissionRedirect } = useAuthHomeViewModel();
  const patientId = user?.id || "";

  const {
    selectedDate,
    availableSlots,
    selectedSlot,
    loading,
    submitting,
    error,
    successMessage,
    availabilityMap,
    nutritionist,
    nutritionistError,
    navigationRoute,
    navigationMethod,
    selectDate,
    selectSlot,
    submitAppointment,
    loadMonthAvailability,
    loadNutritionist,
    clearNutritionistError,
    clearError,
    clearSuccess,
    goBack,
    clearNavigation,
    confirmSuccessRedirect,
  } = usePatientScheduleViewModel();

  useScheduleLifecycle({
    loadNutritionist,
    nutritionistId: nutritionist?.id ?? null,
    patientId: user?.id ?? null,
    loadMonthAvailability,
  });

  useRedirectEffect(unauthenticatedRedirect);
  useRedirectEffect(calendarPermissionRedirect);
  useRedirectEffect(navigationRoute, { method: navigationMethod, onComplete: clearNavigation });

  const alertState = useScheduleAlertState({
    error,
    nutritionistError,
    successMessage,
    onClearError: clearError,
    onClearNutritionistError: clearNutritionistError,
    onClearSuccess: clearSuccess,
    onConfirmSuccess: confirmSuccessRedirect,
  });

  const H_PADDING = spacing.lg;
  const GAP = spacing.sm;
  const columns = 4;

  const {
    selectedDateFormatted,
    todayISO,
    times,
    markedDates,
    pillWidth,
    handleDayPress,
    handleSelectTime,
  } = useScheduleDerivedState({
    selectedDate,
    availableSlots,
    availabilityMap,
    nutritionistId: nutritionist?.id ?? null,
    patientId: user?.id ?? null,
    selectDate,
    selectSlot,
    screenWidth: SCREEN_W,
    horizontalPadding: H_PADDING,
    gap: GAP,
    columns,
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title="Agenda" onBack={goBack} />

      <View style={styles.calendarCard}>
        <ScheduleCalendar
          markedDates={markedDates}
          todayISO={todayISO}
          onDayPress={handleDayPress}
          onMonthChange={(month) => {
            if (!nutritionist) return;
            loadMonthAvailability(month.year, month.month, nutritionist.id, user?.id ?? undefined);
          }}
        />
      </View>

      <View style={styles.appointmentsSection}>
        <ScheduleSlotsSection
          selectedDate={selectedDate}
          selectedDateFormatted={selectedDateFormatted}
          loading={loading}
          times={times}
          selectedTime={selectedSlot?.timeStart ?? null}
          pillWidth={pillWidth}
          gap={GAP}
          onSelectTime={handleSelectTime}
        />
      </View>

      <ScheduleBottomBar
        submitting={submitting}
        disabled={submitting || !selectedSlot}
        paddingBottom={Math.max(spacing.lg, insets.bottom + 10)}
        onSubmit={() => submitAppointment(patientId)}
      />

      <AlertModal
        visible={alertState.visible}
        variant={alertState.variant}
        title={alertState.title}
        message={alertState.message}
        onConfirm={alertState.onConfirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  calendarCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.xl + 6,
    backgroundColor: colors.background,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  appointmentsSection: {
    flex: 1,
    padding: spacing.md,
  },
});
