'use client';

import React from 'react';
import { Plus, Flame, BookmarkPlus, GitBranch, ArrowRight, Shield, PlusCircle, Trash2, Globe, Lock, Copy, Calendar as CalendarIcon, Check, Loader2, Sparkles } from 'lucide-react';
import { LessonPlan, FlowRoutine, WarmUp, ScheduledClass, Drill } from '../types';

interface LessonBuilderViewProps {
  editingLessonId: string | null;
  setEditingLessonId: (val: string | null) => void;
  builderForm: Omit<LessonPlan, 'id' | 'authorInstructorId' | 'authorName'>;
  setBuilderForm: React.Dispatch<React.SetStateAction<Omit<LessonPlan, 'id' | 'authorInstructorId' | 'authorName'>>>;
  targetClassId: string;
  setTargetClassId: (val: string) => void;
  schedule: ScheduledClass[];
  targetDuration: number;
  totalPlannedMinutes: number;
  pacingDifference: number;
  warmUpMinutes: number;
  flowMinutes: number;
  drillsMinutes: number;
  liveRoundsMinutes: number;
  coreConcepts: string[];
  setIsNewConceptModalOpen: (val: boolean) => void;
  tagInput: string;
  setTagInput: (val: string) => void;
  handleAddTag: () => void;
  handleRemoveTag: (t: string) => void;
  warmUpPresets: WarmUp[];
  applyPresetWarmUp: (w: WarmUp) => void;
  handleSaveCurrentWarmUpAsPreset: () => void;
  flowLibrary: FlowRoutine[];
  addDrillToForm: () => void;
  removeDrillFromForm: (id: string) => void;
  updateDrillField: (idx: number, field: any, val: any) => void;
  handleSaveLessonPlan: (isClone: boolean, andSchedule: boolean) => void;
  isGenerating: boolean;
  handleAIGenerate: () => void;
}

