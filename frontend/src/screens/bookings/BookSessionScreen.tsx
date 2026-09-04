import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography, radii } from "@/theme/tokens";
import { getShadow } from "@/theme/shadows";
import { Button } from "@/components/Button";
import { LocationMap } from "@/components/LocationMap";
import { useCreateBookingMutation } from "@/redux/api/bookingsApi";
import { makeLocationPicker } from "@/utils/mapPickerBridge";
import type { PickedLocation } from "@/utils/mapPickerBridge";
import type { RootStackParamList } from "@/navigation/types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { HomeStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<HomeStackParamList, "BookSession"> & {
  navigation: NativeStackScreenProps<HomeStackParamList, "BookSession">["navigation"] & {
    navigate: <T extends keyof RootStackParamList>(
      screen: T,
      params?: RootStackParamList[T]
    ) => void;
  };
};

const TIME_SLOTS = [
  "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00",
  "17:00", "18:00", "19:00", "20:00",
];

export function BookSessionScreen({ route, navigation }: Props) {
  const { colors } = useTheme();
  const { skillId } = route.params;
  const [mode, setMode] = useState<"online" | "offline">("online");
  const [date, setDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    return d;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [location, setLocation] = useState<PickedLocation | null>(null);
  const [createBooking, { isLoading, error }] = useCreateBookingMutation();

  const selectedTimeStr = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

  const openMapPicker = () => {
    const pick = makeLocationPicker(navigation.navigate as any);
    pick(location ?? undefined, "Choose Meeting Point").then((result) => {
      if (result) setLocation(result);
    });
  };

  const onSubmit = async () => {
    try {
      if (mode === "offline" && !location) return;
      const booking = await createBooking({
        skillId,
        mode,
        scheduledAt: date.toISOString(),
        durationMinutes: 60,
        location: location
          ? { lng: location.longitude, lat: location.latitude, label: location.label }
          : undefined,
      }).unwrap();
      navigation.replace("BookingSuccess", { bookingId: booking._id });
    } catch {
      // surfaced via `error` below
    }
  };

  const serverError =
    error && "data" in error ? (error.data as { message?: string })?.message : undefined;

  return (
    <ScrollView
      style={[styles.flex, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Step 1: Session Type */}
      <Animated.View entering={FadeInDown.duration(400)}>
        <Text style={[typography.caption, { color: colors.textMuted, marginBottom: spacing.sm, textTransform: "uppercase", letterSpacing: 0.8 }]}>
          Step 1
        </Text>
        <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.md }]}>
          Session Type
        </Text>
        <View style={styles.modeRow}>
          {(["online", "offline"] as const).map((m) => {
            const isActive = mode === m;
            return (
              <Pressable
                key={m}
                onPress={() => setMode(m)}
                style={[
                  styles.modeCard,
                  getShadow(colors, isActive ? "md" : "sm"),
                  {
                    backgroundColor: isActive ? colors.primaryMuted : colors.surface,
                    borderColor: isActive ? colors.primary : colors.border,
                  },
                ]}
              >
                <Feather
                  name={m === "online" ? "video" : "map-pin"}
                  size={24}
                  color={isActive ? colors.primary : colors.textMuted}
                />
                <Text
                  style={[
                    typography.bodyMedium,
                    {
                      color: isActive ? colors.primary : colors.text,
                      marginTop: spacing.sm,
                      textTransform: "capitalize",
                    },
                  ]}
                >
                  {m}
                </Text>
                <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>
                  {m === "online" ? "Via video call" : "In person"}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Animated.View>

      {/* Step 2: Pick Date */}
      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <Text style={[typography.caption, { color: colors.textMuted, marginBottom: spacing.sm, marginTop: spacing.xl, textTransform: "uppercase", letterSpacing: 0.8 }]}>
          Step 2
        </Text>
        <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.md }]}>
          Pick a Date
        </Text>
        <Pressable
          onPress={() => setShowDatePicker(true)}
          style={[
            styles.dateCard,
            getShadow(colors, "sm"),
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Feather name="calendar" size={20} color={colors.primary} />
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={[typography.bodyMedium, { color: colors.text }]}>
              {date.toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </Text>
            <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>
              Tap to change date
            </Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.textMuted} />
        </Pressable>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            minimumDate={new Date()}
            onChange={(_, selected) => {
              setShowDatePicker(Platform.OS === "ios");
              if (selected) {
                const newDate = new Date(selected);
                newDate.setHours(date.getHours(), date.getMinutes(), 0, 0);
                setDate(newDate);
              }
            }}
            display={Platform.OS === "ios" ? "spinner" : "default"}
          />
        )}
      </Animated.View>

      {/* Step 3: Pick Time */}
      <Animated.View entering={FadeInDown.delay(200).duration(400)}>
        <Text style={[typography.caption, { color: colors.textMuted, marginBottom: spacing.sm, marginTop: spacing.xl, textTransform: "uppercase", letterSpacing: 0.8 }]}>
          Step 3
        </Text>
        <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.md }]}>
          Pick a Time
        </Text>
        <View style={styles.timeGrid}>
          {TIME_SLOTS.map((slot) => {
            const isActive = selectedTimeStr === slot;
            return (
              <Pressable
                key={slot}
                onPress={() => {
                  const [h, m] = slot.split(":").map(Number);
                  const newDate = new Date(date);
                  newDate.setHours(h, m, 0, 0);
                  setDate(newDate);
                }}
                style={[
                  styles.timeSlot,
                  {
                    backgroundColor: isActive ? colors.primary : colors.surface,
                    borderColor: isActive ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    typography.bodyMedium,
                    { color: isActive ? "#FFFFFF" : colors.text },
                  ]}
                >
                  {slot}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Animated.View>

      {/* Step 4: Location (offline only) */}
      {mode === "offline" ? (
        <Animated.View entering={FadeInDown.delay(250).duration(400)}>
          <Text style={[typography.caption, { color: colors.textMuted, marginBottom: spacing.sm, marginTop: spacing.xl, textTransform: "uppercase", letterSpacing: 0.8 }]}>
            Step 4
          </Text>
          <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.md }]}>
            Meeting Location
          </Text>

          <Pressable
            onPress={openMapPicker}
            style={[
              styles.dateCard,
              getShadow(colors, "sm"),
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Feather name="map-pin" size={20} color={colors.primary} />
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={[typography.bodyMedium, { color: colors.text }]}>
                {location
                  ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
                  : "Tap to choose meeting point"}
              </Text>
              <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>
                {location ? "Tap to change" : "Required for in-person sessions"}
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.textMuted} />
          </Pressable>

          {location ? (
            <View style={[styles.mapCard, { borderColor: colors.border }]}>
              <LocationMap
                initial={{ latitude: location.latitude, longitude: location.longitude }}
                interactive={false}
                height={180}
              />
            </View>
          ) : null}
        </Animated.View>
      ) : null}

      {/* Error */}
      {serverError ? (
        <View style={[styles.errorBox, { backgroundColor: colors.danger + "12", borderColor: colors.danger + "30" }]}>
          <Feather name="alert-circle" size={16} color={colors.danger} />
          <Text style={[typography.caption, { color: colors.danger, marginLeft: spacing.sm, flex: 1 }]}>
            {serverError}
          </Text>
        </View>
      ) : null}

      {/* Summary */}
      <Animated.View entering={FadeInDown.delay(300).duration(400)}>
        <View style={[styles.summaryCard, getShadow(colors, "sm"), { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[typography.h4, { color: colors.text, marginBottom: spacing.md }]}>Booking Summary</Text>
          <SummaryRow icon="video" label="Mode" value={mode} colors={colors} />
          <SummaryRow icon="calendar" label="Date" value={date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} colors={colors} />
          <SummaryRow icon="clock" label="Time" value={selectedTimeStr} colors={colors} />
          <SummaryRow icon="timer" label="Duration" value="60 minutes" colors={colors} />
        </View>
      </Animated.View>

      <Button
        label="Confirm Booking"
        onPress={onSubmit}
        loading={isLoading}
        disabled={mode === "offline" && !location}
        style={{ marginTop: spacing.lg }}
      />
      {mode === "offline" && !location ? (
        <Text style={[typography.caption, { color: colors.warning, textAlign: "center", marginTop: spacing.sm }]}>
          Choose a meeting location to continue
        </Text>
      ) : null}
      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

function SummaryRow({ icon, label, value, colors }: { icon: string; label: string; value: string; colors: any }) {
  return (
    <View style={styles.summaryRow}>
      <View style={styles.summaryLeft}>
        <Feather name={icon as any} size={16} color={colors.textMuted} />
        <Text style={[typography.body, { color: colors.textMuted, marginLeft: spacing.sm }]}>{label}</Text>
      </View>
      <Text style={[typography.bodyMedium, { color: colors.text, textTransform: "capitalize" }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: spacing.lg },

  // Mode
  modeRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  modeCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.xl,
    borderRadius: radii.lg,
    borderWidth: 1.5,
  },

  // Date
  dateCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
  },

  // Time
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  timeSlot: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    minWidth: 72,
    alignItems: "center",
  },

  // Error
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    marginTop: spacing.lg,
  },

  // Summary
  summaryCard: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  mapCard: {
    marginTop: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  summaryLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
});
