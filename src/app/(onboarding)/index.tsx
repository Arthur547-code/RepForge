// src/app/(onboarding)/index.tsx
import { View, Text, ScrollView } from "react-native";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OptionButton } from "@/components/ui/OptionButton";
import { AppDropdown, DropdownOption } from "@/components/ui/AppDropdown";
import { Button } from "@/components/ui/Button";
import {
  profileSchema,
  ProfileInput,
  GENDER_VALUES,
} from "@/features/profile/schema/profile.schema";

import { useRouter } from "expo-router";

import { authClient } from "@/lib/auth/auth-client";

import { useCompleteOnboarding } from "@/features/profile/hooks/useProfileMutations";

const GOAL_OPTIONS = [
  { label: "Build muscle", value: "muscle_gain" },
  { label: "Get stronger", value: "strength" },
  { label: "Lose fat", value: "fat_loss" },
  { label: "Stay healthy", value: "general_fitness" },
] as const;

const EXPERIENCE_OPTIONS = [
  { label: "Beginner", value: "beginner" },
  { label: "Intermediate", value: "intermediate" },
  { label: "Advanced", value: "advanced" },
] as const;

const GENDER_DROPDOWN_OPTIONS: DropdownOption<
  (typeof GENDER_VALUES)[number]
>[] = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
  { label: "Prefer not to say", value: "prefer_not_to_say" },
];

const WEIGHT_UNIT_OPTIONS = [
  { label: "Kilograms • kg", value: "kg" },
  { label: "Pounds • lb", value: "lb" },
] as const;

export default function OnboardingScreen() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      trainingGoal: undefined,
      experienceLevel: undefined,
      gender: undefined,
      weightUnit: undefined,
    },
  });

  // ✅ React Compiler compatible: useWatch specifically subscribes to fields without breaking memoization
  const [trainingGoal, experienceLevel, gender, weightUnit] = useWatch({
    control,
    name: ["trainingGoal", "experienceLevel", "gender", "weightUnit"],
  });

  const selectedCount = [
    trainingGoal,
    experienceLevel,
    gender,
    weightUnit,
  ].filter(Boolean).length;

  const { mutate: completeOnboarding, isPending } =
    useCompleteOnboarding(userId ?? "");

  const onSubmit = (data: ProfileInput) => {
    if (!userId) return;

    completeOnboarding(data, {
      onSuccess: () => {
        router.replace("/(app)/(tabs)");
      },
      onError: (err) => {
        console.error("Failed to complete onboarding:", err);
      },
    });
  };

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        className="px-6 pt-12 pb-6"
      >
        {/* Step Indicator & Titles */}
        <Text className="text-lime font-inter-bold text-xs uppercase tracking-widest mb-3">
          Setup • Step {String(selectedCount).padStart(2, "0")} of 04
        </Text>
        <Text className="text-primary-text font-inter-bold text-3xl tracking-tight leading-9">
          Make RepForge yours.
        </Text>
        <Text className="text-muted-text font-inter text-sm mt-1.5 leading-5 mb-5">
          We’ll tailor your training space around your goals.
        </Text>

        {/* Dynamic 4-Segment Progress Bar */}
        <View className="flex-row gap-2 mb-8">
          {[1, 2, 3, 4].map((stepIndex) => {
            const isFilled = selectedCount >= stepIndex;
            return (
              <View
                key={stepIndex}
                className={`flex-1 h-1 rounded-full ${
                  isFilled ? "bg-lime" : "bg-surface border border-border"
                }`}
              />
            );
          })}
        </View>

        {/* SECTION 1: YOUR GOAL */}
        <View className="mb-6">
          <Text className="text-muted-text font-inter-bold text-xs uppercase tracking-wider mb-3">
            YOUR GOAL
          </Text>
          <Controller
            control={control}
            name="trainingGoal"
            render={({ field: { value, onChange } }) => (
              <View className="flex-row flex-wrap gap-3">
                {GOAL_OPTIONS.map((goal) => (
                  <View key={goal.value} className="w-[48%]">
                    <OptionButton
                      label={goal.label}
                      isSelected={value === goal.value}
                      onPress={() => onChange(goal.value)}
                    />
                  </View>
                ))}
              </View>
            )}
          />
          {errors.trainingGoal && (
            <Text className="text-destructive font-inter text-xs mt-1.5 ml-1">
              {errors.trainingGoal.message}
            </Text>
          )}
        </View>

        {/* SECTION 2: EXPERIENCE */}
        <View className="mb-6">
          <Text className="text-muted-text font-inter-bold text-xs uppercase tracking-wider mb-3">
            EXPERIENCE
          </Text>
          <Controller
            control={control}
            name="experienceLevel"
            render={({ field: { value, onChange } }) => (
              <View className="flex-row gap-2.5">
                {EXPERIENCE_OPTIONS.map((exp) => (
                  <View key={exp.value} className="flex-1">
                    <OptionButton
                      label={exp.label}
                      isSelected={value === exp.value}
                      onPress={() => onChange(exp.value)}
                    />
                  </View>
                ))}
              </View>
            )}
          />
          {errors.experienceLevel && (
            <Text className="text-destructive font-inter text-xs mt-1.5 ml-1">
              {errors.experienceLevel.message}
            </Text>
          )}
        </View>

        {/* SECTION 3: GENDER */}
        <View className="mb-6">
          <Text className="text-muted-text font-inter-bold text-xs uppercase tracking-wider mb-3">
            Gender
          </Text>
          <Controller
            control={control}
            name="gender"
            render={({ field: { value, onChange } }) => (
              <AppDropdown
                placeholder="Select gender"
                value={value}
                options={GENDER_DROPDOWN_OPTIONS}
                onSelect={onChange}
                error={errors.gender?.message}
              />
            )}
          />
        </View>

        {/* SECTION 4: WEIGHT UNIT */}
        <View className="mb-6">
          <Text className="text-muted-text font-inter-bold text-xs uppercase tracking-wider mb-3">
            WEIGHT UNIT
          </Text>
          <Controller
            control={control}
            name="weightUnit"
            render={({ field: { value, onChange } }) => (
              <View className="flex-row gap-3">
                {WEIGHT_UNIT_OPTIONS.map((unit) => (
                  <View key={unit.value} className="flex-1">
                    <OptionButton
                      label={unit.label}
                      isSelected={value === unit.value}
                      onPress={() => onChange(unit.value)}
                    />
                  </View>
                ))}
              </View>
            )}
          />
          {errors.weightUnit && (
            <Text className="text-destructive font-inter text-xs mt-1.5 ml-1">
              {errors.weightUnit.message}
            </Text>
          )}
        </View>

        {/* Notice Card */}
        <View className="p-4 bg-surface border border-border rounded-2xl mb-8">
          <Text className="text-muted-text font-inter text-xs leading-4">
            You can change these preferences any time in Profile.
          </Text>
        </View>

        {/* Submit Button */}
        <Button
          label="Save and continue"
          loading={isPending}
          disabled={isPending}
          onPress={handleSubmit(onSubmit)}
        />
      </ScrollView>
    </View>
  );
}
