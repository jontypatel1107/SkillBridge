import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Location from "expo-location";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography, radii } from "@/theme/tokens";
import { getShadow } from "@/theme/shadows";
import { categoryGradients } from "@/theme/gradients";
import { SearchBar } from "@/components/SearchBar";
import { Chip } from "@/components/Chip";
import { EmptyState } from "@/components/EmptyState";
import { SkeletonCard } from "@/components/Skeleton";
import { MentorCard } from "@/components/MentorCard";
import { SectionHeader } from "@/components/SectionHeader";
import { useSearchSkillsQuery } from "@/redux/api/skillsApi";
import { useNearbyMentorsQuery } from "@/redux/api/userApi";
import { useAppSelector } from "@/hooks/redux";
import { Skill, SkillCategory, User } from "@/types";
import { Avatar } from "@/components/Avatar";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ExploreStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<ExploreStackParamList, "Explore">;

const CATEGORIES: { label: string; key: SkillCategory | "all"; icon: string }[] = [
  { label: "All", key: "all", icon: "layers" },
  { label: "Coding", key: "development", icon: "code" },
  { label: "AI/ML", key: "ai", icon: "cpu" },
  { label: "Design", key: "design", icon: "pen-tool" },
  { label: "Music", key: "music", icon: "music" },
  { label: "Fitness", key: "fitness", icon: "activity" },
  { label: "Business", key: "business", icon: "briefcase" },
  { label: "Photo", key: "photography", icon: "camera" },
  { label: "Cooking", key: "cooking", icon: "coffee" },
  { label: "Languages", key: "languages", icon: "globe" },
];

const SORT_OPTIONS: { label: string; value: "newest" | "priceLowHigh" | "priceHighLow" | "topRated" }[] = [
  { label: "Newest", value: "newest" },
  { label: "Price ↑", value: "priceLowHigh" },
  { label: "Price ↓", value: "priceHighLow" },
  { label: "Top Rated", value: "topRated" },
];

