'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Loader2, Sparkles, Send, Users, Edit3, Trash2, PlusCircle, LogIn, X, FolderPlus,
  ExternalLink, Play, Plus, Clock, Volume2, ShieldCheck, ChevronDown, CheckCircle2,
  Calendar as CalendarIcon
} from 'lucide-react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// --- TYPE IMPORTS ---
import { 
  Instructor, LocalTrack, FlowNode, FlowRoutine, WarmUp, Drill, 
  LessonPlan, ClassTemplate, ScheduledClass, ChatMessage 
} from './types';

// --- COMPONENT IMPORTS ---
import { Navigation } from './components/Navigation';
import { MatTimerView } from './components/MatTimerView';
import { LessonBuilderView } from './components/LessonBuilderView';
import { CurriculumHubView } from './components/CurriculumHubView';
import { FlowChainsView } from './components/FlowChainsView';
import { CalendarView } from './components/CalendarView';
import { SearchableLessonPicker } from './components/SearchableLessonPicker';

// --- DATA IMPORTS ---
import { 
  BASELINE_CONCEPTS, BASELINE_WARMUPS, BASELINE_FLOWS, PREBAKED_LESSONS, 
  INITIAL_INSTRUCTORS_SEED, INITIAL_CLASS_TEMPLATES_SEED 
} from './data/curriculumData';

// --- SUPABASE CLIENT INITIALIZATION ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
const supabase: SupabaseClient | null = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