export function LessonBuilderView(props: LessonBuilderViewProps) {
  const {
    editingLessonId, setEditingLessonId, builderForm, setBuilderForm, targetClassId, setTargetClassId,
    schedule, targetDuration, totalPlannedMinutes, pacingDifference, warmUpMinutes, flowMinutes, drillsMinutes, liveRoundsMinutes,
    coreConcepts, setIsNewConceptModalOpen, tagInput, setTagInput, handleAddTag, handleRemoveTag,
    warmUpPresets, applyPresetWarmUp, handleSaveCurrentWarmUpAsPreset, flowLibrary, addDrillToForm, removeDrillFromForm,
    updateDrillField, handleSaveLessonPlan, isGenerating, handleAIGenerate
  } = props;

  const handleClear = () => {
    setEditingLessonId(null);
    setBuilderForm({
      className: '', concept: coreConcepts[0] || 'Concept', ageGroup: 'Adults', beltRank: 'White Belt',
      totalDurationMinutes: 60, tags: ['Fundamentals'], isPublic: false, warmUp: warmUpPresets[0] || { warmUpName: '', type: 'general', description: '', roundCount: 1, roundTimeSeconds: 300, restTimeSeconds: 30 },
      flow: null, drills: [builderForm.drills[0]], liveRounds: { roundCount: 5, roundTimeSeconds: 300, restTimeSeconds: 60 }
    });
  };

  return (
    <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">{editingLessonId ? 'Edit / Refine Lesson Plan' : 'Lesson Plan Builder'}</h2>
            {editingLessonId && <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-800/40 px-2 py-0.5 rounded font-bold">Editing Mode</span>}
          </div>
          <p className="text-sm text-slate-400">Design curriculum units balanced dynamically against your scheduled class duration.</p>
        </div>
        <div className="flex items-center gap-2">
          {editingLessonId && (
            <button type="button" onClick={handleClear} className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 text-xs font-semibold hover:bg-slate-700 text-slate-300">Clear / New</button>
          )}
          <button type="button" disabled={isGenerating} onClick={handleAIGenerate} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs md:text-sm font-bold shadow-lg transition">
            {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} {isGenerating ? 'Designing...' : 'AI Black Belt Suggest'}
          </button>
        </div>
      </div>

      {/* PACING BUDGET BAR */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Target Scheduled Class (Calendar Link)</span>
            <select
              value={targetClassId}
              onChange={(e) => {
                const val = e.target.value;
                setTargetClassId(val);
                const match = schedule.find(s => s.id === val);
                if (match) setBuilderForm(prev => ({ ...prev, ageGroup: match.ageGroup, totalDurationMinutes: match.durationMinutes }));
              }}
              className="w-full sm:w-auto mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-emerald-400 focus:outline-none"
            >
              <option value="">No Calendar Link (Manual Duration)</option>
              {schedule.map(sc => <option key={sc.id} value={sc.id}>{sc.dateStr} • {sc.time} - {sc.title} ({sc.durationMinutes}m)</option>)}
            </select>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-400 uppercase">Class Duration Target</span>
            <div className="text-xl font-black text-white">{targetDuration} Minutes</div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800/80 space-y-2">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-slate-400">Curriculum Pacing Budget:</span>
            <div className="flex items-center gap-2">
              <span className="text-slate-300">{totalPlannedMinutes}m Planned</span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-black ${pacingDifference === 0 ? 'bg-emerald-500/20 text-emerald-400' : pacingDifference > 0 ? 'bg-cyan-500/20 text-cyan-300' : 'bg-rose-500/20 text-rose-400'}`}>
                {pacingDifference === 0 ? 'Balanced' : pacingDifference > 0 ? `${pacingDifference}m Available` : `${Math.abs(pacingDifference)}m Over Budget`}
              </span>
            </div>
          </div>

          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden flex border border-slate-800">
            <div style={{ width: `${Math.min(100, (warmUpMinutes / targetDuration) * 100)}%` }} className="bg-orange-500 transition-all duration-300" />
            {builderForm.flow && <div style={{ width: `${Math.min(100, (flowMinutes / targetDuration) * 100)}%` }} className="bg-cyan-500 transition-all duration-300" />}
            <div style={{ width: `${Math.min(100, (drillsMinutes / targetDuration) * 100)}%` }} className="bg-emerald-500 transition-all duration-300" />
            <div style={{ width: `${Math.min(100, (liveRoundsMinutes / targetDuration) * 100)}%` }} className="bg-indigo-500 transition-all duration-300" />
          </div>
          
          <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1 flex-wrap">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Warm-Up: {warmUpMinutes}m</span>
            {builderForm.flow && <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-500" /> Flow Chain: {flowMinutes}m</span>}
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Drills: {drillsMinutes}m</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Sparring: {liveRoundsMinutes}m</span>
          </div>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSaveLessonPlan(false, false); }} className="space-y-6">
        <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl grid sm:grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-400 uppercase">Core Concept</label>
              <button type="button" onClick={() => setIsNewConceptModalOpen(true)} className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"><Plus size={12} /> New Concept</button>
            </div>
            <select value={builderForm.concept} onChange={(e) => setBuilderForm({ ...builderForm, concept: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-bold text-emerald-400 focus:outline-none focus:border-emerald-500">
              {coreConcepts.map(c => (<option key={c} value={c}>{c}</option>))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase">Lesson / Class Title</label>
            <input type="text" required value={builderForm.className} onChange={(e) => setBuilderForm({ ...builderForm, className: e.target.value })} className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500" />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase">Age Group</label>
            <select value={builderForm.ageGroup} onChange={(e) => setBuilderForm({ ...builderForm, ageGroup: e.target.value })} className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm">
              <option>Ages 3-6</option><option>Ages 7-12</option><option>Teens</option><option>Adults</option><option>Masters</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase">Belt Rank</label>
            <select value={builderForm.beltRank} onChange={(e) => setBuilderForm({ ...builderForm, beltRank: e.target.value })} className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm">
              <option>White Belt</option><option>White / Gray Belt</option><option>Yellow / Orange / Green</option><option>Blue Belt</option><option>Purple Belt +</option><option>All Ranks</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-slate-400 uppercase">Searchable Tags</label>
            <div className="flex gap-2 mt-1">
              <input type="text" placeholder="Type tag and press Enter" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }} className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-500" />
              <button type="button" onClick={handleAddTag} className="bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold">Add Tag</button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {builderForm.tags.map(t => (
                <span key={t} className="bg-slate-800 text-slate-200 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-slate-700">
                  #{t} <button type="button" onClick={() => handleRemoveTag(t)} className="hover:text-rose-400">✕</button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* WARM-UP SECTION */}
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Flame size={20} className="text-orange-400" />
              <h3 className="text-lg font-bold text-white">Warm-Up Activity</h3>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <select onChange={(e) => { const found = warmUpPresets.find(w => (w.id || w.warmUpName) === e.target.value); if (found) applyPresetWarmUp(found); }} className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none" value="">
                <option value="" disabled>Load Reusable Preset...</option>
                {warmUpPresets.map(wu => (<option key={wu.id || wu.warmUpName} value={wu.id || wu.warmUpName}>{wu.warmUpName} ({wu.type === 'general' ? 'General' : 'Game'})</option>))}
              </select>
              <button type="button" onClick={handleSaveCurrentWarmUpAsPreset} className="flex items-center gap-1 text-xs font-bold text-orange-400 bg-orange-950/40 border border-orange-800/40 hover:bg-orange-900/60 px-2.5 py-1.5 rounded-lg transition"><BookmarkPlus size={14} /> Save Preset</button>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase">Warm-Up Name</label>
              <input type="text" required value={builderForm.warmUp.warmUpName} onChange={(e) => setBuilderForm({ ...builderForm, warmUp: { ...builderForm.warmUp, warmUpName: e.target.value } })} className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase">Warm-Up Type</label>
              <select value={builderForm.warmUp.type} onChange={(e) => setBuilderForm({ ...builderForm, warmUp: { ...builderForm.warmUp, type: e.target.value as 'general' | 'game' } })} className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm">
                <option value="general">General Movement (Solo drills, mobility)</option>
                <option value="game">Task-Based Game (Paired interaction, agility)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase">Description</label>
            <textarea rows={2} value={builderForm.warmUp.description} onChange={(e) => setBuilderForm({ ...builderForm, warmUp: { ...builderForm.warmUp, description: e.target.value } })} className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm" />
          </div>
          <div className="pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-3">
            <div>
              <span className="text-[11px] text-slate-500">Rounds</span>
              <input type="number" value={builderForm.warmUp.roundCount} onChange={(e) => setBuilderForm({ ...builderForm, warmUp: { ...builderForm.warmUp, roundCount: Number(e.target.value) } })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500">Round Time (Sec)</span>
              <input type="number" value={builderForm.warmUp.roundTimeSeconds} onChange={(e) => setBuilderForm({ ...builderForm, warmUp: { ...builderForm.warmUp, roundTimeSeconds: Number(e.target.value) } })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500">Rest Time (Sec)</span>
              <input type="number" value={builderForm.warmUp.restTimeSeconds} onChange={(e) => setBuilderForm({ ...builderForm, warmUp: { ...builderForm.warmUp, restTimeSeconds: Number(e.target.value) } })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white" />
            </div>
          </div>
        </div>

        {/* FLOW CHAIN SECTION */}
        <div className="bg-slate-900/60 border border-cyan-900/40 p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <GitBranch size={20} className="text-cyan-400" />
              <h3 className="text-lg font-bold text-white">Tactical Flow Chain (Optional)</h3>
            </div>
            <div className="flex items-center gap-2">
              <select value={builderForm.flow ? builderForm.flow.id : ''} onChange={(e) => { const val = e.target.value; if (!val) { setBuilderForm({ ...builderForm, flow: null }); } else { const found = flowLibrary.find(f => f.id === val); if (found) setBuilderForm({ ...builderForm, flow: { ...found } }); } }} className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-cyan-300 font-bold focus:outline-none">
                <option value="">None (No Flow Chain)</option>
                {flowLibrary.map(f => (<option key={f.id} value={f.id}>{f.title}</option>))}
              </select>
            </div>
          </div>
          {builderForm.flow ? (
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">{builderForm.flow.title}</span>
                <span className="text-xs text-cyan-400 font-semibold">{builderForm.flow.roundCount} Rounds &times; {builderForm.flow.roundTimeSeconds}s</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {builderForm.flow.nodes.map((n, i) => (
                  <React.Fragment key={n.id}>
                    <span className="text-[11px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-300">{n.techniqueName}</span>
                    {i < builderForm.flow!.nodes.length - 1 && <ArrowRight size={11} className="text-cyan-400" />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No flow chain attached. Select one from your library above to include a connected decision tree.</p>
          )}
        </div>

        {/* DRILLS BLOCK SECTION */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold flex items-center gap-2"><Shield size={18} className="text-emerald-400" /> Drills</h3>
            <button type="button" onClick={addDrillToForm} className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-lg">
              <PlusCircle size={15} /> Add Another Drill
            </button>
          </div>
          {builderForm.drills.map((drill: Drill, index: number) => (
            <div key={drill.id} className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black px-2 py-0.5 rounded bg-slate-800 text-slate-300">Drill #{index + 1}</span>
                {builderForm.drills.length > 1 && <button type="button" onClick={() => removeDrillFromForm(drill.id)} className="text-slate-500 hover:text-rose-400 p-1"><Trash2 size={16} /></button>}
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Drill Name</label>
                <input type="text" required value={drill.drillName} onChange={(e) => updateDrillField(index, 'drillName', e.target.value)} className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Drill Constraints</label>
                <textarea rows={2} required value={drill.drillConstraints} onChange={(e) => updateDrillField(index, 'drillConstraints', e.target.value)} className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Primary Goal</label>
                  <input type="text" required value={drill.primaryGoal} onChange={(e) => updateDrillField(index, 'primaryGoal', e.target.value)} className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Immediate Reset Condition</label>
                  <input type="text" required value={drill.immediateReset} onChange={(e) => updateDrillField(index, 'immediateReset', e.target.value)} className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-800">
                <div>
                  <span className="text-[11px] text-slate-400">Rounds</span>
                  <input type="number" value={drill.roundCount} onChange={(e) => updateDrillField(index, 'roundCount', Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400">Work Time (s)</span>
                  <input type="number" value={drill.roundTimeSeconds} onChange={(e) => updateDrillField(index, 'roundTimeSeconds', Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400">Rest Time (s)</span>
                  <input type="number" value={drill.restTimeSeconds} onChange={(e) => updateDrillField(index, 'restTimeSeconds', Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* LIVE ROUNDS SECTION */}
        <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400">Live Rounds Configuration</h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-400">Live Rounds Count</label>
              <input type="number" value={builderForm.liveRounds.roundCount} onChange={(e) => setBuilderForm({ ...builderForm, liveRounds: { ...builderForm.liveRounds, roundCount: Number(e.target.value) } })} className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-slate-400">Round Duration (Sec)</label>
              <input type="number" value={builderForm.liveRounds.roundTimeSeconds} onChange={(e) => setBuilderForm({ ...builderForm, liveRounds: { ...builderForm.liveRounds, roundTimeSeconds: Number(e.target.value) } })} className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-slate-400">Rest Duration (Sec)</label>
              <input type="number" value={builderForm.liveRounds.restTimeSeconds} onChange={(e) => setBuilderForm({ ...builderForm, liveRounds: { ...builderForm.liveRounds, restTimeSeconds: Number(e.target.value) } })} className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm" />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={builderForm.isPublic} onChange={(e) => setBuilderForm({ ...builderForm, isPublic: e.target.checked })} className="w-4 h-4 rounded text-emerald-500 bg-slate-950 border-slate-800" />
            <span className="text-sm font-medium flex items-center gap-1.5">
              {builderForm.isPublic ? <Globe size={16} className="text-emerald-400" /> : <Lock size={16} className="text-slate-400" />}
              {builderForm.isPublic ? 'Publish to Curriculum Hub' : 'Keep Private'}
            </span>
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {editingLessonId && (
              <button type="button" onClick={() => handleSaveLessonPlan(true, false)} className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5">
                <Copy size={14} /> Save as New Lesson
              </button>
            )}
            <button type="button" onClick={() => handleSaveLessonPlan(false, true)} className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5">
              <CalendarIcon size={14} /> Save & Schedule
            </button>
            <button type="submit" className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg flex items-center gap-2">
              <Check size={16} /> {editingLessonId ? 'Update Lesson' : 'Save & Run on Mat'}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}