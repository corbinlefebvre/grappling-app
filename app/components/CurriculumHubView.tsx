'use client';

import React from 'react';
import { 
  Search, Tag, FolderPlus, PlusCircle, ChevronRight, ChevronDown, 
  Edit3, Calendar as CalendarIcon, Play, Flame, GitBranch 
} from 'lucide-react';
import { LessonPlan, WarmUp, Drill } from '../types';

interface CurriculumHubViewProps {
  hubSection: 'lessons' | 'warmups';
  setHubSection: (val: 'lessons' | 'warmups') => void;
  setIsNewConceptModalOpen: (val: boolean) => void;
  setIsNewWarmUpModalOpen: (val: boolean) => void;
  hubSearchTerm: string;
  setHubSearchTerm: (val: string) => void;
  selectedHubTag: string | null;
  setSelectedHubTag: (val: string | null) => void;
  allUniqueTags: string[];
  plansByConcept: Record<string, LessonPlan[]>;
  collapsedConcepts: Record<string, boolean>;
  toggleConceptCollapse: (concept: string) => void;
  handleEditLessonFromHub: (plan: LessonPlan) => void;
  handleOpenScheduleForLesson: (id: string) => void;
  loadPlanToMat: (plan: LessonPlan) => void;
  filteredWarmUps: WarmUp[];
  applyPresetWarmUp: (w: WarmUp) => void;
  setActiveTab: (tab: 'mat' | 'builder' | 'community' | 'flows' | 'calendar' | 'chat' | 'academy' | 'profile') => void;
  launchWarmUpOnly: (w: WarmUp) => void;
}

