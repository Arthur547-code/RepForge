// src\features\exercises\ExerciseLibraryScreen.tsx
import React, { useState, useMemo, useRef } from "react";
import { View, FlatList, ActivityIndicator, Text } from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/theme/hooks/useAppTheme";

import { SearchBar } from "@/components/ui/SearchBar";
import { MuscleFilterBar } from "@/features/exercises/components/MuscleFilterBar";
import { ExerciseCard } from "@/features/exercises/components/ExerciseCard";
import { ExerciseDetailSheet } from "@/features/exercises/components/ExerciseDetailSheet";

import {
  useInfiniteExercises,
  useMuscleFilters,
} from "../../features/exercises/hooks/useExercises";
import { ParsedExercise } from "@/features/exercises/services/exercise.service";

export default function ExerciseLibraryScreen() {
  const { colors } = useAppTheme();
  const [search, setSearch] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState("all");
  const [activeExercise, setActiveExercise] = useState<ParsedExercise | null>(
    null,
  );

  const bottomSheetRef = useRef<BottomSheet>(null);

  const { data: filters = ["all"] } = useMuscleFilters();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteExercises(search, selectedMuscle);

  const flatExercises = useMemo(
    () => data?.pages.flatMap((page) => page) ?? [],
    [data],
  );

  const handleSelectExercise = (exercise: ParsedExercise) => {
    setActiveExercise(exercise);
    bottomSheetRef.current?.expand();
  };

  return (
    <View className="flex-1 bg-canvas px-4 pt-12">
      <View className="mb-5 flex-row items-end justify-between">
        <View className="flex-1 pr-4">
          <View className="mb-2 flex-row items-center">
            <View className="mr-2 h-2 w-2 rounded-full bg-lime" />
            <Text className="font-inter-semibold text-xs uppercase tracking-[2px] text-lime">
              RepForge library
            </Text>
          </View>
          <Text className="font-inter-bold text-3xl tracking-tight text-primary-text">
            Build your base.
          </Text>
          <Text className="mt-1 font-inter text-sm leading-5 text-muted-text">
            Find the right movement for every session.
          </Text>
        </View>
        <View className="h-11 w-11 items-center justify-center rounded-2xl border border-border bg-surface">
          <Ionicons name="barbell-outline" size={21} color={colors.lime} />
        </View>
      </View>

      {/* 1. Reusable Search Bar */}
      <SearchBar
        onSearchChange={setSearch}
        placeholder="Search exercise, muscle, equipment..."
        className="mb-3 py-3"
      />

      {/* 2. Muscle Filter Chips */}
      <MuscleFilterBar
        muscles={filters}
        selectedMuscle={selectedMuscle}
        onSelectMuscle={setSelectedMuscle}
      />

      {/* 3. Paginated List */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.lime} />
          <Text className="mt-3 font-inter-medium text-sm text-muted-text">
            Loading movements...
          </Text>
        </View>
      ) : (
        <FlatList
          data={flatExercises}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ExerciseCard exercise={item} onPress={handleSelectExercise} />
          )}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews
          initialNumToRender={10}
          maxToRenderPerBatch={8}
          updateCellsBatchingPeriod={50}
          windowSize={7}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 32 }}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View className="items-center py-5">
                <ActivityIndicator size="large" color={colors.lime} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View className="items-center justify-center px-8 py-24">
              <View className="mb-4 h-14 w-14 items-center justify-center rounded-2xl border border-border bg-surface">
                <Ionicons
                  name="search-outline"
                  size={24}
                  color={colors.mutedText}
                />
              </View>
              <Text className="font-inter-semibold text-base text-primary-text">
                No matching exercises found.
              </Text>
              <Text className="mt-1 text-center font-inter text-sm leading-5 text-muted-text">
                Try another movement, muscle, or equipment filter.
              </Text>
            </View>
          }
        />
      )}

      {/* 4. Bottom Sheet Modal */}

      <ExerciseDetailSheet
        visible={Boolean(activeExercise)}
        exercise={activeExercise}
        onClose={() => setActiveExercise(null)}
      />
    </View>
  );
}
