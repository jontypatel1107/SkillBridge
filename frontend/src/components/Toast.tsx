import React, { useEffect, useRef, useCallback, createContext, useContext, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography, radii } from "@/theme/tokens";
import { getShadow } from "@/theme/shadows";

type ToastType = "success" | "error" | "info";

interface ToastMessage {
  id: number;
  type: ToastType;
  text: string;
}

interface ToastContextValue {
  show: (text: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ show: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const ICONS: Record<ToastType, keyof typeof Feather.glyphMap> = {
  success: "check-circle",
  error: "alert-circle",
  info: "info",
};

const BG: Record<ToastType, string> = {
  success: "#10B981",
  error: "#EF4444",
  info: "#3B82F6",
};

let toastId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const insets = useSafeAreaInsets();

  const show = useCallback((text: string, type: ToastType = "info") => {
    const id = ++toastId;
    setToasts((prev) => [...prev.slice(-2), { id, type, text }]);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <View style={[styles.layer, { top: insets.top + spacing.md }]} pointerEvents="box-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: () => void }) {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(2500),
      Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(() => onDismiss());
  }, [opacity, onDismiss]);

  return (
    <Animated.View
      style={[
        styles.toast,
        { backgroundColor: BG[toast.type], opacity },
        getShadow(colors, "lg"),
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Feather name={ICONS[toast.type]} size={18} color="#FFFFFF" />
      <Text style={styles.text} numberOfLines={2}>
        {toast.text}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 9999,
    alignItems: "center",
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  text: {
    ...typography.bodyMedium,
    color: "#FFFFFF",
    flex: 1,
  },
});
