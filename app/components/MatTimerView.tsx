'use client';

import React from 'react';
import { Play, Pause, RotateCcw, SkipForward, SkipBack, ChevronDown, ChevronRight, ChevronLeft, GitBranch, Disc3, Radio, UploadCloud } from 'lucide-react';
import { LessonPlan, FlowRoutine, WarmUp, Drill, LocalTrack } from '../types';

interface MatTimerViewProps {
  isRest: boolean;
  isActive: boolean;
  activeHUDMode: 'warmup' | 'flow' | 'drill' | 'live';
  selectedPlan: LessonPlan | null;
  effectiveActiveFlow: FlowRoutine | null;
  currentRound: number;
  maxRounds: number;
  secondsLeft: number;
  workDuration: number;
  activeDrillIndex: number;
  activeFlowNodeIndex: number;
  currentWarmUp: WarmUp;
  currentDrill: Drill;
  musicSource: 'local' | 'spotify' | 'apple';
  localPlaylist: LocalTrack[];
  currentTrackIndex: number;
  isMusicPlaying: boolean;
  setMusicSource: (src: 'local' | 'spotify' | 'apple') => void;
  handleLocalFilesUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  restartTrack: () => void;
  skipTrack: (dir: 'next' | 'prev') => void;
  toggleMusicPlayback: () => void;
  playSoundTone: (phase: 'start' | 'rest') => void;
  setIsActive: (val: boolean) => void;
  setIsRest: (val: boolean) => void;
  setSecondsLeft: (val: number | ((prev: number) => number)) => void;
  setCurrentRound: (val: number | ((prev: number) => number)) => void;
  adjustHUDTimer: (field: 'rounds' | 'work' | 'rest', delta: number) => void;
  handleHUDTargetChange: (type: 'warmup' | 'flow' | 'drill' | 'live', drillIdx?: number) => void;
  setActiveFlowNodeIndex: (val: number) => void;
  formatTime: (secs: number) => string;
}

