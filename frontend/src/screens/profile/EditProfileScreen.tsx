import React, { useState, useCallback } from "react";
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
import { TextField } from "@/components/TextField";
import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { useUpdateProfileMutation } from "@/redux/api/userApi";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { updateUser } from "@/redux/slices/authSlice";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<ProfileStackParamList, "EditProfile">;

const SKILL_SUGGESTIONS = [
  "JavaScript", "TypeScript", "React", "React Native", "Node.js",
  "Python", "Java", "Swift", "Kotlin", "UI/UX Design",
  "Figma", "Photography", "Guitar", "Piano", "Cooking",
  "Fitness", "Yoga", "Marketing", "Business", "Public Speaking",
];

const INTEREST_SUGGESTIONS = [
  "Web Development", "Mobile Development", "AI/ML", "Data Science",
  "Design", "Music", "Fitness", "Photography", "Cooking",
  "Languages", "Business", "Startups",
];

const LANGUAGE_SUGGESTIONS = [
  "English", "Hindi", "Spanish", "French", "German",
  "Japanese", "Mandarin", "Arabic", "Portuguese",
];

const schema = z.object({
  name: z.string().trim().min(2, "At least 2 characters").max(80, "Max 80 characters"),
  bio: z.string().max(300, "Max 300 characters").optional(),
});
type FormValues = z.infer<typeof schema>;

export function EditProfileScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const [updateProfile, { isLoading, error }] = useUpdateProfileMutation();

  const [skills, setSkills] = useState<string[]>(user?.skills ?? []);
  const [interests, setInterests] = useState<string[]>(user?.interests ?? []);
  const [languages, setLanguages] = useState<string[]>(user?.languages ?? []);
  const [skillInput, setSkillInput] = useState("");
  const [interestInput, setInterestInput] = useState("");
  const [languageInput, setLanguageInput] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name ?? "",
      bio: user?.bio ?? "",
    },
  });

  const toggleItem = useCallback((item: string, list: string[], setList: (v: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  }, []);

  const addItem = useCallback((input: string, list: string[], setList: (v: string[]) => void, setInput: (v: string) => void) => {
    const trimmed = input.trim();
    if (trimmed && !list.includes(trimmed)) {
      setList([...list, trimmed]);
      setInput("");
    }
  }, []);

  const onSubmit = async (values: FormValues) => {
    try {
      const result = await updateProfile({
        name: values.name,
        bio: values.bio || undefined,
        skills,
        interests,
        languages,
      }).unwrap();
      dispatch(updateUser(result));
      navigation.goBack();
    } catch {
      // surfaced below
    }
  };

  const serverError =
    error && "data" in error ? (error.data as { message?: string })?.message : undefined;

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
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label="Full name"
                placeholder="Your name"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.name?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="bio"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label="Bio"
                placeholder="Tell others about yourself"
                multiline
                numberOfLines={3}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value ?? ""}
                error={errors.bio?.message}
                style={{ height: 90, textAlignVertical: "top", paddingTop: spacing.md }}
              />
            )}
          />
        </View>
      </Animated.View>

      {/* Skills */}
      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <Text style={[typography.h4, { color: colors.text, marginTop: spacing.xl, marginBottom: spacing.sm }]}>
          Skills
        </Text>
        <Text style={[typography.caption, { color: colors.textMuted, marginBottom: spacing.md }]}>
          What can you teach?
        </Text>
        <View style={styles.tagInput}>
          <TextField
            placeholder="Add a skill"
            value={skillInput}
            onChangeText={setSkillInput}
            style={{ flex: 1 }}
          />
          <Pressable
            onPress={() => addItem(skillInput, skills, setSkills, setSkillInput)}
            style={[styles.addButton, { backgroundColor: colors.primary }]}
          >
            <Feather name="plus" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
        <View style={styles.tagRow}>
          {skills.map((s) => (
            <Chip
              key={s}
              label={s}
              selected
              onPress={() => toggleItem(s, skills, setSkills)}
              icon={<Feather name="x" size={12} color="#FFFFFF" />}
            />
          ))}
        </View>
        <View style={styles.suggestionRow}>
          {SKILL_SUGGESTIONS.filter((s) => !skills.includes(s)).slice(0, 8).map((s) => (
            <Chip
              key={s}
              label={s}
              onPress={() => toggleItem(s, skills, setSkills)}
            />
          ))}
        </View>
      </Animated.View>

      {/* Interests */}
      <Animated.View entering={FadeInDown.delay(150).duration(400)}>
        <Text style={[typography.h4, { color: colors.text, marginTop: spacing.xl, marginBottom: spacing.sm }]}>
          Interests
        </Text>
        <Text style={[typography.caption, { color: colors.textMuted, marginBottom: spacing.md }]}>
          What do you want to learn?
        </Text>
        <View style={styles.tagInput}>
          <TextField
            placeholder="Add an interest"
            value={interestInput}
            onChangeText={setInterestInput}
            style={{ flex: 1 }}
          />
          <Pressable
            onPress={() => addItem(interestInput, interests, setInterests, setInterestInput)}
            style={[styles.addButton, { backgroundColor: colors.primary }]}
          >
            <Feather name="plus" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
        <View style={styles.tagRow}>
          {interests.map((s) => (
            <Chip
              key={s}
              label={s}
              selected
              onPress={() => toggleItem(s, interests, setInterests)}
              icon={<Feather name="x" size={12} color="#FFFFFF" />}
            />
          ))}
        </View>
        <View style={styles.suggestionRow}>
          {INTEREST_SUGGESTIONS.filter((s) => !interests.includes(s)).slice(0, 8).map((s) => (
            <Chip
              key={s}
              label={s}
              onPress={() => toggleItem(s, interests, setInterests)}
            />
          ))}
        </View>
      </Animated.View>

      {/* Languages */}
      <Animated.View entering={FadeInDown.delay(200).duration(400)}>
        <Text style={[typography.h4, { color: colors.text, marginTop: spacing.xl, marginBottom: spacing.sm }]}>
          Languages
        </Text>
        <View style={styles.tagInput}>
          <TextField
            placeholder="Add a language"
            value={languageInput}
            onChangeText={setLanguageInput}
            style={{ flex: 1 }}
          />
          <Pressable
            onPress={() => addItem(languageInput, languages, setLanguages, setLanguageInput)}
            style={[styles.addButton, { backgroundColor: colors.primary }]}
          >
            <Feather name="plus" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
        <View style={styles.tagRow}>
          {languages.map((s) => (
            <Chip
              key={s}
              label={s}
              selected
              onPress={() => toggleItem(s, languages, setLanguages)}
              icon={<Feather name="x" size={12} color="#FFFFFF" />}
            />
          ))}
        </View>
        <View style={styles.suggestionRow}>
          {LANGUAGE_SUGGESTIONS.filter((s) => !languages.includes(s)).slice(0, 8).map((s) => (
            <Chip
              key={s}
              label={s}
              onPress={() => toggleItem(s, languages, setLanguages)}
            />
          ))}
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

      {/* Save */}
      <Animated.View entering={FadeInDown.delay(250).duration(400)}>
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
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },

  formCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },

  tagInput: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },

  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  suggestionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
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
