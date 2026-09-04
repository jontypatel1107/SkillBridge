import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography, radii } from "@/theme/tokens";
import { getShadow } from "@/theme/shadows";
import { gradients } from "@/theme/gradients";
import { Avatar } from "@/components/Avatar";
import { Chip } from "@/components/Chip";
import { Button } from "@/components/Button";
import { SkeletonCard } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { useGetPublicProfileQuery } from "@/redux/api/userApi";
import { categoryGradients } from "@/theme/gradients";
import type { Skill } from "@/types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ExploreStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<ExploreStackParamList, "MentorDetail">;

export function MentorDetailScreen({ route, navigation }: Props) {
  const { colors } = useTheme();
  const { username, mentor: initialMentor } = route.params;
  const { data, isLoading } = useGetPublicProfileQuery(username);
  const mentor = data?.user ?? initialMentor;
  const listings = data?.listings ?? [];

  const openChat = () => {
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
          <Text style={styles.pageTitle}>Mentor Profile</Text>
        </View>

        <LinearGradient
          colors={gradients.primary.colors as any}
          start={gradients.primary.start}
          end={gradients.primary.end}
          style={styles.headerGradient}
        >
          <View style={styles.avatarRing}>
            <Avatar uri={mentor.avatarUrl} name={mentor.name} size={80} />
          </View>
          <Text style={styles.name}>{mentor.name}</Text>
          <Text style={styles.username}>@{mentor.username}</Text>
          <View style={styles.roleBadge}>
            <Feather name="award" size={12} color="rgba(255,255,255,0.9)" />
            <Text style={styles.roleText}>Mentor</Text>
          </View>
        </LinearGradient>

        <Animated.View entering={FadeInDown.delay(50).duration(400)}>
          <View
            style={[
              styles.infoCard,
              getShadow(colors, "sm"),
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.infoRow}>
              <View style={styles.infoBlock}>
                <Feather name="star" size={16} color={colors.warning} />
                <Text style={[typography.bodyMedium, { color: colors.text, marginTop: 4 }]}>
                  {mentor.rating ? mentor.rating.toFixed(1) : "—"}
                </Text>
                <Text style={[typography.caption, { color: colors.textMuted }]}>Rating</Text>
              </View>
              <View style={[styles.infoDivider, { backgroundColor: colors.border }]} />
              <View style={styles.infoBlock}>
                <Feather name="zap" size={16} color={colors.primary} />
                <Text style={[typography.bodyMedium, { color: colors.text, marginTop: 4 }]}>
                  {mentor.level ?? 1}
                </Text>
                <Text style={[typography.caption, { color: colors.textMuted }]}>Level</Text>
              </View>
              <View style={[styles.infoDivider, { backgroundColor: colors.border }]} />
              <View style={styles.infoBlock}>
                <Feather name="layers" size={16} color={colors.cyan} />
                <Text style={[typography.bodyMedium, { color: colors.text, marginTop: 4 }]}>
                  {mentor.skills?.length ?? 0}
                </Text>
                <Text style={[typography.caption, { color: colors.textMuted }]}>Skills</Text>
              </View>
            </View>

            {mentor.skills && mentor.skills.length > 0 ? (
              <View style={styles.skillsWrap}>
                {mentor.skills.slice(0, 10).map((skill) => (
                  <Chip key={skill} label={skill} />
                ))}
              </View>
            ) : null}

            {mentor.bio ? (
              <Text style={[typography.bodySmall, { color: colors.text, marginTop: spacing.md, lineHeight: 20 }]}>
                {mentor.bio}
              </Text>
            ) : null}

            <Button
              label="Message"
              onPress={openChat}
              icon={<Feather name="message-circle" size={18} color="#FFFFFF" />}
              style={styles.chatButton}
            />
          </View>
        </Animated.View>

        {mentor.location?.city ? (
          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <View
              style={[
                styles.infoCard,
                getShadow(colors, "sm"),
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View style={styles.locationTitle}>
                <Feather name="map-pin" size={16} color={colors.primary} />
                <Text style={[typography.h4, { color: colors.text, marginLeft: spacing.sm }]}>
                  Location
                </Text>
              </View>
              <Text style={[typography.bodySmall, { color: colors.textMuted, marginBottom: spacing.sm }]}>
                Based in {mentor.location.city}
              </Text>
              {mentor.distanceKm != null ? (
                <View style={styles.distanceRow}>
                  <Feather name="navigation" size={14} color={colors.cyan} />
                  <Text style={[typography.small, { color: colors.textMuted, marginLeft: spacing.xs }]}>
                    {mentor.distanceKm < 1 ? "<1" : mentor.distanceKm} km from you
                  </Text>
                </View>
              ) : null}
            </View>
          </Animated.View>
        ) : null}

        <Text style={[typography.h3, { color: colors.text, marginTop: spacing.lg, marginBottom: spacing.md }]}>
          Listings ({isLoading ? "..." : listings.length})
        </Text>        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard style={{ marginTop: spacing.md }} />
          </>
        ) : listings.length === 0 ? (
          <EmptyState
            icon="📦"
            title="No listings yet"
            subtitle="This mentor hasn't published any skill listings yet, but you can still message them."
            action={<Chip label="Message" onPress={openChat} />}
          />
        ) : (
          listings.map((skill) => (
            <Pressable
              key={skill._id}
              onPress={() => navigation.navigate("SkillDetail", { skillId: skill._id })}
              style={({ pressed }) => ({ opacity: pressed ? 0.95 : 1 })}
            >
              <ListingCard skill={skill} />
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}

function ListingCard({ skill }: { skill: Skill }) {
  const { colors } = useTheme();
  const grad = categoryGradients[skill.category] ?? categoryGradients.development;

  return (
    <View
      style={[
        styles.listingCard,
        getShadow(colors, "sm"),
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={[styles.listingIcon, { backgroundColor: grad.colors[0] + "18" }]}>
        <Feather name="layers" size={20} color={grad.colors[0]} />
      </View>
      <View style={styles.listingContent}>
        <View style={styles.listingTopRow}>
          <Text style={[typography.bodyMedium, { color: colors.text }]} numberOfLines={1}>
            {skill.title}
          </Text>
          <View style={[styles.pricePill, { backgroundColor: colors.primaryMuted }]}>
            <Text style={[typography.bodyMedium, { color: colors.primary, fontWeight: "700" }]}>
              ${skill.hourlyPrice}
            </Text>
          </View>
        </View>
        <Text style={[typography.bodySmall, { color: colors.textMuted, marginTop: 6 }]} numberOfLines={2}>
          {skill.description}
        </Text>
        <View style={[styles.miniCategory, { backgroundColor: grad.colors[0] + "18", alignSelf: "flex-start", marginTop: spacing.sm }]}>
          <Text style={[typography.tiny, { color: grad.colors[0], textTransform: "capitalize" }]}>
            {skill.category}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg + 6,
    paddingBottom: spacing.md,
    backgroundColor: gradients.primary.colors[0],
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  pageTitle: {
    ...typography.bodyMedium,
    color: "#F8FAFC",
    fontWeight: "700",
  },
  headerGradient: {
    alignItems: "center",
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  avatarRing: {
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
    borderRadius: 44,
    padding: 2,
  },
  name: {
    ...typography.h2,
    color: "#FFFFFF",
    marginTop: spacing.sm,
    textAlign: "center",
  },
  username: {
    ...typography.bodySmall,
    color: "rgba(255,255,255,0.85)",
    marginTop: spacing.xs,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    marginTop: spacing.sm,
  },
  roleText: {
    ...typography.caption,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  infoCard: {
    marginHorizontal: spacing.lg,
    marginTop: -spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoBlock: {
    flex: 1,
    alignItems: "center",
  },
  infoDivider: {
    width: StyleSheet.hairlineWidth,
    height: 40,
  },
  skillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  chatButton: {
    marginTop: spacing.lg,
  },
  chatsButton: {},
  locationTitle: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  distanceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
  },
  listingCard: {
    flexDirection: "row",
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  listingIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  listingContent: {
    flex: 1,
  },
  listingTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  pricePill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
  },
  miniCategory: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
});