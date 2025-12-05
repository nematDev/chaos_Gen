
import React from 'react';
import { Project } from '../models/Project';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, YAxis, CartesianGrid } from 'recharts';

interface ProjectStatsProps {
  project: Project;
}

export const ProjectStats: React.FC<ProjectStatsProps> = ({ project }) => {
  const stats = project.getStatistics();
  
  const priorityData = [
    { name: 'Высокий', value: stats.byPriority.High, color: '#ef4444' }, 
    { name: 'Средний', value: stats.byPriority.Medium, color: '#f59e0b' }, 
    { name: 'Низкий', value: stats.byPriority.Low, color: '#3b82f6' }, 
  ].filter(d => d.value > 0);

  const stageData = project.stages.map(s => ({
    name: s.stage_name,
    total: s.tasks.length,
    completed: s.tasks.filter(t => t.status === 'Done').length
  }));

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-10 pt-4">
        <h2 className="text-3xl font-bold text-foreground tracking-tight mb-2">Аналитика Проекта</h2>
        <p className="text-muted-foreground text-sm">Обзор прогресса и распределение задач.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard label="Общий прогресс" value={`${stats.percent}%`} sub={`Выполнено задач и этапов`} />
        <StatCard label="Всего Задач" value={stats.total} sub="Основных задач" />
        <StatCard label="Завершено" value={stats.completed} sub="Готовых задач" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card/50 border border-border rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground mb-6">Приоритеты</h3>
          <div className="h-[220px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', fontSize: '12px', color: 'hsl(var(--foreground))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4 flex-wrap">
             {priorityData.map(d => (
               <div key={d.name} className="flex items-center text-xs text-muted-foreground">
                 <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: d.color }} />
                 {d.name}
               </div>
             ))}
          </div>
        </div>

        <div className="bg-card/50 border border-border rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground mb-6">Задачи по Этапам</h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} interval={0} angle={-15} textAnchor="end" height={40}/>
                <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', fontSize: '12px', color: 'hsl(var(--foreground))' }}
                />
                <Bar dataKey="total" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} barSize={20} name="Всего" />
                <Bar dataKey="completed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={20} name="Готово" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string | number; sub: string }> = ({ label, value, sub }) => (
  <div className="bg-card border border-border p-6 rounded-xl hover:border-primary/20 transition-colors shadow-sm">
    <div className="text-muted-foreground text-xs font-medium uppercase tracking-wider mb-2">{label}</div>
    <div className="text-4xl font-light text-foreground tracking-tighter mb-1">{value}</div>
    <div className="text-muted-foreground/80 text-xs">{sub}</div>
  </div>
);
