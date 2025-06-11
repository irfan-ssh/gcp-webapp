export interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
}

export interface Project {
  projectId: string;
  name: string;
  projectNumber: string;
  lifecycleState: string;
  createTime: string;
  selected?: boolean;
}

export interface CreateProjectRequest {
  count: number;
  prefix: string;
  enableBilling: boolean;
  createServiceAccounts: boolean;
}

export interface CreateProjectResponse {
  success: boolean;
  projects: Project[];
  serviceAccountKeys?: any[];
  message: string;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: Date;
}

export interface ProgressUpdate {
  current: number;
  total: number;
  status: string;
  projectId?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  sessionId: string | null;
  loading: boolean;
}

export interface AppState {
  auth: AuthState;
  projects: Project[];
  notifications: Notification[];
  loading: boolean;
  darkMode: boolean;
}