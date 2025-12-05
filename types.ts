
export interface Subtask {
  id: number | string;
  title: string;
  status: 'Todo' | 'Done';
}

export interface Task {
  id: number;
  title: string;
  description: string;
  reasoning: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Todo' | 'In Progress' | 'Done';
  tags: string[];
  subtasks: Subtask[];
}

export interface Stage {
  stage_name: string;
  tasks: Task[];
}

export interface RoadmapResponse {
  project_summary: string;
  stages: Stage[];
}

export enum ViewMode {
  ROADMAP = 'ROADMAP',
  ANALYTICS = 'ANALYTICS',
}
