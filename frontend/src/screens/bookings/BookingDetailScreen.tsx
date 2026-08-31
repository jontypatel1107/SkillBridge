import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography, radii } from "@/theme/tokens";
import { getShadow } from "@/theme/shadows";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { StatusBadge } from "@/components/StatusBadge";
import { Avatar } from "@/components/Avatar";
import { Divider } from "@/components/Divider";
import { useGetBookingQuery, useUpdateBookingStatusMutation } from "@/redux/api/bookingsApi";
import { useAppSelector } from "@/hooks/redux";
import { Skill, User } from "@/types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { BookingsStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<BookingsStackParamList, "BookingDetail">;

export function BookingDetailScreen({ route, navigation }: Props) {
  const { colors } = useTheme();
  const { bookingId } = route.params;
  const currentUser = useAppSelector((s) => s.auth.user);
  const { data: booking, isLoading } = useGetBookingQuery(bookingId);
  const [updateStatus, { isLoading: isUpdating }] = useUpdateBookingStatusMutation();

  if (isLoading || !booking) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const skill = typeof booking.skill === "object" ? (booking.skill as Skill) : null;
  const mentor = typeof booking.mentor === "object" ? (booking.mentor as User) : null;
  const learner = typeof booking.learner === "object" ? (booking.learner as User) : null;
  const isMentor = (mentor?.id ?? mentor?._id) === (currentUser?.id ?? currentUser?._id);
  const otherParty = isMentor ? learner : mentor;

  const act = (status: "confirmed" | "completed" | "cancelled") =>
    updateStatus({ id: booking._id, status });

  const scheduledDate = new Date(booking.scheduledAt);

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Card */}
      <Animated.View entering={FadeInDown.duration(400)}>
        <View style={[styles.headerCard, getShadow(colors, "md"), { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.headerTop}>
            <Text style={[typography.h2, { color: colors.text, flex: 1 }]}>
              {skill?.title ?? "Session"}
            </Text>
            <StatusBadge status={booking.status} />
          </View>

          <Divider style={{ marginVertical: spacing.md }} />

          <View style={styles.infoGrid}>
            <InfoItem icon="calendar" label="Date" value={scheduledDate.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} colors={colors} />
            <InfoItem icon="clock" label="Time" value={scheduledDate.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })} colors={colors} />
            <InfoItem icon={booking.mode === "online" ? "video" : "map-pin"} label="Mode" value={booking.mode} colors={colors} />
            <InfoItem icon="timer" label="Duration" value={`${booking.durationMinutes} min`} colors={colors} />
          </View>
        </View>
      </Animated.View>

      {/* Participants */}
      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <View style={[styles.participantsCard, getShadow(colors, "sm"), { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[typography.h4, { color: colors.text, marginBottom: spacing.md }]}>Participants</Text>
          {mentor ? (
            <View style={styles.participantRow}>
              <Avatar uri={mentor.avatarUrl} name={mentor.name} size={44} />
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={[typography.bodyMedium, { color: colors.text }]}>{mentor.name}</Text>
                <Text style={[typography.caption, { color: colors.textMuted }]}>Mentor</Text>
              </View>
            </View>
          ) : null}
          {mentor && learner ? <Divider style={{ marginVertical: spacing.md }} /> : null}
          {learner ? (
            <View style={styles.participantRow}>
              <Avatar uri={learner.avatarUrl} name={learner.name} size={44} />
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={[typography.bodyMedium, { color: colors.text }]}>{learner.name}</Text>
                <Text style={[typography.caption, { color: colors.textMuted }]}>Learner</Text>
              </View>
            </View>
          ) : null}
        </View>
      </Animated.View>

      {/* Actions */}
      <Animated.View entering={FadeInDown.delay(200).duration(400)} style={{ marginTop: spacing.xl }}>
        {isMentor && booking.status === "pending" ? (
          <Button label="Confirm Booking" onPress={() => act("confirmed")} loading={isUpdating} />
        ) : null}
        {isMentor && booking.status === "confirmed" ? (
          <Button label="Mark as Completed" onPress={() => act("completed")} loading={isUpdating} />
        ) : null}
        {(booking.status === "pending" || booking.status === "confirmed") ? (
          <Button
            label="Cancel Booking"
            variant="outline"
            onPress={() => act("cancelled")}
            loading={isUpdating}
            style={{ marginTop: spacing.sm }}
          />
        ) : null}
        {!isMentor && booking.status === "completed" ? (
          <Button
            label="Leave a Review"
            onPress={() => navigation.navigate("LeaveReview", { bookingId: booking._id })}
          />
        ) : null}
      </Animated.View>

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

function InfoItem({ icon, label, value, colors }: { icon: string; label: string; value: string; colors: any }) {
  return (
    <View style={styles.infoItem}>
      <Feather name={icon as any} size={16} color={colors.primary} />
      <View style={{ marginLeft: spacing.sm }}>
        <Text style={[typography.tiny, { color: colors.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }]}>{label}</Text>
        <Text style={[typography.bodyMedium, { color: colors.text, textTransform: "capitalize" }]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },

  // Header
  headerCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.lg,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "45%",
  },

  // Participants
  participantsCard: {
    marginTop: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
  participantRow: {
    flexDirection: "row",
    alignItems: "center",
  },
});
