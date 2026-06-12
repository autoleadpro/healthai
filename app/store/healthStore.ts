"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface FamilyMember {
  id: string;
  name: string;
  relation: "self" | "spouse" | "child" | "parent" | "grandparent" | "other";
  age: number;
  gender: "male" | "female";
  height: number;
  weight: number;
  avatar: string; // emoji
  conditions: string[];
}

export interface FoodEntry {
  id: string;
  memberId?: string;
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
  memberId?: string;
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
  nextSteps?: {
    period: string;
    dietFocus: Array<{ action: string; reason: string; target: string }>;
    activityFocus: Array<{ action: string; reason: string; target: string }>;
    habits: string[];
    avoid: string[];
    expectedOutcome: string;
  };
  followUp: string;
}

interface HealthStore {
  userProfile: UserProfile;
  foodHistory: FoodEntry[];
  labResults: LabResult[];
  healthAnalysis: HealthAnalysis | null;
  activeTab: string;
  members: FamilyMember[];
  activeMemberId: string;
  memberAnalyses: Record<string, HealthAnalysis>;
  setActiveTab: (tab: string) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  addFoodEntry: (entry: FoodEntry) => void;
  removeFoodEntry: (id: string) => void;
  addLabResult: (result: LabResult) => void;
  removeLabResult: (id: string) => void;
  setHealthAnalysis: (analysis: HealthAnalysis) => void;
  addMember: (member: FamilyMember) => void;
  updateMember: (id: string, data: Partial<FamilyMember>) => void;
  removeMember: (id: string) => void;
  setActiveMember: (id: string) => void;
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
      members: [
        { id: "me", name: "Tôi", relation: "self", age: 30, gender: "male", height: 170, weight: 65, avatar: "😊", conditions: [] },
      ],
      activeMemberId: "me",
      memberAnalyses: {},
      setActiveTab: (tab) => set({ activeTab: tab }),
      addMember: (member) => set((state) => ({ members: [...state.members, member] })),
      updateMember: (id, data) =>
        set((state) => ({ members: state.members.map((m) => (m.id === id ? { ...m, ...data } : m)) })),
      removeMember: (id) =>
        set((state) => ({
          members: state.members.filter((m) => m.id !== id),
          activeMemberId: state.activeMemberId === id ? "me" : state.activeMemberId,
          foodHistory: state.foodHistory.filter((f) => (f.memberId || "me") !== id),
          labResults: state.labResults.filter((r) => (r.memberId || "me") !== id),
        })),
      setActiveMember: (id) => set({ activeMemberId: id }),
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
      setHealthAnalysis: (analysis) =>
        set((state) => ({
          healthAnalysis: analysis,
          memberAnalyses: { ...state.memberAnalyses, [state.activeMemberId]: analysis },
        })),
    }),
    { name: "health-tracker-store" }
  )
);

// Data scoped to the currently selected family member.
export function useActiveMemberData() {
  const { members, activeMemberId, foodHistory, labResults, memberAnalyses, healthAnalysis } = useHealthStore();
  const member = members.find((m) => m.id === activeMemberId) || members[0];
  return {
    member,
    foodHistory: foodHistory.filter((f) => (f.memberId || "me") === activeMemberId),
    labResults: labResults.filter((r) => (r.memberId || "me") === activeMemberId),
    analysis: memberAnalyses[activeMemberId] ?? (activeMemberId === "me" ? healthAnalysis : null),
  };
}

export const RELATION_LABELS: Record<FamilyMember["relation"], { vi: string; en: string }> = {
  self: { vi: "Tôi", en: "Me" },
  spouse: { vi: "Vợ/Chồng", en: "Spouse" },
  child: { vi: "Con", en: "Child" },
  parent: { vi: "Bố/Mẹ", en: "Parent" },
  grandparent: { vi: "Ông/Bà", en: "Grandparent" },
  other: { vi: "Khác", en: "Other" },
};
