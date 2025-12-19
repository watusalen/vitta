import React, { useMemo, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  Dimensions,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { router } from "expo-router";

import { colors, fonts, spacing, fontSizes } from "@/view/themes/theme";
import ScreenHeader from "@/view/components/ScreenHeader";
import TimePill from "@/view/components/TimePill";

import useScheduleViewModel from "@/viewmodel/appointment/useScheduleViewModel";
import useHomeViewModel from "@/viewmodel/auth/useHomeViewModel";
import {
  authUseCases,
  getAvailableTimeSlotsUseCase,
  requestAppointmentUseCase,
  getNutritionistUseCase,
} from "@/di/container";
import User from "@/model/entities/user";

LocaleConfig.locales["pt-br"] = {
  monthNames: [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ],
  monthNamesShort: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
  dayNames: ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"],
  dayNamesShort: ["D", "S", "T", "Q", "Q", "S", "S"],
  today: "Hoje",
};
LocaleConfig.defaultLocale = "pt-br";

function formatDateISO(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

const SCREEN_W = Dimensions.get("window").width;

export default function ScheduleScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useHomeViewModel(authUseCases);
  const patientId = user?.id || "";

  const [nutritionist, setNutritionist] = useState<User | null>(null);

  const {
    selectedDate,
    availableSlots,
    selectedSlot,
    observations,
    loading,
    submitting,
    error,
    successMessage,
    selectDate,
    selectSlot,
    setObservations,
    requestAppointment,
    clearError,
    clearSuccess,
  } = useScheduleViewModel(getAvailableTimeSlotsUseCase, requestAppointmentUseCase);

  useEffect(() => {
    getNutritionistUseCase.execute().then(setNutritionist);
  }, []);

  useEffect(() => {
    if (error) Alert.alert("Erro", error, [{ text: "OK", onPress: clearError }]);
  }, [error, clearError]);

  useEffect(() => {
    if (successMessage) {
      Alert.alert("Solicitação Enviada", successMessage, [
        {
          text: "OK",
          onPress: () => {
            clearSuccess();
            router.replace("/my-appointments");
          },
        },
      ]);
    }
  }, [successMessage, clearSuccess]);

  const selectedDateISO = selectedDate ? formatDateISO(selectedDate) : null;
  const todayISO = formatDateISO(new Date());

  const times = useMemo(() => availableSlots.map((s) => s.timeStart), [availableSlots]);

  const markedDates = useMemo(() => {
    // markingType="custom" -> usa customStyles
    const marks: Record<string, any> = {};

    // “hoje” com círculo bege (só se não for o selecionado)
    if (todayISO && todayISO !== selectedDateISO) {
      marks[todayISO] = {
        customStyles: {
          container: stylesCal.todayContainer,
          text: stylesCal.todayText,
        },
      };
    }

    // dia selecionado (círculo verde)
    if (selectedDateISO) {
      marks[selectedDateISO] = {
        customStyles: {
          container: stylesCal.selectedContainer,
          text: stylesCal.selectedText,
        },
      };
    }

    return marks;
  }, [todayISO, selectedDateISO]);

  function handleDayPress(day: { dateString: string }) {
    if (!nutritionist) return;

    const [y, m, d] = day.dateString.split("-").map(Number);
    // 12:00 evita bug de timezone
    selectDate(new Date(y, m - 1, d, 12, 0, 0), nutritionist.id);
  }

  function handleSelectTime(time: string) {
    const slot = availableSlots.find((s) => s.timeStart === time);
    if (slot) selectSlot(slot);
  }

  async function handleSubmit() {
    if (!selectedSlot) return Alert.alert("Atenção", "Selecione um horário disponível.");
    if (!nutritionist) return Alert.alert("Erro", "Nutricionista não encontrada.");
    await requestAppointment(patientId, nutritionist.id);
  }

  // --- grid perfeito (4 colunas) ---
  const H_PADDING = spacing.lg; // padding horizontal do conteúdo
  const GAP = spacing.sm;       // gap entre pills
  const columns = 4;

  const pillWidth = useMemo(() => {
    const totalGaps = GAP * (columns - 1);
    const usable = SCREEN_W - H_PADDING * 2 - totalGaps;
    return Math.floor(usable / columns);
  }, [H_PADDING, GAP]);

  function handleBack() {
    router.replace("/patient-home");
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title="Agendamento" onBack={handleBack} />

      {/* Card do calendário (igual ao mock) */}
      <View style={styles.calendarCard}>
        <Calendar
          onDayPress={handleDayPress}
          hideExtraDays
          enableSwipeMonths
          firstDay={0}
          minDate={todayISO}
          markedDates={markedDates}
          markingType="custom"
          theme={{
            backgroundColor: "transparent",
            calendarBackground: "transparent",

            // mês
            monthTextColor: colors.text,
            textMonthFontSize: fontSizes.lg + 4,
            textMonthFontWeight: "700",

            // dias semana (D S T...)
            textSectionTitleColor: colors.textSecondary,
            textDayHeaderFontSize: fontSizes.sm + 2,
            textDayHeaderFontWeight: "700",

            // dias
            textDayFontSize: fontSizes.md + 1,
            dayTextColor: colors.text,
            textDisabledColor: colors.textSecondary,

            // setas
            arrowColor: colors.text,

            // @ts-expect-error:
            "stylesheet.calendar.header": {
              header: {
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 6,
                paddingBottom: 10,
                marginBottom: 2,
              },
              week: {
                marginTop: 8,
                flexDirection: "row",
                justifyContent: "space-between",
                paddingHorizontal: 4,
              },
            },

            // deixa o dia mais “clicável” e uniforme
            "stylesheet.calendar.main": {
              dayContainer: {
                width: 44,
                height: 44,
                alignItems: "center",
                justifyContent: "center",
              },
            },
          }}
        />
      </View>

      <Text style={styles.sectionTitle}>Horários disponíveis</Text>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : times.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>
            {selectedDateISO ? "Nenhum horário disponível." : "Selecione uma data."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={times}
          keyExtractor={(item) => item}
          numColumns={4}
          columnWrapperStyle={{ gap: GAP, paddingHorizontal: H_PADDING }}
          contentContainerStyle={styles.timesContent}
          renderItem={({ item }) => (
            <View style={{ width: pillWidth }}>
              <TimePill
                time={item}
                selected={selectedSlot?.timeStart === item}
                onPress={() => handleSelectTime(item)}
              />
            </View>
          )}
        />
      )}

      {/* Campo de observações (opcional) */}
      {selectedSlot && (
        <View style={styles.observationsContainer}>
          <Text style={styles.observationsLabel}>Observações (opcional)</Text>
          <TextInput
            style={styles.observationsInput}
            placeholder="Ex: Prefiro horário pela manhã"
            placeholderTextColor={colors.textSecondary}
            value={observations}
            onChangeText={setObservations}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
      )}

      {/* bottom bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(spacing.lg, insets.bottom + 10) }]}>
        <TouchableOpacity
          style={[styles.submitButton, (submitting || !selectedSlot) && styles.submitDisabled]}
          onPress={handleSubmit}
          disabled={submitting || !selectedSlot}
          activeOpacity={0.9}
        >
          {submitting ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={styles.submitText}>Solicitar Consulta</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const stylesCal = StyleSheet.create({
  // “today” bege
  todayContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.inputBackground, // seu bege/cinza claro
    alignItems: "center",
    justifyContent: "center",
  },
  todayText: {
    color: colors.text,
    fontWeight: "700",
  },

  // selecionado verde
  selectedContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedText: {
    color: colors.background,
    fontWeight: "800",
  },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },

  calendarCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderRadius: 24,
    backgroundColor: colors.background,

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 2,
  },

  sectionTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
    fontSize: fontSizes.xl + 2,
    fontFamily: fonts.bold,
    color: colors.text,
  },

  centered: { paddingVertical: spacing.xl, alignItems: "center", justifyContent: "center" },
  emptyText: {
    fontSize: fontSizes.md,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    textAlign: "center",
  },

  timesContent: {
    paddingTop: spacing.xs,
    paddingBottom: 140, // espaço pro botão fixo
  },

  observationsContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },

  observationsLabel: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },

  observationsInput: {
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSizes.md,
    fontFamily: fonts.regular,
    color: colors.text,
    minHeight: 80,
  },

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
  },

  submitButton: {
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 14,
    elevation: 4,
  },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: colors.background, fontSize: fontSizes.lg, fontFamily: fonts.bold },
});
