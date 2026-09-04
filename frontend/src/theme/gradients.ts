export interface GradientStop {
  colors: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}

export const gradients = {
  primary: {
    colors: ["#2563EB", "#06B6D4"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  primarySoft: {
    colors: ["#3B82F6", "#93C5FD"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  accent: {
    colors: ["#F43F5E", "#F59E0B"],
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
    colors: ["#0F172A", "#2563EB", "#06B6D4", "#F43F5E"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  dark: {
    colors: ["#080B12", "#172033"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  shimmer: {
    colors: ["#DDE5F3", "#ECF2FF", "#DDE5F3"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
  shimmerDark: {
    colors: ["#263348", "#172033", "#263348"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
} as const;

export const categoryGradients: Record<string, { colors: string[] }> = {
  development: { colors: ["#2563EB", "#22D3EE"] },
  ai: { colors: ["#7C3AED", "#06B6D4"] },
  music: { colors: ["#F43F5E", "#FB7185"] },
  fitness: { colors: ["#059669", "#34D399"] },
  design: { colors: ["#F59E0B", "#F97316"] },
  business: { colors: ["#0891B2", "#60A5FA"] },
  photography: { colors: ["#E11D48", "#F59E0B"] },
  cooking: { colors: ["#F97316", "#FB923C"] },
  languages: { colors: ["#3B82F6", "#60A5FA"] },
};
