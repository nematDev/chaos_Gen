
import React, { useState } from 'react';
import { GeminiGenerator } from './services/geminiService';
import { Project } from './models/Project';
import { ProjectBoard } from './components/ProjectBoard';
import { ProjectStats } from './components/ProjectStats';
import { useTheme } from './context/ThemeContext';
import { 
  Layout, 
  BarChart2, 
  Plus, 
  Zap, 
  ChevronRight,
  Command,
  Sun,
  Moon,
  Settings
} from 'lucide-react';

type View = 'board' | 'stats';

const App: React.FC = () => {
  const [project, setProject] = useState<Project | null>(null);
  const [currentView, setCurrentView] = useState<View>('board');
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { theme, mode, setTheme, setMode } = useTheme();
  const generator = new GeminiGenerator();

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setIsGenerating(true);
    setError(null);

    try {
      const newProject = await generator.generate(input);
      setProject(newProject);
      setInput(''); 
      setCurrentView('board');
    } catch (e) {
      setError("Не удалось создать план. Попробуйте еще раз.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateProject = (updated: Project) => {
    setProject(updated);
  };

  const renderContent = () => {
    if (!project) return null;
    return (
      <>
        {currentView === 'board' && <ProjectBoard project={project} onUpdate={handleUpdateProject} />}
        {currentView === 'stats' && <ProjectStats project={project} />}
      </>
    );
  };

  // Calculate Progress for Navbar Styling
  const stats = project ? project.getStatistics() : { percent: 0 };
  const progress = stats.percent;
  const isComplete = progress === 100;

  // Dynamic Styles for the "Progress Border"
  const borderGradient = project 
    ? `linear-gradient(90deg, #10b981 0%, #34d399 ${progress}%, rgba(255,255,255,0.1) ${progress}%, rgba(255,255,255,0.05) 100%)`
    : 'rgba(255,255,255,0.1)';
  
  const glowEffect = project && progress > 0
    ? `0 0 ${10 + (progress / 4)}px -2px rgba(16, 185, 129, ${0.1 + (progress / 200)})`
    : '0 10px 40px -10px rgba(0,0,0,0.2)';

  if (!project && !isGenerating) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 transition-colors duration-300 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px]" />
        </div>

        <div className="absolute top-6 right-6 z-50">
           <AppearancePopover 
             mode={mode} setMode={setMode} 
             theme={theme} setTheme={setTheme} 
           />
        </div>

        <div className="max-w-2xl w-full animate-in fade-in zoom-in-95 duration-500 relative z-10">
           <div className="mb-10 text-center">
             <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-card border border-border mb-6 shadow-sm rotate-3 hover:rotate-6 transition-transform">
               <Zap className="w-8 h-8 text-primary" />
             </div>
             <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-3">Architect Plan</h1>
             <p className="text-muted-foreground text-lg">Превращаем идеи в профессиональные дорожные карты.</p>
           </div>

           <div className="relative group">
             <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-500/20 blur-xl rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
             <div className="relative bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-2 shadow-2xl transition-all">
                <textarea 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Опишите вашу цель. Например: 'Запустить интернет-магазин' или 'Выучить Английский до уровня C1'. Я создам детальный план."
                  className="w-full h-40 bg-transparent text-lg text-foreground placeholder:text-muted-foreground/50 p-6 resize-none focus:outline-none font-light leading-relaxed"
                />
                <div className="flex justify-between items-center px-4 pb-2 border-t border-border/50 pt-4">
                   <span className="text-xs text-muted-foreground font-mono flex items-center opacity-70">
                     <Command className="w-3 h-3 mr-1" /> Enter для старта
                   </span>
                   <button 
                    onClick={handleGenerate}
                    disabled={!input.trim()}
                    className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0"
                   >
                     Создать План <ChevronRight className="w-4 h-4 ml-1" />
                   </button>
                </div>
             </div>
           </div>
           
           {error && <div className="mt-6 text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-center font-medium animate-in fade-in">{error}</div>}
        </div>

        {/* Creator Credit (Empty State) */}
        <div className="fixed bottom-4 right-6 z-40 text-[10px] font-mono text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors cursor-default select-none">
          creator @isknemat
        </div>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-muted-foreground">
        <div className="relative">
           <div className="w-16 h-16 border-4 border-muted border-t-primary rounded-full animate-spin" />
           <div className="absolute inset-0 flex items-center justify-center">
             <Zap className="w-6 h-6 text-primary animate-pulse" />
           </div>
        </div>
        <p className="mt-8 font-light text-xl text-foreground animate-pulse">Анализ задачи и декомпозиция...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-300 relative h-full">
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-[20%] left-[20%] w-[60vw] h-[60vw] bg-primary/5 rounded-full blur-[150px]" />
      </div>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 pb-32">
          {renderContent()}
      </main>

      {/* Floating Navbar with Progress Border */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-[95vw]">
        
        {/* The Outer "Border" Container */}
        <div 
          className="rounded-full p-[1.5px] transition-all duration-700 ease-out"
          style={{ 
            background: borderGradient,
            boxShadow: glowEffect
          }}
        >
          {/* The Inner Content Container */}
          <div className="flex items-center gap-1 md:gap-2 p-2 bg-card/90 backdrop-blur-xl rounded-full relative z-10">
            <div className="pl-3 pr-4 md:pl-4 md:pr-6 flex items-center gap-2 border-r border-border/50">
                <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full shadow-lg flex items-center justify-center text-white font-bold text-xs transition-colors duration-500 ${isComplete ? 'bg-emerald-500 animate-pulse' : 'bg-gradient-to-br from-primary to-blue-600'}`}>
                  {isComplete ? <Zap className="w-4 h-4 fill-current"/> : 'AI'}
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-sm font-semibold leading-none">Architect</span>
                  {project && <span className="text-[10px] text-muted-foreground mt-0.5 leading-none">{progress}% Complete</span>}
                </div>
            </div>
            
            <NavButtonNeo active={currentView === 'board'} onClick={() => setCurrentView('board')} icon={<Layout className="w-5 h-5"/>} />
            <NavButtonNeo active={currentView === 'stats'} onClick={() => setCurrentView('stats')} icon={<BarChart2 className="w-5 h-5"/>} />
            
            <div className="w-px h-6 bg-border/50 mx-1" />
            
            <button onClick={() => setProject(null)} className="p-3 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-all hover:scale-110">
                <Plus className="w-5 h-5" />
            </button>
            <AppearancePopover mode={mode} setMode={setMode} theme={theme} setTheme={setTheme} trigger={<Settings className="w-5 h-5"/>} neo />
          </div>
        </div>
      </div>

      {/* Creator Credit (Active State) */}
      <div className="fixed bottom-4 right-6 z-40 text-[10px] font-mono text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors cursor-default select-none">
        creator @isknemat
      </div>
    </div>
  );
};

const AppearancePopover: React.FC<any> = ({ mode, setMode, theme, setTheme, trigger, neo }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setOpen(!open)} 
        className={`p-2 rounded-md transition-all ${neo ? 'hover:bg-secondary text-muted-foreground hover:text-foreground rounded-full hover:scale-110' : 'bg-secondary border border-border hover:bg-muted text-foreground'}`}
      >
        {trigger || <Settings className="w-4 h-4" />}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className={`absolute right-0 w-64 bg-card border border-border rounded-xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 ${neo ? 'bottom-full mb-4' : 'top-full mt-2'}`}>
            <div className="space-y-4">
               <div>
                 <label className="text-xs font-semibold text-muted-foreground uppercase mb-2 block">Тема</label>
                 <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setMode('light')} className={`flex items-center justify-center gap-2 p-2 rounded-lg text-xs border ${mode === 'light' ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary border-transparent text-muted-foreground'}`}>
                      <Sun className="w-3 h-3" /> Светлая
                    </button>
                    <button onClick={() => setMode('dark')} className={`flex items-center justify-center gap-2 p-2 rounded-lg text-xs border ${mode === 'dark' ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary border-transparent text-muted-foreground'}`}>
                      <Moon className="w-3 h-3" /> Темная
                    </button>
                 </div>
               </div>
               <div>
                 <label className="text-xs font-semibold text-muted-foreground uppercase mb-2 block">Цвет</label>
                 <div className="flex gap-2">
                    <button onClick={() => setTheme('zinc')} className={`h-8 flex-1 rounded-lg bg-zinc-500/20 border-2 ${theme === 'zinc' ? 'border-zinc-500' : 'border-transparent'}`} />
                    <button onClick={() => setTheme('blue')} className={`h-8 flex-1 rounded-lg bg-blue-500/20 border-2 ${theme === 'blue' ? 'border-blue-500' : 'border-transparent'}`} />
                    <button onClick={() => setTheme('rose')} className={`h-8 flex-1 rounded-lg bg-rose-500/20 border-2 ${theme === 'rose' ? 'border-rose-500' : 'border-transparent'}`} />
                 </div>
               </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

const NavButtonNeo: React.FC<any> = ({ active, onClick, icon }) => (
  <button 
    onClick={onClick}
    className={`p-3 rounded-full transition-all duration-300 ${
      active 
        ? 'bg-primary text-primary-foreground shadow-lg scale-110' 
        : 'text-muted-foreground hover:text-foreground hover:bg-secondary hover:scale-110'
    }`}
  >
    {icon}
  </button>
);

export default App;
