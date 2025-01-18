export interface Workspace {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  theme?: {
    color: string;
  };
  owner: {
    id: string;
    name: string;
    email: string;
  };
  _count?: {
    projects: number;
    members: number;
  };
} 