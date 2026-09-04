import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography, radii } from "@/theme/tokens";
import { getShadow } from "@/theme/shadows";
import { categoryGradients } from "@/theme/gradients";
import { Button } from "@/components/Button";
import { Avatar } from "@/components/Avatar";
import { Divider } from "@/components/Divider";
import { useGetSkillQuery } from "@/redux/api/skillsApi";
import { useMentorReviewsQuery } from "@/redux/api/reviewsApi";
import { User } from "@/types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { HomeStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<HomeStackParamList, "SkillDetail">;

export function SkillDetailScreen({ route, navigation }: Props) {
  const { colors } = useTheme();
  const { skillId } = route.params;
  const { data: skill, isLoading } = useGetSkillQuery(skillId);
  const mentor = skill?.mentor && typeof skill.mentor === "object" ? (skill.mentor as User) : null;
  const { data: reviews } = useMentorReviewsQuery(mentor?.id ?? mentor?._id ?? "", {
    skip: !mentor,
  });

  if (isLoading || !skill) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const grad = categoryGradients[skill.category] ?? categoryGradients.development;
  const priceLabel = "$" + skill.hourlyPrice + "/hr";

  const openChat = () => {
    if (!mentor) return;
    const mentorId = mentor.id ?? mentor._id;
    navigation.getParent()?.navigate("ChatTab", {
      screen: "Conversation",
      params: { userId: mentorId, userName: mentor.name },
    });
  };

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.topBar}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather name="chevron-left" size={28} color="#F8FAFC" />
          </Pressable>
          <Text style={styles.pageTitle}>Skill Details</Text>
        </View>

        <LinearGradient
          colors={grad.colors as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroContent}>
            <View style={styles.heroTopRow}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{skill.category}</Text>
              </View>
              <View style={styles.priceBadge}>
                <Text style={styles.priceText}>{priceLabel.split("/")[0]}</Text>
                <Text style={styles.priceUnit}>/hr</Text>
              </View>
            </View>
            <Text style={styles.heroTitle}>{skill.title}</Text>
          </View>
        </LinearGradient>

        {mentor ? (
          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <View style={styles.section}>
              <View style={[styles.mentorCard, getShadow(colors, "md"), { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.bookingPanel}>
                  <Pressable
                    onPress={openChat}
                    style={({ pressed }) => [
                      styles.bookingButton,
                      styles.darkButton,
                      { opacity: pressed ? 0.9 : 1 },
                    ]}
                  >
                    <Feather name="message-circle" size={20} color="#F8FAFC" />
                    <Text style={styles.bookingButtonText}>Message</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => navigation.navigate("BookSession", { skillId })}
                    style={({ pressed }) => [
                      styles.bookingButton,
                      styles.primaryButton,
                      { opacity: pressed ? 0.92 : 1 },
                    ]}
                  >
                    <Feather name="calendar" size={20} color="#FFFFFF" />
                    <Text style={styles.bookingButtonText}>Book Session</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Animated.View>
        ) : null}

        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <View style={styles.section}>
            <Text style={[typography.h4, { color: colors.text, marginBottom: spacing.md }]}>About this skill</Text>
            <Text style={[typography.body, { color: colors.textMuted, lineHeight: 24 }]}>{skill.description}</Text>
          </View>
        </Animated.View>

        {skill.tags && skill.tags.length > 0 ? (
          <Animated.View entering={FadeInDown.delay(250).duration(400)}>
            <View style={styles.section}>
              <Text style={[typography.h4, { color: colors.text, marginBottom: spacing.md }]}>Topics covered</Text>
              <View style={styles.tagsContainer}>
                {skill.tags.map((tag) => (
                  <View key={tag} style={[styles.tag, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
                    <Text style={[typography.caption, { color: colors.textMuted }]}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>
        ) : null}

        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <View style={styles.section}>
            <Text style={[typography.h4, { color: colors.text, marginBottom: spacing.md }]}>{"Reviews " + (reviews ? "(" + reviews.length + ")" : "")}</Text>
            {reviews && reviews.length > 0 ? (
              reviews.slice(0, 5).map((r) => (
                <View key={r._id} style={[styles.reviewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.starsRow}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Feather key={s} name="star" size={14} color={s <= r.rating ? colors.warning : colors.border} style={{ marginRight: 2 }} />
                      ))}
                    </View>
                    <Text style={[typography.tiny, { color: colors.textMuted }]}>{new Date(r.createdAt).toLocaleDateString()}</Text>
                  </View>
                  {r.comment ? (
                    <Text style={[typography.bodySmall, { color: colors.textMuted, marginTop: spacing.sm }]}>{r.comment}</Text>
                  ) : null}
                </View>
              ))
            ) : (
              <Text style={[typography.body, { color: colors.textMuted }]}>No reviews yet. Be the first to book this skill.</Text>
            )}
          </View>
        </Animated.View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

function StatItem({ icon, value, label, colors }: { icon: string; value: string; label: string; colors: any }) {
  return (
    <View style={styles.statItem}>
      <Feather name={icon as any} size={16} color={colors.primary} />
      <Text style={[typography.bodyMedium, { color: colors.text, marginTop: 4 }]}>{value}</Text>
      <Text style={[typography.tiny, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  scrollContent: { paddingBottom: spacing.xxl },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: "#030B14",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  pageTitle: {
    ...typography.h3,
    color: "#F8FAFC",
    marginLeft: spacing.md,
  },

  hero: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    borderRadius: radii.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    backgroundColor: "#0E1E31",
  },
  heroContent: {},
  priceBadge: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  categoryBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
  },
  categoryText: {
    ...typography.small,
    color: "#FFFFFF",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "700",
  },
  priceText: {
    ...typography.h2,
    color: "#FFFFFF",
    fontWeight: "800",
    letterSpacing: -1,
  },
  priceUnit: {
    ...typography.body,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "600",
  },
  heroTitle: {
    ...typography.h1,
    color: "#FFFFFF",
    maxWidth: 300,
    lineHeight: 54,
  },

  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },

  mentorCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.lg,
    backgroundColor: "#111B2A",
  },
  bookingPanel: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  bookingButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  darkButton: {
    backgroundColor: "rgba(148,163,184,0.12)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.16)",
  },
  primaryButton: {
    backgroundColor: "#3B82F6",
    shadowColor: "#3B82F6",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  bookingButtonText: {
    ...typography.bodyMedium,
    color: "#F8FAFC",
    fontWeight: "700",
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },

  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  tag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    borderWidth: 1,
  },

  reviewCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  starsRow: {
    flexDirection: "row",
  },
});
