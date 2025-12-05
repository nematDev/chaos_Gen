
import { RoadmapResponse, Stage, Task, Subtask } from '../types';

export class Project {
  private _data: RoadmapResponse;

  constructor(data: RoadmapResponse) {
    this._data = JSON.parse(JSON.stringify(data));
  }

  // Getters
  get summary(): string {
    return this._data.project_summary;
  }

  get stages(): Stage[] {
    return this._data.stages;
  }

  get allTasks(): Task[] {
    return this._data.stages.flatMap(s => s.tasks);
  }

  // Business Logic & Stats
  getStatistics() {
    const tasks = this.allTasks;
    
    // Calculate stats based on Main Tasks
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Done').length;

    // Calculate stats including Subtasks for granular progress
    let totalItems = 0;
    let completedItems = 0;

    tasks.forEach(task => {
      totalItems += 1; // The task itself
      if (task.status === 'Done') completedItems += 1;

      if (task.subtasks) {
        task.subtasks.forEach(sub => {
          totalItems += 0.5; // Weight subtasks less than main tasks
          if (sub.status === 'Done') completedItems += 0.5;
        });
      }
    });

    const percent = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);

    return {
      total: totalTasks,
      completed: completedTasks,
      percent,
      byPriority: {
        High: tasks.filter(t => t.priority === 'High').length,
        Medium: tasks.filter(t => t.priority === 'Medium').length,
        Low: tasks.filter(t => t.priority === 'Low').length,
      },
    };
  }

  // --- MUTATIONS (Return new Project instance) ---

  toggleTaskStatus(taskId: number): Project {
    const newData = JSON.parse(JSON.stringify(this._data)) as RoadmapResponse;
    
    for (const stage of newData.stages) {
      const task = stage.tasks.find(t => t.id === taskId);
      if (task) {
        if (task.status === 'Todo') task.status = 'In Progress';
        else if (task.status === 'In Progress') task.status = 'Done';
        else task.status = 'Todo';
        
        // Auto-update subtasks if main task is done
        if (task.status === 'Done' && task.subtasks) {
           task.subtasks.forEach(s => s.status = 'Done');
        }
        break;
      }
    }
    return new Project(newData);
  }

  deleteTask(taskId: number): Project {
    const newData = JSON.parse(JSON.stringify(this._data)) as RoadmapResponse;
    
    newData.stages = newData.stages.map(stage => ({
      ...stage,
      tasks: stage.tasks.filter(t => t.id !== taskId)
    }));

    // Remove empty stages? Optional. Let's keep them for now.
    return new Project(newData);
  }

  toggleSubtask(taskId: number, subtaskId: string | number): Project {
    const newData = JSON.parse(JSON.stringify(this._data)) as RoadmapResponse;
    
    for (const stage of newData.stages) {
      const task = stage.tasks.find(t => t.id === taskId);
      if (task && task.subtasks) {
        const sub = task.subtasks.find(s => s.id === subtaskId);
        if (sub) {
          sub.status = sub.status === 'Todo' ? 'Done' : 'Todo';
          
          // Auto-update main task status if all subtasks done
          const allDone = task.subtasks.every(s => s.status === 'Done');
          if (allDone) task.status = 'Done';
          else if (task.status === 'Done' && !allDone) task.status = 'In Progress';
        }
        break;
      }
    }
    return new Project(newData);
  }

  addSubtask(taskId: number, title: string): Project {
    const newData = JSON.parse(JSON.stringify(this._data)) as RoadmapResponse;
    
    for (const stage of newData.stages) {
      const task = stage.tasks.find(t => t.id === taskId);
      if (task) {
        if (!task.subtasks) task.subtasks = [];
        task.subtasks.push({
          id: `manual-${Date.now()}`,
          title: title,
          status: 'Todo'
        });
        // If task was done, move back to In Progress
        if (task.status === 'Done') task.status = 'In Progress';
        break;
      }
    }
    return new Project(newData);
  }

  deleteSubtask(taskId: number, subtaskId: string | number): Project {
    const newData = JSON.parse(JSON.stringify(this._data)) as RoadmapResponse;
    
    for (const stage of newData.stages) {
      const task = stage.tasks.find(t => t.id === taskId);
      if (task && task.subtasks) {
        task.subtasks = task.subtasks.filter(s => s.id !== subtaskId);
        break;
      }
    }
    return new Project(newData);
  }

  toJSON(): RoadmapResponse {
    return this._data;
  }
}
