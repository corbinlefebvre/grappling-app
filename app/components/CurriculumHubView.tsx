'use client';

import React, { useState } from 'react';
import { 
  Search, Tag, FolderPlus, PlusCircle, ChevronRight, ChevronDown, 
  Edit3, Calendar as CalendarIcon, Play, Flame, GitBranch,
  Trash2, ArrowUpDown, Sparkles, Layers, LayoutGrid, AlertTriangle, X
} from 'lucide-react';
import { LessonPlan, WarmUp, Drill } from '../types';

export type HubSortOption = 'newest' | 'oldest' | 'name-asc' | 'name-desc' | 'duration-desc' | 'duration-asc';

export function getLessonTimestamp(plan: LessonPlan): number {
  if (plan.createdAt) {
    const time = new Date(plan.createdAt).getTime();
    if (!isNaN(time) && time > 0) return time;
  }
  const match = (plan.id || '').match(/(\d{12,14})/);
  if (match) {
    const time = Number(match[1]);
    if (!isNaN(time) && time > 1000000000000) return time;
  }
  return 0;
}

function formatCreationDate(plan: LessonPlan): string | null {
  const ts = getLessonTimestamp(plan);
  if (!ts) return null;
  const d = new Date(ts);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return 'Created today';
  return `Created ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

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
  plansByConcept?: Record<string, LessonPlan[]>;
  collapsedConcepts: Record<string, boolean>;
  toggleConceptCollapse: (concept: string) => void;
  handleEditLessonFromHub: (plan: LessonPlan) => void;
  handleOpenScheduleForLesson: (id: string) => void;
  loadPlanToMat: (plan: LessonPlan) => void;
  filteredWarmUps: WarmUp[];
  applyPresetWarmUp: (w: WarmUp) => void;
  setActiveTab: (tab: 'mat' | 'builder' | 'community' | 'flows' | 'calendar' | 'chat' | 'academy' | 'profile') => void;
  launchWarmUpOnly: (w: WarmUp) => void;
  plans: LessonPlan[];
  coreConcepts?: string[];
  handleDeleteLesson: (id: string) => Promise<void> | void;
}

export function CurriculumHubView(props: CurriculumHubViewProps) {
  const {
    hubSection, setHubSection, setIsNewConceptModalOpen, setIsNewWarmUpModalOpen, hubSearchTerm, setHubSearchTerm,
    selectedHubTag, setSelectedHubTag, allUniqueTags, collapsedConcepts, toggleConceptCollapse,
    handleEditLessonFromHub, handleOpenScheduleForLesson, loadPlanToMat, filteredWarmUps, applyPresetWarmUp,
    setActiveTab, launchWarmUpOnly, plans, coreConcepts = [], handleDeleteLesson
  } = props;

  const [hubSortBy, setHubSortBy] = useState<HubSortOption>('newest');
  const [viewMode, setViewMode] = useState<'concept' | 'all'>('concept');
  const [showRecentOnly, setShowRecentOnly] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<LessonPlan | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sorting function
  const sortPlansList = (plansList: LessonPlan[], sortOption: HubSortOption): LessonPlan[] => {
    return [...plansList].sort((a, b) => {
      switch (sortOption) {
        case 'newest': {
          const timeA = getLessonTimestamp(a);
          const timeB = getLessonTimestamp(b);
          if (timeA !== timeB) return timeB - timeA;
          return (a.className || '').localeCompare(b.className || '');
        }
        case 'oldest': {
          const timeA = getLessonTimestamp(a);
          const timeB = getLessonTimestamp(b);
          if (timeA !== timeB) return timeA - timeB;
          return (a.className || '').localeCompare(b.className || '');
        }
        case 'name-asc':
          return (a.className || '').localeCompare(b.className || '');
        case 'name-desc':
          return (b.className || '').localeCompare(a.className || '');
        case 'duration-desc':
          return (b.totalDurationMinutes || 0) - (a.totalDurationMinutes || 0);
        case 'duration-asc':
          return (a.totalDurationMinutes || 0) - (b.totalDurationMinutes || 0);
        default:
          return 0;
      }
    });
  };

  const sourcePlans = plans || [];
  const searchLower = (hubSearchTerm || '').trim().toLowerCase();

  // Bulletproof filtering
  const filteredPlans = sourcePlans.filter(p => {
    const matchesSearch = !searchLower ||
      (p.className || '').toLowerCase().includes(searchLower) ||
      (p.concept || '').toLowerCase().includes(searchLower) ||
      (p.tags || []).some(t => (t || '').toLowerCase().includes(searchLower));

    const matchesTag = !selectedHubTag || (p.tags || []).includes(selectedHubTag);

    const isRecent = getLessonTimestamp(p) > 0;
    const matchesRecentOnly = !showRecentOnly || isRecent;

    return matchesSearch && matchesTag && matchesRecentOnly;
  });

  const sortedPlans = sortPlansList(filteredPlans, hubSortBy);

  // Count of recently created / custom classes in academy
  const recentClassesCount = sourcePlans.filter(p => getLessonTimestamp(p) > 0).length;

  // Grouping by concept with dynamic sorting
  const allConceptKeys = Array.from(new Set([...coreConcepts, ...sourcePlans.map(p => p.concept || '')])).filter(Boolean);

  let conceptEntries: [string, LessonPlan[]][] = allConceptKeys.map(concept => {
    const conceptPlans = sortedPlans.filter(p => p.concept === concept);
    return [concept, conceptPlans];
  });

  if (searchLower || selectedHubTag || showRecentOnly) {
    conceptEntries = conceptEntries.filter(([_, cp]) => cp.length > 0);
  }

  // When sorting by newest, prioritize concepts that have newly created classes
  if (hubSortBy === 'newest') {
    conceptEntries.sort((a, b) => {
      const maxA = a[1].length > 0 ? Math.max(...a[1].map(p => getLessonTimestamp(p))) : 0;
      const maxB = b[1].length > 0 ? Math.max(...b[1].map(p => getLessonTimestamp(p))) : 0;
      if (maxA !== maxB) return maxB - maxA;
      return a[0].localeCompare(b[0]);
    });
  } else if (hubSortBy === 'name-asc') {
    conceptEntries.sort((a, b) => a[0].localeCompare(b[0]));
  } else if (hubSortBy === 'name-desc') {
    conceptEntries.sort((a, b) => b[0].localeCompare(a[0]));
  }

  // Render Lesson Card component helper
  const renderLessonCard = (p: LessonPlan) => {
    const isRecent = getLessonTimestamp(p) > 0;
    const formattedDate = formatCreationDate(p);

    return (
      <div key={p.id} className="bg-slate-950/80 border border-slate-800/80 hover:border-slate-700/80 transition p-5 rounded-xl flex flex-col justify-between shadow-sm">
        <div>
          <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
              {p.ageGroup || 'All Ages'} • {p.beltRank || 'All Belts'}
            </span>

            {isRecent && (
              <span className="text-[11px] font-bold text-amber-400 bg-amber-950/50 border border-amber-500/40 px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">
                <Sparkles size={11} className="text-amber-400" />
                {formattedDate || 'New'}
              </span>
            )}
          </div>

          <h4 className="font-bold text-base text-white">{p.className}</h4>
          <div className="text-xs text-slate-400 mt-0.5">
            <span className="text-slate-500">Concept:</span> {p.concept} • <span className="text-slate-500">Instructor:</span> {p.authorName || 'Coach'}
          </div>
          
          <div className="mt-3 space-y-1">
            <div className="text-xs font-bold text-orange-400 uppercase">Warm-Up: {p.warmUp?.warmUpName || 'Standard Warm-Up'}</div>
            {p.flow && (
              <div className="text-xs font-bold text-cyan-400 uppercase flex items-center gap-1">
                <GitBranch size={11} /> Flow: {p.flow.title}
              </div>
            )}
            <div className="text-xs font-bold text-slate-400 uppercase mt-2">Drills ({(p.drills || []).length}):</div>
            <ul className="text-xs text-slate-300 list-disc list-inside space-y-0.5">
              {(p.drills || []).map((d: Drill) => (<li key={d.id}>{d.drillName}</li>))}
            </ul>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-between items-center flex-wrap gap-2">
          <span className="text-xs text-slate-400">
            {p.totalDurationMinutes}m • {p.liveRounds?.roundCount || 0} Sparring Rounds
          </span>
          
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => handleEditLessonFromHub(p)}
              title="Edit or Clone in Lesson Builder"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold flex items-center gap-1 transition"
            >
              <Edit3 size={13} />
              <span className="hidden sm:inline">Edit</span>
            </button>

            <button
              onClick={() => handleOpenScheduleForLesson(p.id)}
              title="Schedule on Calendar"
              className="p-1.5 text-indigo-400 hover:text-white rounded-lg bg-indigo-950/40 border border-indigo-800/40 hover:bg-indigo-600 text-xs font-semibold flex items-center gap-1 transition"
            >
              <CalendarIcon size={13} />
              <span className="hidden sm:inline">Schedule</span>
            </button>

            <button
              onClick={() => loadPlanToMat(p)}
              className="bg-emerald-600/20 text-emerald-400 border border-emerald-600/40 hover:bg-emerald-600 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition"
            >
              <Play size={13} />
              <span className="hidden sm:inline">Run on Mat</span>
            </button>

            <button
              onClick={() => setLessonToDelete(p)}
              title="Delete Class"
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg bg-slate-900 border border-slate-800 hover:bg-rose-950/40 hover:border-rose-800/50 text-xs font-semibold flex items-center gap-1 transition"
            >
              <Trash2 size={13} />
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

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
            <input type="text" placeholder={hubSection === 'lessons' ? 'Search concepts, tags, classes...' : 'Search warm-ups...'} value={hubSearchTerm} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHubSearchTerm(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-emerald-500 text-white placeholder:text-slate-500" />
          </div>
        </div>
      </div>

      {hubSection === 'lessons' ? (
        <>
          {/* Controls Bar: Sort, View Mode, Quick Filter */}
          <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Sort Selector */}
              <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs">
                <ArrowUpDown size={13} className="text-emerald-400 shrink-0" />
                <span className="text-slate-400 font-semibold">Sort:</span>
                <select
                  value={hubSortBy}
                  onChange={(e) => setHubSortBy(e.target.value as HubSortOption)}
                  className="bg-transparent text-white font-bold focus:outline-none cursor-pointer pr-1"
                >
                  <option value="newest" className="bg-slate-900 text-white">⚡ Newest Created</option>
                  <option value="oldest" className="bg-slate-900 text-white">🕒 Oldest Created</option>
                  <option value="name-asc" className="bg-slate-900 text-white">🔤 Name (A → Z)</option>
                  <option value="name-desc" className="bg-slate-900 text-white">🔤 Name (Z → A)</option>
                  <option value="duration-desc" className="bg-slate-900 text-white">⏱️ Duration (Longest)</option>
                  <option value="duration-asc" className="bg-slate-900 text-white">⏱️ Duration (Shortest)</option>
                </select>
              </div>

              {/* Quick Filter: Newest / Recent Only */}
              <button
                type="button"
                onClick={() => setShowRecentOnly(!showRecentOnly)}
                className={`text-xs px-3 py-1.5 rounded-xl border font-bold flex items-center gap-1.5 transition ${
                  showRecentOnly
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm shadow-amber-950/40'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <Sparkles size={12} className={showRecentOnly ? 'text-amber-400' : 'text-slate-400'} />
                <span>Newest Classes</span>
                {recentClassesCount > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${showRecentOnly ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>
                    {recentClassesCount}
                  </span>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3">
              <span className="text-xs text-slate-400 font-semibold">
                {sortedPlans.length} class{sortedPlans.length === 1 ? '' : 'es'}
              </span>

              {/* View Mode Toggle */}
              <div className="flex bg-slate-950 border border-slate-800 p-0.5 rounded-xl">
                <button
                  type="button"
                  onClick={() => setViewMode('concept')}
                  title="Group by Concept"
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    viewMode === 'concept'
                      ? 'bg-slate-800 text-emerald-400 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers size={13} />
                  <span className="hidden sm:inline">By Concept</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('all')}
                  title="All Classes Flat View"
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    viewMode === 'all'
                      ? 'bg-slate-800 text-emerald-400 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LayoutGrid size={13} />
                  <span className="hidden sm:inline">All Classes</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tags bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs uppercase font-bold text-slate-400 flex items-center gap-1 mr-1"><Tag size={13} /> Tags:</span>
            <button onClick={() => setSelectedHubTag(null)} className={`text-xs px-2.5 py-1 rounded-lg border font-semibold ${selectedHubTag === null ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>All</button>
            {allUniqueTags.slice(0, 15).map((t: string) => (
              <button key={t} onClick={() => setSelectedHubTag(selectedHubTag === t ? null : t)} className={`text-xs px-2.5 py-1 rounded-lg border font-semibold ${selectedHubTag === t ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}`}>#{t}</button>
            ))}
          </div>

          {/* Empty state when filtering */}
          {sortedPlans.length === 0 && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center mx-auto text-slate-400">
                <Search size={20} />
              </div>
              <h3 className="font-bold text-white text-base">
                {showRecentOnly ? 'No recently created custom classes found' : 'No classes found'}
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {showRecentOnly
                  ? 'You haven\'t created any custom classes yet, or none match the active search/tag filter. You can create one anytime using the Lesson Builder!'
                  : 'Try broadening your search term or clearing the selected tag filter.'}
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                {showRecentOnly && (
                  <button
                    onClick={() => setActiveTab('builder')}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition"
                  >
                    Open Lesson Builder
                  </button>
                )}
                {(hubSearchTerm || selectedHubTag || showRecentOnly) && (
                  <button
                    onClick={() => {
                      setHubSearchTerm('');
                      setSelectedHubTag(null);
                      setShowRecentOnly(false);
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs px-4 py-2 rounded-xl border border-slate-700 transition"
                  >
                    Reset All Filters
                  </button>
                )}
              </div>
            </div>
          )}

          {/* VIEW MODE: FLAT LIST (ALL CLASSES) */}
          {viewMode === 'all' && sortedPlans.length > 0 && (
            <div className="grid md:grid-cols-2 gap-4">
              {sortedPlans.map(renderLessonCard)}
            </div>
          )}

          {/* VIEW MODE: GROUPED BY CONCEPT */}
          {viewMode === 'concept' && sortedPlans.length > 0 && (
            <div className="space-y-6">
              {conceptEntries.map(([conceptName, conceptPlans]: [string, LessonPlan[]]) => {
                const isCollapsed = collapsedConcepts[conceptName];
                const hasRecentInConcept = conceptPlans.some(p => getLessonTimestamp(p) > 0);

                return (
                  <div key={conceptName} className="border border-slate-800 rounded-2xl bg-slate-900/40 overflow-hidden shadow-sm">
                    <button onClick={() => toggleConceptCollapse(conceptName)} className="w-full px-5 py-4 bg-slate-900/80 flex items-center justify-between text-left hover:bg-slate-900 transition">
                      <div className="flex items-center gap-3">
                        {isCollapsed ? <ChevronRight size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-emerald-400" />}
                        <h3 className="font-extrabold text-base md:text-lg text-white">{conceptName}</h3>
                        <span className="text-xs bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded-full">{conceptPlans.length} Lessons</span>
                        {hasRecentInConcept && (
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Sparkles size={10} /> Has New
                          </span>
                        )}
                      </div>
                    </button>

                    {!isCollapsed && (
                      <div className="p-4 grid md:grid-cols-2 gap-4">
                        {conceptPlans.map(renderLessonCard)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
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

      {/* DELETE CONFIRMATION MODAL */}
      {lessonToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setLessonToDelete(null)}
              disabled={isDeleting}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Delete Class Plan?</h3>
                <p className="text-xs text-slate-400">This action cannot be undone.</p>
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-xl space-y-1">
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
                {lessonToDelete.ageGroup || 'All Ages'} • {lessonToDelete.beltRank || 'All Belts'}
              </span>
              <h4 className="font-bold text-white text-sm mt-1">{lessonToDelete.className}</h4>
              <div className="text-xs text-slate-400">
                Concept: <span className="text-slate-300">{lessonToDelete.concept}</span>
              </div>
              {formatCreationDate(lessonToDelete) && (
                <div className="text-xs text-amber-400 font-medium pt-1 flex items-center gap-1">
                  <Sparkles size={11} /> {formatCreationDate(lessonToDelete)}
                </div>
              )}
            </div>

            <p className="text-xs text-slate-300">
              Are you sure you want to permanently delete this lesson? It will be removed from the Curriculum Hub, any assigned calendar schedules, and academy database.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setLessonToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  setIsDeleting(true);
                  try {
                    await handleDeleteLesson(lessonToDelete.id);
                  } finally {
                    setIsDeleting(false);
                    setLessonToDelete(null);
                  }
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5 transition shadow-lg shadow-rose-950/40 disabled:opacity-50"
              >
                <Trash2 size={14} />
                {isDeleting ? 'Deleting...' : 'Delete Class'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}