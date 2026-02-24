export type Priority = "low" | "medium" | "high";
export type Status = "todo" | "in_progress" | "completed";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: Status;
  priority: Priority;
  category?: string;
  due_date?: string;
  time_estimate?: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export const STATUS_CONFIG: Record<Status, { label: string; color: string }> = {
  todo: { label: "To-Do", color: "tag-blue" },
  in_progress: { label: "In Progress", color: "tag-orange" },
  completed: { label: "Completed", color: "tag-green" },
};

export const PRIORITY_CONFIG: Record<Priority, { label: string; dotClass: string }> = {
  high: { label: "High", dotClass: "bg-priority-high" },
  medium: { label: "Medium", dotClass: "bg-priority-medium" },
  low: { label: "Low", dotClass: "bg-priority-low" },
};

export const CATEGORY_COLORS: Record<string, string> = {
  Design: "bg-tag-purple/15 text-tag-purple",
  Development: "bg-tag-blue/15 text-tag-blue",
  Marketing: "bg-tag-orange/15 text-tag-orange",
  Research: "bg-tag-green/15 text-tag-green",
  Other: "bg-tag-pink/15 text-tag-pink",
};
