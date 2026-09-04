import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography } from "@/theme/tokens";
import { Avatar } from "@/components/Avatar";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { SkeletonCard } from "@/components/Skeleton";
import { useGetLeaderboardQuery, LeaderboardEntry } from "@/redux/api/userApi";

const MEDAL_COLORS = ["#F59E0B", "#94A3B8", "#B45309"];

export function LeaderboardScreen() {
  const { colors } = useTheme();
  const { data, isLoading, isFetching, refetch } = useGetLeaderboardQuery();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const users = data ?? [];

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      {isLoading ? (
        <View style={styles.listContent}>
          <SkeletonCard />
          <SkeletonCard style={{ marginTop: spacing.md }} />
          <SkeletonCard style={{ marginTop: spacing.md }} />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing || (isFetching && !isLoading)}
              onRefresh={onRefresh}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="🏆"
              title="No rankings yet"
              subtitle="Complete sessions and earn XP to climb the leaderboard."
            />
          }
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(index * 30).duration(300)}>
              <LeaderboardRow item={item} rank={index + 1} />
            </Animated.View>
          )}
        />
      )}
    </View>
  );
}

function LeaderboardRow({ item, rank }: { item: LeaderboardEntry; rank: number }) {
  const { colors } = useTheme();
  const medal = rank <= 3 ? MEDAL_COLORS[rank - 1] : colors.textMuted;

  return (
    <Card style={styles.row}>
      <View style={[styles.rank, { backgroundColor: medal + "18" }]}>
        <Text style={[typography.bodyMedium, { color: medal, fontWeight: "700" }]}>
          {rank}
        </Text>
      </View>

      <Avatar uri={item.avatarUrl} name={item.name} size={40} />

      <View style={styles.rowInfo}>
        <Text style={[typography.bodyMedium, { color: colors.text }]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[typography.caption, { color: colors.textMuted }]} numberOfLines={1}>
          Level {item.level} · {item.levelTitle}
        </Text>
      </View>

      <View style={styles.xpBlock}>
        <Text style={[typography.h4, { color: colors.primary }]}>{item.xp}</Text>
        <Text style={[typography.tiny, { color: colors.textMuted }]}>XP</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },

  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  rank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  rowInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  xpBlock: {
    alignItems: "flex-end",
    marginLeft: spacing.sm,
  },
});