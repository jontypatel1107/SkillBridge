import React, { useState, useRef, useEffect } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region, MapPressEvent } from "react-native-maps";

export interface MapLocationValue {
  latitude: number;
  longitude: number;
}

interface LocationMapProps {
  initial?: MapLocationValue;
  onLocationChange?: (loc: MapLocationValue) => void;
  interactive?: boolean;
  style?: ViewStyle;
  height?: number;
}

const DEFAULT_REGION: Region = {
  latitude: 20.5937,
  longitude: 78.9629,
  latitudeDelta: 30,
  longitudeDelta: 30,
};

export function LocationMap({
  initial,
  onLocationChange,
  interactive = false,
  style,
  height = 220,
}: LocationMapProps) {
  const mapRef = useRef<MapView>(null);

  const [region, setRegion] = useState<Region>(
    initial
      ? {
          latitude: initial.latitude,
          longitude: initial.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }
      : DEFAULT_REGION
  );
  const [picked, setPicked] = useState<MapLocationValue | undefined>(initial);

  // When an initial location arrives/changes (e.g. loaded from the server),
  // center the map on it.
  useEffect(() => {
    if (initial) {
      setRegion((r) => ({
        latitude: initial.latitude,
        longitude: initial.longitude,
        latitudeDelta: Math.min(r.latitudeDelta, 0.05),
        longitudeDelta: Math.min(r.longitudeDelta, 0.05),
      }));
      setPicked(initial);
    }
  }, [initial?.latitude, initial?.longitude]);

  const handleMapPress = (e: MapPressEvent) => {
    if (!interactive) return;
    const { latitude, longitude } = e.nativeEvent.coordinate;
    const loc = { latitude, longitude };
    setPicked(loc);
    onLocationChange?.(loc);
  };

  return (
    <View style={[styles.wrap, { height }, style]}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        onRegionChangeComplete={(r) => setRegion((prev) => ({ ...prev, ...r }))}
        onPress={handleMapPress}
      >
        {picked ? (
          <Marker
            coordinate={{ latitude: picked.latitude, longitude: picked.longitude }}
            draggable={interactive}
            onDragEnd={(e) => {
              const { latitude, longitude } = e.nativeEvent.coordinate;
              const loc = { latitude, longitude };
              setPicked(loc);
              onLocationChange?.(loc);
            }}
          />
        ) : null}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: "hidden",
    borderRadius: 16,
  },
  map: {
    flex: 1,
  },
});
