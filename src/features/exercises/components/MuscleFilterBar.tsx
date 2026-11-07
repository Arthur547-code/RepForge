// src/features/exercises/components/MuscleFilterBar.tsx
import { FlatList, View } from "react-native";
import { Button } from "@/components/ui/Button";

interface MuscleFilterBarProps {
  muscles: string[];
  selectedMuscle: string;
  onSelectMuscle: (muscle: string) => void;
}

export function MuscleFilterBar({
  muscles,
  selectedMuscle,
  onSelectMuscle,
}: MuscleFilterBarProps) {
  return (
    <View className="pb-1 pt-1">
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={muscles}
        keyExtractor={(item) => item}
        renderItem={({ item }) => {
          const isSelected = selectedMuscle.toLowerCase() === item.toLowerCase();
          return (
            <Button
              label={item}
              onPress={() => onSelectMuscle(item)}
              variant={isSelected ? "primary" : "secondary"}
              className={`mr-2 h-auto rounded-full border px-4 py-2 ${
                isSelected
                  ? "border-lime bg-lime"
                  : "border-border bg-surface"
              }`}
            />
          );
        }}
      />
    </View>
  );
}
