import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
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
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
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

        {/* Mentor Card */}
        {mentor ? (
          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <View style={styles.section}>
              <Text style={[typography.h4, { color: colors.text, marginBottom: spacing.md }]}>
                Your Mentor
              </Text>
              <View style={[styles.mentorCard, getShadow(colors, "md"), { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.mentorHeader}>
                  <Avatar uri={mentor.avatarUrl} name={mentor.name} size={64} online />
                  <View style={styles.mentorInfo}>
                    <View style={styles.mentorNameRow}>
                      <Text style={[typography.h3, { color: colors.text }]}>{mentor.name}</Text>
                      {mentor.isVerified ? (
                        <View style={[styles.verifiedBadge, { backgroundColor: colors.primaryMuted }]}>
                          <Feather name="check-circle" size={14} color={colors.primary} />
                        </View>
                      ) : null}
                    </View>
                    {mentor.bio ? (
                      <Text style={[typography.bodySmall, { color: colors.textMuted, marginTop: 4 }]} numberOfLines={3}>
                        {mentor.bio}
                      </Text>
                    ) : null}
                  </View>
                </View>

                <Divider style={{ marginVertical: spacing.md }} />

                <View style={styles.statsRow}>
                  <StatItem
                    icon="star"
                    value={mentor.rating?.toFixed(1) ?? "New"}
                    label={(mentor.ratingCount ?? 0) + " reviews"}
                    colors={colors}
                  />
                  <StatItem
                    icon="award"
                    value={mentor.isVerified ? "Verified" : "Mentor"}
                    label={mentor.role === "mentor" ? "Teaching" : "Learning"}
                    colors={colors}
                  />
                  <StatItem
                    icon="globe"
                    value={mentor.languages?.[0] ?? "EN"}
                    label="Language"
                    colors={colors}
                  />
                </View>
              </View>
            </View>
          </Animated.View>
        ) : null}

        {/* Description */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <View style={styles.section}>
            <Text style={[typography.h4, { color: colors.text, marginBottom: spacing.md }]}>
              About this skill
            </Text>
            <Text style={[typography.body, { color: colors.textMuted, lineHeight: 24 }]}>
              {skill.description}
            </Text>
          </View>
        </Animated.View>

        {/* Tags */}
        {skill.tags && skill.tags.length > 0 ? (
          <Animated.View entering={FadeInDown.delay(250).duration(400)}>
            <View style={styles.section}>
              <Text style={[typography.h4, { color: colors.text, marginBottom: spacing.md }]}>
                Topics covered
              </Text>
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

        {/* Reviews */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <View style={styles.section}>
            <Text style={[typography.h4, { color: colors.text, marginBottom: spacing.md }]}>
              {"Reviews " + (reviews ? "(" + reviews.length + ")" : "")}
            </Text>
            {reviews && reviews.length > 0 ? (
              reviews.slice(0, 5).map((r) => (
                <View
                  key={r._id}
                  style={[styles.reviewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <View style={styles.reviewHeader}>
                    <View style={styles.starsRow}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Feather
                          key={s}
                          name="star"
                          size={14}
                          color={s <= r.rating ? colors.warning : colors.border}
                          style={{ marginRight: 2 }}
                        />
                      ))}
                    </View>
                    <Text style={[typography.tiny, { color: colors.textMuted }]}>
                      {new Date(r.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  {r.comment ? (
                    <Text style={[typography.bodySmall, { color: colors.textMuted, marginTop: spacing.sm }]}>
                      {r.comment}
                    </Text>
                  ) : null}
                </View>
              ))
            ) : (
              <Text style={[typography.body, { color: colors.textMuted }]}>
                No reviews yet. Be the first to book this skill.
              </Text>
            )}
          </View>
        </Animated.View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Sticky CTA */}
      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <View style={styles.footerLeft}>
          <Text style={[typography.caption, { color: colors.textMuted }]}>Starting from</Text>
          <Text style={[typography.h3, { color: colors.primary }]}>{priceLabel}</Text>
        </View>
        <View style={styles.footerButtons}>
          <Button label="Message" variant="secondary" onPress={openChat} />
          <View style={{ flex: 1 }}>
            <Button label="Book Session" onPress={() => navigation.navigate("BookSession", { skillId })} />
          </View>
        </View>
      </View>
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

  hero: {
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  heroContent: {},
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
  priceBadge: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  priceText: {
    ...typography.h2,
    color: "#FFFFFF",
  },
  priceUnit: {
    ...typography.body,
    color: "rgba(255,255,255,0.8)",
    marginLeft: 2,
  },
  heroTitle: {
    ...typography.h1,
    color: "#FFFFFF",
  },

  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },

  mentorCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
  mentorHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  mentorInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  mentorNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  verifiedBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
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

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    gap: spacing.md,
  },
  footerLeft: {
    minWidth: 80,
  },
  footerButtons: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
});
