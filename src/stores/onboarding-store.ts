import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PersonalDetails {
  phone_number: string;
  date_of_birth: string;
  gender: "male" | "female" | "prefer_not_to_say" | "";
  location: string;
}

interface AboutYou {
  occupation: string;
  work_feeling: string;
  ideal_work: string;
  platform_motivation: string;
}

interface VedantaGoals {
  yoga_motivation: string;
  has_practiced_before: boolean;
  years_of_practice: number;
}

export interface OnboardingState {
  step: number;
  personalDetails: PersonalDetails;
  aboutYou: AboutYou;
  healthConditions: string[];
  vedantaGoals: VedantaGoals;
}

export interface OnboardingActions {
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setPersonalDetails: (data: OnboardingState["personalDetails"]) => void;
  setAboutYou: (data: OnboardingState["aboutYou"]) => void;
  setHealthConditions: (conditions: string[]) => void;
  setVedantaGoals: (data: OnboardingState["vedantaGoals"]) => void;
  reset: () => void;
}

const TOTAL_STEPS = 6;

const initialState: OnboardingState = {
  step: 0,
  personalDetails: {
    phone_number: "",
    date_of_birth: "",
    gender: "",
    location: "",
  },
  aboutYou: {
    occupation: "",
    work_feeling: "",
    ideal_work: "",
    platform_motivation: "",
  },
  healthConditions: [],
  vedantaGoals: {
    yoga_motivation: "",
    has_practiced_before: false,
    years_of_practice: 0,
  },
};

export const useOnboardingStore = create<OnboardingState & OnboardingActions>()(
  persist(
    (set) => ({
      ...initialState,

      setStep: (step) =>
        set({ step: Math.max(0, Math.min(step, TOTAL_STEPS - 1)) }),

      nextStep: () =>
        set((state) => ({
          step: Math.min(state.step + 1, TOTAL_STEPS - 1),
        })),

      prevStep: () =>
        set((state) => ({
          step: Math.max(state.step - 1, 0),
        })),

      setPersonalDetails: (data) => set({ personalDetails: data }),

      setAboutYou: (data) => set({ aboutYou: data }),

      setHealthConditions: (conditions) =>
        set({ healthConditions: conditions }),

      setVedantaGoals: (data) => set({ vedantaGoals: data }),

      reset: () => set(initialState),
    }),
    {
      name: "yoga-onboarding",
    },
  ),
);
