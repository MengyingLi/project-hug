export type IssuePriority = 'urgent' | 'high' | 'medium' | 'low' | 'none';
export type IssueStatus = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done' | 'cancelled';
export type NotificationType = 'issue_assigned' | 'issue_mentioned' | 'comment_added' | 'status_changed' | 'priority_changed';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  description: string | null;
  created_at: string;
}

export interface Cycle {
  id: string;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Issue {
  id: string;
  identifier: string;
  title: string;
  description: string | null;
  priority: IssuePriority;
  status: IssueStatus;
  assignee_id: string | null;
  reporter_id: string | null;
  cycle_id: string | null;
  due_date: string | null;
  estimate: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  // Joined data
  assignee?: Profile | null;
  reporter?: Profile | null;
  cycle?: Cycle | null;
  labels?: Label[];
}

export interface Comment {
  id: string;
  issue_id: string;
  author_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
  author?: Profile | null;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  issue_id: string | null;
  actor_id: string | null;
  message: string;
  read: boolean;
  created_at: string;
  actor?: Profile | null;
  issue?: Issue | null;
}

export interface IssueFilters {
  status?: IssueStatus[];
  priority?: IssuePriority[];
  assignee_id?: string | null;
  label_ids?: string[];
  cycle_id?: string | null;
  search?: string;
}

export type ViewType = 'board' | 'list' | 'timeline';

export const STATUS_CONFIG: Record<IssueStatus, { label: string; color: string }> = {
  backlog: { label: 'Backlog', color: 'bg-muted' },
  todo: { label: 'Todo', color: 'bg-slate-500' },
  in_progress: { label: 'In Progress', color: 'bg-blue-500' },
  in_review: { label: 'In Review', color: 'bg-yellow-500' },
  done: { label: 'Done', color: 'bg-green-500' },
  cancelled: { label: 'Cancelled', color: 'bg-red-500' },
};

export const PRIORITY_CONFIG: Record<IssuePriority, { label: string; icon: string; color: string }> = {
  urgent: { label: 'Urgent', icon: '🔴', color: 'text-red-500' },
  high: { label: 'High', icon: '🟠', color: 'text-orange-500' },
  medium: { label: 'Medium', icon: '🟡', color: 'text-yellow-500' },
  low: { label: 'Low', icon: '🟢', color: 'text-green-500' },
  none: { label: 'No Priority', icon: '⚪', color: 'text-muted-foreground' },
};

export const STATUSES: IssueStatus[] = ['backlog', 'todo', 'in_progress', 'in_review', 'done', 'cancelled'];
export const PRIORITIES: IssuePriority[] = ['urgent', 'high', 'medium', 'low', 'none'];
