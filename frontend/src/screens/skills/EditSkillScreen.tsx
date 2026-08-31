import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography, radii } from "@/theme/tokens";
import { getShadow } from "@/theme/shadows";
import { categoryGradients } from "@/theme/gradients";
import { TextField } from "@/components/TextField";
import { Button } from "@/components/Button";
import { SkeletonCard } from "@/components/Skeleton";
import { useGetSkillQuery, useUpdateSkillMutation } from "@/redux/api/skillsApi";
import { SkillCategory } from "@/types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<ProfileStackParamList, "EditSkill">;

const CATEGORIES: { key: SkillCategory; icon: string }[] = [
  { key: "development", icon: "code" },
  { key: "ai", icon: "cpu" },
  { key: "design", icon: "pen-tool" },
  { key: "music", icon: "music" },
  { key: "fitness", icon: "activity" },
  { key: "business", icon: "briefcase" },
  { key: "photography", icon: "camera" },
  { key: "cooking", icon: "coffee" },
  { key: "languages", icon: "globe" },
];

const schema = z.object({
  title: z.string().trim().min(3, "At least 3 characters"),
  description: z.string().trim().min(10, "At least 10 characters"),
  hourlyPrice: z.coerce.number().min(0, "Must be 0 or more"),
});
type FormValues = z.infer<typeof schema>;

export function EditSkillScreen({ route, navigation }: Props) {
  const { skillId } = route.params;
  const { colors } = useTheme();
  const { data: skill, isLoading: loadingSkill } = useGetSkillQuery(skillId);
  const [updateSkill, { isLoading, error }] = useUpdateSkillMutation();

  const [category, setCategory] = useState<SkillCategory>("development");

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (skill) {
      setCategory(skill.category);
      reset({
        title: skill.title,
        description: skill.description,
        hourlyPrice: skill.hourlyPrice,
      });
    }
  }, [skill, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      await updateSkill({ id: skillId, body: { ...values, category } }).unwrap();
      navigation.goBack();
    } catch {
      // surfaced below
    }
  };

  const serverError =
    error && "data" in error ? (error.data as { message?: string })?.message : undefined;

  if (loadingSkill) {
    return (
      <View style={[styles.flex, { backgroundColor: colors.background }]}>
        <View style={styles.listContent}>
          <SkeletonCard />
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Form */}
      <Animated.View entering={FadeInDown.duration(400)}>
        <View style={[styles.formCard, getShadow(colors, "sm"), { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label="Skill title"
                placeholder="e.g. React Native for Beginners"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.title?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label="Description"
                placeholder="What will learners get out of this?"
                multiline
                numberOfLines={4}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.description?.message}
                style={{ height: 110, textAlignVertical: "top", paddingTop: spacing.md }}
              />
            )}
          />

          <Controller
            control={control}
            name="hourlyPrice"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label="Hourly price ($)"
                placeholder="0 for free sessions"
                keyboardType="numeric"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value !== undefined ? String(value) : ""}
                error={errors.hourlyPrice?.message}
              />
            )}
          />
        </View>
      </Animated.View>

      {/* Category Picker */}
      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <Text style={[typography.h4, { color: colors.text, marginTop: spacing.xl, marginBottom: spacing.md }]}>
          Category
        </Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((c) => {
            const isActive = category === c.key;
            const grad = categoryGradients[c.key] ?? categoryGradients.development;
            return (
              <Pressable
                key={c.key}
                onPress={() => setCategory(c.key)}
                style={[
                  styles.categoryItem,
                  getShadow(colors, isActive ? "md" : "sm"),
                  {
                    backgroundColor: isActive ? grad.colors[0] + "18" : colors.surface,
                    borderColor: isActive ? grad.colors[0] : colors.border,
                  },
                ]}
              >
                <Feather
                  name={c.icon as any}
                  size={20}
                  color={isActive ? grad.colors[0] : colors.textMuted}
                />
                <Text
                  style={[
                    typography.caption,
                    {
                      color: isActive ? grad.colors[0] : colors.textMuted,
                      textTransform: "capitalize",
                      marginTop: 4,
                    },
                  ]}
                >
                  {c.key}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Animated.View>

      {/* Error */}
      {serverError ? (
        <View style={[styles.errorBox, { backgroundColor: colors.danger + "12", borderColor: colors.danger + "30" }]}>
          <Feather name="alert-circle" size={16} color={colors.danger} />
          <Text style={[typography.caption, { color: colors.danger, marginLeft: spacing.sm, flex: 1 }]}>
            {serverError}
          </Text>
        </View>
      ) : null}

      <Animated.View entering={FadeInDown.delay(200).duration(400)}>
        <Button
          label="Save Changes"
          onPress={handleSubmit(onSubmit)}
          loading={isLoading}
          icon={!isLoading ? <Feather name="check" size={18} color="#FFFFFF" /> : undefined}
          style={{ marginTop: spacing.xl }}
        />
      </Animated.View>

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },

  formCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },

  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  categoryItem: {
    width: "30%",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    marginTop: spacing.lg,
  },
});
