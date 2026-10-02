'use client';

import React from 'react';
import { GitBranch, PlusCircle, Plus, Trash2, ArrowRight, Edit3, Play } from 'lucide-react';
import { FlowRoutine, FlowNode } from '../types';

interface FlowChainsViewProps {
  activeFlowInStudio: FlowRoutine;
  setActiveFlowInStudio: React.Dispatch<React.SetStateAction<FlowRoutine>>;
  isEditingExistingFlow: boolean;
  setIsEditingExistingFlow: (val: boolean) => void;
  handleSaveFlowRoutine: (e: React.FormEvent) => void;
  addFlowNode: () => void;
  updateFlowNode: (idx: number, field: keyof FlowNode, val: string) => void;
  removeFlowNode: (id: string) => void;
  coreConcepts: string[];
  setIsNewConceptModalOpen: (val: boolean) => void;
  flowLibrary: FlowRoutine[];
  handleDeleteFlow: (id: string) => void;
  launchFlowToMat: (flow: FlowRoutine) => void;
}

export function FlowChainsView(props: FlowChainsViewProps) {
  const {
    activeFlowInStudio, setActiveFlowInStudio, isEditingExistingFlow, setIsEditingExistingFlow,
    handleSaveFlowRoutine, addFlowNode, updateFlowNode, removeFlowNode, coreConcepts, 
    setIsNewConceptModalOpen, flowLibrary, handleDeleteFlow, launchFlowToMat
  } = props;

  return (
    <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <GitBranch size={22} className="text-cyan-400" /> Tactical Flow Chains Library
          </h2>
          <p className="text-sm text-slate-400">Design and launch connected submission and counter-reaction sequences.</p>
        </div>
        <button
          onClick={() => {
            setActiveFlowInStudio({
              id: `flow-${Date.now()}`, title: '', concept: coreConcepts[0] || 'Concept',
              startingPosition: 'Closed Guard', roundCount: 4, roundTimeSeconds: 180, restTimeSeconds: 30,
              nodes: [
                { id: `fn-1`, techniqueName: '', opponentDefenseTrigger: '', transitionCue: '' },
                { id: `fn-2`, techniqueName: '', opponentDefenseTrigger: '', transitionCue: '' }
              ]
            });
            setIsEditingExistingFlow(false);
          }}
          className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
        >
          <PlusCircle size={15} /> Create New Flow Chain
        </button>
      </div>

      <form onSubmit={handleSaveFlowRoutine} className="bg-slate-900/60 border border-cyan-900/40 p-6 rounded-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-sm font-extrabold uppercase text-cyan-400 tracking-wider">
            {isEditingExistingFlow ? 'Refine & Update Flow Chain' : 'Flow Chain Architect'}
          </span>
          <button type="button" onClick={addFlowNode} className="text-xs font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-3 py-1.5 rounded-lg flex items-center gap-1">
            <Plus size={13} /> Add Transition Stage
          </button>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div><label className="text-xs font-semibold text-slate-400 uppercase">Title</label><input type="text" required value={activeFlowInStudio.title} onChange={(e) => setActiveFlowInStudio({ ...activeFlowInStudio, title: e.target.value })} className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" /></div>
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-400 uppercase">Concept</label>
              <button
                type="button"
                onClick={() => setIsNewConceptModalOpen(true)}
                className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <Plus size={12} /> New Concept
              </button>
            </div>
            <select value={activeFlowInStudio.concept} onChange={(e) => setActiveFlowInStudio({ ...activeFlowInStudio, concept: e.target.value })} className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-cyan-300 font-bold focus:outline-none">
              {coreConcepts.map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
          </div>
          <div><label className="text-xs font-semibold text-slate-400 uppercase">Starting Position</label><input type="text" required value={activeFlowInStudio.startingPosition} onChange={(e) => setActiveFlowInStudio({ ...activeFlowInStudio, startingPosition: e.target.value })} className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" /></div>
        </div>

        <div className="space-y-3">
          {activeFlowInStudio.nodes.map((node, index) => (
            <div key={node.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">Stage #{index + 1}</span>
                {activeFlowInStudio.nodes.length > 2 && <button type="button" onClick={() => removeFlowNode(node.id)} className="text-slate-500 hover:text-rose-400 p-1"><Trash2 size={15} /></button>}
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <div><label className="text-[11px] font-semibold text-slate-400 uppercase">Technique</label><input type="text" required value={node.techniqueName} onChange={(e) => updateFlowNode(index, 'techniqueName', e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white" /></div>
                <div><label className="text-[11px] font-semibold text-amber-400 uppercase">Opponent Reaction</label><input type="text" required value={node.opponentDefenseTrigger} onChange={(e) => updateFlowNode(index, 'opponentDefenseTrigger', e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white" /></div>
                <div><label className="text-[11px] font-semibold text-emerald-400 uppercase">Transition Cue</label><input type="text" required value={node.transitionCue} onChange={(e) => updateFlowNode(index, 'transitionCue', e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white" /></div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl">
            {isEditingExistingFlow ? 'Update Flow Chain' : 'Save Chain'}
          </button>
        </div>
      </form>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">Saved Flow Chains ({flowLibrary.length})</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {flowLibrary.map(flow => (
            <div key={flow.id} className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-700">
              <div className="space-y-3">
                <span className="text-xs font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded">{flow.concept}</span>
                <h4 className="font-bold text-lg text-white">{flow.title}</h4>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  onClick={() => {
                    setActiveFlowInStudio(flow);
                    setIsEditingExistingFlow(true);
                    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                  title="Edit Flow"
                >
                  <Edit3 size={15} />
                </button>
                <button
                  onClick={() => handleDeleteFlow(flow.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                  title="Delete Flow"
                >
                  <Trash2 size={15} />
                </button>
                <button onClick={() => launchFlowToMat(flow)} className="bg-cyan-600 hover:bg-cyan-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"><Play size={13} /> Run on Mat</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}