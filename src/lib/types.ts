// Existing types...

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'deadline' | 'mention' | 'update' | 'system';
  read: boolean;
  created_at: string;
}

export interface TaskProgress {
  id: string;
  task_id: string;
  percentage: number;
  status_update: string;
  created_at: string;
  updated_at: string;
}

export interface DeadlineReminder {
  id: string;
  task_id: string;
  remind_at: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  email_notifications: boolean;
  created_at: string;
}