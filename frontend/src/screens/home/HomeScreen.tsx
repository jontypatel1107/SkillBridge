import React, { useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Pressable,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography, radii } from "@/theme/tokens";
import { getShadow } from "@/theme/shadows";
import { gradients, categoryGradients } from "@/theme/gradients";
import { useSearchSkillsQuery } from "@/redux/api/skillsApi";
import { useRecommendedMentorsQuery, useSuggestedSkillsQuery } from "@/redux/api/aiApi";
import { useAppSelector } from "@/hooks/redux";
import { Skill, User, SkillCategory } from "@/types";
import { Avatar } from "@/components/Avatar";
import { SectionHeader } from "@/components/SectionHeader";
import { SearchBar } from "@/components/SearchBar";
import { SkeletonCard, SkeletonMentorCard } from "@/components/Skeleton";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { HomeStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<HomeStackParamList, "HomeFeed">;

const CATEGORIES: { label: string; icon: string; key: SkillCategory }[] = [
  { label: "Coding", icon: "code", key: "development" },
  { label: "Design", icon: "pen-tool", key: "design" },
  { label: "Music", icon: "music", key: "music" },
  { label: "Fitness", icon: "activity", key: "fitness" },
  { label: "AI/ML", icon: "cpu", key: "ai" },
  { label: "Languages", icon: "globe", key: "languages" },
  { label: "Business", icon: "briefcase", key: "business" },
  { label: "Photo", icon: "camera", key: "photography" },
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function HomeScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const user = useAppSelector((s) => s.auth.user);
  const { data, isLoading, isFetching, refetch } = useSearchSkillsQuery({ sort: "newest" });
  const { data: recommended, isLoading: mentorsLoading } = useRecommendedMentorsQuery();
  const { data: suggested, isLoading: suggestionsLoading } = useSuggestedSkillsQuery();

  const skills = useMemo(() => data?.skills ?? [], [data]);

  const mentors = useMemo(() => recommended ?? [], [recommended]);
  const suggestedSkills = useMemo(() => suggested ?? [], [suggested]);

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} />
        }
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <View style={styles.greetingRow}>
            <View style={{ flex: 1 }}>
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                {getGreeting()} {getGreetingEmoji()}
              </Text>
              <Text style={[typography.h1, { color: colors.text }]} numberOfLines={1}>
                {user?.name?.split(" ")[0] ?? "there"}
              </Text>
            </View>
            <Avatar uri={user?.avatarUrl} name={user?.name ?? "U"} size={48} />
          </View>

          <Pressable onPress={() => navigation.getParent()?.navigate("ExploreTab")}>
            <SearchBar
              value=""
              onChangeText={() => {}}
              placeholder="What do you want to learn?"
              style={{ marginTop: spacing.lg }}
            />
          </Pressable>
        </Animated.View>

        {/* AI Card */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <Pressable
            onPress={() =>
              navigation.getParent()?.navigate("ProfileTab", {
                screen: "Roadmaps",
              })
            }
            style={({ pressed }) => [{ opacity: pressed ? 0.95 : 1 }]}
          >
            <LinearGradient
              colors={gradients.hero.colors as any}
              start={gradients.hero.start}
              end={gradients.hero.end}
              style={[styles.aiCard, getShadow(colors, "float")]}
            >
              <View style={styles.aiCardTop}>
                <Feather name="zap" size={20} color="rgba(255,255,255,0.9)" />
                <Text style={styles.aiLabel}>AI POWERED</Text>
              </View>
              <Text style={styles.aiTitle}>Not sure what to learn?</Text>
              <Text style={styles.aiSubtitle}>
                Let AI build your personalized learning roadmap.
              </Text>
              <View style={[styles.aiCTA, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
                <Text style={styles.aiCTAText}>Create Roadmap</Text>
                <Feather name="arrow-right" size={16} color="#FFFFFF" />
              </View>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {/* Categories */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <SectionHeader title="Categories" action="See all" onAction={() => navigation.getParent()?.navigate("ExploreTab")} />
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={CATEGORIES}
            keyExtractor={(c) => c.key}
            contentContainerStyle={styles.categoriesList}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => navigation.getParent()?.navigate("ExploreTab")}
                style={({ pressed }) => [
                  styles.categoryItem,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    opacity: pressed ? 0.85 : 1,
                  },
                  getShadow(colors, "sm"),
                ]}
              >
                <View
                  style={[
                    styles.categoryIcon,
                    { backgroundColor: (categoryGradients[item.key]?.colors[0] ?? colors.primary) + "18" },
                  ]}
                >
                  <Feather
                    name={item.icon as any}
                    size={20}
                    color={categoryGradients[item.key]?.colors[0] ?? colors.primary}
                  />
                </View>
                <Text style={[typography.caption, { color: colors.text }]} numberOfLines={1}>
                  {item.label}
                </Text>
              </Pressable>
            )}
          />
        </Animated.View>

        {/* Recommended Mentors */}
        {mentorsLoading ? (
          <Animated.View entering={FadeInDown.delay(300).duration(400)}>
            <SectionHeader title="Recommended Mentors" />
            <View style={styles.mentorsList}>
              <SkeletonMentorCard />
              <SkeletonMentorCard />
            </View>
          </Animated.View>
        ) : mentors.length > 0 ? (
          <Animated.View entering={FadeInDown.delay(300).duration(400)}>
            <SectionHeader title="Recommended Mentors" />
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={mentors}
              keyExtractor={(m) => m.id ?? m._id ?? Math.random().toString()}
              contentContainerStyle={styles.mentorsList}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {}}
                  style={({ pressed }) => [
                    styles.mentorCard,
                    getShadow(colors, "sm"),
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      opacity: pressed ? 0.95 : 1,
                    },
                  ]}
                >
                  <Avatar uri={item.avatarUrl} name={item.name} size={48} online />
                  <Text style={[typography.bodyMedium, { color: colors.text, marginTop: spacing.sm }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {item.skills && item.skills.length > 0 ? (
                    <Text style={[typography.caption, { color: colors.primary, marginTop: 2 }]} numberOfLines={1}>
                      {item.skills[0]}
                    </Text>
                  ) : null}
                  <View style={styles.mentorRating}>
                    {item.rating ? (
                      <Text style={[typography.small, { color: colors.warning }]}>
                        ⭐ {item.rating.toFixed(1)}
                      </Text>
                    ) : (
                      <Text style={[typography.small, { color: colors.textMuted }]}>New</Text>
                    )}
                  </View>
                </Pressable>
              )}
            />
          </Animated.View>
        ) : null}

        {/* Trending Skills */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <SectionHeader
            title="Trending Skills"
            action="See all"
            onAction={() => navigation.getParent()?.navigate("ExploreTab")}
          />
          {isLoading ? (
            <View>
              <SkeletonCard />
              <SkeletonCard style={{ marginTop: spacing.md }} />
            </View>
          ) : skills.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="layers" size={40} color={colors.textMuted} />
              <Text style={[typography.bodyMedium, { color: colors.textMuted, marginTop: spacing.sm }]}>
                No listings yet — be the first to teach something.
              </Text>
            </View>
          ) : (
            skills.slice(0, 5).map((skill, index) => (
              <Animated.View
                key={skill._id}
                entering={FadeInDown.delay(50 + index * 60).duration(300)}
              >
                <Pressable
                  onPress={() => navigation.navigate("SkillDetail", { skillId: skill._id })}
                  style={({ pressed }) => ({ opacity: pressed ? 0.95 : 1 })}
                >
                  <SkillListItem skill={skill} />
                </Pressable>
              </Animated.View>
            ))
          )}
        </Animated.View>

        {/* Suggested for You */}
        {suggestionsLoading ? (
          <Animated.View entering={FadeInDown.delay(500).duration(400)}>
            <SectionHeader title="Suggested for You" />
            <View>
              <SkeletonCard />
              <SkeletonCard style={{ marginTop: spacing.md }} />
            </View>
          </Animated.View>
        ) : suggestedSkills.length > 0 ? (
          <Animated.View entering={FadeInDown.delay(500).duration(400)}>
            <SectionHeader title="Suggested for You" />
            {suggestedSkills.slice(0, 3).map((skill, index) => (
              <Animated.View
                key={skill._id}
                entering={FadeInDown.delay(60 + index * 70).duration(300)}
              >
                <Pressable
                  onPress={() => navigation.navigate("SkillDetail", { skillId: skill._id })}
                  style={({ pressed }) => ({ opacity: pressed ? 0.95 : 1 })}
                >
                  <SkillListItem skill={skill} />
                </Pressable>
              </Animated.View>
            ))}
          </Animated.View>
        ) : null}

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </View>
  );
}

