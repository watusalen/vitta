import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import useLoadFonts from '@/view/hooks/useLoadFonts';
import AppErrorBoundary from '@/view/pages/AppError';
import ErrorScreen from '@/view/components/ErrorScreen';
import * as diContainer from '@/di/container';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const fontsLoaded = useLoadFonts();
  const [boundaryKey, setBoundaryKey] = useState(0);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  if (getMissingFirebaseConfig().length > 0 || getMissingDependencies().length > 0) {
    return (
      <SafeAreaProvider>
        <ErrorScreen message="Falha ao inicializar o aplicativo." />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <AppErrorBoundary onReset={() => setBoundaryKey((key) => key + 1)} key={boundaryKey}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)/login" />
          <Stack.Screen name="(auth)/register" />
          <Stack.Screen name="(auth)/forgot-password" />
          <Stack.Screen name="(patient)/patient-home" />
          <Stack.Screen name="(patient)/schedule" />
          <Stack.Screen name="(patient)/my-appointments" />
          <Stack.Screen name="(patient)/appointment/[id]" />
          <Stack.Screen name="(nutritionist)/nutritionist-home" />
          <Stack.Screen name="(nutritionist)/pending-requests" />
          <Stack.Screen name="(nutritionist)/agenda" />
          <Stack.Screen name="(nutritionist)/nutritionist-appointment/[id]" />
        </Stack>
      </AppErrorBoundary>
    </SafeAreaProvider>
  );
}

function getMissingDependencies() {
  const required = [
    { name: 'useAuthHomeViewModel', value: diContainer.useAuthHomeViewModel },
    { name: 'useAuthLoginViewModel', value: diContainer.useAuthLoginViewModel },
    { name: 'useAuthSignUpViewModel', value: diContainer.useAuthSignUpViewModel },
    { name: 'usePatientScheduleViewModel', value: diContainer.usePatientScheduleViewModel },
    { name: 'usePatientAppointmentsViewModel', value: diContainer.usePatientAppointmentsViewModel },
    { name: 'usePatientAppointmentDetailsViewModel', value: diContainer.usePatientAppointmentDetailsViewModel },
    { name: 'usePatientHomeViewModel', value: diContainer.usePatientHomeViewModel },
    { name: 'useNutritionistAgendaViewModel', value: diContainer.useNutritionistAgendaViewModel },
    { name: 'useNutritionistPendingRequestsViewModel', value: diContainer.useNutritionistPendingRequestsViewModel },
    { name: 'useNutritionistHomeViewModel', value: diContainer.useNutritionistHomeViewModel },
    { name: 'useNutritionistAppointmentDetailsViewModel', value: diContainer.useNutritionistAppointmentDetailsViewModel },
  ];

  return required.filter(({ value }) => typeof value !== 'function').map(({ name }) => name);
}

function getMissingFirebaseConfig() {
  const required = [
    'EXPO_PUBLIC_FIREBASE_API_KEY',
    'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
    'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'EXPO_PUBLIC_FIREBASE_APP_ID',
  ] as const;

  return required.filter((key) => !process.env[key]);
}
