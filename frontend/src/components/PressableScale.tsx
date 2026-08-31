import React, { useCallback } from "react";
import { Pressable, ViewStyle } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { hapticLight } from "@/utils/haptics";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PressableScaleProps {
  children: React.ReactNode;
  onPress?: () => void;
  scale?: number;
  disabled?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
  accessibilityRole?: "button" | "link" | "header" | "image";
}

export function PressableScale({ children, onPress, scale = 0.97, disabled, style, accessibilityLabel, accessibilityRole }: PressableScaleProps) {
  const sv = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sv.value }],
  }));

  const handlePress = useCallback(() => {
    hapticLight();
    onPress?.();
  }, [onPress]);

  return (
    <AnimatedPressable
      onPressIn={() => {
        sv.value = withSpring(scale, { damping: 15, stiffness: 300 });
      }}
      onPressOut={() => {
        sv.value = withSpring(1, { damping: 15, stiffness: 300 });
      }}
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      style={[animStyle, style]}
    >
      {children}
    </AnimatedPressable>
  );
}