function getGreetingEmoji(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "☀️";
  if (hour < 17) return "👋";
  return "🌙";
}

function SkillListItem({ skill }: { skill: Skill }) {
  const { colors } = useTheme();
  const mentor = typeof skill.mentor === "object" ? (skill.mentor as User) : null;
  const grad = categoryGradients[skill.category] ?? categoryGradients.development;

  return (
    <View style={[styles.skillItem, getShadow(colors, "sm"), { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.skillAccent, { backgroundColor: grad.colors[0] }]} />
      <View style={styles.skillContent}>
        <View style={styles.skillTopRow}>
          <View style={[styles.categoryPill, { backgroundColor: grad.colors[0] + "18" }]}>
            <Text style={[typography.small, { color: grad.colors[0], textTransform: "capitalize" }]}>
              {skill.category}
            </Text>
          </View>
          <Text style={[typography.bodyMedium, { color: colors.primary, fontWeight: "600" }]}>
            ${skill.hourlyPrice}/hr
          </Text>
        </View>
        <Text style={[typography.h4, { color: colors.text, marginTop: spacing.sm }]} numberOfLines={1}>
          {skill.title}
        </Text>
        <Text numberOfLines={2} style={[typography.bodySmall, { color: colors.textMuted, marginTop: 4 }]}>
          {skill.description}
        </Text>
        {mentor ? (
          <View style={styles.skillMentor}>
            <Avatar uri={mentor.avatarUrl} name={mentor.name} size={24} />
            <Text style={[typography.caption, { color: colors.textMuted, marginLeft: spacing.sm }]}>
              {mentor.name}
              {mentor.rating ? ` · ⭐ ${mentor.rating.toFixed(1)}` : ""}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { paddingBottom: spacing.xxl },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  greetingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  // AI Card
  aiCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  aiCardTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  aiLabel: {
    ...typography.small,
    color: "rgba(255,255,255,0.8)",
    letterSpacing: 1.2,
    fontWeight: "700",
  },
  aiTitle: {
    ...typography.h3,
    color: "#FFFFFF",
  },
  aiSubtitle: {
    ...typography.body,
    color: "rgba(255,255,255,0.8)",
    marginTop: spacing.xs,
  },
  aiCTA: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  aiCTAText: {
    ...typography.bodyMedium,
    color: "#FFFFFF",
    fontWeight: "600",
  },

  // Categories
  categoriesList: {
    paddingRight: spacing.lg,
    gap: spacing.sm,
  },
  categoryItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    minWidth: 80,
    borderWidth: 1,
    gap: spacing.sm,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },

  // Mentors
  mentorsList: {
    paddingRight: spacing.lg,
    gap: spacing.md,
  },
  mentorCard: {
    width: 130,
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.md,
    alignItems: "center",
  },
  mentorRating: {
    marginTop: spacing.xs,
  },

  // Skills
  skillItem: {
    flexDirection: "row",
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  skillAccent: {
    width: 4,
  },
  skillContent: {
    flex: 1,
    padding: spacing.md,
  },
  skillTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  skillMentor: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
  },

  // Empty
  emptyContainer: {
    alignItems: "center",
    paddingVertical: spacing.xxl,
  },
});
