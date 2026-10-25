// src/components/ui/AppDropdown.tsx
import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";

export interface DropdownOption<T extends string> {
  label: string;
  value: T;
}

interface AppDropdownProps<T extends string> {
  label?: string;
  placeholder?: string;
  value?: T;
  options: DropdownOption<T>[];
  onSelect: (value: T) => void;
  error?: string;
}

export function AppDropdown<T extends string>({
  placeholder = "Select option",
  value,
  options,
  onSelect,
  error,
}: AppDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const { colors } = useAppTheme();

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <View className="w-full">
      {/* Trigger Button */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setIsOpen(true)}
        className={`h-14 bg-surface border ${
          error ? "border-destructive" : "border-border"
        } rounded-2xl px-4 flex-row items-center justify-between`}
      >
        <Text
          className={`font-inter text-base ${
            selectedOption ? "text-primary-text" : "text-muted-text"
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Ionicons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={18}
          color={colors.mutedText}
        />
      </TouchableOpacity>

      {error && (
        <Text className="text-destructive font-inter text-xs mt-1.5 ml-1">
          {error}
        </Text>
      )}

      {/* Options Modal */}
      <Modal visible={isOpen} transparent animationType="fade">
        <Pressable
          className="flex-1 bg-black/60 justify-end"
          onPress={() => setIsOpen(false)}
        >
          <View className="bg-canvas border-t border-border rounded-t-3xl p-6 pb-10">
            <View className="w-12 h-1 bg-border rounded-full self-center mb-6" />
            <Text className="text-primary-text font-inter-bold text-lg mb-4">
              Select Gender
            </Text>

            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              ItemSeparatorComponent={() => <View className="h-2" />}
              renderItem={({ item }) => {
                const isSelected = item.value === value;
                return (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      onSelect(item.value);
                      setIsOpen(false);
                    }}
                    className={`h-16 px-4 rounded-xl flex-row items-center justify-between border ${
                      isSelected
                        ? "bg-lime/10 border-lime"
                        : "bg-surface border-border"
                    }`}
                  >
                    <Text
                      className={`font-inter-medium text-base ${
                        isSelected ? "text-lime" : "text-primary-text"
                      }`}
                    >
                      {item.label}
                    </Text>
                    {isSelected && (
                      <Ionicons
                        name="checkmark"
                        size={20}
                        color={colors.primaryText}
                      />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