export function ExploreScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | null>(null);
  const [sort, setSort] = useState<"newest" | "priceLowHigh" | "priceHighLow" | "topRated">("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [appliedMinPrice, setAppliedMinPrice] = useState<number | undefined>(undefined);
  const [appliedMaxPrice, setAppliedMaxPrice] = useState<number | undefined>(undefined);

  const [page, setPage] = useState(1);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);

  const { data, isLoading, isFetching, refetch } = useSearchSkillsQuery({
    q: query.trim() || undefined,
    category: selectedCategory ?? undefined,
    sort,
    minPrice: appliedMinPrice,
    maxPrice: appliedMaxPrice,
    page,
  });

  const pagination = data?.pagination;
  const mentors = data?.mentors ?? [];

  // ---- Nearby mentors (uses your profile location, or device location as a fallback) ----
  const viewer = useAppSelector((s) => s.auth.user);
  const profileLoc = viewer?.location as { coordinates?: [number, number] } | undefined;
  const [deviceLoc, setDeviceLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [preferDevice, setPreferDevice] = useState(false);
  const [locating, setLocating] = useState(false);

  const nearCenter = useMemo(() => {
    if (deviceLoc && preferDevice) return deviceLoc;
    if (profileLoc?.coordinates && profileLoc.coordinates.length === 2) {
      return { lng: profileLoc.coordinates[0], lat: profileLoc.coordinates[1] };
    }
    if (deviceLoc) return deviceLoc;
    return null;
  }, [profileLoc, deviceLoc, preferDevice]);

  const {
    data: nearbyData,
    isLoading: nearbyLoading,
  } = useNearbyMentorsQuery(
    nearCenter ? { ...nearCenter, radiusKm: 25, limit: 20 } : { lng: 0, lat: 0 },
    { skip: !nearCenter }
  );

  const nearbyMentors = (nearbyData?.mentors ?? []).filter(
    (m) => (m.id ?? m._id) !== (viewer?.id ?? viewer?._id)
  );

  const tryDeviceLocation = useCallback(async (force = false) => {
    try {
      setLocating(true);
      if (force) setPreferDevice(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const loc = await Location.getCurrentPositionAsync({});
      setDeviceLoc({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    } catch {
      // ignore — fall back to profile location or hidden section
    } finally {
      setLocating(false);
    }
  }, []);

  useEffect(() => {
    if (!profileLoc?.coordinates && !deviceLoc) {
      tryDeviceLocation(false);
    }
  }, [profileLoc, deviceLoc, tryDeviceLocation]);


  useEffect(() => {
    if (page === 1) {
      setAllSkills(data?.skills ?? []);
    } else if (data?.skills) {
      setAllSkills((prev) => [...prev, ...data.skills]);
    }
  }, [data, page]);

  const handleCategoryPress = useCallback((key: SkillCategory) => {
    setSelectedCategory((prev) => (prev === key ? null : key));
    setPage(1);
  }, []);

  const handleSortChange = useCallback((value: typeof sort) => {
    setSort(value);
    setPage(1);
  }, []);

  const handleApplyPrice = useCallback(() => {
    const min = minPrice ? Number(minPrice) : undefined;
    const max = maxPrice ? Number(maxPrice) : undefined;
    setAppliedMinPrice(min);
    setAppliedMaxPrice(max);
    setPage(1);
  }, [minPrice, maxPrice]);

  const handleClearPrice = useCallback(() => {
    setMinPrice("");
    setMaxPrice("");
    setAppliedMinPrice(undefined);
    setAppliedMaxPrice(undefined);
    setPage(1);
  }, []);

  const handleSearchChange = useCallback((text: string) => {
    setQuery(text);
    setPage(1);
  }, []);

  const loadMore = useCallback(() => {
    if (!isFetching && pagination && page < pagination.totalPages) {
      setPage((prev) => prev + 1);
    }
  }, [isFetching, pagination, page]);

  const hasActiveFilters = !!selectedCategory || appliedMinPrice !== undefined || appliedMaxPrice !== undefined;

  const resetAllFilters = useCallback(() => {
    setSelectedCategory(null);
    setSort("newest");
    setMinPrice("");
    setMaxPrice("");
    setAppliedMinPrice(undefined);
    setAppliedMaxPrice(undefined);
    setPage(1);
  }, []);

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <LinearGradient
          colors={[colors.primary, colors.cyan]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <Text style={styles.heroEyebrow}>Discover</Text>
          <Text style={styles.heroTitle}>Find your next skill.</Text>
          <Text style={styles.heroSubtitle}>
            Explore curated classes, mentors, and high-impact learning paths.
          </Text>
          <View style={styles.heroStatsRow}>
            <View style={styles.heroStatPill}>
              <Feather name="users" size={12} color="#FFFFFF" />
              <Text style={styles.heroStatText}>Top mentors</Text>
            </View>
            <View style={styles.heroStatPill}>
              <Feather name="trending-up" size={12} color="#FFFFFF" />
              <Text style={styles.heroStatText}>Fresh picks</Text>
            </View>
          </View>
        </LinearGradient>

        <SearchBar
          value={query}
          onChangeText={handleSearchChange}
          placeholder="Search skills, mentors, topics..."
          style={styles.searchBar}
        />

        <View style={styles.toolbarRow}>
          <View style={styles.sortRow}>
            {SORT_OPTIONS.map((opt) => (
              <Chip
                key={opt.value}
                label={opt.label}
                selected={sort === opt.value}
                onPress={() => handleSortChange(opt.value)}
                style={styles.sortChip}
              />
            ))}
          </View>
          <Pressable
            onPress={() => setShowFilters((v) => !v)}
            style={[
              styles.filterToggle,
              {
                backgroundColor: hasActiveFilters ? colors.primary + "18" : colors.surfaceMuted,
                borderColor: hasActiveFilters ? colors.primary : colors.border,
              },
            ]}
          >
            <Feather name="sliders" size={16} color={hasActiveFilters ? colors.primary : colors.textMuted} />
          </Pressable>
        </View>

        {showFilters && (
          <Animated.View entering={FadeInDown.duration(200)}>
            <View style={[styles.filterPanel, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
              <Text style={[typography.caption, { color: colors.textMuted, marginBottom: spacing.sm }]}>Price Range ($/hr)</Text>
              <View style={styles.priceRow}>
                <TextInput
                  style={[styles.priceInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                  placeholder="Min"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  value={minPrice}
                  onChangeText={setMinPrice}
                />
                <Text style={[typography.caption, { color: colors.textMuted }]}>to</Text>
                <TextInput
                  style={[styles.priceInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                  placeholder="Max"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  value={maxPrice}
                  onChangeText={setMaxPrice}
                />
                <Pressable onPress={handleApplyPrice} style={[styles.applyBtn, { backgroundColor: colors.primary }]}>
                  <Feather name="check" size={16} color="#FFFFFF" />
                </Pressable>
                {hasActiveFilters && (
                  <Pressable onPress={resetAllFilters} style={[styles.applyBtn, { backgroundColor: colors.danger + "18" }]}>
                    <Feather name="x" size={16} color={colors.danger} />
                  </Pressable>
                )}
              </View>
            </View>
          </Animated.View>
        )}

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(c) => c.key}
          contentContainerStyle={styles.chipList}
          renderItem={({ item }) => {
            const isAll = item.label === "All";
            const selected = isAll ? !selectedCategory : selectedCategory === item.key;

            return (
              <Chip
                label={item.label}
                selected={selected}
                onPress={() => {
                  if (isAll) {
                    setSelectedCategory(null);
                    setPage(1);
                  } else {
                    handleCategoryPress(item.key as SkillCategory);
                  }
                }}
                icon={
                  <Feather
                    name={item.icon as any}
                    size={14}
                    color={selected ? "#FFFFFF" : colors.textMuted}
                  />
                }
              />
            );
          }}
        />
      </View>

      {/* Results */}
      {isLoading ? (
        <View style={styles.listContent}>
          <SkeletonCard />
          <SkeletonCard style={{ marginTop: spacing.md }} />
          <SkeletonCard style={{ marginTop: spacing.md }} />
        </View>
      ) : (
        <FlatList
          data={allSkills}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && page === 1}
              onRefresh={() => {
                setPage(1);
                refetch();
              }}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListHeaderComponent={
            <>
              {nearCenter && (nearbyMentors.length > 0 || nearbyLoading) ? (
                <View style={styles.mentorSection}>
                  <SectionHeader
                    title="Nearby Mentors"
                    action={locating ? "Locating…" : "Use my location"}
                    onAction={locating ? undefined : () => tryDeviceLocation(true)}
                  />
                  {nearbyLoading ? (
                    <View style={styles.nearbyLoader}>
                      <ActivityIndicator size="small" color={colors.primary} />
                    </View>
                  ) : (
                    <FlatList
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      data={nearbyMentors}
                      keyExtractor={(m) => m.id ?? m._id ?? m.username}
                      contentContainerStyle={styles.mentorList}
                      renderItem={({ item }) => (
                        <NearbyMentorCard
                          mentor={item}
                          onPress={() =>
                            navigation.navigate("MentorDetail", {
                              username: item.username,
                              mentor: item,
                            })
                          }
                        />
                      )}
                    />
                  )}
                </View>
              ) : null}
              {mentors.length > 0 ? (
                <View style={styles.mentorSection}>
                  <SectionHeader title="Mentors" />
                  <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={mentors}
                    keyExtractor={(m) => m.id ?? m._id ?? m.username}
                    contentContainerStyle={styles.mentorList}
                    renderItem={({ item }) => (
                      <MentorCard
                        mentor={item}
                        onPress={() =>
                          navigation.navigate("MentorDetail", {
                            username: item.username,
                            mentor: item,
                          })
                        }
                      />
                    )}
                  />
                </View>
              ) : null}
              {hasActiveFilters || query.trim() ? (
                <View style={styles.resultInfo}>
                  <Text style={[typography.caption, { color: colors.textMuted }]}>
                    {pagination?.total ?? allSkills.length} result{(pagination?.total ?? allSkills.length) !== 1 ? "s" : ""} found
                  </Text>
                </View>
              ) : null}
            </>
          }
          ListEmptyComponent={
            mentors.length === 0 ? (
              <EmptyState
                icon="🔍"
                title="No matches found"
                subtitle="Try a different search term or adjust your filters."
                action={
                  hasActiveFilters ? (
                    <Chip label="Clear filters" onPress={resetAllFilters} />
                  ) : undefined
                }
              />
            ) : null
          }
          ListFooterComponent={
            isFetching && page > 1 ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[typography.caption, { color: colors.textMuted, marginLeft: spacing.sm }]}>
                  Loading more...
                </Text>
              </View>
            ) : pagination && page >= pagination.totalPages && allSkills.length > 0 ? (
              <Text style={[typography.caption, { color: colors.textMuted, textAlign: "center", marginTop: spacing.md }]}>
                You've reached the end
              </Text>
            ) : null
          }
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(Math.min(index, 5) * 40).duration(300)}>
              <Pressable
                onPress={() => navigation.navigate("SkillDetail", { skillId: item._id })}
                style={({ pressed }) => ({ opacity: pressed ? 0.95 : 1 })}
              >
                <ExploreResultCard skill={item} />
              </Pressable>
            </Animated.View>
          )}
        />
      )}
    </View>
  );
}

function NearbyMentorCard({
  mentor,
  onPress,
}: {
  mentor: User;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const area = mentor.location?.city;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.nearbyCard,
        getShadow(colors, "sm"),
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.95 : 1,
        },
      ]}
    >
      <Avatar uri={mentor.avatarUrl} name={mentor.name} size={48} online />
      <Text style={[typography.bodyMedium, { color: colors.text, marginTop: spacing.sm }]} numberOfLines={1}>
        {mentor.name}
      </Text>
      <View style={styles.nearbyBadge}>
        <Feather name="map-pin" size={12} color={colors.primary} />
        <Text style={[typography.tiny, { color: colors.primary, marginLeft: 4 }]}>
          {mentor.distanceKm != null
            ? `${mentor.distanceKm < 1 ? "<1" : mentor.distanceKm} km away`
            : area ?? "Nearby"}
        </Text>
      </View>
      {mentor.skills && mentor.skills.length > 0 ? (
        <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]} numberOfLines={1}>
          {mentor.skills[0]}
        </Text>
      ) : null}
      <View style={styles.rating}>
        {mentor.rating ? (
          <Text style={[typography.small, { color: colors.warning }]}>
            ⭐ {mentor.rating.toFixed(1)}
          </Text>
        ) : (
          <Text style={[typography.small, { color: colors.textMuted }]}>New</Text>
        )}
      </View>
    </Pressable>
  );
}

