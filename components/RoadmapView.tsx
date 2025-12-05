import React, { useState } from 'react';
import { RoadmapResponse, Task } from '../types';
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Tag, 
  LayoutGrid, 
  Table as TableIcon, 
  MoreHorizontal,
  FileText,
  CheckSquare,
  Square
} from 'lucide-react';

interface RoadmapViewProps {
  data: RoadmapResponse;
}

const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
  const styles = {
    High: "bg-red-500/20 text-red-300 border-red-500/50",
    Medium: "bg-yellow-500/20 text-yellow-300 border-yellow-500/50",
    Low: "bg-blue-500/20 text-blue-300 border-blue-500/50",
  };

  const icons = {
    High: <AlertCircle className="w-3 h-3 mr-1" />,
    Medium: <Clock className="w-3 h-3 mr-1" />,
    Low: <CheckCircle2 className="w-3 h-3 mr-1" />,
  };

  const labels: Record<string, string> = {
    High: "Высокий",
    Medium: "Средний",
    Low: "Низкий"
  };

  return (
    <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full border ${styles[priority as keyof typeof styles] || styles.Low}`}>
      {icons[priority as keyof typeof icons]}
      {labels[priority] || priority}
    </span>
  );
};

export const RoadmapView: React.FC<RoadmapViewProps> = ({ data }) => {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [localData, setLocalData] = useState<RoadmapResponse>(data);

  // Flatten tasks for table view
  const allTasks = localData.stages.flatMap(stage => 
    stage.tasks.map(task => ({ ...task, stageName: stage.stage_name }))
  );

  const toggleTaskStatus = (taskId: number) => {
    const newData = { ...localData };
    newData.stages = newData.stages.map(stage => ({
      ...stage,
      tasks: stage.tasks.map(task => {
        if (task.id === taskId) {
          return { ...task, status: task.status === 'Done' ? 'Todo' : 'Done' };
        }
        return task;
      }) as Task[]
    }));
    setLocalData(newData);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/50 p-4 rounded-lg border border-slate-700">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Описание проекта</h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-3xl mt-1">{data.project_summary}</p>
        </div>
        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700 shrink-0">
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              viewMode === 'table' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <TableIcon className="w-4 h-4 mr-2" />
            Таблица
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              viewMode === 'cards' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <LayoutGrid className="w-4 h-4 mr-2" />
            Карточки
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="rounded-lg border border-slate-700 overflow-hidden bg-slate-900 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left caption-bottom border-collapse">
              <thead className="bg-slate-800/80 text-slate-400 font-medium">
                <tr className="border-b border-slate-700">
                  <th className="h-10 px-4 w-12 text-center border-r border-slate-700/50">
                    <CheckSquare className="w-4 h-4 mx-auto opacity-50" />
                  </th>
                  <th className="h-10 px-4 w-16 text-center border-r border-slate-700/50">ID</th>
                  <th className="h-10 px-4 min-w-[300px] border-r border-slate-700/50">Задача</th>
                  <th className="h-10 px-4 w-[180px] border-r border-slate-700/50">Этап</th>
                  <th className="h-10 px-4 w-[140px] border-r border-slate-700/50">Приоритет</th>
                  <th className="h-10 px-4 min-w-[200px] border-r border-slate-700/50">Теги</th>
                  <th className="h-10 px-4 w-12 text-center">Инфо</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {allTasks.map((task) => (
                  <tr 
                    key={task.id} 
                    className={`group transition-colors hover:bg-slate-800/40 ${task.status === 'Done' ? 'bg-slate-800/20' : ''}`}
                  >
                    <td className="p-0 border-r border-slate-800 text-center align-middle">
                      <button 
                        onClick={() => toggleTaskStatus(task.id)}
                        className="w-full h-full p-3 flex items-center justify-center hover:bg-indigo-500/10 transition-colors"
                      >
                        {task.status === 'Done' ? (
                          <div className="w-5 h-5 bg-indigo-500 rounded flex items-center justify-center text-white">
                            <CheckSquare className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 border-2 border-slate-600 rounded hover:border-indigo-400 transition-colors" />
                        )}
                      </button>
                    </td>
                    <td className="p-3 text-center text-slate-500 font-mono text-xs border-r border-slate-800 align-middle">
                      #{task.id}
                    </td>
                    <td className="p-3 border-r border-slate-800 align-middle">
                      <div className={`font-medium ${task.status === 'Done' ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                        {task.title}
                      </div>
                      <div className="text-xs text-slate-500 truncate max-w-[400px]">
                        {task.description}
                      </div>
                    </td>
                    <td className="p-3 border-r border-slate-800 align-middle">
                      <span className="inline-flex items-center px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 text-xs whitespace-nowrap">
                        {task.stageName}
                      </span>
                    </td>
                    <td className="p-3 border-r border-slate-800 align-middle">
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td className="p-3 border-r border-slate-800 align-middle">
                      <div className="flex flex-wrap gap-1">
                         {task.tags.slice(0, 3).map((tag, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded border border-slate-700/50">
                            {tag}
                          </span>
                        ))}
                        {task.tags.length > 3 && (
                          <span className="text-[10px] px-1.5 py-0.5 text-slate-500">+ {task.tags.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-center align-middle">
                      <div className="group/tooltip relative inline-block">
                        <FileText className="w-4 h-4 text-slate-600 hover:text-indigo-400 cursor-help" />
                        <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 w-64 p-3 bg-slate-900 border border-slate-700 rounded-lg shadow-xl text-xs text-slate-300 opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-50 text-left">
                          <div className="font-semibold text-indigo-400 mb-1">Обоснование:</div>
                          {task.reasoning}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-800/50 border-t border-slate-700">
                <tr>
                  <td colSpan={2} className="p-3 text-center text-xs text-slate-500 border-r border-slate-700/50">
                    Всего: {allTasks.length}
                  </td>
                  <td colSpan={5} className="p-3">
                    <div className="flex items-center justify-between text-xs text-slate-400 px-2">
                       <span>Выполнено: <span className="text-indigo-400 font-bold">{allTasks.filter(t => t.status === 'Done').length}</span></span>
                       <div className="w-48 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-500 transition-all duration-500" 
                            style={{ width: `${(allTasks.filter(t => t.status === 'Done').length / allTasks.length) * 100}%` }}
                          />
                       </div>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {localData.stages.map((stage, index) => (
            <div key={index} className="relative pl-8 border-l-2 border-slate-700 pb-8 last:pb-0 last:border-0">
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-500 ring-4 ring-slate-900" />
              
              <h3 className="text-lg font-bold text-indigo-400 mb-4 flex items-center">
                <span className="bg-slate-800 px-3 py-1 rounded border border-slate-700">
                  {stage.stage_name}
                </span>
              </h3>

              <div className="grid grid-cols-1 gap-4">
                {stage.tasks.map((task) => (
                  <div key={task.id} className="bg-slate-800/50 hover:bg-slate-800 transition-colors rounded-lg p-5 border border-slate-700/50 group">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-slate-200 font-medium text-lg flex items-center">
                        <span className="text-slate-500 text-sm mr-2 font-mono">#{task.id}</span>
                        {task.title}
                      </h4>
                      <PriorityBadge priority={task.priority} />
                    </div>
                    
                    <p className="text-slate-400 text-sm mb-3">{task.description}</p>
                    
                    <div className="bg-slate-900/50 p-3 rounded text-xs text-slate-500 italic mb-3 border-l-2 border-indigo-500/30">
                      <span className="font-semibold text-indigo-400/80 not-italic mr-1">Обоснование:</span>
                      {task.reasoning}
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {task.tags.map((tag, i) => (
                        <span key={i} className="flex items-center text-xs text-slate-400 bg-slate-900 px-2 py-1 rounded">
                          <Tag className="w-3 h-3 mr-1 opacity-50" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};