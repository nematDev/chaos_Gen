import React from 'react';
import { RoadmapResponse } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface AnalyticsViewProps {
  data: RoadmapResponse;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ data }) => {
  // Prepare data for Tasks per Stage
  const tasksPerStage = data.stages.map((stage) => ({
    name: stage.stage_name,
    count: stage.tasks.length,
    high: stage.tasks.filter((t) => t.priority === 'High').length,
    medium: stage.tasks.filter((t) => t.priority === 'Medium').length,
    low: stage.tasks.filter((t) => t.priority === 'Low').length,
  }));

  // Prepare data for Overall Priority Distribution
  const allTasks = data.stages.flatMap((s) => s.tasks);
  
  const priorityLabels: Record<string, string> = {
    High: 'Высокий',
    Medium: 'Средний',
    Low: 'Низкий'
  };

  const priorityDistribution = [
    { name: 'High', label: 'Высокий', value: allTasks.filter((t) => t.priority === 'High').length },
    { name: 'Medium', label: 'Средний', value: allTasks.filter((t) => t.priority === 'Medium').length },
    { name: 'Low', label: 'Низкий', value: allTasks.filter((t) => t.priority === 'Low').length },
  ];

  const PRIORITY_COLORS = {
    High: '#ef4444',
    Medium: '#eab308',
    Low: '#3b82f6',
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 p-2 rounded shadow-xl text-xs">
          <p className="text-slate-200 font-semibold mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks per Stage Chart */}
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-100 mb-6">Распределение задач по этапам</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tasksPerStage} layout="vertical" margin={{ left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={100} 
                  stroke="#94a3b8" 
                  tick={{ fontSize: 10 }} 
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b' }} />
                <Legend />
                <Bar dataKey="high" name="Высокий приоритет" stackId="a" fill={PRIORITY_COLORS.High} radius={[0, 4, 4, 0]} />
                <Bar dataKey="medium" name="Средний приоритет" stackId="a" fill={PRIORITY_COLORS.Medium} />
                <Bar dataKey="low" name="Низкий приоритет" stackId="a" fill={PRIORITY_COLORS.Low} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Distribution Pie Chart */}
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-100 mb-6">Общее распределение приоритетов</h3>
          <div className="h-[300px] w-full flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="label"
                >
                  {priorityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.name as keyof typeof PRIORITY_COLORS]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 text-center">
            <div className="text-slate-400 text-sm">Всего задач</div>
            <div className="text-3xl font-bold text-slate-100">{allTasks.length}</div>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 text-center">
            <div className="text-slate-400 text-sm">Всего этапов</div>
            <div className="text-3xl font-bold text-slate-100">{data.stages.length}</div>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 text-center">
            <div className="text-slate-400 text-sm">Ср. задач на этап</div>
            <div className="text-3xl font-bold text-slate-100">{Math.round(allTasks.length / data.stages.length)}</div>
        </div>
      </div>
    </div>
  );
};