export function CurriculumHubView(props: CurriculumHubViewProps) {
  const {
    hubSection, setHubSection, setIsNewConceptModalOpen, setIsNewWarmUpModalOpen, hubSearchTerm, setHubSearchTerm,
    selectedHubTag, setSelectedHubTag, allUniqueTags, plansByConcept, collapsedConcepts, toggleConceptCollapse,
    handleEditLessonFromHub, handleOpenScheduleForLesson, loadPlanToMat, filteredWarmUps, applyPresetWarmUp,
    setActiveTab, launchWarmUpOnly
  } = props;

  return (
    <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold">Curriculum Hub</h2>
          <p className="text-sm text-slate-400">
            {hubSection === 'lessons' ? 'Select lessons to edit, clone into the builder, or directly schedule on the academy calendar.' : 'Library of general flows and paired exploratory warm-up games.'}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <button onClick={() => setHubSection('lessons')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${hubSection === 'lessons' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}>Concept Lessons</button>
            <button onClick={() => setHubSection('warmups')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${hubSection === 'warmups' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'}`}><Flame size={13} />Warm-Ups</button>
          </div>

          {hubSection === 'lessons' ? (
            <button onClick={() => setIsNewConceptModalOpen(true)} className="flex items-center gap-1.5 bg-emerald-600/20 text-emerald-400 border border-emerald-600/40 hover:bg-emerald-600 hover:text-white px-3 py-2 rounded-xl text-xs md:text-sm font-bold"><FolderPlus size={16} />Add Concept</button>
          ) : (
            <button onClick={() => setIsNewWarmUpModalOpen(true)} className="flex items-center gap-1.5 bg-orange-600/20 text-orange-400 border border-orange-600/40 hover:bg-orange-600 hover:text-white px-3 py-2 rounded-xl text-xs md:text-sm font-bold"><PlusCircle size={16} />Add Warm-Up</button>
          )}

          <div className="relative flex-1 md:w-60">
            <Search size={16} className="absolute left-3 top-3 text-slate-400 pointer-events-none" />
            <input type="text" placeholder={hubSection === 'lessons' ? 'Search concepts, tags...' : 'Search warm-ups...'} value={hubSearchTerm} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHubSearchTerm(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-emerald-500" />
          </div>
        </div>
      </div>

      {hubSection === 'lessons' ? (
        <>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs uppercase font-bold text-slate-400 flex items-center gap-1 mr-1"><Tag size={13} /> Tags:</span>
            <button onClick={() => setSelectedHubTag(null)} className={`text-xs px-2.5 py-1 rounded-lg border font-semibold ${selectedHubTag === null ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>All</button>
            {allUniqueTags.slice(0, 15).map((t: string) => (
              <button key={t} onClick={() => setSelectedHubTag(selectedHubTag === t ? null : t)} className={`text-xs px-2.5 py-1 rounded-lg border font-semibold ${selectedHubTag === t ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}`}>#{t}</button>
            ))}
          </div>

          <div className="space-y-6">
            {Object.entries(plansByConcept).map(([conceptName, conceptPlans]: [string, LessonPlan[]]) => {
              const isCollapsed = collapsedConcepts[conceptName];
              return (
                <div key={conceptName} className="border border-slate-800 rounded-2xl bg-slate-900/40 overflow-hidden">
                  <button onClick={() => toggleConceptCollapse(conceptName)} className="w-full px-5 py-4 bg-slate-900/80 flex items-center justify-between text-left hover:bg-slate-900 transition">
                    <div className="flex items-center gap-3">
                      {isCollapsed ? <ChevronRight size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-emerald-400" />}
                      <h3 className="font-extrabold text-base md:text-lg text-white">{conceptName}</h3>
                      <span className="text-xs bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded-full">{conceptPlans.length} Lessons</span>
                    </div>
                  </button>

                  {!isCollapsed && (
                    <div className="p-4 grid md:grid-cols-2 gap-4">
                      {conceptPlans.map((p: LessonPlan) => (
                        <div key={p.id} className="bg-slate-950/80 border border-slate-800/80 p-5 rounded-xl flex flex-col justify-between">
                          <div>
                            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">{p.ageGroup} • {p.beltRank}</span>
                            <h4 className="font-bold text-base text-white mt-2">{p.className}</h4>
                            <div className="text-xs text-slate-400 mt-1">Instructor: {p.authorName}</div>
                            
                            <div className="mt-3 space-y-1">
                              <div className="text-xs font-bold text-orange-400 uppercase">Warm-Up: {p.warmUp?.warmUpName}</div>
                              {p.flow && (
                                <div className="text-xs font-bold text-cyan-400 uppercase flex items-center gap-1">
                                  <GitBranch size={11} /> Flow: {p.flow.title}
                                </div>
                              )}
                              <div className="text-xs font-bold text-slate-400 uppercase mt-2">Drills ({p.drills.length}):</div>
                              <ul className="text-xs text-slate-300 list-disc list-inside">
                                {p.drills.map((d: Drill) => (<li key={d.id}>{d.drillName}</li>))}
                              </ul>
                            </div>
                          </div>

                          <div className="mt-5 pt-3 border-t border-slate-800 flex justify-between items-center flex-wrap gap-2">
                            <span className="text-xs text-slate-400">{p.liveRounds.roundCount} Sparring Rounds</span>
                            
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleEditLessonFromHub(p)}
                                title="Edit or Clone in Lesson Builder"
                                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold flex items-center gap-1"
                              >
                                <Edit3 size={13} /> Edit
                              </button>

                              <button
                                onClick={() => handleOpenScheduleForLesson(p.id)}
                                title="Schedule on Calendar"
                                className="p-1.5 text-indigo-400 hover:text-white rounded-lg bg-indigo-950/40 border border-indigo-800/40 hover:bg-indigo-600 text-xs font-semibold flex items-center gap-1"
                              >
                                <CalendarIcon size={13} /> Schedule
                              </button>

                              <button
                                onClick={() => loadPlanToMat(p)}
                                className="bg-emerald-600/20 text-emerald-400 border border-emerald-600/40 hover:bg-emerald-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"
                              >
                                <Play size={13} /> Run on Mat
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredWarmUps.map((wu: WarmUp) => (
            <div key={wu.id || wu.warmUpName} className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold px-2 py-0.5 rounded uppercase bg-orange-500/20 text-orange-400 border border-orange-800/40">{wu.type}</span>
                <h3 className="font-bold text-lg text-white mt-2">{wu.warmUpName}</h3>
                <p className="text-xs text-slate-300 mt-1">{wu.description}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button onClick={() => { applyPresetWarmUp(wu); setActiveTab('builder'); }} className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold">Use in Builder</button>
                <button onClick={() => launchWarmUpOnly(wu)} className="bg-orange-600 hover:bg-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"><Play size={13} />Run Warm-Up</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}