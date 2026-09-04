import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography, radii } from "@/theme/tokens";
import { getShadow } from "@/theme/shadows";
import { gradients } from "@/theme/gradients";
import { TextField } from "@/components/TextField";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { useGenerateRoadmapMutation, useMyRoadmapsQuery, LearningPlan } from "@/redux/api/aiApi";

export function RoadmapScreen() {
  const { colors } = useTheme();
  const [goal, setGoal] = useState("");
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [generate, { isLoading, error }] = useGenerateRoadmapMutation();
  const { data: plans, refetch } = useMyRoadmapsQuery();

  const onGenerate = async () => {
    if (!goal.trim()) return;
    try {
      await generate({ goal: goal.trim() }).unwrap();
      setGoal("");
      refetch();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
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
    >
      {/* AI Hero */}
      <Animated.View entering={FadeInDown.duration(400)}>
        <LinearGradient
          colors={gradients.hero.colors as any}
          start={gradients.hero.start}
          end={gradients.hero.end}
          style={styles.hero}
        >
          <View style={styles.heroBadge}>
            <Feather name="cpu" size={22} color="rgba(255,255,255,0.9)" />
          </View>
          <Text style={styles.heroTitle}>Your AI Learning Coach</Text>
          <Text style={styles.heroSubtitle}>
            Tell me what you want to learn and I'll build a personalized roadmap.
          </Text>
        </LinearGradient>
      </Animated.View>

      {/* Input */}
      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <View style={[styles.inputCard, getShadow(colors, "md"), { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TextField
            label="What do you want to learn?"
            placeholder="e.g. Become a React Native developer"
            value={goal}
            onChangeText={setGoal}
          />

          {serverError ? (
            <View style={[styles.errorBox, { backgroundColor: colors.danger + "12" }]}>
              <Feather name="alert-circle" size={14} color={colors.danger} />
              <Text style={[typography.caption, { color: colors.danger, marginLeft: spacing.sm, flex: 1 }]}>
                {serverError}
              </Text>
            </View>
          ) : null}

          <Button
            label="Build My Roadmap"
            onPress={onGenerate}
            loading={isLoading}
            style={styles.primaryAction}
            icon={!isLoading ? <Feather name="zap" size={18} color="#FFFFFF" /> : undefined}
          />
        </View>
      </Animated.View>

      {/* Roadmaps */}
      <Animated.View entering={FadeInDown.delay(200).duration(400)}>
        <Text style={[typography.h3, { color: colors.text, marginTop: spacing.xl, marginBottom: spacing.md }]}>
          Your Roadmaps
        </Text>

        {plans && plans.length > 0 ? (
          plans.map((plan, index) => (
            <Animated.View key={plan._id} entering={FadeInDown.delay(300 + index * 80).duration(300)}>
              <RoadmapCard
                plan={plan}
                expanded={expandedPlan === plan._id}
                onToggle={() =>
                  setExpandedPlan(expandedPlan === plan._id ? null : plan._id)
                }
              />
            </Animated.View>
          ))
        ) : (
          <EmptyState
            icon="🗺️"
            title="No roadmaps yet"
            subtitle="Describe your learning goal above to generate your first roadmap."
          />
        )}
      </Animated.View>

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

function RoadmapCard({
  plan,
  expanded,
  onToggle,
}: {
  plan: LearningPlan;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={[styles.planCard, getShadow(colors, "sm"), { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Pressable onPress={onToggle}>
        <View style={styles.planHeader}>
          <View style={styles.planInfo}>
            <Text style={[typography.bodyMedium, { color: colors.text }]} numberOfLines={expanded ? undefined : 2}>
              {plan.goal}
            </Text>
            <View style={styles.planMeta}>
              <View style={[styles.metaBadge, { backgroundColor: colors.primaryMuted }]}>
                <Feather name="calendar" size={12} color={colors.primary} />
                <Text style={[typography.tiny, { color: colors.primary }]}>
                  {plan.weeks.length} weeks
                </Text>
              </View>
              <View style={[styles.metaBadge, { backgroundColor: colors.surfaceMuted }]}>
                <Feather name="clock" size={12} color={colors.textMuted} />
                <Text style={[typography.tiny, { color: colors.textMuted }]}>
                  {plan.durationDays} days
                </Text>
              </View>
            </View>
          </View>
          <Feather
            name={expanded ? "chevron-up" : "chevron-down"}
            size={20}
            color={colors.textMuted}
          />
        </View>
      </Pressable>

      {/* Expanded Timeline */}
      {expanded ? (
        <View style={styles.timeline}>
          {plan.weeks.map((week, idx) => (
            <View key={week.week} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View
                  style={[
                    styles.timelineDot,
                    {
                      backgroundColor: idx === 0 ? colors.success : colors.primary,
                    },
                  ]}
                />
                {idx < plan.weeks.length - 1 ? (
                  <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
                ) : null}
              </View>
              <View style={styles.timelineContent}>
                <Text style={[typography.caption, { color: colors.primary, fontWeight: "700" }]}>
                  Week {week.week}
                </Text>
                <Text style={[typography.bodyMedium, { color: colors.text, marginTop: 2 }]}>
                  {week.title}
                </Text>
                {week.dailyTasks.length > 0 ? (
                  <View style={styles.taskList}>
                    {week.dailyTasks.slice(0, 3).map((task, i) => (
                      <View key={i} style={styles.taskRow}>
                        <Feather name="check-square" size={12} color={colors.success} />
                        <Text style={[typography.caption, { color: colors.textMuted, marginLeft: spacing.sm, flex: 1 }]}>
                          {task}
                        </Text>
                      </View>
                    ))}
                    {week.dailyTasks.length > 3 ? (
                      <Text style={[typography.tiny, { color: colors.textMuted, marginTop: 4 }]}>
                        +{week.dailyTasks.length - 3} more tasks
                      </Text>
                    ) : null}
                  </View>
                ) : null}
                {week.milestone ? (
                  <View style={[styles.milestoneBadge, { backgroundColor: colors.warning + "15" }]}>
                    <Feather name="flag" size={12} color={colors.warning} />
                    <Text style={[typography.tiny, { color: colors.warning, marginLeft: 4 }]}>
                      {week.milestone}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },

  // Hero
  hero: {
    borderRadius: radii.lg,
    padding: spacing.xl,
    alignItems: "center",
    overflow: "hidden",
  },
  heroBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
  },
  heroTitle: {
    ...typography.h2,
    color: "#FFFFFF",
    marginTop: spacing.md,
    textAlign: "center",
  },
  heroSubtitle: {
    ...typography.body,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    marginTop: spacing.sm,
    lineHeight: 22,
  },

  // Input Card
  inputCard: {
    marginTop: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  primaryAction: {
    marginTop: spacing.xs,
    width: "100%",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.xs,
  },

  // Plan Card
  planCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  planHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  planInfo: {
    flex: 1,
  },
  planMeta: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  metaBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.full,
    gap: 4,
  },

  // Timeline
  timeline: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "transparent",
  },
  timelineItem: {
    flexDirection: "row",
  },
  timelineLeft: {
    width: 24,
    alignItems: "center",
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
    marginBottom: -4,
  },
  timelineContent: {
    flex: 1,
    marginLeft: spacing.sm,
    paddingBottom: spacing.lg,
  },
  taskList: {
    marginTop: spacing.sm,
    gap: 6,
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  milestoneBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.full,
    marginTop: spacing.sm,
  },
});
