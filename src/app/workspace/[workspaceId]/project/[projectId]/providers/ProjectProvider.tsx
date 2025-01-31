'use client';

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
  Dispatch,
} from 'react';
import { useProject } from '@/hooks/use-project';

interface ProjectState {
  currentView: string;
  customViews: CustomView[];
  favoriteViews: string[];
  taskTemplates: TaskTemplate[];
  customFields: CustomField[];
  workflowStatuses: WorkflowStatus[];
  settings: ProjectSettings;
}

interface FilterValue {
  field: string;
  operator: 'equals' | 'contains' | 'gt' | 'lt' | 'between' | 'in';
  value: string | number | boolean | Date | Array<string | number>;
}

interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

type ViewType = 'kanban' | 'list' | 'calendar' | 'timeline' | 'table' | 'gallery' | 'mindmap';

interface CustomView {
  id: string;
  name: string;
  type: ViewType;
  filters: Record<string, FilterValue>;
  sort: SortConfig;
  groupBy?: string;
  columns?: string[];
}

interface TaskTemplate {
  id: string;
  name: string;
  description?: string;
  fields: Record<string, unknown>;
}

interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'user' | 'url';
  options?: { label: string; value: string }[];
  required: boolean;
  defaultValue?: unknown;
}

interface WorkflowStatus {
  id: string;
  name: string;
  color: string;
  type: 'todo' | 'in_progress' | 'done';
  position: number;
}

interface ProjectSettings {
  defaultView: string;
  timeTracking: boolean;
  requireEstimates: boolean;
  requireDueDate: boolean;
  allowSubtasks: boolean;
  allowAttachments: boolean;
  allowComments: boolean;
  allowTimeTracking: boolean;
  notifyOnChanges: boolean;
  theme: {
    primaryColor: string;
    accentColor: string;
  };
}

type ProjectAction =
  | { type: 'SET_CURRENT_VIEW'; payload: string }
  | { type: 'ADD_CUSTOM_VIEW'; payload: CustomView }
  | { type: 'UPDATE_CUSTOM_VIEW'; payload: CustomView }
  | { type: 'DELETE_CUSTOM_VIEW'; payload: string }
  | { type: 'ADD_TASK_TEMPLATE'; payload: TaskTemplate }
  | { type: 'UPDATE_TASK_TEMPLATE'; payload: TaskTemplate }
  | { type: 'DELETE_TASK_TEMPLATE'; payload: string }
  | { type: 'ADD_CUSTOM_FIELD'; payload: CustomField }
  | { type: 'UPDATE_CUSTOM_FIELD'; payload: CustomField }
  | { type: 'DELETE_CUSTOM_FIELD'; payload: string }
  | { type: 'UPDATE_WORKFLOW_STATUSES'; payload: WorkflowStatus[] }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<ProjectSettings> };

const initialState: ProjectState = {
  currentView: 'kanban',
  customViews: [],
  favoriteViews: [],
  taskTemplates: [],
  customFields: [],
  workflowStatuses: [
    { id: 'todo', name: 'To Do', color: '#E2E8F0', type: 'todo', position: 0 },
    { id: 'in_progress', name: 'In Progress', color: '#3B82F6', type: 'in_progress', position: 1 },
    { id: 'done', name: 'Done', color: '#10B981', type: 'done', position: 2 },
  ],
  settings: {
    defaultView: 'kanban',
    timeTracking: false,
    requireEstimates: false,
    requireDueDate: false,
    allowSubtasks: true,
    allowAttachments: true,
    allowComments: true,
    allowTimeTracking: false,
    notifyOnChanges: true,
    theme: {
      primaryColor: '#3B82F6',
      accentColor: '#10B981',
    },
  },
};

function projectReducer(state: ProjectState, action: ProjectAction): ProjectState {
  switch (action.type) {
    case 'SET_CURRENT_VIEW':
      return {
        ...state,
        currentView: action.payload,
      };
    case 'ADD_CUSTOM_VIEW':
      return {
        ...state,
        customViews: [...state.customViews, action.payload],
      };
    case 'UPDATE_CUSTOM_VIEW':
      return {
        ...state,
        customViews: state.customViews.map((view) =>
          view.id === action.payload.id ? action.payload : view
        ),
      };
    case 'DELETE_CUSTOM_VIEW':
      return {
        ...state,
        customViews: state.customViews.filter((view) => view.id !== action.payload),
      };
    case 'ADD_TASK_TEMPLATE':
      return {
        ...state,
        taskTemplates: [...state.taskTemplates, action.payload],
      };
    case 'UPDATE_TASK_TEMPLATE':
      return {
        ...state,
        taskTemplates: state.taskTemplates.map((template) =>
          template.id === action.payload.id ? action.payload : template
        ),
      };
    case 'DELETE_TASK_TEMPLATE':
      return {
        ...state,
        taskTemplates: state.taskTemplates.filter(
          (template) => template.id !== action.payload
        ),
      };
    case 'ADD_CUSTOM_FIELD':
      return {
        ...state,
        customFields: [...state.customFields, action.payload],
      };
    case 'UPDATE_CUSTOM_FIELD':
      return {
        ...state,
        customFields: state.customFields.map((field) =>
          field.id === action.payload.id ? action.payload : field
        ),
      };
    case 'DELETE_CUSTOM_FIELD':
      return {
        ...state,
        customFields: state.customFields.filter(
          (field) => field.id !== action.payload
        ),
      };
    case 'UPDATE_WORKFLOW_STATUSES':
      return {
        ...state,
        workflowStatuses: action.payload,
      };
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload,
        },
      };
    default:
      return state;
  }
}

const ProjectContext = createContext<{
  state: ProjectState;
  dispatch: Dispatch<ProjectAction>;
} | null>(null);

export function ProjectProvider({
  children,
  workspaceId,
  projectId,
}: {
  children: ReactNode;
  workspaceId: string;
  projectId: string;
}) {
  const [state, dispatch] = useReducer(projectReducer, initialState);
  const { data: projectData } = useProject(workspaceId, projectId);

  useEffect(() => {
    if (projectData?.project) {
      dispatch({
        type: 'UPDATE_SETTINGS',
        payload: {
          theme: {
            primaryColor: projectData.project.backgroundColor || '#3B82F6',
            accentColor: state.settings.theme.accentColor,
          },
        },
      });
    }
  }, [projectData]);

  return (
    <ProjectContext.Provider value={{ state, dispatch }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjectContext() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjectContext must be used within a ProjectProvider');
  }
  return context;
}