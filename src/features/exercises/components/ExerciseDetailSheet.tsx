// src/features/exercises/components/ExerciseDetailSheet.tsx
import { View, Text, Image, Modal, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/theme/hooks/useAppTheme";
import { ParsedExercise } from "../services/exercise.service";

interface ExerciseDetailModalProps {
  visible: boolean;
  exercise: ParsedExercise | null;
  onClose: () => void;
}

export function ExerciseDetailSheet({
  visible,
  exercise,
  onClose,
}: ExerciseDetailModalProps) {
  const { colors } = useAppTheme();

  if (!exercise) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <View className="flex-1 justify-end bg-black/75">
        <Pressable
          onPress={onClose}
          className="absolute inset-0"
          accessibilityLabel="Close exercise details"
        />
        {/* Sheet Container */}
        <View className="h-[85%] rounded-t-3xl border-t border-border bg-canvas px-5 pt-4">
          {/* Drag Handle Indicator */}
          <View className="mb-4 items-center">
            <View className="h-1.5 w-12 rounded-full bg-border" />
          </View>

          <View className="mb-5 flex-row items-start justify-between">
            <View className="mr-4 flex-1">
              <Text className="mb-1 font-inter-semibold text-xs uppercase tracking-[2px] text-lime">
                Exercise details
              </Text>
              <Text className="font-inter text-xs text-muted-text">
                Focus on control and clean form.
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              hitSlop={8}
              className="h-9 w-9 items-center justify-center rounded-full border border-border bg-surface"
            >
              <Ionicons name="close" size={18} color={colors.mutedText} />
            </Pressable>
          </View>

          {/* Scrollable Content Container */}
          <ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            bounces={true}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingBottom: 80,
            }}
          >
            {/* Header Title & Tags */}
            <View className="mb-5">
              <Text className="font-inter-bold text-2xl tracking-tight text-primary-text">
                {exercise.name}
              </Text>
              <View className="flex-row items-center gap-2 mt-2 flex-wrap">
                <View className="rounded-full border border-lime/30 bg-lime/10 px-3 py-1.5">
                  <Text className="font-inter-semibold text-xs capitalize text-lime">
                    {exercise.primaryMuscle ?? "Target Muscle"}
                  </Text>
                </View>

                {exercise.equipment && (
                  <View className="rounded-full border border-border bg-surface px-3 py-1.5">
                    <Text className="font-inter-semibold text-xs capitalize text-muted-text">
                      {exercise.equipment}
                    </Text>
                  </View>
                )}

                {exercise.level && (
                  <View className="rounded-full border border-border bg-surface px-3 py-1.5">
                    <Text className="font-inter-semibold text-xs capitalize text-muted-text">
                      {exercise.level}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Images */}
            {exercise.images && exercise.images.length > 0 && (
              <View className="mb-6 flex-row gap-3">
                {exercise.images.slice(0, 2).map((imgUri, index) => (
                  <View
                    key={index}
                    className="aspect-square flex-1 overflow-hidden rounded-2xl border border-border bg-surface"
                  >
                    <Image
                      source={{ uri: imgUri }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                    <View className="absolute bottom-2 left-2 bg-black/70 px-2 py-0.5 rounded">
                      <Text className="font-inter-bold text-[10px] uppercase text-primary-text">
                        {index === 0 ? "Start" : "Peak"}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Secondary Muscles */}
            {exercise.secondaryMuscles &&
              exercise.secondaryMuscles.length > 0 && (
                <View className="mb-6">
                  <Text className="mb-2 font-inter-semibold text-xs uppercase tracking-wider text-muted-text">
                    Secondary Muscles
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {exercise.secondaryMuscles.map((muscle) => (
                      <View
                        key={muscle}
                        className="rounded-lg border border-border bg-surface px-3 py-1.5"
                      >
                        <Text className="font-inter text-xs capitalize text-muted-text">
                          {muscle}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

            {/* Instructions */}
            {exercise.instructions && exercise.instructions.length > 0 && (
              <View className="mb-4">
                <Text className="mb-3 font-inter-semibold text-xs uppercase tracking-wider text-muted-text">
                  Execution Instructions
                </Text>
                <View>
                  {exercise.instructions.map((step, idx) => (
                    <View key={idx} className="mb-3 flex-row items-start">
                      <View className="mr-3 mt-0.5 h-6 w-6 shrink-0 items-center justify-center rounded-full border border-lime/30 bg-lime/10">
                        <Text className="font-inter-bold text-xs text-lime">
                          {idx + 1}
                        </Text>
                      </View>
                      <Text className="flex-1 font-inter text-sm leading-5 text-primary-text">
                        {step}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
