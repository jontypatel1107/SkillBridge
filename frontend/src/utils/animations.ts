import { withSpring, withTiming, FadeIn, FadeOut, Layout, Easing } from "react-native-reanimated";

export const ANIM_DURATION = 250;
export const SPRING_CONFIG = { damping: 18, stiffness: 200, mass: 0.8 };
export const GENTLE_SPRING = { damping: 15, stiffness: 150, mass: 0.6 };

export const fadeIn = (delay = 0) =>
  FadeIn.delay(delay).duration(ANIM_DURATION).easing(Easing.out(Easing.cubic));

export const fadeInUp = (delay = 0) =>
  FadeIn.delay(delay).duration(ANIM_DURATION).easing(Easing.out(Easing.cubic));

export const fadeOut = FadeOut.duration(150);

export const staggerItem = (index: number, baseDelay = 50) =>
  FadeIn.delay(index * baseDelay).duration(300).easing(Easing.out(Easing.cubic));

export const listItemLayout = Layout.springify().damping(18).stiffness(200);

export function springToggle(current: number, to: number): number {
  return withSpring(to, SPRING_CONFIG);
}

export function animateWidth(current: number, to: number): number {
  return withTiming(to, { duration: ANIM_DURATION, easing: Easing.out(Easing.cubic) });
}