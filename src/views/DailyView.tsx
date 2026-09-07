import React, { useState } from 'react';
import { 
  Plus, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Calendar, 
  MoreVertical, 
  Trash2, 
  ArrowRightCircle, 
  Edit2, 
  BookOpen, 
  Moon, 
  Sparkles, 
  GraduationCap, 
  Target, 
  Cpu, 
  Activity, 
  Languages, 
  Heart, 
  Wallet,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { TaskItem, TaskCategory, ReligionState, ReadingLog } from '../types';
import { getSeptemberPeriodInfo } from '../utils/dateUtils';

interface DailyViewProps {
  currentDateKey: string;
  tasks: TaskItem[];
  onToggleTask: (taskId: string) => void;
  onAddTask: (task: Partial<TaskItem>) => void;
  onUpdateTask: (task: TaskItem) => void;
  onDeleteTask: (taskId: string) => void;
  onMoveTask: (taskId: string, targetDateKey: string) => void;
  religionState: ReligionState;
  onUpdateReligionState: (state: ReligionState) => void;
  readingLog: ReadingLog;
  onUpdateReadingLog: (arabic: number, english: number) => void;
  totalQuranPages: number;
}

const CATEGORY_META: Record<TaskCategory, { label: string; icon: React.ElementType; color: string }> = {
  religion: { label: 'Religion & Adhkar', icon: Moon, color: 'emerald' },
  academics: { label: 'Academics & BAC Prep', icon: GraduationCap, color: 'blue' },
  sat: { label: 'SAT Preparation', icon: Target, color: 'indigo' },
  projects_skills: { label: 'Projects & Skills', icon: Cpu, color: 'purple' },
  research: { label: 'Research Sessions', icon: Sparkles, color: 'cyan' },
  health: { label: 'Health & Fitness', icon: Activity, color: 'teal' },
  reading: { label: 'Reading Progress', icon: BookOpen, color: 'amber' },
  languages: { label: 'Languages', icon: Languages, color: 'sky' },
  wellbeing: { label: 'Personal Well-being', icon: Heart, color: 'rose' },
  finance: { label: 'Work & Finance', icon: Wallet, color: 'slate' },
};

export const DailyView: React.FC<DailyViewProps> = ({
  currentDateKey,
  tasks,
  onToggleTask,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onMoveTask,
  religionState,
  onUpdateReligionState,
  readingLog,
  onUpdateReadingLog,
  totalQuranPages
}) => {
  const periodInfo = getSeptemberPeriodInfo(currentDateKey);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [moveTaskId, setMoveTaskId] = useState<string | null>(null);
  const [targetMoveDate, setTargetMoveDate] = useState('');
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);

  // New task form state
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<TaskCategory>('academics');
  const [newTaskDuration, setNewTaskDuration] = useState('');
  const [newTaskNotes, setNewTaskNotes] = useState('');

  // Prayers detail collapsible
  const [showPrayerDetails, setShowPrayerDetails] = useState(true);

  // Group tasks by category
  const categoriesPresent = Array.from(new Set(tasks.map(t => t.category))) as TaskCategory[];

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;

    onAddTask({
      name: newTaskName.trim(),
      category: newTaskCategory,
      approximateDuration: newTaskDuration.trim() || undefined,
      notes: newTaskNotes.trim() || undefined,
      date: currentDateKey,
      completed: false
    });

    setNewTaskName('');
    setNewTaskDuration('');
    setNewTaskNotes('');
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editingTask.name.trim()) return;
    onUpdateTask(editingTask);
    setEditingTask(null);
  };

  const handleExecuteMove = (e: React.FormEvent) => {
    e.preventDefault();
    if (!moveTaskId || !targetMoveDate) return;
    onMoveTask(moveTaskId, targetMoveDate);
    setMoveTaskId(null);
    setTargetMoveDate('');
  };

  // Prayers check helper
  const handleTogglePrayer = (prayer: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha') => {
    const updated = { ...religionState, [prayer]: !religionState[prayer] };
    onUpdateReligionState(updated);
  };

  const handleToggleAdhkar = (session: 'morningAdhkar' | 'noonAdhkar') => {
    const updated = { ...religionState, [session]: !religionState[session] };
    onUpdateReligionState(updated);
  };

  const handleAddQuranPages = (delta: number) => {
    const current = religionState.quranPagesToday || 0;
    const nextVal = Math.max(0, current + delta);
    onUpdateReligionState({ ...religionState, quranPagesToday: nextVal });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Contextual September Period Banner */}
      <div className="clay-card p-4 sm:p-5 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-100 text-blue-700 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-800">{periodInfo.periodName}</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100/80 text-blue-700">
                Context
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">{periodInfo.contextNote}</p>
          </div>
        </div>

        <div className="clay-card-subtle px-3 py-1.5 rounded-xl text-xs text-slate-600 self-start sm:self-auto shrink-0">
          <span className="text-slate-400">Reference:</span> {periodInfo.activeWindow}
        </div>
      </div>

      {/* Top Action Bar: Add Task + Completed counter */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Daily Checklist</h2>
          <p className="text-xs text-slate-500">Flexible completion anytime — no rigid hourly pressure</p>
        </div>

        <button
          id="btn-add-daily-task"
          onClick={() => setIsAddModalOpen(true)}
          className="clay-button-primary inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Task</span>
        </button>
      </div>

      {/* SPECIAL INTERACTIVE ANCHORS: Religion & Reading Quick Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Religion Deep Tracker (Prayers + Adhkar + Quran) */}
        <div className="clay-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                <Moon className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-slate-800">5 Prayers & Quran Journey</h4>
                <p className="text-[11px] text-slate-500">4 pages after each prayer • Khatma: {totalQuranPages} / 604 p.</p>
              </div>
            </div>
            <button 
              onClick={() => setShowPrayerDetails(!showPrayerDetails)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              {showPrayerDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {showPrayerDetails && (
            <div className="space-y-3 pt-1 border-t border-slate-100">
              {/* Prayers Individual Checkboxes */}
              <div className="grid grid-cols-5 gap-1.5 text-center">
                {(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const).map((p) => {
                  const isDone = religionState[p];
                  return (
                    <button
                      key={p}
                      onClick={() => handleTogglePrayer(p)}
                      className={`p-2 rounded-xl text-xs font-semibold transition-all ${
                        isDone 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs' 
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      <div className="capitalize">{p}</div>
                      <div className="mt-1 flex justify-center">
                        {isDone ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <span className="w-3.5 h-3.5 block" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Adhkar and Quran pages */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                {/* Adhkar Chips */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleAdhkar('morningAdhkar')}
                    className={`px-3 py-1.5 rounded-xl border text-[11px] font-medium transition-colors ${
                      religionState.morningAdhkar ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'
                    }`}
                  >
                    Morning Adhkar {religionState.morningAdhkar ? '✓' : ''}
                  </button>
                  <button
                    onClick={() => handleToggleAdhkar('noonAdhkar')}
                    className={`px-3 py-1.5 rounded-xl border text-[11px] font-medium transition-colors ${
                      religionState.noonAdhkar ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'
                    }`}
                  >
                    Noon Adhkar {religionState.noonAdhkar ? '✓' : ''}
                  </button>
                </div>

                {/* Quran Pages Quick Counter */}
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-[11px]">Pages today:</span>
                  <div className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-xl">
                    <button 
                      onClick={() => handleAddQuranPages(-2)}
                      className="w-5 h-5 flex items-center justify-center font-bold text-slate-600 hover:text-slate-900"
                    >
                      -
                    </button>
                    <span className="font-bold text-slate-800 text-xs px-1.5">
                      {religionState.quranPagesToday || 0}
                    </span>
                    <button 
                      onClick={() => handleAddQuranPages(4)}
                      className="w-5 h-5 flex items-center justify-center font-bold text-blue-600 hover:text-blue-800"
                    >
                      +4
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Reading Quick Logger */}
        <div className="clay-card p-5 space-y-3 flex flex-col justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <BookOpen className="w-4 h-4" />
            </span>
            <div>
              <h4 className="text-sm font-bold text-slate-800">Reading Progression</h4>
              <p className="text-[11px] text-slate-500">Target ~300 pages/month (150 Arabic / 150 English)</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="clay-card-subtle p-3 rounded-2xl">
              <label className="text-[11px] font-medium text-slate-500 block mb-1">Arabic Pages</label>
              <input 
                type="number"
                min="0"
                value={readingLog.arabicPages || 0}
                onChange={(e) => onUpdateReadingLog(Number(e.target.value) || 0, readingLog.englishPages || 0)}
                className="w-full clay-inset px-3 py-1.5 text-sm font-bold text-slate-800 rounded-xl outline-none"
              />
            </div>
            <div className="clay-card-subtle p-3 rounded-2xl">
              <label className="text-[11px] font-medium text-slate-500 block mb-1">English Pages</label>
              <input 
                type="number"
                min="0"
                value={readingLog.englishPages || 0}
                onChange={(e) => onUpdateReadingLog(readingLog.arabicPages || 0, Number(e.target.value) || 0)}
                className="w-full clay-inset px-3 py-1.5 text-sm font-bold text-slate-800 rounded-xl outline-none"
              />
            </div>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center justify-between px-1">
            <span>Today's Total: <strong>{(readingLog.arabicPages || 0) + (readingLog.englishPages || 0)} pages</strong></span>
            <span className="text-emerald-600 font-medium">Actual counts recorded</span>
          </div>
        </div>
      </div>

      {/* Main Task List Grouped by Category */}
      <div className="space-y-6">
        {categoriesPresent.map((cat) => {
          const categoryTasks = tasks.filter(t => t.category === cat);
          const meta = CATEGORY_META[cat] || { label: cat, icon: Sparkles, color: 'blue' };
          const Icon = meta.icon;

          return (
            <div key={cat} className="space-y-3">
              {/* Category Header */}
              <div className="flex items-center gap-2.5 px-1">
                <span className="p-1.5 rounded-xl bg-slate-200/60 text-slate-700">
                  <Icon className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-slate-800 tracking-tight">
                  {meta.label}
                </h3>
                <span className="text-xs text-slate-400 font-medium">
                  ({categoryTasks.filter(t => t.completed).length}/{categoryTasks.length})
                </span>
              </div>

              {/* Task Items */}
              <div className="space-y-2.5">
                {categoryTasks.map((task) => (
                  <div
                    key={task.id}
                    id={`task-item-${task.id}`}
                    className={`clay-card p-4 flex items-center justify-between gap-4 transition-all duration-200 ${
                      task.completed ? 'opacity-70 bg-slate-50/50' : 'hover:translate-x-1'
                    }`}
                  >
                    {/* Checkbox and Label */}
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <button
                        onClick={() => onToggleTask(task.id)}
                        className="mt-0.5 text-blue-600 hover:scale-110 transition-transform shrink-0"
                        title={task.completed ? 'Mark uncompleted' : 'Mark completed'}
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-300 hover:text-blue-500" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline flex-wrap gap-2">
                          <span className={`text-sm font-semibold truncate ${
                            task.completed ? 'line-through text-slate-400' : 'text-slate-800'
                          }`}>
                            {task.name}
                          </span>

                          {task.approximateDuration && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">
                              {task.approximateDuration}
                            </span>
                          )}
                        </div>

                        {task.frequency && (
                          <p className="text-xs text-slate-500 mt-0.5">{task.frequency}</p>
                        )}
                        {task.notes && (
                          <p className="text-[11px] text-slate-400 mt-0.5 italic">{task.notes}</p>
                        )}
                      </div>
                    </div>

                    {/* Actions: Edit, Move, Delete */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setEditingTask(task)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Edit task"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          setMoveTaskId(task.id);
                          setTargetMoveDate(currentDateKey);
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                        title="Move to another day"
                      >
                        <ArrowRightCircle className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add Custom Task */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs">
          <div className="clay-card w-full max-w-md p-6 relative bg-white">
            <h3 className="text-base font-bold text-slate-800 mb-4">Add Task to {currentDateKey}</h3>
            
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Task Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SAT Practice Test 2"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  className="w-full clay-inset px-3 py-2 text-sm text-slate-800 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Category</label>
                  <select
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value as TaskCategory)}
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
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Approx. Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. ~45 mins"
                    value={newTaskDuration}
                    onChange={(e) => setNewTaskDuration(e.target.value)}
                    className="w-full clay-inset px-3 py-2 text-sm text-slate-800 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Notes / Context (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Focus on geometry formulas"
                  value={newTaskNotes}
                  onChange={(e) => setNewTaskNotes(e.target.value)}
                  className="w-full clay-inset px-3 py-2 text-sm text-slate-800 rounded-xl outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="clay-button-primary px-4 py-2 text-xs font-semibold"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Move Task */}
      {moveTaskId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs">
          <div className="clay-card w-full max-w-sm p-6 relative bg-white">
            <h3 className="text-base font-bold text-slate-800 mb-2">Move Task to Another Day</h3>
            <p className="text-xs text-slate-500 mb-4">
              Reschedule calmly without guilt or automatic catch-up pressure.
            </p>

            <form onSubmit={handleExecuteMove} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Target Date</label>
                <input
                  type="date"
                  required
                  value={targetMoveDate}
                  onChange={(e) => setTargetMoveDate(e.target.value)}
                  className="w-full clay-inset px-3 py-2 text-sm text-slate-800 rounded-xl outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setMoveTaskId(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="clay-button-primary px-4 py-2 text-xs font-semibold"
                >
                  Confirm Move
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Task */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs">
          <div className="clay-card w-full max-w-md p-6 relative bg-white">
            <h3 className="text-base font-bold text-slate-800 mb-4">Edit Task</h3>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Task Name</label>
                <input
                  type="text"
                  required
                  value={editingTask.name}
                  onChange={(e) => setEditingTask({ ...editingTask, name: e.target.value })}
                  className="w-full clay-inset px-3 py-2 text-sm text-slate-800 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Category</label>
                  <select
                    value={editingTask.category}
                    onChange={(e) => setEditingTask({ ...editingTask, category: e.target.value as TaskCategory })}
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
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Approx. Duration</label>
                  <input
                    type="text"
                    value={editingTask.approximateDuration || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, approximateDuration: e.target.value })}
                    className="w-full clay-inset px-3 py-2 text-sm text-slate-800 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Notes / Context</label>
                <input
                  type="text"
                  value={editingTask.notes || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, notes: e.target.value })}
                  className="w-full clay-inset px-3 py-2 text-sm text-slate-800 rounded-xl outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="clay-button-primary px-4 py-2 text-xs font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
