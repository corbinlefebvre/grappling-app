'use client';

import React from 'react';
import { Calendar as CalendarIcon, PlusCircle, ChevronLeft, ChevronRight, Plus, Edit3, Play, Trash2 } from 'lucide-react';
import { ScheduledClass, LessonPlan, ClassTemplate } from '../types';
import { SearchableLessonPicker } from './SearchableLessonPicker';

interface CalendarViewProps {
  calendarAnchorDate: Date;
  setCalendarAnchorDate: (val: Date) => void;
  setMonthAnchor: (val: number) => void;
  setYearAnchor: (val: number) => void;
  shiftWeek: (offset: number) => void;
  currentWeekMonday: Date;
  weekDays: Date[];
  schedule: ScheduledClass[];
  setSchedule: (val: ScheduledClass[]) => void;
  plans: LessonPlan[];
  classTemplates: ClassTemplate[];
  setIsTemplateManagerOpen: (val: boolean) => void;
  openAddClassModalForDate: (dateKey: string) => void;
  updateScheduledClass: (id: string, updates: Partial<ScheduledClass>) => void;
  handleEditLessonFromHub: (plan: LessonPlan) => void;
  loadPlanToMat: (plan: LessonPlan) => void;
  handleDeleteScheduledClass: (id: string) => void;
  formatDateKey: (d: Date) => string;
}

export function CalendarView(props: CalendarViewProps) {
  const {
    calendarAnchorDate, setCalendarAnchorDate, setMonthAnchor, setYearAnchor, shiftWeek, currentWeekMonday,
    weekDays, schedule, setSchedule, plans, classTemplates, setIsTemplateManagerOpen, openAddClassModalForDate,
    updateScheduledClass, handleEditLessonFromHub, loadPlanToMat, handleDeleteScheduledClass, formatDateKey
  } = props;

  return (
    <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CalendarIcon size={22} className="text-emerald-400" /> Academy Schedule & Pacing
          </h2>
          <p className="text-sm text-slate-400">Plan classes by real calendar dates and assign curriculum units.</p>
        </div>
        <button onClick={() => setIsTemplateManagerOpen(true)} className="bg-slate-900 border border-slate-700 hover:bg-slate-800 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5">
          <PlusCircle size={15} className="text-emerald-400" /> Class Templates ({classTemplates.length})
        </button>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <select value={calendarAnchorDate.getMonth()} onChange={(e) => setMonthAnchor(parseInt(e.target.value))} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-100">
            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, idx) => (<option key={m} value={idx}>{m}</option>))}
          </select>
          <select value={calendarAnchorDate.getFullYear()} onChange={(e) => setYearAnchor(parseInt(e.target.value))} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-100">
            {[2025, 2026, 2027, 2028].map(y => (<option key={y} value={y}>{y}</option>))}
          </select>
          <button onClick={() => setCalendarAnchorDate(new Date())} className="bg-slate-800 hover:bg-slate-700 text-xs px-2.5 py-1.5 rounded-lg">Current Week</button>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => shiftWeek(-1)} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300"><ChevronLeft size={16} /></button>
          <span className="text-xs font-bold text-slate-300">Week of {currentWeekMonday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          <button onClick={() => shiftWeek(1)} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300"><ChevronRight size={16} /></button>
        </div>
      </div>

      <div className="space-y-5">
        {weekDays.map((dayDate) => {
          const dayDateKey = formatDateKey(dayDate);
          const scheduledClassesForDay = schedule.filter(s => s.dateStr === dayDateKey);

          return (
            <div key={dayDateKey} className="border border-slate-800 rounded-2xl p-5 space-y-4 bg-slate-900/40">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <h3 className="font-extrabold text-base text-white">{dayDate.toLocaleDateString('en-US', { weekday: 'long' })}</h3>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-0.5 rounded-full">{dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <button onClick={() => openAddClassModalForDate(dayDateKey)} className="flex items-center gap-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl border border-slate-700">
                  <Plus size={14} className="text-emerald-400" /> Add Class
                </button>
              </div>

              {scheduledClassesForDay.map(cl => {
                const assignedPlan = plans.find(p => p.id === cl.assignedLessonId);
                return (
                  <div key={cl.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-900">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-black px-2 py-0.5 rounded bg-slate-800 text-slate-200">{cl.time}</span>
                          <h4 className="font-bold text-base text-white">{cl.title}</h4>
                          <span className="text-xs text-slate-400">({cl.durationMinutes}m)</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs font-bold text-slate-400 shrink-0">Assigned Lesson:</span>
                          <SearchableLessonPicker lessons={plans} selectedLessonId={cl.assignedLessonId} onSelect={(val) => updateScheduledClass(cl.id, { assignedLessonId: val })} />
                          {assignedPlan && <button onClick={() => handleEditLessonFromHub(assignedPlan)} className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800"><Edit3 size={13} /></button>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {assignedPlan && <button onClick={() => loadPlanToMat(assignedPlan)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"><Play size={13} />Run on Mat</button>}
                        <button onClick={() => handleDeleteScheduledClass(cl.id)} className="text-slate-500 hover:text-rose-400 p-1.5"><Trash2 size={16} /></button>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 pt-1">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 uppercase">Class Debrief Notes (Persisted)</label>
                        <textarea
                          rows={2}
                          placeholder="Notes on student performance, engagement, bottlenecks..."
                          value={cl.postClassNotes}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                            const text = e.target.value;
                            setSchedule(schedule.map((sc: ScheduledClass) => sc.id === cl.id ? { ...sc, postClassNotes: text } : sc));
                          }}
                          onBlur={(e: React.FocusEvent<HTMLTextAreaElement>) => {
                            updateScheduledClass(cl.id, { postClassNotes: e.target.value });
                          }}
                          className="w-full mt-1 bg-slate-900/60 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 uppercase">Modifications Suggested (Persisted)</label>
                        <textarea
                          rows={2}
                          placeholder="Adjustments for next cycle, constraint changes..."
                          value={cl.modificationsSuggested}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                            const text = e.target.value;
                            setSchedule(schedule.map((sc: ScheduledClass) => sc.id === cl.id ? { ...sc, modificationsSuggested: text } : sc));
                          }}
                          onBlur={(e: React.FocusEvent<HTMLTextAreaElement>) => {
                            updateScheduledClass(cl.id, { modificationsSuggested: e.target.value });
                          }}
                          className="w-full mt-1 bg-slate-900/60 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </main>
  );
}