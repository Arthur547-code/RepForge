// src/features/auth/components/SignInForm.tsx
import React, { useState } from "react";
import { View, Text, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";

import { useAppTheme } from "@/hooks/useAppTheme";
import { Button } from "@/components/ui/Button";
import { signInSchema, SignInInput } from "../schema/auth.schema";

import OAuth from "./OAuth";
import { useSignInMutation } from "../hooks/useAuthMutations";

export function SignInForm() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const [showPassword, setShowPassword] = useState(false);

  // TanStack Query Mutation
  const { mutate: signIn, isPending, error: serverError } = useSignInMutation();

  // React Hook Form Setup
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: SignInInput) => {
    signIn(data);
  };

  return (
    <View className="flex-1 justify-between">
      <View>
        {/* Brand Header */}
        <View className="flex-row items-center mt-2 mb-10">
          <View className="w-12 h-12 rounded-2xl bg-lime items-center justify-center mr-3.5">
            <Text className="text-lime-foreground font-inter-bold text-2xl">
              R
            </Text>
          </View>
          <View>
            <Text className="text-primary-text font-inter-bold text-2xl tracking-tight leading-7">
              RepForge
            </Text>
            <Text className="text-muted-text font-inter text-xs">
              Your training, remembered.
            </Text>
          </View>
        </View>

        {/* Heading */}
        <View className="mb-8">
          <Text className="text-primary-text font-inter-bold text-3xl tracking-tight">
            Welcome back.
          </Text>
          <Text className="text-muted-text font-inter text-sm mt-2 leading-5">
            Sign in to continue logging your training sessions.
          </Text>
        </View>

        {/* Server Error Banner */}
        {serverError && (
          <View className="mb-5 p-3.5 bg-destructive/15 border border-destructive/40 rounded-xl">
            <Text className="text-destructive font-inter-medium text-xs">
              {serverError.message}
            </Text>
          </View>
        )}

        {/* Inputs */}
        <View className="gap-5">
          {/* Email Address */}
          <View>
            <Text className="text-muted-text font-inter-medium text-xs mb-2">
              Email address
            </Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.mutedText}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className={`h-14 bg-input border ${
                    errors.email ? "border-destructive" : "border-input-border"
                  } rounded-xl px-4 text-primary-text font-inter text-base`}
                />
              )}
            />
            {errors.email && (
              <Text className="text-destructive font-inter text-xs mt-1.5 ml-1">
                {errors.email.message}
              </Text>
            )}
          </View>

          {/* Password with Eye Toggle */}
          <View>
            <Text className="text-muted-text font-inter-medium text-xs mb-2">
              Password
            </Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <View
                  className={`h-14 bg-input border ${
                    errors.password
                      ? "border-destructive"
                      : "border-input-border"
                  } rounded-xl px-4 flex-row items-center`}
                >
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Enter your password"
                    placeholderTextColor={colors.mutedText}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    className="flex-1 h-full text-primary-text font-inter text-base pr-2"
                  />
                  <Button
                    activeOpacity={0.7}
                    onPress={() => setShowPassword((prev) => !prev)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    variant="secondary"
                    className="h-auto flex-none rounded-none border-0 bg-transparent px-0"
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color={colors.mutedText}
                    />
                  </Button>
                </View>
              )}
            />
            {errors.password && (
              <Text className="text-destructive font-inter text-xs mt-1.5 ml-1">
                {errors.password.message}
              </Text>
            )}
          </View>

          {/* Submit Button */}
          <Button
            label={isPending ? "Signing in..." : "Sign in"}
            disabled={isPending}
            activeOpacity={0.85}
            onPress={handleSubmit(onSubmit)}
            className="mt-2"
          />
        </View>

        {/* OAuth */}
        <OAuth />

        {/* Terms */}
        <Text className="text-muted-text font-inter text-center text-xs mt-6 leading-5">
          By continuing, you agree to our Terms and Privacy Policy.
        </Text>
      </View>

      {/* Footer Navigation */}
      <View className="flex-row justify-center items-center pt-6 pb-2">
        <Text className="text-muted-text font-inter text-sm">
          {`Don't have an account? `}
        </Text>
        <Button
          onPress={() => router.replace("/(auth)/sign-up")}
          activeOpacity={0.7}
          variant="secondary"
          className="h-auto rounded-none border-0 bg-transparent px-0"
        >
          <Text className="text-lime font-inter-bold text-sm">Sign up</Text>
        </Button>
      </View>
    </View>
  );
}