// --- UTILITY FUNCTIONS ---
function formatDateKey(d: Date): string {
  const y = d.getFullYear(); const m = String(d.getMonth() + 1).padStart(2, '0'); const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getMondayOfWeek(d: Date): Date {
  const date = new Date(d); const day = date.getDay(); const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
}

export default function SubCadenceApp() {
  const [activeTab, setActiveTab] = useState<'mat' | 'builder' | 'community' | 'flows' | 'calendar' | 'chat' | 'academy' | 'profile'>('community');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentInstructor, setCurrentInstructor] = useState<Instructor | null>(INITIAL_INSTRUCTORS_SEED[0]);
  const [instructors, setInstructors] = useState<Instructor[]>(INITIAL_INSTRUCTORS_SEED);
  const [academyName, setAcademyName] = useState('Pacific Training Academy');

  // Audio State
  const [musicSource, setMusicSource] = useState<'local' | 'spotify' | 'apple'>('local');
  const [localPlaylist, setLocalPlaylist] = useState<LocalTrack[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.7);
  const [isMusicDeckOpen, setIsMusicDeckOpen] = useState(false);
  const localAudioRef = useRef<HTMLAudioElement | null>(null);

  // Modals & Forms
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [userFormData, setUserFormData] = useState<Instructor>({ id: '', username: '', password: '', name: '', email: '', role: 'instructor', rank: 'Blue Belt', bio: '' });

  // Hub & Library State
  const [coreConcepts, setCoreConcepts] = useState<string[]>(BASELINE_CONCEPTS);
  const [warmUpPresets, setWarmUpPresets] = useState<WarmUp[]>(BASELINE_WARMUPS);
  const [classTemplates, setClassTemplates] = useState<ClassTemplate[]>(INITIAL_CLASS_TEMPLATES_SEED);
  const [isNewConceptModalOpen, setIsNewConceptModalOpen] = useState(false);
  const [newConceptInput, setNewConceptInput] = useState('');
  const [hubSection, setHubSection] = useState<'lessons' | 'warmups'>('lessons');
  const [isNewWarmUpModalOpen, setIsNewWarmUpModalOpen] = useState(false);
  const [newWarmUpForm, setNewWarmUpForm] = useState<WarmUp>({
    warmUpName: '', type: 'game', description: '', gameRules: '', constraints: '', goals: '', roundCount: 3, roundTimeSeconds: 90, restTimeSeconds: 20, isCustom: true
  });
  
  // Flow State
  const [flowLibrary, setFlowLibrary] = useState<FlowRoutine[]>(BASELINE_FLOWS);
  const [activeFlowInStudio, setActiveFlowInStudio] = useState<FlowRoutine>(() => BASELINE_FLOWS[0]);
  const [isEditingExistingFlow, setIsEditingExistingFlow] = useState(false);

  // Mat HUD Timer State
  const [activeHUDMode, setActiveHUDMode] = useState<'warmup' | 'flow' | 'drill' | 'live'>('warmup');
  const [activeLoadedFlow, setActiveLoadedFlow] = useState<FlowRoutine | null>(() => BASELINE_FLOWS[0]);
  const [activeFlowNodeIndex, setActiveFlowNodeIndex] = useState(0);
  const [alarmType, setAlarmType] = useState<'bell' | 'beep'>('bell');
  const [volume, setVolume] = useState<number>(0.8);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(300);
  const [isActive, setIsActive] = useState(false);
  const [isRest, setIsRest] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [activeDrillIndex, setActiveDrillIndex] = useState(0);

  // Calendar State
  const [calendarAnchorDate, setCalendarAnchorDate] = useState<Date>(() => new Date());
  const [schedule, setSchedule] = useState<ScheduledClass[]>(() => {
    const monday = getMondayOfWeek(new Date());
    return [{ id: 'sch-1', dateStr: formatDateKey(monday), time: '06:00 PM', title: 'Adult Fundamental Gi', ageGroup: 'Adults', durationMinutes: 60, assignedInstructorId: 'inst-1', assignedLessonId: 'plan-w1-d1-adults', postClassNotes: '', modificationsSuggested: '' }];
  });
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false);
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
  const [targetDateForNewClass, setTargetDateForNewClass] = useState<string>(formatDateKey(new Date()));
  const [selectedTemplateForNewClass, setSelectedTemplateForNewClass] = useState<string>(INITIAL_CLASS_TEMPLATES_SEED[0]?.id || '');
  const [newClassTime, setNewClassTime] = useState('06:00 PM');
  const [newClassInstructorId, setNewClassInstructorId] = useState('inst-1');
  const [newClassLessonId, setNewClassLessonId] = useState('');
  const [templateFormData, setTemplateFormData] = useState<ClassTemplate>({ id: '', name: '', ageGroup: 'Adults', durationMinutes: 60 });
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);

  // Builder State
  const [plans, setPlans] = useState<LessonPlan[]>(PREBAKED_LESSONS);
  const [selectedPlan, setSelectedPlan] = useState<LessonPlan>(PREBAKED_LESSONS[0]);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [targetClassId, setTargetClassId] = useState<string>('');
  const [tagInput, setTagInput] = useState('');
  const [builderForm, setBuilderForm] = useState<Omit<LessonPlan, 'id' | 'authorInstructorId' | 'authorName'>>({
    className: '', concept: BASELINE_CONCEPTS[0], ageGroup: 'Adults', beltRank: 'White Belt', totalDurationMinutes: 60, tags: ['Fundamentals'], isPublic: false,
    warmUp: BASELINE_WARMUPS[0], flow: null, drills: [{ id: 'drill-1', drillName: '', drillConstraints: '', primaryGoal: '', immediateReset: '', roundCount: 4, roundTimeSeconds: 120, restTimeSeconds: 30 }],
    liveRounds: { roundCount: 5, roundTimeSeconds: 300, restTimeSeconds: 60 }
  });

  // Hub Filtering
  const [hubSearchTerm, setHubSearchTerm] = useState('');
  const [selectedHubTag, setSelectedHubTag] = useState<string | null>(null);
  const [collapsedConcepts, setCollapsedConcepts] = useState<Record<string, boolean>>({});

  // AI Chat State
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'assistant', content: 'Oss Coach! I am your SubCadence AI Black Belt assistant. Ask me anything about lesson designs, flow routines, or class pacing.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatSending, setIsChatSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- HARDWARE SCREEN WAKE LOCK (PREVENTS TABLET SLEEP ON MAT) ---
  useEffect(() => {
    let wakeLock: any = null;

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator && isActive) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        }
      } catch (err) {
        console.warn('Wake Lock request failed:', err);
      }
    };

    if (isActive) {
      requestWakeLock();
    } else if (wakeLock) {
      wakeLock.release().then(() => {
        wakeLock = null;
      });
    }

    return () => {
      if (wakeLock) wakeLock.release();
    };
  }, [isActive]);

  // --- AUTO SCROLL CHAT ---
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatSending]);

  // --- DERIVED PACING LOGIC ---
  const warmUpMinutes = Math.round((builderForm.warmUp.roundCount * (builderForm.warmUp.roundTimeSeconds + builderForm.warmUp.restTimeSeconds)) / 60);
  const flowMinutes = builderForm.flow ? Math.round((builderForm.flow.roundCount * (builderForm.flow.roundTimeSeconds + builderForm.flow.restTimeSeconds)) / 60) : 0;
  const drillsMinutes = builderForm.drills.reduce((acc, d) => acc + Math.round((d.roundCount * (d.roundTimeSeconds + d.restTimeSeconds)) / 60), 0);
  const liveRoundsMinutes = Math.round((builderForm.liveRounds.roundCount * (builderForm.liveRounds.roundTimeSeconds + builderForm.liveRounds.restTimeSeconds)) / 60);
  const totalPlannedMinutes = warmUpMinutes + flowMinutes + drillsMinutes + liveRoundsMinutes;
  const targetClass = schedule.find(s => s.id === targetClassId);
  const targetDuration = targetClass ? targetClass.durationMinutes : builderForm.totalDurationMinutes;
  const pacingDifference = targetDuration - totalPlannedMinutes;

  // --- SUPABASE BULLETPROOF SYNC ENGINE ---
  useEffect(() => {
    if (!supabase) return;

    async function syncAndSeedSupabase() {
      try {
        // 1. LESSONS (With Bulletproof Mapping)
        const { data: lessonData } = await supabase!.from('lessons').select('*');
        if (!lessonData || lessonData.length === 0) {
          const dbLessons = PREBAKED_LESSONS.map(p => ({
            id: p.id, class_name: p.className, concept: p.concept, age_group: p.ageGroup, belt_rank: p.beltRank,
            total_duration_minutes: p.totalDurationMinutes, tags: p.tags, warm_up: p.warmUp, flow: p.flow,
            drills: p.drills, live_rounds: p.liveRounds, is_public: p.isPublic, author_id: p.authorInstructorId, author_name: p.authorName
          }));
          await supabase!.from('lessons').insert(dbLessons);
        } else {
          const remotePlans = lessonData.map((item: any) => ({
            id: item.id || `fallback-${Date.now()}`,
            className: item.class_name || 'Unnamed Lesson', 
            concept: item.concept || 'Uncategorized', 
            ageGroup: item.age_group || 'Adults', 
            beltRank: item.belt_rank || 'All Belts',
            totalDurationMinutes: item.total_duration_minutes || 60, 
            tags: item.tags || [], 
            warmUp: item.warm_up || BASELINE_WARMUPS[0], 
            flow: item.flow || null,
            drills: item.drills || [], 
            liveRounds: item.live_rounds || { roundCount: 5, roundTimeSeconds: 300, restTimeSeconds: 60 }, 
            isPublic: item.is_public || false, 
            authorInstructorId: item.author_id || 'inst-1', 
            authorName: item.author_name || 'Coach'
          }));
          setPlans(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const fresh = remotePlans.filter((r: any) => !existingIds.has(r.id));
            return [...fresh, ...prev];
          });
        }

        // 2. FLOW CHAINS (With Bulletproof Mapping)
        const { data: flowData } = await supabase!.from('flow_routines').select('*');
        if (!flowData || flowData.length === 0) {
          const dbFlows = BASELINE_FLOWS.map(f => ({
            id: f.id, title: f.title, concept: f.concept, starting_position: f.startingPosition,
            round_count: f.roundCount, round_time_seconds: f.roundTimeSeconds, rest_time_seconds: f.restTimeSeconds,
            nodes: f.nodes, is_public: f.isPublic
          }));
          await supabase!.from('flow_routines').insert(dbFlows);
        } else {
          const remoteFlows = flowData.map((item: any) => ({
            id: item.id || `flow-${Date.now()}`, 
            title: item.title || 'Unnamed Flow', 
            concept: item.concept || 'Uncategorized', 
            startingPosition: item.starting_position || 'Open Guard',
            roundCount: item.round_count || 4, 
            roundTimeSeconds: item.round_time_seconds || 180, 
            restTimeSeconds: item.rest_time_seconds || 30,
            nodes: item.nodes || [], 
            isPublic: item.is_public || false
          }));
          setFlowLibrary(prev => {
            const existingIds = new Set(prev.map(f => f.id));
            const fresh = remoteFlows.filter((r: any) => !existingIds.has(r.id));
            return [...fresh, ...prev];
          });
        }

        // 3. WARM-UPS (With Bulletproof Mapping)
        const { data: warmupData } = await supabase!.from('warmup_presets').select('*');
        if (!warmupData || warmupData.length === 0) {
          const dbWarmups = BASELINE_WARMUPS.map(w => ({
            id: w.id, warm_up_name: w.warmUpName, type: w.type, description: w.description,
            game_rules: w.gameRules, constraints: w.constraints, goals: w.goals,
            round_count: w.roundCount, round_time_seconds: w.roundTimeSeconds, rest_time_seconds: w.restTimeSeconds, is_custom: w.isCustom
          }));
          await supabase!.from('warmup_presets').insert(dbWarmups);
        } else {
          const remoteWarmups = warmupData.map((item: any) => ({
            id: item.id || `wu-${Date.now()}`, 
            warmUpName: item.warm_up_name || 'Unnamed Warmup', 
            type: item.type || 'general', 
            description: item.description || '',
            gameRules: item.game_rules || '', 
            constraints: item.constraints || '', 
            goals: item.goals || '',
            roundCount: item.round_count || 1, 
            roundTimeSeconds: item.round_time_seconds || 300, 
            restTimeSeconds: item.rest_time_seconds || 30, 
            isCustom: item.is_custom || true
          }));
          setWarmUpPresets(prev => {
            const existingIds = new Set(prev.map(w => w.id));
            const fresh = remoteWarmups.filter((r: any) => !existingIds.has(r.id));
            return [...fresh, ...prev];
          });
        }

        // 4. INSTRUCTORS
        const { data: instructorData } = await supabase!.from('instructors').select('*');
        if (!instructorData || instructorData.length === 0) {
          await supabase!.from('instructors').insert(INITIAL_INSTRUCTORS_SEED);
        } else {
          setInstructors(instructorData);
        }

      } catch (err) {
        console.warn('Supabase sync/seed error. Using local fallbacks.', err);
      }
    }
    
    syncAndSeedSupabase();
  }, []);

  // --- AUDIO & TIMER ENGINE ---
  const audioContextRef = useRef<AudioContext | null>(null);
  const getAudioContext = () => {
    if (typeof window === 'undefined') return null;
    if (!audioContextRef.current) { const AudioCtx = window.AudioContext || (window as any).webkitAudioContext; audioContextRef.current = new AudioCtx(); }
    if (audioContextRef.current.state === 'suspended') audioContextRef.current.resume();
    return audioContextRef.current;
  };
  useEffect(() => {
    const handleFocus = () => { if (audioContextRef.current && audioContextRef.current.state === 'suspended') audioContextRef.current.resume(); };
    window.addEventListener('focus', handleFocus); document.addEventListener('visibilitychange', handleFocus);
    return () => { window.removeEventListener('focus', handleFocus); document.removeEventListener('visibilitychange', handleFocus); };
  }, []);

  const playSoundTone = (phase: 'start' | 'rest') => {
    if (typeof window === 'undefined' || volume === 0) return;
    try {
      const audioCtx = getAudioContext();
      if (!audioCtx) return;
      if (localAudioRef.current && isMusicPlaying) {
        localAudioRef.current.volume = Math.max(0.05, musicVolume * 0.2);
        setTimeout(() => { if (localAudioRef.current) localAudioRef.current.volume = musicVolume; }, 2200);
      }
      if (alarmType === 'bell') {
        if (phase === 'start') {
          const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
          osc.type = 'sine'; osc.frequency.setValueAtTime(400, audioCtx.currentTime);
          gain.gain.setValueAtTime(volume, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2.0);
          osc.connect(gain); gain.connect(audioCtx.destination); osc.start(); osc.stop(audioCtx.currentTime + 2.0);
        } else {
          [0, 0.4, 0.8].forEach((delay) => {
            const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
            osc.type = 'sine'; osc.frequency.setValueAtTime(550, audioCtx.currentTime + delay);
            gain.gain.setValueAtTime(volume, audioCtx.currentTime + delay); gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delay + 0.35);
            osc.connect(gain); gain.connect(audioCtx.destination); osc.start(audioCtx.currentTime + delay); osc.stop(audioCtx.currentTime + delay + 0.35);
          });
        }
      } else {
        if (phase === 'start') {
          const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
          osc.type = 'sawtooth'; osc.frequency.setValueAtTime(800, audioCtx.currentTime);
          gain.gain.setValueAtTime(volume * 0.4, audioCtx.currentTime); gain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 2.0);
          osc.connect(gain); gain.connect(audioCtx.destination); osc.start(); osc.stop(audioCtx.currentTime + 2.0);
        } else {
          [0, 0.25, 0.5].forEach((delay) => {
            const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
            osc.type = 'square'; osc.frequency.setValueAtTime(950, audioCtx.currentTime + delay);
            gain.gain.setValueAtTime(volume * 0.3, audioCtx.currentTime + delay); gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delay + 0.15);
            osc.connect(gain); gain.connect(audioCtx.destination); osc.start(audioCtx.currentTime + delay); osc.stop(audioCtx.currentTime + delay + 0.15);
          });
        }
      }
    } catch (err) {}
  };

  const handleLocalFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files; if (!files || files.length === 0) return;
    const newTracks: LocalTrack[] = Array.from(files).map((f: File) => ({ id: `track-${Date.now()}`, name: f.name.replace(/\.[^/.]+$/, ''), fileUrl: URL.createObjectURL(f) }));
    setLocalPlaylist(prev => [...prev, ...newTracks]);
    if (localPlaylist.length === 0) setCurrentTrackIndex(0);
  };
  const toggleMusicPlayback = () => {
    if (!localAudioRef.current) return;
    if (isMusicPlaying) { localAudioRef.current.pause(); setIsMusicPlaying(false); } else { localAudioRef.current.play().then(() => setIsMusicPlaying(true)).catch(() => {}); }
  };
  const skipTrack = (direction: 'next' | 'prev') => {
    if (localPlaylist.length === 0) return;
    let nextIdx = direction === 'next' ? currentTrackIndex + 1 : currentTrackIndex - 1;
    if (nextIdx >= localPlaylist.length) nextIdx = 0; if (nextIdx < 0) nextIdx = localPlaylist.length - 1;
    setCurrentTrackIndex(nextIdx); setIsMusicPlaying(true);
  };
  const restartTrack = () => { if (!localAudioRef.current) return; localAudioRef.current.currentTime = 0; localAudioRef.current.play(); setIsMusicPlaying(true); };
  
  useEffect(() => { if (localAudioRef.current) localAudioRef.current.volume = musicVolume; }, [musicVolume]);
  useEffect(() => { if (localAudioRef.current && localPlaylist[currentTrackIndex]) { localAudioRef.current.src = localPlaylist[currentTrackIndex].fileUrl; if (isMusicPlaying) localAudioRef.current.play().catch(() => {}); } }, [currentTrackIndex, localPlaylist]);

  const currentWarmUp: WarmUp = selectedPlan?.warmUp || BASELINE_WARMUPS[0];
  const currentDrill: Drill = (selectedPlan?.drills && selectedPlan.drills[activeDrillIndex]) || { id: 'd-fallback', drillName: 'Positional Drill', drillConstraints: 'Active work', primaryGoal: 'Win position', immediateReset: 'Reset upon score', roundCount: 4, roundTimeSeconds: 120, restTimeSeconds: 30 };
  const effectiveActiveFlow = selectedPlan?.flow || activeLoadedFlow;

  const maxRounds: number = activeHUDMode === 'flow' && effectiveActiveFlow ? effectiveActiveFlow.roundCount : activeHUDMode === 'warmup' ? currentWarmUp.roundCount : activeHUDMode === 'drill' ? currentDrill.roundCount : selectedPlan?.liveRounds?.roundCount || 5;
  const workDuration: number = activeHUDMode === 'flow' && effectiveActiveFlow ? effectiveActiveFlow.roundTimeSeconds : activeHUDMode === 'warmup' ? currentWarmUp.roundTimeSeconds : activeHUDMode === 'drill' ? currentDrill.roundTimeSeconds : selectedPlan?.liveRounds?.roundTimeSeconds || 300;
  const restDuration: number = activeHUDMode === 'flow' && effectiveActiveFlow ? effectiveActiveFlow.restTimeSeconds : activeHUDMode === 'warmup' ? currentWarmUp.restTimeSeconds : activeHUDMode === 'drill' ? currentDrill.restTimeSeconds : selectedPlan?.liveRounds?.restTimeSeconds || 60;

  // --- TIMER PROGRESSION ENGINE (WITH AUTO-ADVANCE) ---
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => setSecondsLeft(prev => prev - 1), 1000);
    } else if (isActive && secondsLeft === 0) {
      if (!isRest && restDuration > 0) { 
        playSoundTone('rest'); 
        setIsRest(true); 
        setSecondsLeft(restDuration); 
      } else {
        playSoundTone('start'); 
        setIsRest(false);
        if (currentRound < maxRounds) { 
          setCurrentRound(prev => prev + 1); 
          setSecondsLeft(workDuration); 
        } else {
          // Automatic Stage Progression
          if (activeHUDMode === 'warmup') {
            if (selectedPlan?.flow) {
              setActiveHUDMode('flow');
              setCurrentRound(1);
              setSecondsLeft(selectedPlan.flow.roundTimeSeconds);
              setIsActive(false);
            } else if (selectedPlan?.drills && selectedPlan.drills.length > 0) {
              setActiveHUDMode('drill');
              setActiveDrillIndex(0);
              setCurrentRound(1);
              setSecondsLeft(selectedPlan.drills[0].roundTimeSeconds);
              setIsActive(false);
            } else if (selectedPlan?.liveRounds) {
              setActiveHUDMode('live');
              setCurrentRound(1);
              setSecondsLeft(selectedPlan.liveRounds.roundTimeSeconds);
              setIsActive(false);
            }
          } else if (activeHUDMode === 'flow' && selectedPlan?.drills && selectedPlan.drills.length > 0) {
            setActiveHUDMode('drill');
            setActiveDrillIndex(0);
            setCurrentRound(1);
            setSecondsLeft(selectedPlan.drills[0].roundTimeSeconds);
            setIsActive(false);
          } else if (activeHUDMode === 'drill' && selectedPlan?.drills && activeDrillIndex < selectedPlan.drills.length - 1) {
            const nextIdx = activeDrillIndex + 1;
            setActiveDrillIndex(nextIdx);
            setCurrentRound(1);
            setSecondsLeft(selectedPlan.drills[nextIdx].roundTimeSeconds);
            setIsActive(false);
          } else if (activeHUDMode === 'drill' && selectedPlan?.liveRounds) {
            setActiveHUDMode('live');
            setCurrentRound(1);
            setSecondsLeft(selectedPlan.liveRounds.roundTimeSeconds);
            setIsActive(false);
          } else {
            setIsActive(false); 
            setCurrentRound(1); 
            setSecondsLeft(workDuration); 
          }
        }
      }
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isActive, secondsLeft, isRest, currentRound, activeHUDMode, activeDrillIndex, maxRounds, workDuration, restDuration, selectedPlan]);

  // --- DISPATCH HANDLERS & WRITES TO SUPABASE ---
  const handleHUDTargetChange = (type: 'warmup' | 'flow' | 'drill' | 'live', drillIdx: number = 0) => { setIsActive(false); setIsRest(false); setCurrentRound(1); setActiveHUDMode(type); if (type === 'warmup') setSecondsLeft(selectedPlan?.warmUp?.roundTimeSeconds || 180); else if (type === 'flow' && effectiveActiveFlow) { setSecondsLeft(effectiveActiveFlow.roundTimeSeconds); setActiveFlowNodeIndex(0); } else if (type === 'drill' && selectedPlan?.drills?.[drillIdx]) { setActiveDrillIndex(drillIdx); setSecondsLeft(selectedPlan.drills[drillIdx].roundTimeSeconds); } else setSecondsLeft(selectedPlan?.liveRounds?.roundTimeSeconds || 300); };
  const adjustHUDTimer = (field: 'rounds' | 'work' | 'rest', delta: number) => { if (activeHUDMode === 'flow' && effectiveActiveFlow) { const curFlow = { ...effectiveActiveFlow }; if (field === 'work') { curFlow.roundTimeSeconds = Math.max(15, curFlow.roundTimeSeconds + delta); if (!isRest) setSecondsLeft(prev => Math.max(1, prev + delta)); } if (field === 'rest') { curFlow.restTimeSeconds = Math.max(0, curFlow.restTimeSeconds + delta); if (isRest) setSecondsLeft(prev => Math.max(1, prev + delta)); } if (selectedPlan?.flow) setSelectedPlan({ ...selectedPlan, flow: curFlow }); else setActiveLoadedFlow(curFlow); } };
  const formatTime = (secs: number) => { const mins = Math.floor(secs / 60); const rem = secs % 60; return `${mins}:${rem < 10 ? '0' : ''}${rem}`; };

  const loadPlanToMat = (plan: LessonPlan) => { setSelectedPlan(plan); setActiveHUDMode('warmup'); setActiveDrillIndex(0); setCurrentRound(1); setIsActive(false); setIsRest(false); setSecondsLeft(plan?.warmUp?.roundTimeSeconds || 180); setActiveTab('mat'); };
  const launchFlowToMat = (flow: FlowRoutine) => { setActiveLoadedFlow(flow); setActiveHUDMode('flow'); setActiveFlowNodeIndex(0); setCurrentRound(1); setIsActive(false); setIsRest(false); setSecondsLeft(flow.roundTimeSeconds); setActiveTab('mat'); };
  const launchWarmUpOnly = (warmUp: WarmUp) => { loadPlanToMat({ id: `standalone-${Date.now()}`, className: `Warm-Up: ${warmUp.warmUpName}`, concept: 'Movement & Mobility', ageGroup: 'All Levels', beltRank: 'All Ranks', totalDurationMinutes: Math.ceil((warmUp.roundCount * (warmUp.roundTimeSeconds + warmUp.restTimeSeconds)) / 60), tags: ['Warm-Up', warmUp.type], warmUp: { ...warmUp }, drills: [], liveRounds: { roundCount: 0, roundTimeSeconds: 0, restTimeSeconds: 0 }, isPublic: true, authorInstructorId: currentInstructor?.id || 'inst-1', authorName: currentInstructor?.name || 'Coach' }); };
  
  const handleSaveLessonPlan = async (isNewClone: boolean, andSchedule: boolean = false) => { 
    if (!currentInstructor) { setIsLoginModalOpen(true); return; } 
    const planId = (editingLessonId && !isNewClone) ? editingLessonId : `plan-${Date.now()}`; 
    const newOrUpdatedPlan: LessonPlan = { ...builderForm, id: planId, className: isNewClone ? `${builderForm.className} (Copy)` : builderForm.className, authorInstructorId: currentInstructor.id, authorName: currentInstructor.name }; 
    
    // Write to Local State
    if (editingLessonId && !isNewClone) setPlans(plans.map(p => p.id === editingLessonId ? newOrUpdatedPlan : p)); else setPlans([newOrUpdatedPlan, ...plans]); 
    
    // Write to Supabase
    if (supabase) {
      const dbPayload = { id: newOrUpdatedPlan.id, class_name: newOrUpdatedPlan.className, concept: newOrUpdatedPlan.concept, age_group: newOrUpdatedPlan.ageGroup, belt_rank: newOrUpdatedPlan.beltRank, total_duration_minutes: newOrUpdatedPlan.totalDurationMinutes, tags: newOrUpdatedPlan.tags, warm_up: newOrUpdatedPlan.warmUp, flow: newOrUpdatedPlan.flow, drills: newOrUpdatedPlan.drills, live_rounds: newOrUpdatedPlan.liveRounds, is_public: newOrUpdatedPlan.isPublic, author_id: newOrUpdatedPlan.authorInstructorId, author_name: newOrUpdatedPlan.authorName };
      await supabase.from('lessons').upsert(dbPayload);
    }

    if (andSchedule) { setSelectedTemplateForNewClass(classTemplates[0]?.id || ''); setNewClassLessonId(newOrUpdatedPlan.id); setIsAddClassModalOpen(true); } 
    else { loadPlanToMat(newOrUpdatedPlan); setEditingLessonId(null); }
  };

  const handleEditLessonFromHub = (plan: LessonPlan) => { setEditingLessonId(plan.id); setBuilderForm({ ...plan }); const scheduledMatch = schedule.find(s => s.assignedLessonId === plan.id); if (scheduledMatch) setTargetClassId(scheduledMatch.id); setActiveTab('builder'); };
  const handleOpenScheduleForLesson = (lessonId: string) => { setNewClassLessonId(lessonId); setTargetDateForNewClass(formatDateKey(new Date())); setSelectedTemplateForNewClass(classTemplates[0]?.id || ''); setIsAddClassModalOpen(true); };
  
  const addFlowNode = () => setActiveFlowInStudio({ ...activeFlowInStudio, nodes: [...activeFlowInStudio.nodes, { id: `fn-${Date.now()}`, techniqueName: '', opponentDefenseTrigger: '', transitionCue: '' }] });
  const updateFlowNode = (idx: number, field: keyof FlowNode, val: string) => { const newNodes = [...activeFlowInStudio.nodes]; newNodes[idx] = { ...newNodes[idx], [field]: val }; setActiveFlowInStudio({ ...activeFlowInStudio, nodes: newNodes }); };
  const removeFlowNode = (id: string) => setActiveFlowInStudio({ ...activeFlowInStudio, nodes: activeFlowInStudio.nodes.filter(n => n.id !== id) });
  
  const handleSaveFlowRoutine = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    const finalFlow = isEditingExistingFlow ? activeFlowInStudio : { ...activeFlowInStudio, id: `flow-${Date.now()}` };
    
    // Write Local
    if (isEditingExistingFlow) setFlowLibrary(flowLibrary.map(f => f.id === finalFlow.id ? finalFlow : f)); else setFlowLibrary([...flowLibrary, finalFlow]); 
    
    // Write Supabase
    if (supabase) {
      await supabase.from('flow_routines').upsert({ id: finalFlow.id, title: finalFlow.title, concept: finalFlow.concept, starting_position: finalFlow.startingPosition, round_count: finalFlow.roundCount, round_time_seconds: finalFlow.roundTimeSeconds, rest_time_seconds: finalFlow.restTimeSeconds, nodes: finalFlow.nodes, is_public: finalFlow.isPublic });
    }

    setActiveFlowInStudio(BASELINE_FLOWS[0]); setIsEditingExistingFlow(false); setActiveTab('flows'); 
  };
  
  const handleDeleteFlow = async (id: string) => { 
    setFlowLibrary(flowLibrary.filter(f => f.id !== id)); 
    if(supabase) await supabase.from('flow_routines').delete().eq('id', id);
  };

  // Calendar Actions
  const currentWeekMonday = getMondayOfWeek(calendarAnchorDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => { const d = new Date(currentWeekMonday); d.setDate(currentWeekMonday.getDate() + i); return d; });
  const shiftWeek = (offsetWeeks: number) => { const nextDate = new Date(calendarAnchorDate); nextDate.setDate(calendarAnchorDate.getDate() + offsetWeeks * 7); setCalendarAnchorDate(nextDate); };
  
  const updateScheduledClass = async (classId: string, updates: Partial<ScheduledClass>) => { 
    setSchedule(schedule.map(sc => (sc.id === classId ? { ...sc, ...updates } : sc))); 
    if(supabase) {
      const target = schedule.find(s => s.id === classId);
      if(target) {
        const payload = { ...target, ...updates };
        await supabase.from('schedules').upsert({ id: payload.id, date_str: payload.dateStr, time: payload.time, title: payload.title, age_group: payload.ageGroup, duration_minutes: payload.durationMinutes, assigned_instructor_id: payload.assignedInstructorId, assigned_lesson_id: payload.assignedLessonId, post_class_notes: payload.postClassNotes, modifications_suggested: payload.modificationsSuggested });
      }
    }
  };

  const handleDeleteScheduledClass = async (id: string) => { 
    setSchedule(schedule.filter(s => s.id !== id)); 
    if(supabase) await supabase.from('schedules').delete().eq('id', id);
  };

  // Class Templates Actions
  const handleSaveClassTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateFormData.name.trim()) return;
    if (isEditingTemplate) {
      setClassTemplates(classTemplates.map(t => t.id === templateFormData.id ? templateFormData : t));
    } else {
      const newT: ClassTemplate = { ...templateFormData, id: `ct-${Date.now()}` };
      setClassTemplates([...classTemplates, newT]);
    }
    setTemplateFormData({ id: '', name: '', ageGroup: 'Adults', durationMinutes: 60 });
    setIsEditingTemplate(false);
  };

  const handleDeleteClassTemplate = (id: string) => {
    setClassTemplates(classTemplates.filter(t => t.id !== id));
  };

  // Schedule New Class Handler
  const handleScheduleNewClass = async (e: React.FormEvent) => {
    e.preventDefault();
    const template = classTemplates.find(t => t.id === selectedTemplateForNewClass) || classTemplates[0];
    const newClass: ScheduledClass = {
      id: `sch-${Date.now()}`,
      dateStr: targetDateForNewClass,
      time: newClassTime,
      title: template?.name || 'Scheduled Class',
      ageGroup: template?.ageGroup || 'Adults',
      durationMinutes: template?.durationMinutes || 60,
      assignedInstructorId: newClassInstructorId,
      assignedLessonId: newClassLessonId || null,
      postClassNotes: '',
      modificationsSuggested: ''
    };

    setSchedule([...schedule, newClass]);
    if (supabase) {
      await supabase.from('schedules').insert({
        id: newClass.id,
        date_str: newClass.dateStr,
        time: newClass.time,
        title: newClass.title,
        age_group: newClass.ageGroup,
        duration_minutes: newClass.durationMinutes,
        assigned_instructor_id: newClass.assignedInstructorId,
        assigned_lesson_id: newClass.assignedLessonId,
        post_class_notes: '',
        modifications_suggested: ''
      });
    }
    setIsAddClassModalOpen(false);
    setNewClassLessonId('');
  };

  // Warm-Up Preset Handler
  const handleCreateNewWarmUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const newWu: WarmUp = { ...newWarmUpForm, id: `wu-${Date.now()}`, isCustom: true };
    setWarmUpPresets([newWu, ...warmUpPresets]);
    if (supabase) {
      await supabase.from('warmup_presets').insert({
        id: newWu.id,
        warm_up_name: newWu.warmUpName,
        type: newWu.type,
        description: newWu.description,
        game_rules: newWu.gameRules,
        constraints: newWu.constraints,
        goals: newWu.goals,
        round_count: newWu.roundCount,
        round_time_seconds: newWu.roundTimeSeconds,
        rest_time_seconds: newWu.restTimeSeconds,
        is_custom: true
      });
    }
    setNewWarmUpForm({
      warmUpName: '', type: 'game', description: '', gameRules: '', constraints: '', goals: '', roundCount: 3, roundTimeSeconds: 90, restTimeSeconds: 20, isCustom: true
    });
    setIsNewWarmUpModalOpen(false);
  };

  // AI Lesson Generation Handler
  const handleAIGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concept: builderForm.concept,
          ageGroup: builderForm.ageGroup,
          beltRank: builderForm.beltRank,
          totalDurationMinutes: targetDuration,
        }),
      });
      if (!res.ok) throw new Error('Generation failed');
      const aiPlan = await res.json();
      const formattedDrills: Drill[] = (aiPlan.drills || []).map((d: Drill, idx: number) => ({
        ...d,
        id: `ai-drill-${Date.now()}-${idx}`,
      }));

      setBuilderForm((prev) => ({
        ...prev,
        className: aiPlan.className || prev.className,
        tags: aiPlan.tags || prev.tags,
        drills: formattedDrills.length > 0 ? formattedDrills : prev.drills,
        liveRounds: aiPlan.liveRounds || prev.liveRounds,
      }));
    } catch {
      alert('Failed to connect to the AI model.');
    } finally {
      setIsGenerating(false);
    }
  };

  // --- BULLETPROOF DATA FILTERING (No nulls allowed) ---
  const allUniqueTags: string[] = Array.from(new Set(plans.flatMap(p => p.tags || [])));
  
  const filteredPlans: LessonPlan[] = plans.filter(p => 
    ((p.className || '').toLowerCase().includes((hubSearchTerm || '').toLowerCase()) || 
     (p.concept || '').toLowerCase().includes((hubSearchTerm || '').toLowerCase())) && 
    (selectedHubTag ? (p.tags || []).includes(selectedHubTag) : true)
  );

  const filteredWarmUps: WarmUp[] = warmUpPresets.filter(wu => 
    (wu.warmUpName || '').toLowerCase().includes((hubSearchTerm || '').toLowerCase())
  );

  const allConceptKeys: string[] = Array.from(new Set([...coreConcepts, ...plans.map(p => p.concept || '')]));
  const plansByConcept: Record<string, LessonPlan[]> = allConceptKeys.reduce((acc: Record<string, LessonPlan[]>, concept: string) => {
    if(!concept) return acc;
    const matching = filteredPlans.filter(p => p.concept === concept);
    if (matching.length > 0 || (!hubSearchTerm && !selectedHubTag)) acc[concept] = matching;
    return acc;
  }, {});

  const canManageAcademy = currentInstructor?.role === 'owner' || currentInstructor?.role === 'manager';

  // ==========================================
  // RENDER UI
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      <audio ref={localAudioRef} onEnded={() => skipTrack('next')} className="hidden" />

      <Navigation 
        academyName={academyName} activeTab={activeTab} setActiveTab={setActiveTab}
        isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}
        isMusicDeckOpen={isMusicDeckOpen} setIsMusicDeckOpen={setIsMusicDeckOpen}
        isMusicPlaying={isMusicPlaying} setIsAudioModalOpen={setIsAudioModalOpen}
        currentInstructor={currentInstructor} setCurrentInstructor={setCurrentInstructor}
        setIsLoginModalOpen={setIsLoginModalOpen} setLoginError={setLoginError}
      />

      {activeTab === 'mat' && (
        <MatTimerView 
          isRest={isRest} isActive={isActive} activeHUDMode={activeHUDMode} selectedPlan={selectedPlan} effectiveActiveFlow={effectiveActiveFlow} 
          currentRound={currentRound} maxRounds={maxRounds} secondsLeft={secondsLeft} workDuration={workDuration} activeDrillIndex={activeDrillIndex} 
          activeFlowNodeIndex={activeFlowNodeIndex} currentWarmUp={currentWarmUp} currentDrill={currentDrill} musicSource={musicSource} localPlaylist={localPlaylist} 
          currentTrackIndex={currentTrackIndex} isMusicPlaying={isMusicPlaying} setMusicSource={setMusicSource} handleLocalFilesUpload={handleLocalFilesUpload} 
          restartTrack={restartTrack} skipTrack={skipTrack} toggleMusicPlayback={toggleMusicPlayback} playSoundTone={playSoundTone} setIsActive={setIsActive} setIsRest={setIsRest} 
          setSecondsLeft={setSecondsLeft} setCurrentRound={setCurrentRound} adjustHUDTimer={adjustHUDTimer} handleHUDTargetChange={handleHUDTargetChange} 
          setActiveFlowNodeIndex={setActiveFlowNodeIndex} formatTime={formatTime}
        />
      )}

      {activeTab === 'builder' && (
        <LessonBuilderView 
          editingLessonId={editingLessonId} setEditingLessonId={setEditingLessonId} builderForm={builderForm} setBuilderForm={setBuilderForm} 
          targetClassId={targetClassId} setTargetClassId={setTargetClassId} schedule={schedule} targetDuration={targetDuration} 
          totalPlannedMinutes={totalPlannedMinutes} pacingDifference={pacingDifference} warmUpMinutes={warmUpMinutes} flowMinutes={flowMinutes} drillsMinutes={drillsMinutes} liveRoundsMinutes={liveRoundsMinutes} 
          coreConcepts={coreConcepts} setIsNewConceptModalOpen={setIsNewConceptModalOpen} tagInput={tagInput} setTagInput={setTagInput} 
          handleAddTag={() => { if(tagInput) setBuilderForm({...builderForm, tags: [...builderForm.tags, tagInput]}); setTagInput(''); }} 
          handleRemoveTag={(t) => setBuilderForm({...builderForm, tags: builderForm.tags.filter(tag => tag !== t)})} 
          warmUpPresets={warmUpPresets} applyPresetWarmUp={(wu) => setBuilderForm({...builderForm, warmUp: wu})} 
          handleSaveCurrentWarmUpAsPreset={async () => {
            const newWu = { ...builderForm.warmUp, id: `wu-${Date.now()}`, isCustom: true };
            setWarmUpPresets([newWu, ...warmUpPresets]);
            if(supabase) await supabase.from('warmup_presets').insert({ id: newWu.id, warm_up_name: newWu.warmUpName, type: newWu.type, description: newWu.description, game_rules: newWu.gameRules, constraints: newWu.constraints, goals: newWu.goals, round_count: newWu.roundCount, round_time_seconds: newWu.roundTimeSeconds, rest_time_seconds: newWu.restTimeSeconds, is_custom: newWu.isCustom });
          }} 
          flowLibrary={flowLibrary} addDrillToForm={() => setBuilderForm({...builderForm, drills: [...builderForm.drills, { id: `d-${Date.now()}`, drillName: '', drillConstraints: '', primaryGoal: '', immediateReset: '', roundCount: 4, roundTimeSeconds: 120, restTimeSeconds: 30 }]})} 
          removeDrillFromForm={(id) => setBuilderForm({...builderForm, drills: builderForm.drills.filter(d => d.id !== id)})} 
          updateDrillField={(idx, field, val) => { const next = [...builderForm.drills]; next[idx] = { ...next[idx], [field]: val }; setBuilderForm({...builderForm, drills: next}); }} 
          handleSaveLessonPlan={handleSaveLessonPlan} isGenerating={isGenerating} handleAIGenerate={handleAIGenerate}
        />
      )}

      {activeTab === 'community' && (
        <CurriculumHubView 
          hubSection={hubSection} setHubSection={setHubSection} setIsNewConceptModalOpen={setIsNewConceptModalOpen} setIsNewWarmUpModalOpen={setIsNewWarmUpModalOpen} 
          hubSearchTerm={hubSearchTerm} setHubSearchTerm={setHubSearchTerm} selectedHubTag={selectedHubTag} setSelectedHubTag={setSelectedHubTag} 
          allUniqueTags={allUniqueTags} plansByConcept={plansByConcept} collapsedConcepts={collapsedConcepts} toggleConceptCollapse={(c) => setCollapsedConcepts({...collapsedConcepts, [c]: !collapsedConcepts[c]})} 
          handleEditLessonFromHub={handleEditLessonFromHub} handleOpenScheduleForLesson={handleOpenScheduleForLesson} 
          loadPlanToMat={loadPlanToMat} filteredWarmUps={filteredWarmUps} applyPresetWarmUp={(wu) => setBuilderForm({...builderForm, warmUp: wu})} setActiveTab={setActiveTab} launchWarmUpOnly={launchWarmUpOnly}
        />
      )}

      {activeTab === 'flows' && (
        <FlowChainsView 
          activeFlowInStudio={activeFlowInStudio} setActiveFlowInStudio={setActiveFlowInStudio} isEditingExistingFlow={isEditingExistingFlow} setIsEditingExistingFlow={setIsEditingExistingFlow} 
          handleSaveFlowRoutine={handleSaveFlowRoutine} addFlowNode={addFlowNode} updateFlowNode={updateFlowNode} removeFlowNode={removeFlowNode} 
          coreConcepts={coreConcepts} setIsNewConceptModalOpen={setIsNewConceptModalOpen} flowLibrary={flowLibrary} handleDeleteFlow={handleDeleteFlow} launchFlowToMat={launchFlowToMat}
        />
      )}

      {activeTab === 'calendar' && (
        <CalendarView 
          calendarAnchorDate={calendarAnchorDate} setCalendarAnchorDate={setCalendarAnchorDate} 
          setMonthAnchor={(val) => { const d = new Date(calendarAnchorDate); d.setMonth(val); setCalendarAnchorDate(d); }} 
          setYearAnchor={(val) => { const d = new Date(calendarAnchorDate); d.setFullYear(val); setCalendarAnchorDate(d); }} 
          shiftWeek={shiftWeek} currentWeekMonday={currentWeekMonday} weekDays={weekDays} schedule={schedule} 
          setSchedule={setSchedule} plans={plans} classTemplates={classTemplates} setIsTemplateManagerOpen={setIsTemplateManagerOpen} 
          openAddClassModalForDate={(d) => { setTargetDateForNewClass(d); setIsAddClassModalOpen(true); }} 
          updateScheduledClass={updateScheduledClass} handleEditLessonFromHub={handleEditLessonFromHub} 
          loadPlanToMat={loadPlanToMat} handleDeleteScheduledClass={handleDeleteScheduledClass} formatDateKey={formatDateKey}
        />
      )}

      {/* VIEW: CHAT ASSISTANT WITH REAL INTERACTIVE AI */}
      {activeTab === 'chat' && (
        <main className="flex-1 flex flex-col p-4 md:p-8 max-w-4xl mx-auto w-full">
          <div className="border-b border-slate-800 pb-4 mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles size={22} className="text-indigo-400" /> AI Black Belt Mat Consultant
            </h2>
            <p className="text-xs text-slate-400">Ask for positional dilemma fixes, constraints-led mini-games, or full lesson designs.</p>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 min-h-[400px]">
            {chatMessages.map((msg: ChatMessage) => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-black text-xs shrink-0">BB</div>
                )}
                <div className={`p-4 rounded-2xl max-w-xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none whitespace-pre-line'}`}>
                  {msg.content}

                  {msg.actionPayload?.action === 'POPULATE_LESSON' && msg.actionPayload.lessonData && (
                    <div className="mt-3 pt-3 border-t border-slate-800 flex justify-end">
                      <button
                        onClick={() => {
                          const lData = msg.actionPayload!.lessonData;
                          setEditingLessonId(null);
                          setBuilderForm((prev) => ({
                            ...prev,
                            className: lData.className || prev.className,
                            concept: lData.concept || prev.concept,
                            ageGroup: lData.ageGroup || prev.ageGroup,
                            beltRank: lData.beltRank || prev.beltRank,
                            totalDurationMinutes: lData.totalDurationMinutes || prev.totalDurationMinutes,
                            tags: lData.tags || prev.tags,
                            drills: (lData.drills || []).map((d: any, idx: number) => ({
                              ...d,
                              id: `ai-msg-drill-${Date.now()}-${idx}`
                            })),
                            liveRounds: lData.liveRounds || prev.liveRounds
                          }));
                          setActiveTab('builder');
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md"
                      >
                        <ExternalLink size={13} /> Load into Lesson Builder
                      </button>
                    </div>
                  )}

                  {msg.actionPayload?.action === 'CREATE_CONCEPT' && msg.actionPayload.conceptData?.conceptName && (
                    <div className="mt-3 pt-3 border-t border-slate-800 flex justify-end">
                      <button
                        onClick={() => {
                          const cName = msg.actionPayload!.conceptData!.conceptName;
                          if (!coreConcepts.includes(cName)) {
                            setCoreConcepts([...coreConcepts, cName]);
                            setBuilderForm((prev) => ({ ...prev, concept: cName }));
                            alert(`Concept "${cName}" added to academy curriculum!`);
                          }
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition shadow-md"
                      >
                        <FolderPlus size={13} /> Add Concept to Hub
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isChatSending && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-black text-xs">BB</div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-sm flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-indigo-400" /> Thinking...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form 
            onSubmit={async (e: React.FormEvent) => {
              e.preventDefault();
              const query = chatInput.trim();
              if (!query || isChatSending) return;

              const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content: query };
              const updatedMessages = [...chatMessages, userMsg];
              setChatMessages(updatedMessages);
              setChatInput('');
              setIsChatSending(true);

              try {
                const res = await fetch('/api/chat-assistant', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ messages: updatedMessages, activeConcepts: coreConcepts }),
                });

                const data = await res.json();
                const assistantMsg: ChatMessage = {
                  id: `a-${Date.now()}`,
                  role: 'assistant',
                  content: data.reply || 'Session processed.',
                  actionPayload: data.action ? {
                    action: data.action,
                    conceptData: data.conceptData,
                    lessonData: data.lessonData
                  } : undefined
                };
                setChatMessages((prev: ChatMessage[]) => [...prev, assistantMsg]);
              } catch {
                setChatMessages((prev: ChatMessage[]) => [...prev, { id: `err-${Date.now()}`, role: 'assistant', content: 'Connection issue. Could not reach AI service.' }]);
              } finally {
                setIsChatSending(false);
              }
            }} 
            className="flex gap-2"
          >
            <input 
              type="text" 
              placeholder="Ask AI Coach for drill ideas, counter transitions, or lesson pacing..." 
              value={chatInput} 
              onChange={(e) => setChatInput(e.target.value)} 
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500" 
            />
            <button type="submit" disabled={isChatSending} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-3 rounded-xl flex items-center gap-2 transition disabled:opacity-50"><Send size={16} />Ask</button>
          </form>
        </main>
      )}

      {/* VIEW: ACADEMY ROSTER & ROLES */}
      {activeTab === 'academy' && (
        <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full space-y-8">
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
            <h2 className="text-xl font-bold flex items-center gap-2"><Users size={20} className="text-emerald-400" />Academy Settings</h2>
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Academy Name</label>
                <input type="text" value={academyName} onChange={(e) => setAcademyName(e.target.value)} disabled={!canManageAcademy} className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm disabled:opacity-60" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Active Session User</label>
                <div className="mt-1 flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm">
                  <span className="font-semibold text-white">{currentInstructor ? `${currentInstructor.name} (${currentInstructor.role.toUpperCase()})` : 'Not Signed In'}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">Authorized Instructors & Staff</h3>
              </div>
              {canManageAcademy && (
                <button onClick={() => { setIsEditingUser(false); setUserFormData({ id: '', username: '', password: 'password123', name: '', email: '', role: 'instructor', rank: 'Purple Belt', bio: '' }); setIsUserModalOpen(true); }} className="flex items-center gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl"><PlusCircle size={15} /> Add User</button>
              )}
            </div>
            <div className="divide-y divide-slate-800">
              {instructors.map((inst: Instructor) => (
                <div key={inst.id} className="py-3.5 flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <div className="font-bold text-sm text-slate-100">{inst.name} <span className="text-xs font-normal text-slate-400">(@{inst.username})</span></div>
                    <div className="text-xs text-slate-400">{inst.email} • {inst.rank}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">{inst.role}</span>
                    {canManageAcademy && (
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setIsEditingUser(true); setUserFormData({ ...inst, password: inst.password || 'password123' }); setIsUserModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"><Edit3 size={15} /></button>
                        {inst.id !== currentInstructor?.id && <button onClick={() => { setInstructors(instructors.filter(i => i.id !== inst.id)) }} className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800"><Trash2 size={15} /></button>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* VIEW: INSTRUCTOR PROFILE */}
      {activeTab === 'profile' && currentInstructor && (
        <main className="flex-1 p-4 md:p-8 max-w-3xl mx-auto w-full space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-6">
            <div className="flex items-center gap-4 border-b border-slate-800 pb-5">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 font-black text-2xl flex items-center justify-center border border-emerald-500/30">
                {currentInstructor.name[0]}
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">{currentInstructor.name}</h2>
                <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                  <span>@{currentInstructor.username}</span> • <span>{currentInstructor.rank}</span> • <span className="uppercase font-bold text-emerald-400">{currentInstructor.role}</span>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Display Name</label>
                <input 
                  type="text" 
                  value={currentInstructor.name} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const updated = { ...currentInstructor, name: e.target.value };
                    setCurrentInstructor(updated);
                    setInstructors(instructors.map((i: Instructor) => i.id === updated.id ? updated : i));
                  }} 
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" 
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Email</label>
                <input 
                  type="email" 
                  value={currentInstructor.email} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const updated = { ...currentInstructor, email: e.target.value };
                    setCurrentInstructor(updated);
                    setInstructors(instructors.map((i: Instructor) => i.id === updated.id ? updated : i));
                  }} 
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" 
                />
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center border-t border-slate-800">
              <button onClick={() => setActiveTab('mat')} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl">Back to Mat</button>
            </div>
          </div>
        </main>
      )}

      {/* AUDIO SETTINGS MODAL */}
      {isAudioModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-white">Alarm & Bell Controls</h3>
              <button onClick={() => setIsAudioModalOpen(false)} className="text-slate-400 hover:text-white text-sm"><X size={18} /></button>
            </div>
            <div>
              <label className="text-xs uppercase font-bold text-slate-400">Tone Type</label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button 
                  type="button" 
                  onClick={() => setAlarmType('bell')} 
                  className={`py-3 px-4 rounded-xl font-bold text-sm border text-left transition ${alarmType === 'bell' ? 'border-emerald-500 bg-emerald-950/30 text-emerald-400' : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'}`}
                >
                  Boxing Bell
                </button>
                <button 
                  type="button" 
                  onClick={() => setAlarmType('beep')} 
                  className={`py-3 px-4 rounded-xl font-bold text-sm border text-left transition ${alarmType === 'beep' ? 'border-emerald-500 bg-emerald-950/30 text-emerald-400' : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'}`}
                >
                  Electronic Beep
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs uppercase font-bold text-slate-400">Volume: {Math.round(volume * 100)}%</label>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.05" 
                value={volume} 
                onChange={(e) => setVolume(parseFloat(e.target.value))} 
                className="w-full mt-2 accent-emerald-500" 
              />
            </div>
            <button onClick={() => setIsAudioModalOpen(false)} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm">Done</button>
          </div>
        </div>
      )}

      {/* CLASS TEMPLATES MODAL */}
      {isTemplateManagerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-white">Class Templates</h3>
              <button onClick={() => setIsTemplateManagerOpen(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveClassTemplate} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
              <div className="grid sm:grid-cols-3 gap-3">
                <input 
                  type="text" 
                  required 
                  placeholder="Template Name" 
                  value={templateFormData.name} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTemplateFormData({ ...templateFormData, name: e.target.value })} 
                  className="sm:col-span-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white" 
                />
                <select 
                  value={templateFormData.ageGroup} 
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTemplateFormData({ ...templateFormData, ageGroup: e.target.value })} 
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                >
                  <option value="Ages 3-6">Ages 3-6</option>
                  <option value="Ages 7-12">Ages 7-12</option>
                  <option value="Adults">Adults</option>
                  <option value="Masters">Masters</option>
                  <option value="All Levels">All Levels</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <input 
                  type="number" 
                  min="15" 
                  max="180" 
                  placeholder="Duration (Minutes)" 
                  value={templateFormData.durationMinutes} 
                  onChange={(e) => setTemplateFormData({ ...templateFormData, durationMinutes: parseInt(e.target.value) || 60 })} 
                  className="w-32 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white" 
                />
                <button type="submit" className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white">
                  {isEditingTemplate ? 'Update Template' : 'Save Template'}
                </button>
              </div>
            </form>
            <div className="divide-y divide-slate-800">
              {classTemplates.map((t: ClassTemplate) => (
                <div key={t.id} className="py-2.5 flex items-center justify-between">
                  <div className="text-sm font-bold text-white">{t.name} <span className="text-xs text-slate-400 font-normal">({t.ageGroup} • {t.durationMinutes}m)</span></div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setTemplateFormData(t); setIsEditingTemplate(true); }} className="text-slate-400 hover:text-white p-1"><Edit3 size={15} /></button>
                    <button onClick={() => handleDeleteClassTemplate(t.id)} className="text-slate-400 hover:text-rose-400 p-1"><Trash2 size={15} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ADD / SCHEDULE CLASS MODAL */}
      {isAddClassModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-white">Schedule Class</h3>
              <button onClick={() => setIsAddClassModalOpen(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleScheduleNewClass} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Class Date</label>
                <input
                  type="date"
                  required
                  value={targetDateForNewClass}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTargetDateForNewClass(e.target.value)}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Class Template</label>
                <select value={selectedTemplateForNewClass} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedTemplateForNewClass(e.target.value)} className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white">
                  {classTemplates.map((ct: ClassTemplate) => (<option key={ct.id} value={ct.id}>{ct.name} ({ct.durationMinutes}m)</option>))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Start Time</label>
                <input type="text" required placeholder="06:00 PM" value={newClassTime} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewClassTime(e.target.value)} className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase mb-1 block">Assign Curriculum Lesson</label>
                <SearchableLessonPicker
                  lessons={plans}
                  selectedLessonId={newClassLessonId || null}
                  onSelect={(val) => setNewClassLessonId(val || '')}
                  placeholder="Search and select curriculum lesson..."
                />
              </div>

              <button type="submit" className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white">Save Class to Calendar</button>
            </form>
          </div>
        </div>
      )}

      {/* NEW WARM-UP MODAL */}
      {isNewWarmUpModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-white">Add New Warm-Up Game</h3>
              <button onClick={() => setIsNewWarmUpModalOpen(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateNewWarmUp} className="space-y-3">
              <input type="text" required placeholder="Warm-Up Name" value={newWarmUpForm.warmUpName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewWarmUpForm({ ...newWarmUpForm, warmUpName: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
              <textarea rows={2} required placeholder="Description..." value={newWarmUpForm.description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewWarmUpForm({ ...newWarmUpForm, description: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white" />
              <div className="grid sm:grid-cols-2 gap-3">
                <input type="text" placeholder="Game Rules (Optional)" value={newWarmUpForm.gameRules || ''} onChange={(e) => setNewWarmUpForm({ ...newWarmUpForm, gameRules: e.target.value })} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
                <input type="text" placeholder="Constraints (Optional)" value={newWarmUpForm.constraints || ''} onChange={(e) => setNewWarmUpForm({ ...newWarmUpForm, constraints: e.target.value })} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
              </div>
              <button type="submit" className="w-full py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-xs">Save to Library</button>
            </form>
          </div>
        </div>
      )}

      {/* USER MODAL */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-white">{isEditingUser ? 'Edit User' : 'Add User'}</h3>
              <button onClick={() => setIsUserModalOpen(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (isEditingUser) { setInstructors(instructors.map(i => i.id === userFormData.id ? userFormData : i)); if (currentInstructor?.id === userFormData.id) setCurrentInstructor(userFormData); } 
              else { setInstructors([...instructors, { ...userFormData, id: `inst-${Date.now()}` }]); }
              setIsUserModalOpen(false);
            }} className="space-y-3">
              <input type="text" required placeholder="Name" value={userFormData.name} onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
              <input type="text" required placeholder="Username" value={userFormData.username} onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
              <input type="email" required placeholder="Email" value={userFormData.email} onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
              <select value={userFormData.role} onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value as any })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white">
                <option value="owner">Owner</option><option value="manager">Manager</option><option value="instructor">Instructor</option><option value="assistant">Assistant</option>
              </select>
              <button type="submit" className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm">Save User</button>
            </form>
          </div>
        </div>
      )}

      {/* LOGIN MODAL */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-lg text-white">Log In</h3>
            {loginError && <div className="text-rose-400 text-xs">{loginError}</div>}
            <input type="text" placeholder="Username" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white" />
            <input type="password" placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white" />
            <button onClick={() => { 
              const found = instructors.find(i => i.username === loginUsername && i.password === loginPassword);
              if (found) { setCurrentInstructor(found); setIsLoginModalOpen(false); setLoginError(''); } else { setLoginError('Invalid credentials'); }
            }} className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm">Sign In</button>
          </div>
        </div>
      )}

      {/* NEW CONCEPT MODAL */}
      {isNewConceptModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-white flex items-center gap-2"><FolderPlus size={18} className="text-emerald-400" />Add Concept</h3>
              <button onClick={() => setIsNewConceptModalOpen(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); if (newConceptInput && !coreConcepts.includes(newConceptInput)) { setCoreConcepts([...coreConcepts, newConceptInput]); setBuilderForm(prev => ({...prev, concept: newConceptInput})); } setNewConceptInput(''); setIsNewConceptModalOpen(false); }} className="space-y-4">
              <input type="text" required autoFocus placeholder="e.g., Mount Defense" value={newConceptInput} onChange={(e) => setNewConceptInput(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white" />
              <button type="submit" className="w-full py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs">Save</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
