import React, { useState } from 'react';
import { 
  Target, 
  CheckCircle2, 
  Circle, 
  BookOpen, 
  Moon, 
  GraduationCap, 
  Cpu, 
  Sparkles, 
  Activity, 
  Languages, 
  Heart, 
  PiggyBank,
  Plus,
  Edit2
} from 'lucide-react';
import { GoalItem, TaskCategory } from '../types';

interface GoalsViewProps {
  goals: GoalItem[];
  onUpdateGoals: (goals: GoalItem[]) => void;
  quranPagesTotal: number;
  readingTotal: number;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  religion: Moon,
  academics: GraduationCap,
  sat: Target,
  projects_skills: Cpu,
  research: Sparkles,
  health: Activity,
  reading: BookOpen,
  languages: Languages,
  wellbeing: Heart,
  finance: PiggyBank
};

export const GoalsView: React.FC<GoalsViewProps> = ({
  goals,
  onUpdateGoals,
  quranPagesTotal,
  readingTotal
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState<TaskCategory>('academics');
  const [newGoalDesc, setNewGoalDesc] = useState('');

  const handleToggleMilestone = (goalId: string, milestoneId: string) => {
    const updated = goals.map(g => {
      if (g.id === goalId && g.milestones) {
        const nextMilestones = g.milestones.map(m => 
          m.id === milestoneId ? { ...m, completed: !m.completed } : m
        );
        return { ...g, milestones: nextMilestones };
      }
      return g;
    });
    onUpdateGoals(updated);
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;

    const newGoal: GoalItem = {
      id: `goal-custom-${Date.now()}`,
      category: newGoalCategory,
      title: newGoalTitle.trim(),
      description: newGoalDesc.trim() || 'Custom personal development mission',
      type: 'milestones',
      milestones: [
        { id: `m-${Date.now()}-1`, title: 'Define foundational steps', completed: false },
        { id: `m-${Date.now()}-2`, title: 'Execute regular weekly practice', completed: false }
      ]
    };

    onUpdateGoals([...goals, newGoal]);
    setNewGoalTitle('');
    setNewGoalDesc('');
    setIsAddModalOpen(false);
  };

  const filteredGoals = selectedCategory === 'all'
    ? goals
    : goals.filter(g => g.category === selectedCategory);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Monthly Goals & Missions</h2>
          <p className="text-xs text-slate-500">
            Meaningful trajectories connected to daily actions — transparent & non-judgmental
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="clay-button-primary inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Goal</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3.5 py-1.5 rounded-full font-medium transition-all shrink-0 ${
            selectedCategory === 'all' ? 'clay-pill-active' : 'clay-pill text-slate-600 hover:text-slate-900'
          }`}
        >
          All Domains ({goals.length})
        </button>
        {['religion', 'academics', 'sat', 'projects_skills', 'research', 'health', 'reading', 'languages', 'wellbeing', 'finance'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full font-medium transition-all shrink-0 capitalize ${
              selectedCategory === cat ? 'clay-pill-active' : 'clay-pill text-slate-600 hover:text-slate-900'
            }`}
          >
            {cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Goals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredGoals.map((goal) => {
          const Icon = CATEGORY_ICONS[goal.category] || Target;

          // Dynamic calculation for linked goals
          let currentVal = goal.currentValue || 0;
          let targetVal = goal.targetValue || 100;
          if (goal.id === 'goal-religion-quran') {
            currentVal = quranPagesTotal;
            targetVal = 604;
          } else if (goal.id === 'goal-reading-monthly') {
            currentVal = readingTotal;
            targetVal = 300;
          }

          let progressPercent = 0;
          if (goal.type === 'numeric' && targetVal > 0) {
            progressPercent = Math.min(100, Math.round((currentVal / targetVal) * 100));
          } else if (goal.milestones && goal.milestones.length > 0) {
            const completedCount = goal.milestones.filter(m => m.completed).length;
            progressPercent = Math.round((completedCount / goal.milestones.length) * 100);
          } else {
            progressPercent = 75; // Default healthy baseline
          }

          return (
            <div key={goal.id} className="clay-card p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                      <Icon className="w-5 h-5" />
                    </span>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {goal.category.replace('_', ' ')}
                      </span>
                      <h3 className="text-base font-bold text-slate-800 tracking-tight leading-snug">
                        {goal.title}
                      </h3>
                    </div>
                  </div>

                  <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700">
                    {progressPercent}%
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {goal.description}
                </p>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Numeric details if numeric */}
                {goal.type === 'numeric' && (
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span>Progress: <strong>{currentVal}</strong> of {targetVal} {goal.unit}</span>
                    <span className="text-emerald-600 font-semibold">{targetVal - currentVal > 0 ? `${targetVal - currentVal} ${goal.unit} to go` : 'Target reached!'}</span>
                  </div>
                )}
              </div>

              {/* Milestones list if milestone goal */}
              {goal.milestones && goal.milestones.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Milestones & Checkpoints
                  </span>
                  <div className="space-y-1.5">
                    {goal.milestones.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => handleToggleMilestone(goal.id, m.id)}
                        className="w-full flex items-center gap-2.5 text-left p-2 rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        {m.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                        )}
                        <span className={`text-xs ${m.completed ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}`}>
                          {m.title}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal: Add Custom Goal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs">
          <div className="clay-card w-full max-w-md p-6 relative bg-white">
            <h3 className="text-base font-bold text-slate-800 mb-4">Create Monthly Goal</h3>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Goal Mission</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master SAT Algebra & Geometry"
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  className="w-full clay-inset px-3 py-2 text-sm text-slate-800 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Category</label>
                <select
                  value={newGoalCategory}
                  onChange={(e) => setNewGoalCategory(e.target.value as TaskCategory)}
                  className="w-full clay-inset px-3 py-2 text-xs text-slate-800 rounded-xl outline-none"
                >
                  <option value="religion">Religion</option>
                  <option value="academics">Academics</option>
                  <option value="sat">SAT</option>
                  <option value="projects_skills">Projects & Skills</option>
                  <option value="research">Research</option>
                  <option value="health">Health & Fitness</option>
                  <option value="reading">Reading</option>
                  <option value="languages">Languages</option>
                  <option value="wellbeing">Well-being</option>
                  <option value="finance">Finance</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Description / Intention</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Take diagnostic test, record mistake log, and do weekly sets without panic."
                  value={newGoalDesc}
                  onChange={(e) => setNewGoalDesc(e.target.value)}
                  className="w-full clay-inset px-3 py-2 text-sm text-slate-800 rounded-xl outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="clay-button-primary px-4 py-2 text-xs font-semibold"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
