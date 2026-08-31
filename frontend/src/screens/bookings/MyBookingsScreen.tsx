import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography, radii } from "@/theme/tokens";
import { getShadow } from "@/theme/shadows";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { SkeletonCard } from "@/components/Skeleton";
import { useMyBookingsQuery } from "@/redux/api/bookingsApi";
import { Booking, BookingStatus, Skill, User } from "@/types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { BookingsStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<BookingsStackParamList, "MyBookings">;

const FILTERS: { label: string; value: BookingStatus | "all"; icon: string }[] = [
  { label: "All", value: "all", icon: "layers" },
  { label: "Pending", value: "pending", icon: "clock" },
  { label: "Confirmed", value: "confirmed", icon: "check-circle" },
  { label: "Completed", value: "completed", icon: "award" },
];

export function MyBookingsScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const [filter, setFilter] = useState<BookingStatus | "all">("all");
  const { data: bookings, isLoading } = useMyBookingsQuery(
    filter === "all" ? undefined : { status: filter }
  );

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      {/* Filters */}
      <View style={[styles.filterContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTERS}
          keyExtractor={(f) => f.value}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => {
            const isActive = filter === item.value;
            return (
              <Pressable
                onPress={() => setFilter(item.value)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isActive ? colors.primary : colors.surfaceMuted,
                    borderColor: isActive ? colors.primary : colors.border,
                  },
                ]}
              >
                <Feather
                  name={item.icon as any}
                  size={14}
                  color={isActive ? "#FFFFFF" : colors.textMuted}
                />
                <Text
                  style={[
                    typography.caption,
                    { color: isActive ? "#FFFFFF" : colors.textMuted },
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {/* Bookings */}
      {isLoading ? (
        <View style={styles.listContent}>
          <SkeletonCard />
          <SkeletonCard style={{ marginTop: spacing.md }} />
          <SkeletonCard style={{ marginTop: spacing.md }} />
        </View>
      ) : (
        <FlatList
          data={bookings ?? []}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="📅"
              title="No bookings here yet"
              subtitle="Find a mentor and book your first session."
            />
          }
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(index * 40).duration(300)}>
              <Pressable
                onPress={() => navigation.navigate("BookingDetail", { bookingId: item._id })}
                style={({ pressed }) => ({ opacity: pressed ? 0.95 : 1 })}
              >
                <BookingCard booking={item} />
              </Pressable>
            </Animated.View>
          )}
        />
      )}
    </View>
  );
}

function BookingCard({ booking }: { booking: Booking }) {
  const { colors } = useTheme();
  const skill = typeof booking.skill === "object" ? (booking.skill as Skill) : null;
  const otherParty =
    typeof booking.mentor === "object"
      ? (booking.mentor as User)
      : typeof booking.learner === "object"
      ? (booking.learner as User)
      : null;

  const scheduledDate = new Date(booking.scheduledAt);
  const dayNum = scheduledDate.getDate();
  const monthStr = scheduledDate.toLocaleString(undefined, { month: "short" }).toUpperCase();

  return (
    <View style={[styles.bookingCard, getShadow(colors, "sm"), { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* Date column */}
      <View style={[styles.dateColumn, { backgroundColor: colors.primaryMuted }]}>
        <Text style={[typography.tiny, { color: colors.primary, fontWeight: "700" }]}>{monthStr}</Text>
        <Text style={[typography.h2, { color: colors.primary }]}>{dayNum}</Text>
      </View>

      {/* Content */}
      <View style={styles.bookingContent}>
        <View style={styles.bookingTopRow}>
          <Text style={[typography.bodyMedium, { color: colors.text }]} numberOfLines={1}>
            {skill?.title ?? "Session"}
          </Text>
          <StatusBadge status={booking.status} />
        </View>

        <View style={styles.bookingMeta}>
          <View style={styles.metaItem}>
            <Feather name="clock" size={12} color={colors.textMuted} />
            <Text style={[typography.caption, { color: colors.textMuted }]}>
              {scheduledDate.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Feather name={booking.mode === "online" ? "video" : "map-pin"} size={12} color={colors.textMuted} />
            <Text style={[typography.caption, { color: colors.textMuted, textTransform: "capitalize" }]}>
              {booking.mode}
            </Text>
          </View>
        </View>

        {otherParty ? (
          <View style={styles.metaItem}>
            <Feather name="user" size={12} color={colors.textMuted} />
            <Text style={[typography.caption, { color: colors.textMuted }]}>
              {otherParty.name}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },

  // Filters
  filterContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  filterList: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    borderWidth: 1,
    gap: spacing.xs,
  },

  // List
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },

  // Booking Card
  bookingCard: {
    flexDirection: "row",
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: spacing.md,
  },
  dateColumn: {
    width: 64,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
  },
  bookingContent: {
    flex: 1,
    padding: spacing.md,
  },
  bookingTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  bookingMeta: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});
