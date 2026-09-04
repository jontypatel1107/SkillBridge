// Date/time helpers for the chat UI, inspired by popular messenger apps.

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function isSameDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

const TODAY = new Date();

// Formats a list row timestamp: Today -> time, else weekday, else date.
export function formatListTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();

  if (isSameDay(d, now)) {
    return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(d, yesterday)) {
    return "Yesterday";
  }

  const diffDays = Math.floor((startOfDay(now).getTime() - startOfDay(d).getTime()) / 86400000);
  if (diffDays < 7) {
    return d.toLocaleDateString(undefined, { weekday: "short" });
  }

  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

// Formats a conversation header separator: Today / Yesterday / "12 Aug" / "Mon, 12 Aug".
export function formatDateSeparator(iso: string): string {
  const d = new Date(iso);
  const now = new Date();

  if (isSameDay(d, now)) return "Today";

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(d, yesterday)) return "Yesterday";

  return d.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

// Formats the timestamp shown inside a message bubble (e.g. "10:42 AM").
export function formatBubbleTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}
