import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring, withSequence } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography, radii } from "@/theme/tokens";
import { TextField } from "@/components/TextField";
import { Button } from "@/components/Button";
import { useCreateReviewMutation } from "@/redux/api/reviewsApi";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { BookingsStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<BookingsStackParamList, "LeaveReview">;

const RATING_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Great",
  5: "Excellent",
};

export function LeaveReviewScreen({ route, navigation }: Props) {
  const { colors } = useTheme();
  const { bookingId } = route.params;
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [createReview, { isLoading, error }] = useCreateReviewMutation();

  const handleRating = (n: number) => {
    setRating(n);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  const onSubmit = async () => {
    try {
      await createReview({ bookingId, rating, comment: comment.trim() || undefined }).unwrap();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      navigation.goBack();
    } catch {
      // surfaced below
    }
  };

  const serverError =
    error && "data" in error ? (error.data as { message?: string })?.message : undefined;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(400)}>
        <View style={styles.headerSection}>
          <Feather name="star" size={40} color={colors.warning} />
          <Text style={[typography.h2, { color: colors.text, marginTop: spacing.md }]}>
            Rate your session
          </Text>
          <Text style={[typography.body, { color: colors.textMuted, marginTop: spacing.xs }]}>
            How was your learning experience?
          </Text>
        </View>
      </Animated.View>

      {/* Stars */}
      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((n) => (
            <StarButton
              key={n}
              active={n <= rating}
              onPress={() => handleRating(n)}
            />
          ))}
        </View>
        <Text style={[typography.bodyMedium, { color: colors.primary, textAlign: "center", marginTop: spacing.sm }]}>
          {RATING_LABELS[rating] ?? ""}
        </Text>
      </Animated.View>

      {/* Comment */}
      <Animated.View entering={FadeInDown.delay(200).duration(400)} style={{ marginTop: spacing.xl }}>
        <TextField
          label="Your review (optional)"
          placeholder="Share details about your experience..."
          multiline
          numberOfLines={4}
          value={comment}
          onChangeText={setComment}
          style={styles.textArea}
        />
      </Animated.View>

      {/* Error */}
      {serverError ? (
        <View style={[styles.errorBox, { backgroundColor: colors.danger + "12", borderColor: colors.danger + "30" }]}>
          <Feather name="alert-circle" size={16} color={colors.danger} />
          <Text style={[typography.caption, { color: colors.danger, marginLeft: spacing.sm, flex: 1 }]}>
            {serverError}
          </Text>
        </View>
      ) : null}

      <View style={{ flex: 1 }} />

      <Button
        label="Submit Review"
        onPress={onSubmit}
        loading={isLoading}
      />
    </View>
  );
}

function StarButton({ active, onPress }: { active: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  const sv = useSharedValue(active ? 1 : 0.6);

  React.useEffect(() => {
    if (active) {
      sv.value = withSequence(
        withSpring(1.3, { damping: 8, stiffness: 400 }),
        withSpring(1, { damping: 10, stiffness: 200 })
      );
    } else {
      sv.value = withSpring(0.6, { damping: 15, stiffness: 200 });
    }
  }, [active]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sv.value }],
    opacity: active ? 1 : 0.3,
  }));

  return (
    <Pressable onPress={onPress} hitSlop={8}>
      <Animated.View style={animStyle}>
        <Feather
          name="star"
          size={44}
          color={active ? colors.warning : colors.textMuted}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  headerSection: {
    alignItems: "center",
    paddingTop: spacing.xl,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
    paddingTop: spacing.md,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    marginTop: spacing.md,
  },
});
