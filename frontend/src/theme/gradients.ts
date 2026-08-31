export interface GradientStop {
  colors: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}

export const gradients = {
  primary: {
    colors: ["#4F46E5", "#7C3AED"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  primarySoft: {
    colors: ["#4F46E5", "#818CF8"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  accent: {
    colors: ["#7C3AED", "#A78BFA"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  cyan: {
    colors: ["#06B6D4", "#22D3EE"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  warm: {
    colors: ["#F59E0B", "#EF4444"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  cool: {
    colors: ["#3B82F6", "#06B6D4"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  success: {
    colors: ["#16A34A", "#4ADE80"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  hero: {
    colors: ["#4F46E5", "#7C3AED", "#06B6D4"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  dark: {
    colors: ["#1E1B4B", "#312E81"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  shimmer: {
    colors: ["#E7E6F0", "#F2F1FA", "#E7E6F0"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
  shimmerDark: {
    colors: ["#2A2840", "#211F33", "#2A2840"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
} as const;

export const categoryGradients: Record<string, { colors: string[] }> = {
  development: { colors: ["#4F46E5", "#818CF8"] },
  ai: { colors: ["#7C3AED", "#A78BFA"] },
  music: { colors: ["#EC4899", "#F472B6"] },
  fitness: { colors: ["#16A34A", "#4ADE80"] },
  design: { colors: ["#F59E0B", "#FBBF24"] },
  business: { colors: ["#06B6D4", "#22D3EE"] },
  photography: { colors: ["#EF4444", "#F87171"] },
  cooking: { colors: ["#F97316", "#FB923C"] },
  languages: { colors: ["#3B82F6", "#60A5FA"] },
};
