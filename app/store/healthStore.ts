"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface FoodEntry {
  id: string;
  date: string;
  meal: "breakfast" | "lunch" | "dinner" | "snack";
  imageUrl?: string;
  foods: Array<{
    name: string;
    portion: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  nutritionScore: number;
  assessment: string;
  suggestions: string[];
}

export interface LabResult {
  id: string;
  date: string;
  category: string;
  name: string;
  value: string;
  unit: string;
  normalMin?: number;
  normalMax?: number;
}

export interface UserProfile {
  name: string;
  age: number;
  gender: "male" | "female";
  height: number;
  weight: number;
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
  healthGoals: string[];
  conditions: string[];
}

export interface HealthAnalysis {
  overallScore: number;
  riskLevel: "low" | "medium" | "high";
  labAnalysis: {
    abnormalValues: Array<{
      name: string;
      value: string;
      normalRange: string;
      status: "high" | "low" | "normal";
      concern: string;
    }>;
    summary: string;
  };
  nutritionAnalysis: {
    avgDailyCalories: number;
    macroBalance: string;
    deficiencies: string[];
    excesses: string[];
  };
  recommendations: {
    diet: string[];
    exercise: string[];
    lifestyle: string[];
    medical: string[];
  };
  weeklyPlan: Record<string, { breakfast: string; lunch: string; dinner: string; exercise: string }>;
  followUp: string;
}

interface HealthStore {
  userProfile: UserProfile;
  foodHistory: FoodEntry[];
  labResults: LabResult[];
  healthAnalysis: HealthAnalysis | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  addFoodEntry: (entry: FoodEntry) => void;
  removeFoodEntry: (id: string) => void;
  addLabResult: (result: LabResult) => void;
  removeLabResult: (id: string) => void;
  setHealthAnalysis: (analysis: HealthAnalysis) => void;
}

export const useHealthStore = create<HealthStore>()(
  persist(
    (set) => ({
      userProfile: {
        name: "",
        age: 30,
        gender: "male",
        height: 170,
        weight: 65,
        activityLevel: "moderate",
        healthGoals: [],
        conditions: [],
      },
      foodHistory: [],
      labResults: [],
      healthAnalysis: null,
      activeTab: "dashboard",
      setActiveTab: (tab) => set({ activeTab: tab }),
      updateProfile: (profile) =>
        set((state) => ({ userProfile: { ...state.userProfile, ...profile } })),
      addFoodEntry: (entry) =>
        set((state) => ({ foodHistory: [entry, ...state.foodHistory].slice(0, 100) })),
      removeFoodEntry: (id) =>
        set((state) => ({ foodHistory: state.foodHistory.filter((e) => e.id !== id) })),
      addLabResult: (result) =>
        set((state) => ({ labResults: [result, ...state.labResults] })),
      removeLabResult: (id) =>
        set((state) => ({ labResults: state.labResults.filter((r) => r.id !== id) })),
      setHealthAnalysis: (analysis) => set({ healthAnalysis: analysis }),
    }),
    { name: "health-tracker-store" }
  )
);
