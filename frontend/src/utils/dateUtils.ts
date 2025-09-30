// src/utils/dateUtils.ts
import { format, isToday, isYesterday } from "date-fns";

/**
 * Formats a timestamp into a human-readable format
 * @param timestamp - ISO timestamp string or Date object
 * @returns Formatted string (e.g., "Today", "Yesterday", or "Jan 15, 2023")
 */
export function formatMessageDate(timestamp: string | Date | null): string {
  if (!timestamp) return "";

  const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;

  // Check if date is invalid
  if (isNaN(date.getTime())) {
    return "";
  }

  // If message is from today, show "Today"
  if (isToday(date)) {
    return format(date, "h:mm a"); // "2:30 PM"
  }

  // If message is from yesterday, show "Yesterday"
  if (isYesterday(date)) {
    return "Yesterday";
  }

  // If message is from this year, show month and day
  if (date.getFullYear() === new Date().getFullYear()) {
    return format(date, "MMM d"); // "Jan 15"
  }

  // Otherwise, show month, day and year
  return format(date, "MMM d, yyyy"); // "Jan 15, 2023"
}

/**
 * Formats a timestamp into a human-readable time
 * @param timestamp - ISO timestamp string or Date object
 * @returns Formatted time string (e.g., "2:30 PM")
 */
export function formatMessageTime(timestamp: string | Date | null): string {
  if (!timestamp) return "";

  const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;

  // Check if date is invalid
  if (isNaN(date.getTime())) {
    return "";
  }

  // Return just the time portion
  return format(date, "h:mm a"); // "2:30 PM"
}

/**
 * For very recent messages (within minutes), show "Just now" or "X minutes ago"
 * @param timestamp - ISO timestamp string or Date object
 * @returns Formatted string (e.g., "Just now", "5m ago", etc.)
 */
export function formatRecentTime(timestamp: string | Date | null): string {
  if (!timestamp) return "";

  const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;

  // Check if date is invalid
  if (isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();
  const diffMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60),
  );

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffMinutes < 24 * 60) {
    // Less than 24 hours ago - show the time
    return format(date, "h:mm a");
  }

  // Show date for older messages
  return formatMessageDate(date);
}

/**
 * Get a complete formatted date and time for chat messages
 * @param timestamp - ISO timestamp string or Date object
 * @returns Combined date and time (e.g., "Today at 2:30 PM", "Yesterday at 3:45 PM", "Jan 15 at 4:20 PM")
 */
export function formatChatDateTime(timestamp: string | Date | null): string {
  if (!timestamp) return "";

  const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;

  // Check if date is invalid
  if (isNaN(date.getTime())) {
    return "";
  }

  const dateStr = formatMessageDate(date);
  const timeStr = formatMessageTime(date);

  return `${dateStr} at ${timeStr}`;
}
