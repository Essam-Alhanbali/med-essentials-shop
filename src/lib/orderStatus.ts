export const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Ready for Pickup",
  "Out for Delivery",
  "Completed",
  "Cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export function statusBadgeClasses(status: string): string {
  switch (status) {
    case "Pending":
      return "bg-yellow-100 text-yellow-900 border-yellow-300 dark:bg-yellow-500/15 dark:text-yellow-200 dark:border-yellow-500/30";
    case "Confirmed":
      return "bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-500/15 dark:text-blue-200 dark:border-blue-500/30";
    case "Ready for Pickup":
      return "bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-500/15 dark:text-purple-200 dark:border-purple-500/30";
    case "Out for Delivery":
      return "bg-orange-100 text-orange-900 border-orange-300 dark:bg-orange-500/15 dark:text-orange-200 dark:border-orange-500/30";
    case "Completed":
      return "bg-green-100 text-green-900 border-green-300 dark:bg-green-500/15 dark:text-green-200 dark:border-green-500/30";
    case "Cancelled":
      return "bg-red-100 text-red-900 border-red-300 dark:bg-red-500/15 dark:text-red-200 dark:border-red-500/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

export const CATEGORY_EMOJIS = [
  "🩺","💊","🩻","🧬","🔬","🩹","🧪","💉","🫀","🧠",
  "🦷","👁️","🦴","🩼","🧤","🥼","📋","🔦","✂️","📚",
  "🏥","🚑","🧰","💻","🫁","🫶","📓","📦",
] as const;

export const DEFAULT_CATEGORY_EMOJI = "📦";