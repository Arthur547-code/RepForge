// src\features\exercises\components\ExerciseCard.tsx
import { Ionicons } from "@expo/vector-icons";
import { View, Text, Image, Pressable } from "react-native";
import { useAppTheme } from "@/theme/hooks/useAppTheme";
import { ParsedExercise } from "../services/exercise.service";

interface ExerciseCardProps {
  exercise: ParsedExercise;
  onPress: (exercise: ParsedExercise) => void;
}

export function ExerciseCard({ exercise, onPress }: ExerciseCardProps) {
  const firstImage = exercise.images[0];
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={() => onPress(exercise)}
      className="mb-2.5 flex-row items-center rounded-2xl border border-border bg-card p-3 active:bg-elevated"
    >
      {firstImage ? (
        <Image
          source={{ uri: firstImage }}
          className="h-[68px] w-[68px] rounded-xl bg-elevated"
          resizeMode="cover"
        />
      ) : (
        <View className="h-[68px] w-[68px] items-center justify-center rounded-xl bg-elevated">
          <Ionicons name="barbell-outline" size={23} color={colors.lime} />
        </View>
      )}

      <View className="ml-3 flex-1">
        <Text
          className="font-inter-semibold text-base text-primary-text"
          numberOfLines={1}
        >
          {exercise.name}
        </Text>
        <View className="mt-1 flex-row items-center">
          <Text className="font-inter text-xs capitalize text-muted-text">
            {exercise.primaryMuscle ?? "General"}
          </Text>
          <Text className="mx-1.5 text-xs text-border">-</Text>
          <Text className="font-inter text-xs capitalize text-muted-text">
            {exercise.equipment ?? "Bodyweight"}
          </Text>
        </View>
        <View className="mt-3 flex-row items-center">
          <View className="mr-1.5 h-1.5 w-1.5 rounded-full bg-lime" />
          <Text className="font-inter-medium text-[10px] uppercase tracking-wider text-muted-text">
            View details
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.mutedText} />
    </Pressable>
  );
}
