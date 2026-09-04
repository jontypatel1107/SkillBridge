import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  TextInput,
  FlatList,
  Keyboard,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import * as Location from "expo-location";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography, radii } from "@/theme/tokens";
import { Button } from "@/components/Button";
import { completeLocationPick, PickedLocation } from "@/utils/mapPickerBridge";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "MapPicker">;

interface Suggestion {
  latitude: number;
  longitude: number;
  label: string;
}

export function MapPickerScreen({ route, navigation }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const initial = route.params?.initial;
  const title = route.params?.title ?? "Select Location";

  const [picked, setPicked] = useState<PickedLocation | undefined>(initial);
  const [region, setRegion] = useState<Region>(
    initial
      ? {
          latitude: initial.latitude,
          longitude: initial.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }
      : {
          latitude: 20.5937,
          longitude: 78.9629,
          latitudeDelta: 30,
          longitudeDelta: 30,
        }
  );
  const [locating, setLocating] = useState(false);

  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  const searchPlaces = async (text: string) => {
    setQuery(text);
    if (!text.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setSearching(true);
    try {
      const results = await Location.geocodeAsync(text);
      const mapped: Suggestion[] = results.map((r, i) => ({
        latitude: r.latitude,
        longitude: r.longitude,
        label: `${text.trim()} (${r.latitude.toFixed(4)}, ${r.longitude.toFixed(4)})`,
      }));
      setSuggestions(mapped);
      setShowSuggestions(mapped.length > 0);
    } catch {
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setSearching(false);
    }
  };

  const selectSuggestion = (s: Suggestion) => {
    Keyboard.dismiss();
    setPicked({ latitude: s.latitude, longitude: s.longitude, label: s.label });
    setRegion({
      latitude: s.latitude,
      longitude: s.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    });
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const useCurrentLocation = async () => {
    try {
      setLocating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Location permission needed",
          "Allow location access to use your current position.",
          [{ text: "OK" }]
        );
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;
      setPicked({ latitude, longitude });
      setRegion({ latitude, longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 });
    } catch {
      Alert.alert("Location error", "Could not get your location. Please try again.");
    } finally {
      setLocating(false);
    }
  };

  const confirm = () => {
    if (!picked) return;
    completeLocationPick(picked);
    navigation.goBack();
  };

  const cancel = () => {
    completeLocationPick(null);
    navigation.goBack();
  };

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border, paddingTop: spacing.sm + insets.top }]}>
        <Pressable onPress={cancel} hitSlop={10} style={styles.headerBtn}>
          <Feather name="x" size={22} color={colors.text} />
        </Pressable>
        <View style={[styles.searchWrap, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={searchPlaces}
            placeholder="Search location"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            style={[styles.searchInput, { color: colors.text }]}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          />
          {searching ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : query ? (
            <Pressable onPress={() => searchPlaces("")} hitSlop={8}>
              <Feather name="x-circle" size={16} color={colors.textMuted} />
            </Pressable>
          ) : null}
        </View>
        <Pressable
          onPress={useCurrentLocation}
          disabled={locating}
          style={[styles.headerBtn, { backgroundColor: colors.primaryMuted }]}
        >
          {locating ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Feather name="crosshair" size={20} color={colors.primary} />
          )}
        </Pressable>
      </View>

      <View style={styles.flex}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.flex}
          region={region}
          onPress={(e) => {
            const { latitude, longitude } = e.nativeEvent.coordinate;
            setPicked({ latitude, longitude });
          }}
        >
          {picked ? (
            <Marker
              coordinate={{ latitude: picked.latitude, longitude: picked.longitude }}
              draggable
              onDragEnd={(e) => {
                const { latitude, longitude } = e.nativeEvent.coordinate;
                setPicked({ latitude, longitude });
              }}
            />
          ) : null}
        </MapView>

        {showSuggestions ? (
          <View
            style={[
              styles.suggestionsBox,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <FlatList
              data={suggestions}
              keyExtractor={(item, i) => `${item.latitude}-${item.longitude}-${i}`}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <Pressable onPress={() => selectSuggestion(item)} style={styles.suggestionRow}>
                  <Feather name="map-pin" size={16} color={colors.primary} />
                  <Text style={[typography.bodySmall, { color: colors.text, marginLeft: spacing.sm, flex: 1 }]}>
                    {item.label}
                  </Text>
                  <Feather name="chevron-right" size={16} color={colors.textMuted} />
                </Pressable>
              )}
            />
          </View>
        ) : null}
      </View>

      {/* Bottom panel */}
      <View
        style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}
      >
        <View style={styles.coordsRow}>
          <Feather name="map-pin" size={16} color={colors.primary} />
          {picked?.label ? (
            <Text style={[typography.caption, { color: colors.text, marginLeft: spacing.sm, flex: 1 }]} numberOfLines={1}>
              {picked.label}
            </Text>
          ) : picked ? (
            <Text style={[typography.caption, { color: colors.text, marginLeft: spacing.sm, flex: 1 }]}>
              {picked.latitude.toFixed(5)}, {picked.longitude.toFixed(5)}
            </Text>
          ) : (
            <Text style={[typography.caption, { color: colors.textMuted, marginLeft: spacing.sm, flex: 1 }]}>
              Search or tap the map to set a location
            </Text>
          )}
        </View>
        <Button
          label="Confirm Location"
          disabled={!picked}
          onPress={confirm}
          icon={picked ? <Feather name="check" size={18} color="#FFFFFF" /> : undefined}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  searchWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    height: 40,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "transparent",
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 15,
    padding: 0,
  },
  suggestionsBox: {
    position: "absolute",
    top: 0,
    left: spacing.md,
    right: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    maxHeight: 260,
    overflow: "hidden",
  },
  suggestionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  coordsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
});