export function MatTimerView({
  isRest, isActive, activeHUDMode, selectedPlan, effectiveActiveFlow, currentRound, maxRounds,
  secondsLeft, workDuration, activeDrillIndex, activeFlowNodeIndex, currentWarmUp, currentDrill,
  musicSource, localPlaylist, currentTrackIndex, isMusicPlaying, setMusicSource, handleLocalFilesUpload,
  restartTrack, skipTrack, toggleMusicPlayback, playSoundTone, setIsActive, setIsRest,
  setSecondsLeft, setCurrentRound, adjustHUDTimer, handleHUDTargetChange, setActiveFlowNodeIndex, formatTime
}: MatTimerViewProps) {
  return (
    <main className={`flex-1 flex flex-col justify-between p-3 sm:p-6 md:p-10 max-w-6xl mx-auto w-full transition-colors duration-500 ${isRest ? 'bg-amber-950/20' : 'bg-transparent'}`}>
      <header className="flex flex-col gap-3 border-b-2 border-slate-800 pb-3 sm:pb-4 w-full">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs sm:text-sm md:text-base font-black px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-md uppercase tracking-wider ${isRest ? 'bg-amber-500 text-slate-950 shadow-lg' : 'bg-emerald-500 text-slate-950 shadow-lg'}`}>
              {isRest ? 'REST INTERVAL' : activeHUDMode === 'flow' ? 'TACTICAL FLOW' : activeHUDMode.toUpperCase()}
            </span>
            <span className="text-xs sm:text-sm md:text-base font-extrabold text-white bg-slate-900 border border-slate-700 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-md">
              {selectedPlan?.ageGroup || 'All Levels'}
            </span>
            <span className="text-xs sm:text-sm font-bold text-indigo-300 bg-indigo-950/60 border border-indigo-800/60 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md truncate max-w-full">
              {activeHUDMode === 'flow' && effectiveActiveFlow ? effectiveActiveFlow.concept : selectedPlan?.concept}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-4xl font-black text-white truncate max-w-full mt-1 drop-shadow-sm">
            {activeHUDMode === 'flow' && effectiveActiveFlow ? effectiveActiveFlow.title : selectedPlan?.className}
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 w-full">
          <div className="relative flex-1 min-w-0">
            <select
              value={activeHUDMode === 'flow' ? 'flow' : activeHUDMode === 'warmup' ? 'warmup' : activeHUDMode === 'drill' ? `drill-${activeDrillIndex}` : 'live'}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'flow') handleHUDTargetChange('flow');
                else if (val === 'warmup') handleHUDTargetChange('warmup');
                else if (val === 'live') handleHUDTargetChange('live');
                else handleHUDTargetChange('drill', parseInt(val.replace('drill-', '')));
              }}
              className="w-full bg-slate-900 border-2 border-slate-700 text-white font-extrabold text-xs sm:text-sm md:text-base px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl appearance-none pr-8 sm:pr-10 focus:outline-none focus:border-emerald-500 shadow-md truncate"
            >
              <optgroup label="Preparation"><option value="warmup">Warm-Up: {selectedPlan?.warmUp?.warmUpName || 'Warm-Up'}</option></optgroup>
              {effectiveActiveFlow && <optgroup label="Tactical Flow"><option value="flow">Flow Chain: {effectiveActiveFlow.title}</option></optgroup>}
              {selectedPlan?.drills && selectedPlan.drills.length > 0 && (
                <optgroup label="Drills">
                  {selectedPlan.drills.map((d, idx) => (<option key={d.id} value={`drill-${idx}`}>Drill {idx + 1}: {d.drillName}</option>))}
                </optgroup>
              )}
              <optgroup label="Sparring"><option value="live">Live Rounds ({selectedPlan?.liveRounds?.roundCount || 5} Rounds)</option></optgroup>
            </select>
            <ChevronDown size={16} className="absolute right-2.5 sm:right-3.5 top-3.5 sm:top-4 pointer-events-none text-slate-400" />
          </div>

          <div className="text-right bg-slate-900 border-2 border-slate-800 px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-xl sm:rounded-2xl shadow-inner shrink-0 min-w-[90px] sm:min-w-[130px]">
            <span className="text-[9px] sm:text-[11px] uppercase font-black text-slate-400 block tracking-widest">ROUND</span>
            <div className="text-2xl sm:text-4xl md:text-5xl font-black text-white tabular-nums leading-none mt-0.5">
              {currentRound} <span className="text-slate-500 text-lg sm:text-2xl md:text-3xl">/ {maxRounds}</span>
            </div>
          </div>
        </div>
      </header>

      {/* MUSIC DECK */}
      <div className="bg-slate-900/70 border border-purple-900/40 rounded-2xl p-2.5 sm:p-3 my-2 shadow-lg backdrop-blur">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] sm:text-xs font-bold">
              <button onClick={() => setMusicSource('local')} className={`px-2 py-1 rounded-lg transition ${musicSource === 'local' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>Local</button>
              <button onClick={() => setMusicSource('spotify')} className={`px-2 py-1 rounded-lg transition ${musicSource === 'spotify' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}>Spotify</button>
              <button onClick={() => setMusicSource('apple')} className={`px-2 py-1 rounded-lg transition ${musicSource === 'apple' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}>Apple</button>
            </div>
            {musicSource === 'local' ? (
              <div className="text-xs truncate max-w-[150px] sm:max-w-xs">
                {localPlaylist.length > 0 ? (
                  <div className="flex items-center gap-1.5 font-bold text-purple-300 truncate">
                    <Disc3 size={14} className={isMusicPlaying ? 'animate-spin shrink-0' : 'shrink-0'} />
                    <span className="truncate">{localPlaylist[currentTrackIndex]?.name}</span>
                  </div>
                ) : (<span className="text-slate-500 italic">No audio loaded</span>)}
              </div>
            ) : (
              <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5"><Radio size={14} className="text-emerald-400" /><span>Ready</span></div>
            )}
          </div>

          {musicSource === 'local' && (
            <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto justify-between md:justify-end">
              <label className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-700 cursor-pointer">
                <UploadCloud size={13} /><span>Upload</span>
                <input type="file" multiple accept="audio/*" onChange={handleLocalFilesUpload} className="hidden" />
              </label>
              <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-xl">
                <button onClick={restartTrack} disabled={localPlaylist.length === 0} className="p-1.5 hover:text-white text-slate-400 disabled:opacity-40"><RotateCcw size={15} /></button>
                <button onClick={() => skipTrack('prev')} disabled={localPlaylist.length === 0} className="p-1.5 hover:text-white text-slate-400 disabled:opacity-40"><SkipBack size={15} /></button>
                <button onClick={toggleMusicPlayback} disabled={localPlaylist.length === 0} className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1 disabled:opacity-40">
                  {isMusicPlaying ? <Pause size={13} /> : <Play size={13} />}<span>{isMusicPlaying ? 'Pause' : 'Play'}</span>
                </button>
                <button onClick={() => skipTrack('next')} disabled={localPlaylist.length === 0} className="p-1.5 hover:text-white text-slate-400 disabled:opacity-40"><SkipForward size={15} /></button>
              </div>
            </div>
          )}
        </div>
      </div>

      <section className="text-center my-auto py-2">
        <div className={`text-8xl sm:text-[11rem] md:text-[14rem] font-black tracking-tighter tabular-nums leading-none drop-shadow-2xl ${isRest ? 'text-amber-400' : secondsLeft <= 10 && isActive ? 'text-rose-500 animate-pulse' : 'text-white'}`}>
          {formatTime(secondsLeft)}
        </div>

        <div className="flex justify-center items-center gap-3 sm:gap-5 mt-4 sm:mt-6 flex-wrap">
          <button onClick={() => { playSoundTone('start'); setIsActive(!isActive); }} className={`flex items-center justify-center gap-2 sm:gap-3 px-8 sm:px-10 py-4 sm:py-6 min-h-[64px] sm:min-h-[72px] min-w-[160px] sm:min-w-[210px] rounded-2xl font-black text-lg sm:text-2xl shadow-2xl transition active:scale-95 ${isActive ? 'bg-amber-500 hover:bg-amber-400 text-slate-950' : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'}`}>
            {isActive ? <Pause size={26} /> : <Play size={26} />} <span>{isActive ? 'PAUSE' : 'START'}</span>
          </button>
          <button onClick={() => { setIsActive(false); setIsRest(false); setSecondsLeft(workDuration); }} className="flex items-center justify-center gap-2 px-6 sm:px-8 py-4 sm:py-6 min-h-[64px] sm:min-h-[72px] rounded-2xl bg-slate-900 border-2 border-slate-700 hover:bg-slate-800 font-bold text-base sm:text-lg text-white shadow-lg active:scale-95">
            <RotateCcw size={22} /> <span>RESET</span>
          </button>
          <button onClick={() => { setIsActive(false); setIsRest(false); setCurrentRound((prev) => (prev < maxRounds ? prev + 1 : 1)); setSecondsLeft(workDuration); }} className="flex items-center justify-center gap-2 px-6 sm:px-8 py-4 sm:py-6 min-h-[64px] sm:min-h-[72px] rounded-2xl bg-slate-900 border-2 border-slate-700 hover:bg-slate-800 font-bold text-base sm:text-lg text-white shadow-lg active:scale-95">
            <SkipForward size={22} /> <span>SKIP</span>
          </button>
        </div>

        <div className="mt-5 sm:mt-7 bg-slate-900 border-2 border-slate-800 p-2.5 sm:p-3 rounded-2xl max-w-xl mx-auto flex justify-around items-center text-xs sm:text-sm font-bold text-slate-200 shadow-md">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-slate-400 uppercase text-[10px] sm:text-xs">Work:</span>
            <button onClick={() => adjustHUDTimer('work', -60)} className="px-2.5 sm:px-3 py-1.5 sm:py-2 min-h-[38px] sm:min-h-[44px] min-w-[38px] sm:min-w-[44px] rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white font-extrabold">-1m</button>
            <button onClick={() => adjustHUDTimer('work', 60)} className="px-2.5 sm:px-3 py-1.5 sm:py-2 min-h-[38px] sm:min-h-[44px] min-w-[38px] sm:min-w-[44px] rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white font-extrabold">+1m</button>
          </div>
          <div className="w-[1px] h-7 sm:h-8 bg-slate-800" />
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-slate-400 uppercase text-[10px] sm:text-xs">Rest:</span>
            <button onClick={() => adjustHUDTimer('rest', -30)} className="px-2.5 sm:px-3 py-1.5 sm:py-2 min-h-[38px] sm:min-h-[44px] min-w-[38px] sm:min-w-[44px] rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white font-extrabold">-30s</button>
            <button onClick={() => adjustHUDTimer('rest', 30)} className="px-2.5 sm:px-3 py-1.5 sm:py-2 min-h-[38px] sm:min-h-[44px] min-w-[38px] sm:min-w-[44px] rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white font-extrabold">+30s</button>
          </div>
        </div>
      </section>

      <footer className="space-y-4 mt-4 sm:mt-6">
        {activeHUDMode === 'flow' && effectiveActiveFlow ? (
          <div className="bg-slate-900/90 border-2 border-cyan-900/50 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <GitBranch size={20} className="text-cyan-400" />
                <span className="text-sm sm:text-base font-extrabold text-white">Flow: {effectiveActiveFlow.title}</span>
                <span className="text-[10px] sm:text-xs bg-cyan-950/60 text-cyan-300 border border-cyan-800/40 px-2 py-0.5 rounded font-bold">Starts in {effectiveActiveFlow.startingPosition}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-semibold">Node {activeFlowNodeIndex + 1} of {effectiveActiveFlow.nodes.length}</span>
                <button onClick={() => setActiveFlowNodeIndex(Math.max(0, activeFlowNodeIndex - 1))} disabled={activeFlowNodeIndex === 0} className="p-1 rounded bg-slate-800 disabled:opacity-40"><ChevronLeft size={16} /></button>
                <button onClick={() => setActiveFlowNodeIndex(Math.min(effectiveActiveFlow.nodes.length - 1, activeFlowNodeIndex + 1))} disabled={activeFlowNodeIndex === effectiveActiveFlow.nodes.length - 1} className="p-1 rounded bg-slate-800 disabled:opacity-40"><ChevronRight size={16} /></button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 pb-2">
              {effectiveActiveFlow.nodes.map((node, idx) => (
                <button key={node.id} onClick={() => setActiveFlowNodeIndex(idx)} className={`p-2.5 rounded-xl border text-left transition ${activeFlowNodeIndex === idx ? 'border-cyan-500 bg-cyan-950/60 shadow-md font-bold' : 'border-slate-800 bg-slate-950/60 opacity-60 hover:opacity-100'}`}>
                  <div className="text-[10px] font-black uppercase text-cyan-400">Node {idx + 1}</div>
                  <div className="text-xs font-bold text-white truncate">{node.techniqueName}</div>
                </button>
              ))}
            </div>

            {effectiveActiveFlow.nodes[activeFlowNodeIndex] && (
              <div className="grid md:grid-cols-3 gap-3 sm:gap-4 pt-1">
                <div className="bg-slate-950/90 border border-slate-800 p-3.5 sm:p-4 rounded-xl border-l-4 border-l-cyan-500">
                  <div className="text-xs uppercase font-extrabold text-slate-400">Technique State</div>
                  <div className="text-base sm:text-lg font-black text-white mt-1">{effectiveActiveFlow.nodes[activeFlowNodeIndex].techniqueName}</div>
                </div>
                <div className="bg-slate-950/90 border border-slate-800 p-3.5 sm:p-4 rounded-xl border-l-4 border-l-amber-500">
                  <div className="text-xs uppercase font-extrabold text-slate-400">Defense / Reaction Trigger</div>
                  <p className="text-xs sm:text-sm font-semibold text-amber-200 mt-1">{effectiveActiveFlow.nodes[activeFlowNodeIndex].opponentDefenseTrigger}</p>
                </div>
                <div className="bg-slate-950/90 border border-slate-800 p-3.5 sm:p-4 rounded-xl border-l-4 border-l-emerald-500">
                  <div className="text-xs uppercase font-extrabold text-slate-400">Transition Cue</div>
                  <p className="text-xs sm:text-sm font-semibold text-emerald-200 mt-1">{effectiveActiveFlow.nodes[activeFlowNodeIndex].transitionCue}</p>
                </div>
              </div>
            )}
          </div>
        ) : activeHUDMode === 'warmup' ? (
          <div className="grid md:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-slate-900/90 border border-slate-800 p-3.5 sm:p-4 rounded-2xl border-l-4 border-l-orange-500 shadow-md">
              <div className="text-xs uppercase font-extrabold text-slate-400">Warm-Up Activity</div>
              <div className="text-base sm:text-lg font-black text-white mt-0.5">{currentWarmUp.warmUpName}</div>
              <p className="text-xs text-slate-300 mt-1">{currentWarmUp.description}</p>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-3.5 sm:p-4 rounded-2xl border-l-4 border-l-amber-500 shadow-md">
              <div className="text-xs uppercase font-extrabold text-slate-400">Game Rules</div>
              <p className="text-xs sm:text-sm font-semibold text-slate-100 mt-1.5">{currentWarmUp.gameRules || 'Standard movement rules.'}</p>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-3.5 sm:p-4 rounded-2xl border-l-4 border-l-rose-500 shadow-md">
              <div className="text-xs uppercase font-extrabold text-slate-400">Constraints</div>
              <p className="text-xs sm:text-sm font-semibold text-slate-100 mt-1.5">{currentWarmUp.constraints || 'No additional constraints.'}</p>
            </div>
          </div>
        ) : activeHUDMode === 'drill' ? (
          <div className="grid md:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-slate-900/90 border border-slate-800 p-3.5 sm:p-4 rounded-2xl border-l-4 border-l-emerald-500 shadow-md">
              <div className="text-xs uppercase font-extrabold text-slate-400">Drill Name & Goal</div>
              <div className="text-base sm:text-lg font-black text-white mt-0.5">{currentDrill.drillName}</div>
              <p className="text-xs sm:text-sm font-medium text-slate-200 mt-1">{currentDrill.primaryGoal}</p>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-3.5 sm:p-4 rounded-2xl border-l-4 border-l-amber-500 shadow-md">
              <div className="text-xs uppercase font-extrabold text-slate-400">Drill Constraints</div>
              <p className="text-xs sm:text-sm font-semibold text-slate-100 mt-1.5">{currentDrill.drillConstraints}</p>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-3.5 sm:p-4 rounded-2xl border-l-4 border-l-rose-500 shadow-md">
              <div className="text-xs uppercase font-extrabold text-slate-400">Immediate Reset Condition</div>
              <p className="text-xs sm:text-sm font-semibold text-slate-100 mt-1.5">{currentDrill.immediateReset}</p>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/90 border border-slate-800 p-5 sm:p-6 rounded-2xl text-center border-l-4 border-l-indigo-500 shadow-md">
            <h3 className="text-lg sm:text-xl font-black text-indigo-400 uppercase tracking-wider">Live Rounds in Progress</h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">Full situational or open sparring rounds according to class belt regulations.</p>
          </div>
        )}
      </footer>
    </main>
  );
}