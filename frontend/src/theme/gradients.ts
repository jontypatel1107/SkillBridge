export interface GradientStop {
  colors: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}

export const gradients = {
  primary: {
    colors: ["#1B4D42", "#2F7361"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  primarySoft: {
    colors: ["#2F7361", "#5FA894"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  accent: {
    colors: ["#C97A2B", "#E0A25A"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  plum: {
    colors: ["#5B4159", "#8A3A4E"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  cyan: {
    colors: ["#2E5C6E", "#5FA894"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  warm: {
    colors: ["#C97A2B", "#A8601F"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  cool: {
    colors: ["#1B4D42", "#2E5C6E"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  success: {
    colors: ["#2F7D4F", "#6FBF8E"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  hero: {
    colors: ["#1B4D42", "#2F7361", "#C97A2B"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  dark: {
    colors: ["#121714", "#212B24"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  shimmer: {
    colors: ["#DCE5D8", "#EAF0E6", "#DCE5D8"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
  shimmerDark: {
    colors: ["#2B362F", "#212B24", "#2B362F"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
} as const;

export const categoryGradients: Record<string, { colors: string[] }> = {
  development: { colors: ["#1B4D42", "#2F7361"] },
  ai: { colors: ["#5B4159", "#8A3A4E"] },
  music: { colors: ["#B3432E", "#C97A2B"] },
  fitness: { colors: ["#3E5C3A", "#6FBF8E"] },
  design: { colors: ["#C97A2B", "#E0A25A"] },
  business: { colors: ["#2E5C6E", "#5FA894"] },
  photography: { colors: ["#8A3A4E", "#A8601F"] },
  cooking: { colors: ["#A8601F", "#E0A25A"] },
  languages: { colors: ["#1B4D42", "#5FA894"] },
};