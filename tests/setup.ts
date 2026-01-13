jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  multiSet: jest.fn(() => Promise.resolve()),
  multiGet: jest.fn(() => Promise.resolve([])),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  clear: jest.fn(() => Promise.resolve()),
}));

jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(() => []),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  addDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
}));

jest.mock('expo-constants', () => ({
  expoConfig: { extra: {} },
  easConfig: {},
}));

global.console.warn = jest.fn();
global.console.error = jest.fn();

import Appointment from "@/model/entities/appointment";

type MatcherResult = {
  pass: boolean;
  message: () => string;
};

expect.extend({
  toBeValidAppointment(received: Appointment): MatcherResult {
    const isString = (value: unknown) => typeof value === "string" && value.trim().length > 0;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
    const validStatuses = ["pending", "accepted", "rejected", "cancelled"];
    const isValidDate = (d: unknown) => d instanceof Date && !isNaN(d.getTime());

    const checks = [
      { ok: isString(received?.id), reason: "id inválido" },
      { ok: isString(received?.patientId), reason: "patientId inválido" },
      { ok: isString(received?.nutritionistId), reason: "nutritionistId inválido" },
      { ok: isString(received?.date) && dateRegex.test(received.date), reason: "date inválida" },
      { ok: isString(received?.timeStart) && timeRegex.test(received.timeStart), reason: "timeStart inválido" },
      { ok: isString(received?.timeEnd) && timeRegex.test(received.timeEnd), reason: "timeEnd inválido" },
      { ok: validStatuses.includes(received?.status as string), reason: "status inválido" },
      { ok: isValidDate(received?.createdAt), reason: "createdAt inválido" },
      { ok: isValidDate(received?.updatedAt), reason: "updatedAt inválido" },
    ];

    const failed = checks.find((c) => !c.ok);

    if (failed) {
      return {
        pass: false,
        message: () => `Esperava um Appointment válido, falhou em: ${failed.reason}`,
      };
    }

    return {
      pass: true,
      message: () => "Appointment é válido",
    };
  },
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toBeValidAppointment(): R;
    }
  }
}