function ExploreResultCard({ skill }: { skill: Skill }) {
  const { colors } = useTheme();
  const mentor = typeof skill.mentor === "object" ? (skill.mentor as User) : null;
  const grad = categoryGradients[skill.category] ?? categoryGradients.development;

  return (
    <View
      style={[
        styles.resultCard,
        getShadow(colors, "sm"),
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.resultLeft}>
        <View style={[styles.resultIcon, { backgroundColor: grad.colors[0] + "18" }]}>
          <Feather name="layers" size={20} color={grad.colors[0]} />
        </View>
      </View>
      <View style={styles.resultContent}>
        <View style={styles.resultTopRow}>
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
        <View style={styles.resultMeta}>
          <View style={[styles.miniCategory, { backgroundColor: grad.colors[0] + "18" }]}>
            <Text style={[typography.tiny, { color: grad.colors[0], textTransform: "capitalize" }]}>
              {skill.category}
            </Text>
          </View>
          {mentor ? (
            <View style={styles.resultMentor}>
              <Avatar uri={mentor.avatarUrl} name={mentor.name} size={16} />
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                {mentor.name}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  heroCard: {
    borderRadius: radii.xl,
    padding: spacing.lg,
    overflow: "hidden",
  },
  heroEyebrow: {
    ...typography.caption,
    color: "rgba(255,255,255,0.8)",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    fontWeight: "800",
  },
  heroTitle: {
    ...typography.h2,
    color: "#FFFFFF",
    marginTop: spacing.sm,
  },
  heroSubtitle: {
    ...typography.body,
    color: "rgba(255,255,255,0.85)",
    marginTop: spacing.xs,
    lineHeight: 22,
  },
  heroStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  heroStatPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  heroStatText: {
    ...typography.caption,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  searchBar: {
    marginTop: spacing.md,
  },
  toolbarRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.md,
  },
  sortRow: {
    flexDirection: "row",
    flex: 1,
    gap: spacing.xs,
    flexWrap: "nowrap",
  },
  sortChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  filterToggle: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginLeft: spacing.sm,
  },
  filterPanel: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  priceInput: {
    flex: 1,
    height: 42,
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    ...typography.bodySmall,
  },
  applyBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  chipList: {
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  resultInfo: {
    marginBottom: spacing.md,
  },
  mentorSection: {
    marginBottom: spacing.sm,
  },
  mentorList: {
    gap: spacing.md,
    paddingRight: spacing.lg,
    marginBottom: spacing.sm,
  },
  nearbyLoader: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.lg,
  },
  nearbyCard: {
    width: 130,
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.md,
    alignItems: "center",
  },
  nearbyBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
  },
  rating: {
    marginTop: spacing.xs,
  },
  footerLoader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.lg,
  },
  resultCard: {
    flexDirection: "row",
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  resultLeft: {
    marginRight: spacing.md,
    justifyContent: "center",
  },
  resultIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  resultContent: {
    flex: 1,
  },
  resultTopRow: {
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
  resultMeta: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  miniCategory: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  resultMentor: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    maxWidth: "60%",
  },
});
