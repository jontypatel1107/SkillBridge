import { Platform } from "react-native";

const isSupported = Platform.OS === "ios" || Platform.OS === "android";

async function getHaptics() {
  if (!isSupported) return null;
  try {
    return await import("expo-haptics");
  } catch {
    return null;
  }
}

export async function hapticLight() {
  try {
    const H = await getHaptics();
    if (H) await H.impactAsync(H.ImpactFeedbackStyle.Light);
  } catch {}
}

export async function hapticMedium() {
  try {
    const H = await getHaptics();
    if (H) await H.impactAsync(H.ImpactFeedbackStyle.Medium);
  } catch {}
}

export async function hapticHeavy() {
  try {
    const H = await getHaptics();
    if (H) await H.impactAsync(H.ImpactFeedbackStyle.Heavy);
  } catch {}
}

export async function hapticSuccess() {
  try {
    const H = await getHaptics();
    if (H) await H.notificationAsync(H.NotificationFeedbackType.Success);
  } catch {}
}

export async function hapticError() {
  try {
    const H = await getHaptics();
    if (H) await H.notificationAsync(H.NotificationFeedbackType.Error);
  } catch {}
}

export async function hapticWarning() {
  try {
    const H = await getHaptics();
    if (H) await H.notificationAsync(H.NotificationFeedbackType.Warning);
  } catch {}
}

export async function hapticSelection() {
  try {
    const H = await getHaptics();
    if (H) await H.selectionAsync();
  } catch {}
}
