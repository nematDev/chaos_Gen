
import React, { useState } from 'react';
import { Project } from '../models/Project';
import { Task, Subtask } from '../types';
import { 
  Check, 
  Circle, 
  Clock, 
  ChevronDown, 
  ChevronRight,
  LayoutGrid, 
  Table as TableIcon, 
  List,
  CheckSquare,
  Trash2,
  Plus,
  MoreHorizontal
} from 'lucide-react';

interface ProjectBoardProps {
  project: Project;
  onUpdate: (project: Project) => void;
}

export const ProjectBoard: React.FC<ProjectBoardProps> = ({ project, onUpdate }) => {
  const [viewMode, setViewMode] = useState<'list' | 'table' | 'cards'>('list');
  const [collapsedStages, setCollapsedStages] = useState<Record<string, boolean>>({});

  const toggleStage = (stageName: string) => {
    setCollapsedStages(prev => ({ ...prev, [stageName]: !prev[stageName] }));
  };

  // --- Handlers ---
  const handleTaskToggle = (taskId: number) => {
    onUpdate(project.toggleTaskStatus(taskId));
  };

  const handleDeleteTask = (taskId: number) => {
    if (window.confirm('Удалить эту задачу?')) {
      onUpdate(project.deleteTask(taskId));
    }
  };

  const handleSubtaskToggle = (taskId: number, subId: string | number) => {
    onUpdate(project.toggleSubtask(taskId, subId));
  };

  const handleAddSubtask = (taskId: number, title: string) => {
    onUpdate(project.addSubtask(taskId, title));
  };

  const handleDeleteSubtask = (taskId: number, subId: string | number) => {
    onUpdate(project.deleteSubtask(taskId, subId));
  };

  const stats = project.getStatistics();

  return (
    <div className="w-full max-w-6xl mx-auto animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pt-4">
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-foreground tracking-tight mb-2">План Проекта</h2>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-3xl">
            {project.summary}
          </p>
          
          {/* Professional Progress Bar */}
          <div className="mt-6 max-w-lg">
             <div className="flex justify-between text-xs font-medium text-muted-foreground mb-2">
                <span>Общий прогресс</span>
                <span>{stats.percent}%</span>
             </div>
             <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-700 ease-out"
                  style={{ width: `${stats.percent}%` }}
                />
             </div>
          </div>
        </div>
        
        {/* View Toggles */}
        <div className="bg-secondary/50 p-1 rounded-lg border border-border flex items-center shrink-0 self-start md:self-auto shadow-sm">
          <ViewToggleButton 
            active={viewMode === 'list'} 
            onClick={() => setViewMode('list')} 
            icon={<List className="w-4 h-4" />} 
            label="Список"
          />
          <ViewToggleButton 
            active={viewMode === 'table'} 
            onClick={() => setViewMode('table')} 
            icon={<TableIcon className="w-4 h-4" />} 
            label="Таблица"
          />
          <ViewToggleButton 
            active={viewMode === 'cards'} 
            onClick={() => setViewMode('cards')} 
            icon={<LayoutGrid className="w-4 h-4" />} 
            label="Блоки"
          />
        </div>
      </div>

      {/* --- LIST VIEW --- */}
      {viewMode === 'list' && (
        <div className="space-y-8">
          {project.stages.map((stage) => (
            <div key={stage.stage_name} className="group/stage">
              <button 
                onClick={() => toggleStage(stage.stage_name)}
                className="flex items-center w-full text-left mb-4 group-hover/stage:text-foreground transition-colors select-none py-2 border-b border-border/50"
              >
                <div className="p-1 rounded hover:bg-secondary text-muted-foreground transition-colors mr-2">
                  {collapsedStages[stage.stage_name] ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
                <span className="text-sm font-bold text-foreground uppercase tracking-wider">{stage.stage_name}</span>
                <span className="ml-3 text-xs font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                  {stage.tasks.length} задач
                </span>
              </button>

              {!collapsedStages[stage.stage_name] && (
                <div className="space-y-4 pl-2 md:pl-6">
                  {stage.tasks.map((task) => (
                    <TaskCardFull 
                      key={task.id} 
                      task={task} 
                      onToggle={() => handleTaskToggle(task.id)}
                      onDelete={() => handleDeleteTask(task.id)}
                      onSubtaskToggle={(sid) => handleSubtaskToggle(task.id, sid)}
                      onAddSubtask={(title) => handleAddSubtask(task.id, title)}
                      onDeleteSubtask={(sid) => handleDeleteSubtask(task.id, sid)}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* --- CARDS VIEW --- */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {project.stages.map((stage) => (
            <div key={stage.stage_name} className="flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/50">
                 <div className="h-2 w-2 rounded-full bg-primary" />
                 <span className="text-sm font-bold text-foreground">{stage.stage_name}</span>
              </div>
              {stage.tasks.map((task) => (
                <TaskCardCompact
                  key={task.id}
                  task={task}
                  onToggle={() => handleTaskToggle(task.id)}
                  onSubtaskToggle={(sid) => handleSubtaskToggle(task.id, sid)}
                  onDelete={() => handleDeleteTask(task.id)}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* --- TABLE VIEW --- */}
      {viewMode === 'table' && (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left border-collapse table-fixed">
            <thead className="bg-secondary/50 text-muted-foreground font-medium border-b border-border">
              <tr>
                <th className="h-12 px-4 w-12 text-center border-r border-border/50"><CheckSquare className="w-4 h-4 mx-auto" /></th>
                <th className="h-12 px-4 w-16 text-center border-r border-border/50 hidden md:table-cell">ID</th>
                <th className="h-12 px-4 w-auto border-r border-border/50">Задача</th>
                <th className="h-12 px-4 w-[140px] border-r border-border/50 hidden lg:table-cell">Этап</th>
                <th className="h-12 px-4 w-[100px] text-center border-r border-border/50">Приоритет</th>
                <th className="h-12 px-4 w-12 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {project.allTasks.map(task => {
                const stage = project.stages.find(s => s.tasks.find(t => t.id === task.id));
                const completedSubs = task.subtasks?.filter(s => s.status === 'Done').length || 0;
                const totalSubs = task.subtasks?.length || 0;

                return (
                  <tr key={task.id} className={`hover:bg-muted/30 transition-colors ${task.status === 'Done' ? 'bg-secondary/20' : ''}`}>
                    <td className="p-0 border-r border-border/50 text-center align-middle">
                      <button 
                        onClick={() => handleTaskToggle(task.id)} 
                        className="w-full h-full py-3 flex items-center justify-center hover:bg-primary/10 transition-colors"
                      >
                         {task.status === 'Done' 
                          ? <div className="w-5 h-5 bg-primary rounded flex items-center justify-center text-primary-foreground"><Check className="w-3.5 h-3.5"/></div> 
                          : <div className="w-5 h-5 border-2 border-muted-foreground/30 rounded" />
                         }
                      </button>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-center text-muted-foreground border-r border-border/50 hidden md:table-cell align-top pt-4">#{task.id}</td>
                    <td className="px-4 py-3 border-r border-border/50 align-top">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`font-medium break-words ${task.status === 'Done' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {task.title}
                        </span>
                        {totalSubs > 0 && (
                          <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded border border-border">
                            {completedSubs}/{totalSubs}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {task.description}
                      </div>
                      <div className="lg:hidden mt-2">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-secondary text-secondary-foreground">
                          {stage?.stage_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs border-r border-border/50 hidden lg:table-cell align-middle text-muted-foreground">{stage?.stage_name}</td>
                    <td className="px-2 py-3 border-r border-border/50 text-center align-middle">
                       <PriorityBadge priority={task.priority} />
                    </td>
                    <td className="px-2 py-3 text-center align-middle">
                      <button onClick={() => handleDeleteTask(task.id)} className="text-muted-foreground hover:text-destructive transition-colors p-2 rounded-full hover:bg-destructive/10">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

// --- COMPONENTS ---

const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
  const styles = {
    High: "bg-red-500/10 text-red-500 border-red-500/20",
    Medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    Low: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  };
  return (
    <span className={`inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded border ${styles[priority as keyof typeof styles] || styles.Low}`}>
      {priority}
    </span>
  );
};

const ViewToggleButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
      active 
        ? 'bg-card shadow-sm text-foreground ring-1 ring-border' 
        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
    }`}
  >
    <span className="mr-2">{icon}</span>
    <span className="hidden sm:inline">{label}</span>
  </button>
);

// --- Task Card Full (List View) ---
const TaskCardFull: React.FC<{ 
  task: Task; 
  onToggle: () => void;
  onDelete: () => void;
  onSubtaskToggle: (id: string | number) => void;
  onAddSubtask: (title: string) => void;
  onDeleteSubtask: (id: string | number) => void;
}> = ({ task, onToggle, onDelete, onSubtaskToggle, onAddSubtask, onDeleteSubtask }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');

  const submitSubtask = () => {
    if (newSubtask.trim()) {
      onAddSubtask(newSubtask);
      setNewSubtask('');
      setIsAdding(false);
    }
  };

  return (
    <div className={`bg-card border border-border rounded-xl p-5 shadow-sm transition-all hover:shadow-md ${task.status === 'Done' ? 'opacity-70' : ''}`}>
      {/* Main Task Header */}
      <div className="flex items-start gap-3">
        {/* Large hit area for main checkbox */}
        <button 
          onClick={onToggle} 
          className="shrink-0 h-10 w-10 flex items-center justify-center -ml-2 -mt-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-primary"
        >
           {task.status === 'Done' 
             ? <div className="w-5 h-5 bg-primary rounded flex items-center justify-center text-primary-foreground"><Check className="w-3.5 h-3.5"/></div>
             : <div className="w-5 h-5 border-2 border-muted-foreground/30 rounded" />
           }
        </button>
        
        <div className="flex-grow min-w-0 pt-0.5">
          <div className="flex justify-between items-start">
            <h3 className={`font-semibold text-lg leading-tight ${task.status === 'Done' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
              {task.title}
            </h3>
            <div className="flex items-center gap-3 ml-2">
              <PriorityBadge priority={task.priority} />
              <button onClick={onDelete} className="p-2 -mr-2 text-muted-foreground/50 hover:text-destructive transition-colors rounded-full hover:bg-destructive/10">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1 mb-3">{task.description}</p>
          
          {/* Subtasks Section */}
          <div className="mt-4 bg-secondary/30 rounded-lg p-3 border border-border/50">
            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
              Подзадачи
              <span className="bg-secondary text-foreground px-1.5 rounded text-[10px]">
                {task.subtasks?.filter(s => s.status === 'Done').length || 0}/{task.subtasks?.length || 0}
              </span>
            </h5>
            
            <div className="space-y-1">
              {task.subtasks?.map(sub => (
                <div key={sub.id} className="group/sub flex items-center gap-1 py-1.5 hover:bg-secondary/50 px-2 rounded -mx-2 transition-colors">
                  <button 
                    onClick={() => onSubtaskToggle(sub.id)} 
                    className="shrink-0 h-8 w-8 flex items-center justify-center rounded-full hover:bg-secondary text-muted-foreground hover:text-primary transition-colors -ml-2"
                  >
                    {sub.status === 'Done' 
                      ? <div className="w-4 h-4 bg-primary/20 text-primary rounded flex items-center justify-center"><Check className="w-3 h-3"/></div>
                      : <div className="w-4 h-4 border border-muted-foreground/40 rounded" />
                    }
                  </button>
                  <span className={`text-sm flex-grow cursor-pointer ${sub.status === 'Done' ? 'line-through text-muted-foreground' : 'text-foreground/90'}`} onClick={() => onSubtaskToggle(sub.id)}>
                    {sub.title}
                  </span>
                  <button 
                    onClick={() => onDeleteSubtask(sub.id)} 
                    className="opacity-0 group-hover/sub:opacity-100 p-2 text-muted-foreground hover:text-destructive transition-all rounded-full hover:bg-destructive/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Subtask Input */}
            {isAdding ? (
              <div className="mt-2 flex items-center gap-2">
                <input 
                  autoFocus
                  type="text" 
                  value={newSubtask}
                  onChange={e => setNewSubtask(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && submitSubtask()}
                  placeholder="Новая подзадача..."
                  className="bg-background border border-border rounded px-2 py-1 text-sm w-full focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button onClick={submitSubtask} className="p-2 text-primary hover:text-primary/80"><Check className="w-4 h-4" /></button>
              </div>
            ) : (
              <button 
                onClick={() => setIsAdding(true)}
                className="mt-2 flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded hover:bg-secondary"
              >
                <Plus className="w-3.5 h-3.5" /> Добавить шаг
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

// --- Task Card Compact (Card View) ---
const TaskCardCompact: React.FC<{ 
  task: Task; 
  onToggle: () => void;
  onSubtaskToggle: (id: string | number) => void;
  onDelete: () => void;
}> = ({ task, onToggle, onSubtaskToggle, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const completedSubs = task.subtasks?.filter(s => s.status === 'Done').length || 0;
  const totalSubs = task.subtasks?.length || 0;
  const percent = totalSubs === 0 ? 0 : Math.round((completedSubs / totalSubs) * 100);

  return (
    <div className={`bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col h-full group ${task.status === 'Done' ? 'opacity-60' : ''}`}>
      <div className="flex justify-between items-start mb-2">
        <PriorityBadge priority={task.priority} />
        <button onClick={onDelete} className="p-1.5 -mr-1.5 text-muted-foreground/30 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 rounded-full hover:bg-destructive/10">
           <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      
      <div className="flex items-start gap-2 mb-2">
         <button 
           onClick={onToggle} 
           className="shrink-0 h-9 w-9 flex items-center justify-center -ml-2 -mt-1.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-primary transition-colors"
         >
           {task.status === 'Done' 
             ? <div className="w-4 h-4 bg-primary rounded flex items-center justify-center text-primary-foreground"><Check className="w-3 h-3"/></div>
             : <div className="w-4 h-4 border-2 border-muted-foreground/30 rounded" />
           }
        </button>
        <h4 className={`font-semibold leading-tight pt-0.5 ${task.status === 'Done' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
          {task.title}
        </h4>
      </div>

      <p className="text-xs text-muted-foreground line-clamp-2 mb-4 flex-grow">{task.description}</p>
      
      {/* Subtasks Progress */}
      {totalSubs > 0 && (
        <div className="bg-secondary/50 rounded-lg p-2 mt-auto cursor-pointer hover:bg-secondary" onClick={() => setExpanded(!expanded)}>
           <div className="flex justify-between items-center text-[10px] text-muted-foreground mb-1.5">
              <span className="font-medium">Прогресс</span>
              <span>{completedSubs}/{totalSubs}</span>
           </div>
           <div className="h-1.5 w-full bg-background rounded-full overflow-hidden mb-1">
              <div className="h-full bg-primary/80" style={{ width: `${percent}%` }} />
           </div>
           
           {expanded && (
             <div className="mt-2 space-y-1 pt-2 border-t border-border/50 animate-in slide-in-from-top-2 fade-in">
               {task.subtasks.map(sub => (
                 <div key={sub.id} className="flex items-center gap-2 p-1 rounded hover:bg-background/50" onClick={(e) => { e.stopPropagation(); onSubtaskToggle(sub.id); }}>
                    <div className={`shrink-0 w-3 h-3 border rounded-sm flex items-center justify-center ${sub.status === 'Done' ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/40'}`}>
                      {sub.status === 'Done' && <Check className="w-2 h-2" />}
                    </div>
                    <span className={`text-[10px] truncate ${sub.status === 'Done' ? 'line-through text-muted-foreground' : 'text-foreground/80'}`}>{sub.title}</span>
                 </div>
               ))}
             </div>
           )}
        </div>
      )}
    </div>
  );
};
