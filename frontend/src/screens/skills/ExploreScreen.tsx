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
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography, radii } from "@/theme/tokens";
import { getShadow } from "@/theme/shadows";
import { categoryGradients } from "@/theme/gradients";
import { SearchBar } from "@/components/SearchBar";
import { Chip } from "@/components/Chip";
import { EmptyState } from "@/components/EmptyState";
import { SkeletonCard } from "@/components/Skeleton";
import { useSearchSkillsQuery } from "@/redux/api/skillsApi";
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
        <SearchBar
          value={query}
          onChangeText={handleSearchChange}
          placeholder="Search skills, mentors, topics..."
        />

        {/* Sort + Filter toggle row */}
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

        {/* Price Filter Panel */}
        {showFilters && (
          <Animated.View entering={FadeInDown.duration(200)}>
            <View style={[styles.filterPanel, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
              <Text style={[typography.caption, { color: colors.textMuted, marginBottom: spacing.sm }]}>
                Price Range ($/hr)
              </Text>
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
                <Pressable
                  onPress={handleApplyPrice}
                  style={[styles.applyBtn, { backgroundColor: colors.primary }]}
                >
                  <Feather name="check" size={16} color="#FFFFFF" />
                </Pressable>
                {hasActiveFilters && (
                  <Pressable
                    onPress={resetAllFilters}
                    style={[styles.applyBtn, { backgroundColor: colors.danger + "18" }]}
                  >
                    <Feather name="x" size={16} color={colors.danger} />
                  </Pressable>
                )}
              </View>
            </View>
          </Animated.View>
        )}

        {/* Category Chips */}
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
          <Text style={[typography.bodyMedium, { color: colors.primary, fontWeight: "600" }]}>
            ${skill.hourlyPrice}
          </Text>
        </View>
        <Text style={[typography.bodySmall, { color: colors.textMuted }]} numberOfLines={2}>
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
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
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
    width: 36,
    height: 36,
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
    height: 40,
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
    paddingBottom: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  resultInfo: {
    marginBottom: spacing.md,
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
    width: 44,
    height: 44,
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
  },
  resultMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  miniCategory: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  resultMentor: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});
