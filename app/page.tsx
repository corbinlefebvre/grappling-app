'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, SkipForward, SkipBack, PlusCircle, Trash2,
  Globe, Lock, Sparkles, BookOpen, Clock, Shield, Users, 
  Volume2, ChevronDown, ChevronRight, ChevronLeft, Plus, Minus, LogOut,
  Calendar as CalendarIcon, Tag, Search, FolderPlus, X, Loader2, MessageSquare, 
  Send, UserCheck, FileText, CheckCircle2, Flame, BookmarkPlus, Edit3, Key, User,
  ShieldCheck, LogIn, Music, Disc3, Radio, UploadCloud
} from 'lucide-react';

// --- DATA TYPES ---
type UserRole = 'owner' | 'manager' | 'instructor' | 'assistant';

interface Instructor {
  id: string;
  username: string;
  password?: string;
  name: string;
  email: string;
  role: UserRole;
  rank: string;
  bio?: string;
}

interface LocalTrack {
  id: string;
  name: string;
  fileUrl: string;
}

interface WarmUp {
  id?: string;
  warmUpName: string;
  type: 'general' | 'game';
  description: string;
  gameRules?: string;
  constraints?: string;
  goals?: string;
  roundCount: number;
  roundTimeSeconds: number;
  restTimeSeconds: number;
  isCustom?: boolean;
}

interface Drill {
  id: string;
  drillName: string;
  drillConstraints: string;
  primaryGoal: string;
  immediateReset: string;
  roundCount: number;
  roundTimeSeconds: number;
  restTimeSeconds: number;
}

interface LessonPlan {
  id: string;
  className: string;
  concept: string;
  ageGroup: string;
  beltRank: string;
  totalDurationMinutes: number;
  tags: string[];
  warmUp: WarmUp;
  drills: Drill[];
  liveRounds: {
    roundCount: number;
    roundTimeSeconds: number;
    restTimeSeconds: number;
  };
  isPublic: boolean;
  authorInstructorId: string;
  authorName: string;
}

interface ClassTemplate {
  id: string;
  name: string;
  ageGroup: string;
  durationMinutes: number;
}

interface ScheduledClass {
  id: string;
  dateStr: string;
  time: string;
  title: string;
  ageGroup: string;
  durationMinutes: number;
  assignedInstructorId: string;
  assignedLessonId: string | null;
  postClassNotes: string;
  modificationsSuggested: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

// --- INITIAL SEED ---
const INITIAL_INSTRUCTORS: Instructor[] = [
  { id: 'inst-1', username: 'owner', password: 'password123', name: 'Chief Instructor', email: 'owner@matops.com', role: 'owner', rank: 'Black Belt', bio: 'Head Coach and Program Director.' },
  { id: 'inst-2', username: 'mvance', password: 'password123', name: 'Marcus Vance', email: 'marcus@matops.com', role: 'manager', rank: 'Brown Belt', bio: 'Operations Manager and Senior Instructor.' },
  { id: 'inst-3', username: 'sarah_bjj', password: 'password123', name: 'Sarah Jenkins', email: 'sarah@matops.com', role: 'instructor', rank: 'Purple Belt', bio: 'Fundamentals Lead.' },
  { id: 'inst-4', username: 'alex_coach', password: 'password123', name: 'Alex Rivera', email: 'alex@matops.com', role: 'assistant', rank: 'Blue Belt', bio: 'Assistant Coach.' },
];

const INITIAL_CLASS_TEMPLATES: ClassTemplate[] = [
  { id: 'ct-1', name: 'Adult Fundamental Gi', ageGroup: 'Adults', durationMinutes: 60 },
  { id: 'ct-2', name: 'Youth BJJ Dynamics', ageGroup: 'Ages 7-12', durationMinutes: 45 },
  { id: 'ct-3', name: 'Advanced No-Gi & Sparring', ageGroup: 'Adults', durationMinutes: 75 },
  { id: 'ct-4', name: 'Tiny Champions Movement', ageGroup: 'Ages 3-6', durationMinutes: 30 },
  { id: 'ct-5', name: 'Weekend Open Mat', ageGroup: 'All Levels', durationMinutes: 90 },
];

const INITIAL_WARMUPS: WarmUp[] = [
  {
    id: 'wu-1',
    warmUpName: 'General Dynamic Movement Flow',
    type: 'general',
    description: 'Solo locomotion: forward/backward hip escapes, granby rolls, technical standups, and animal crawls.',
    gameRules: 'Continuous non-impact movement down mat lines. Focus on floor engagement and hip mobility.',
    constraints: 'No resting on heels; maintain active posting hands.',
    goals: 'Elevate core body temperature and prime spinal flexion/extension.',
    roundCount: 1,
    roundTimeSeconds: 300,
    restTimeSeconds: 30,
    isCustom: false,
  },
  {
    id: 'wu-2',
    warmUpName: 'Shoulder & Knee Tag Game',
    type: 'game',
    description: 'Standing agility game priming level changes, defensive posting, and stance discipline.',
    gameRules: 'Both athletes start in grappling stance. Touch opponent shoulders or knees to score 1 point.',
    constraints: 'No grabbing clothing/gi; no collar ties. Defensive posts must touch hands or forearms only.',
    goals: 'Touch lead knee or shoulder while protecting own lead targets. First to 5 touches wins the round.',
    roundCount: 3,
    roundTimeSeconds: 90,
    restTimeSeconds: 20,
    isCustom: false,
  },
  {
    id: 'wu-3',
    warmUpName: 'Inside Hand Fight & Pummel Relay',
    type: 'game',
    description: 'Standing or kneeling clinch pummeling focusing on interior head and arm frame control.',
    gameRules: 'Athletes maintain continuous contact. Fight for double underhooks or double inside bicep control.',
    constraints: 'No tripping or takedowns; arms cannot leave opponent torso or bicep frames.',
    goals: 'Win inside position for 3 consecutive seconds without head position being broken.',
    roundCount: 4,
    roundTimeSeconds: 60,
    restTimeSeconds: 15,
    isCustom: false,
  }
];

const INITIAL_CONCEPTS = [
  'Half Guard Bottom',
  'Closed Guard Top',
  'Headquarters Passing',
  'Scissor Sweep',
  'Back Escapes',
  'Mount Defense & Retention'
];

const INITIAL_PLANS: LessonPlan[] = [
  {
    id: 'plan-1',
    className: 'Underhook Battle & Dogfight Sweep',
    concept: 'Half Guard Bottom',
    ageGroup: 'Adults',
    beltRank: 'Blue Belt',
    totalDurationMinutes: 60,
    tags: ['No-Gi', 'Underhook', 'Sweep', 'Half Guard'],
    authorInstructorId: 'inst-1',
    authorName: 'Chief Instructor',
    isPublic: true,
    warmUp: INITIAL_WARMUPS[1],
    drills: [
      {
        id: 'd-1',
        drillName: 'Pummel to Underhook',
        drillConstraints: 'Top player cannot post on mat; bottom cannot wrap closed guard.',
        primaryGoal: 'Bottom secures underhook; top flattens bottom shoulders.',
        immediateReset: 'Underhook secured or bottom shoulders pinned flat.',
        roundCount: 4,
        roundTimeSeconds: 120,
        restTimeSeconds: 30,
      }
    ],
    liveRounds: {
      roundCount: 4,
      roundTimeSeconds: 300,
      restTimeSeconds: 60,
    }
  }
];

function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getMondayOfWeek(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
}

export default function MatApp() {
  // Navigation & Identity
  const [activeTab, setActiveTab] = useState<'mat' | 'builder' | 'community' | 'calendar' | 'chat' | 'academy' | 'profile'>('mat');
  const [currentInstructor, setCurrentInstructor] = useState<Instructor | null>(INITIAL_INSTRUCTORS[0]);
  const [instructors, setInstructors] = useState<Instructor[]>(INITIAL_INSTRUCTORS);
  const [academyName, setAcademyName] = useState('Pacific Training Academy');

  // Music Player Deck State
  const [musicSource, setMusicSource] = useState<'local' | 'spotify' | 'apple'>('local');
  const [localPlaylist, setLocalPlaylist] = useState<LocalTrack[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.7);
  const [spotifyEmbedUri, setSpotifyEmbedUri] = useState('playlist/37i9dQZF1DXdLEN7aqioXM');
  const [appleMusicEmbedUrl, setAppleMusicEmbedUrl] = useState('https://embed.music.apple.com/us/playlist/hip-hop-workout/pl.u-38oWXPvCY36P0b');
  const [isMusicDeckOpen, setIsMusicDeckOpen] = useState(false);
  const localAudioRef = useRef<HTMLAudioElement | null>(null);

  // Authentication Modals
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // User Management Modal (Owner/Manager Only)
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [userFormData, setUserFormData] = useState<Instructor>({
    id: '',
    username: '',
    password: '',
    name: '',
    email: '',
    role: 'instructor',
    rank: 'Blue Belt',
    bio: ''
  });

  // Concepts, Warmups, and Class Templates
  const [coreConcepts, setCoreConcepts] = useState<string[]>(INITIAL_CONCEPTS);
  const [warmUpPresets, setWarmUpPresets] = useState<WarmUp[]>(INITIAL_WARMUPS);
  const [classTemplates, setClassTemplates] = useState<ClassTemplate[]>(INITIAL_CLASS_TEMPLATES);
  const [isNewConceptModalOpen, setIsNewConceptModalOpen] = useState(false);
  const [newConceptInput, setNewConceptInput] = useState('');

  // Curriculum Hub View Switcher
  const [hubSection, setHubSection] = useState<'lessons' | 'warmups'>('lessons');
  const [isNewWarmUpModalOpen, setIsNewWarmUpModalOpen] = useState(false);
  const [newWarmUpForm, setNewWarmUpForm] = useState<WarmUp>({
    warmUpName: '',
    type: 'game',
    description: '',
    gameRules: '',
    constraints: '',
    goals: '',
    roundCount: 3,
    roundTimeSeconds: 90,
    restTimeSeconds: 20,
    isCustom: true
  });

  // Calendar State
  const [calendarAnchorDate, setCalendarAnchorDate] = useState<Date>(() => new Date());
  const [schedule, setSchedule] = useState<ScheduledClass[]>(() => {
    const today = new Date();
    const monday = getMondayOfWeek(today);
    return [
      {
        id: 'sch-1',
        dateStr: formatDateKey(monday),
        time: '06:00 PM',
        title: 'Adult Fundamental Gi',
        ageGroup: 'Adults',
        durationMinutes: 60,
        assignedInstructorId: 'inst-1',
        assignedLessonId: 'plan-1',
        postClassNotes: 'Solid turnout; underhook timing was clean.',
        modificationsSuggested: 'Next week add limp-arm counter drill.'
      }
    ];
  });

  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false);
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
  const [targetDateForNewClass, setTargetDateForNewClass] = useState<string>(formatDateKey(new Date()));
  const [selectedTemplateForNewClass, setSelectedTemplateForNewClass] = useState<string>('');
  const [newClassTime, setNewClassTime] = useState('06:00 PM');
  const [newClassInstructorId, setNewClassInstructorId] = useState('inst-1');
  const [newClassLessonId, setNewClassLessonId] = useState('');

  const [templateFormData, setTemplateFormData] = useState<ClassTemplate>({
    id: '',
    name: '',
    ageGroup: 'Adults',
    durationMinutes: 60
  });
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);

  // Lesson Plans & Timer
  const [plans, setPlans] = useState<LessonPlan[]>(INITIAL_PLANS);
  const [selectedPlan, setSelectedPlan] = useState<LessonPlan>(INITIAL_PLANS[0]);
  const [activeMode, setActiveMode] = useState<'warmup' | 'drill' | 'live'>('warmup');
  const [activeDrillIndex, setActiveDrillIndex] = useState(0);

  // Search & Filter
  const [hubSearchTerm, setHubSearchTerm] = useState('');
  const [selectedHubTag, setSelectedHubTag] = useState<string | null>(null);
  const [collapsedConcepts, setCollapsedConcepts] = useState<Record<string, boolean>>({});

  // Audio / Sound Configurations
  const [alarmType, setAlarmType] = useState<'bell' | 'beep'>('bell');
  const [volume, setVolume] = useState<number>(0.8);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);

  // Live Timer
  const [secondsLeft, setSecondsLeft] = useState(INITIAL_PLANS[0].warmUp.roundTimeSeconds);
  const [isActive, setIsActive] = useState(false);
  const [isRest, setIsRest] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);

  // AI Chat State
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Oss Coach! I am your AI Black Belt assistant. Ask me anything about class schedules, warm-ups, drill constraints, or curriculum structure.'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatSending, setIsChatSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Builder Form State
  const [tagInput, setTagInput] = useState('');
  const [builderForm, setBuilderForm] = useState<Omit<LessonPlan, 'id' | 'authorInstructorId' | 'authorName'>>({
    className: '',
    concept: 'Half Guard Bottom',
    ageGroup: 'Adults',
    beltRank: 'White Belt',
    totalDurationMinutes: 60,
    tags: ['Fundamentals', 'No-Gi'],
    isPublic: false,
    warmUp: { ...INITIAL_WARMUPS[0] },
    drills: [
      {
        id: 'drill-1',
        drillName: 'Positional Drill 1',
        drillConstraints: '',
        primaryGoal: '',
        immediateReset: '',
        roundCount: 4,
        roundTimeSeconds: 120,
        restTimeSeconds: 30,
      }
    ],
    liveRounds: {
      roundCount: 5,
      roundTimeSeconds: 300,
      restTimeSeconds: 60,
    }
  });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatSending]);

  // Audio Player Handling
  const handleLocalFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newTracks: LocalTrack[] = Array.from(files).map((f) => ({
      id: `track-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: f.name.replace(/\.[^/.]+$/, ''),
      fileUrl: URL.createObjectURL(f),
    }));

    setLocalPlaylist((prev) => [...prev, ...newTracks]);
    if (localPlaylist.length === 0) setCurrentTrackIndex(0);
  };

  const toggleMusicPlayback = () => {
    if (!localAudioRef.current) return;
    if (isMusicPlaying) {
      localAudioRef.current.pause();
      setIsMusicPlaying(false);
    } else {
      localAudioRef.current.play().then(() => setIsMusicPlaying(true)).catch(() => {});
    }
  };

  const skipTrack = (direction: 'next' | 'prev') => {
    if (localPlaylist.length === 0) return;
    let nextIdx = direction === 'next' ? currentTrackIndex + 1 : currentTrackIndex - 1;
    if (nextIdx >= localPlaylist.length) nextIdx = 0;
    if (nextIdx < 0) nextIdx = localPlaylist.length - 1;
    setCurrentTrackIndex(nextIdx);
    setIsMusicPlaying(true);
  };

  const restartTrack = () => {
    if (!localAudioRef.current) return;
    localAudioRef.current.currentTime = 0;
    localAudioRef.current.play();
    setIsMusicPlaying(true);
  };

  useEffect(() => {
    if (localAudioRef.current) localAudioRef.current.volume = musicVolume;
  }, [musicVolume]);

  useEffect(() => {
    if (localAudioRef.current && localPlaylist[currentTrackIndex]) {
      localAudioRef.current.src = localPlaylist[currentTrackIndex].fileUrl;
      if (isMusicPlaying) localAudioRef.current.play().catch(() => {});
    }
  }, [currentTrackIndex, localPlaylist]);

  // Web Audio Alarm Bell
  const playSoundTone = (phase: 'start' | 'rest') => {
    if (typeof window === 'undefined' || volume === 0) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (alarmType === 'bell') {
        if (phase === 'start') {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(400, audioCtx.currentTime);
          gain.gain.setValueAtTime(volume, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2.0);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 2.0);
        } else {
          [0, 0.4, 0.8].forEach((delay) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(550, audioCtx.currentTime + delay);
            gain.gain.setValueAtTime(volume, audioCtx.currentTime + delay);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delay + 0.35);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(audioCtx.currentTime + delay);
            osc.stop(audioCtx.currentTime + delay + 0.35);
          });
        }
      } else {
        if (phase === 'start') {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(800, audioCtx.currentTime);
          gain.gain.setValueAtTime(volume * 0.4, audioCtx.currentTime);
          gain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 2.0);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 2.0);
        } else {
          [0, 0.25, 0.5].forEach((delay) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(950, audioCtx.currentTime + delay);
            gain.gain.setValueAtTime(volume * 0.3, audioCtx.currentTime + delay);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(audioCtx.currentTime + delay);
            osc.stop(audioCtx.currentTime + delay + 0.15);
          });
        }
      }
    } catch {}
  };

  const currentWarmUp = selectedPlan.warmUp;
  const currentDrill = selectedPlan.drills[activeDrillIndex] || selectedPlan.drills[0];

  const maxRounds = 
    activeMode === 'warmup' ? currentWarmUp.roundCount :
    activeMode === 'drill' ? currentDrill.roundCount : 
    selectedPlan.liveRounds.roundCount;

  const workDuration = 
    activeMode === 'warmup' ? currentWarmUp.roundTimeSeconds :
    activeMode === 'drill' ? currentDrill.roundTimeSeconds : 
    selectedPlan.liveRounds.roundTimeSeconds;

  const restDuration = 
    activeMode === 'warmup' ? currentWarmUp.restTimeSeconds :
    activeMode === 'drill' ? currentDrill.restTimeSeconds : 
    selectedPlan.liveRounds.restTimeSeconds;

  // Master Timer Loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => setSecondsLeft((prev) => prev - 1), 1000);
    } else if (isActive && secondsLeft === 0) {
      if (!isRest && restDuration > 0) {
        playSoundTone('rest');
        setIsRest(true);
        setSecondsLeft(restDuration);
      } else {
        playSoundTone('start');
        setIsRest(false);
        if (currentRound < maxRounds) {
          setCurrentRound((prev) => prev + 1);
          setSecondsLeft(workDuration);
        } else {
          if (activeMode === 'warmup' && selectedPlan.drills.length > 0) {
            setActiveMode('drill');
            setActiveDrillIndex(0);
            setCurrentRound(1);
            setSecondsLeft(selectedPlan.drills[0].roundTimeSeconds);
            setIsActive(false);
          } else if (activeMode === 'drill' && activeDrillIndex < selectedPlan.drills.length - 1) {
            const nextIdx = activeDrillIndex + 1;
            setActiveDrillIndex(nextIdx);
            setCurrentRound(1);
            setSecondsLeft(selectedPlan.drills[nextIdx].roundTimeSeconds);
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
  }, [isActive, secondsLeft, isRest, currentRound, activeMode, activeDrillIndex, maxRounds, workDuration, restDuration, selectedPlan]);

  const handleHUDTargetChange = (type: 'warmup' | 'drill' | 'live', drillIdx: number = 0) => {
    setIsActive(false);
    setIsRest(false);
    setCurrentRound(1);
    setActiveMode(type);
    if (type === 'warmup') {
      setSecondsLeft(selectedPlan.warmUp.roundTimeSeconds);
    } else if (type === 'drill') {
      setActiveDrillIndex(drillIdx);
      setSecondsLeft(selectedPlan.drills[drillIdx].roundTimeSeconds);
    } else {
      setSecondsLeft(selectedPlan.liveRounds.roundTimeSeconds);
    }
  };

  const adjustHUDTimer = (field: 'rounds' | 'work' | 'rest', delta: number) => {
    if (activeMode === 'warmup') {
      const curWu = { ...selectedPlan.warmUp };
      if (field === 'rounds') curWu.roundCount = Math.max(1, curWu.roundCount + delta);
      if (field === 'work') {
        curWu.roundTimeSeconds = Math.max(15, curWu.roundTimeSeconds + delta);
        if (!isRest) setSecondsLeft((prev) => Math.max(1, prev + delta));
      }
      if (field === 'rest') {
        curWu.restTimeSeconds = Math.max(0, curWu.restTimeSeconds + delta);
        if (isRest) setSecondsLeft((prev) => Math.max(1, prev + delta));
      }
      setSelectedPlan({ ...selectedPlan, warmUp: curWu });
    } else if (activeMode === 'drill') {
      const updatedDrills = [...selectedPlan.drills];
      const cur = { ...updatedDrills[activeDrillIndex] };
      if (field === 'rounds') cur.roundCount = Math.max(1, cur.roundCount + delta);
      if (field === 'work') {
        cur.roundTimeSeconds = Math.max(15, cur.roundTimeSeconds + delta);
        if (!isRest) setSecondsLeft((prev) => Math.max(1, prev + delta));
      }
      if (field === 'rest') {
        cur.restTimeSeconds = Math.max(0, cur.restTimeSeconds + delta);
        if (isRest) setSecondsLeft((prev) => Math.max(1, prev + delta));
      }
      updatedDrills[activeDrillIndex] = cur;
      setSelectedPlan({ ...selectedPlan, drills: updatedDrills });
    } else {
      const curLive = { ...selectedPlan.liveRounds };
      if (field === 'rounds') curLive.roundCount = Math.max(1, curLive.roundCount + delta);
      if (field === 'work') {
        curLive.roundTimeSeconds = Math.max(15, curLive.roundTimeSeconds + delta);
        if (!isRest) setSecondsLeft((prev) => Math.max(1, prev + delta));
      }
      if (field === 'rest') {
        curLive.restTimeSeconds = Math.max(0, curLive.restTimeSeconds + delta);
        if (isRest) setSecondsLeft((prev) => Math.max(1, prev + delta));
      }
      setSelectedPlan({ ...selectedPlan, liveRounds: curLive });
    }
  };

  const handleTypedParamChange = (field: 'rounds' | 'work_mins' | 'work_secs' | 'rest_mins' | 'rest_secs', val: number) => {
    const safeVal = isNaN(val) ? 0 : Math.max(0, val);
    if (activeMode === 'warmup') {
      const curWu = { ...selectedPlan.warmUp };
      if (field === 'rounds') curWu.roundCount = Math.max(1, safeVal);
      if (field === 'work_mins') curWu.roundTimeSeconds = safeVal * 60 + (curWu.roundTimeSeconds % 60);
      if (field === 'work_secs') curWu.roundTimeSeconds = Math.floor(curWu.roundTimeSeconds / 60) * 60 + (safeVal % 60);
      if (field === 'rest_mins') curWu.restTimeSeconds = safeVal * 60 + (curWu.restTimeSeconds % 60);
      if (field === 'rest_secs') curWu.restTimeSeconds = Math.floor(curWu.restTimeSeconds / 60) * 60 + (safeVal % 60);
      setSelectedPlan({ ...selectedPlan, warmUp: curWu });
    } else if (activeMode === 'drill') {
      const updatedDrills = [...selectedPlan.drills];
      const cur = { ...updatedDrills[activeDrillIndex] };
      if (field === 'rounds') cur.roundCount = Math.max(1, safeVal);
      if (field === 'work_mins') cur.roundTimeSeconds = safeVal * 60 + (cur.roundTimeSeconds % 60);
      if (field === 'work_secs') cur.roundTimeSeconds = Math.floor(cur.roundTimeSeconds / 60) * 60 + (safeVal % 60);
      if (field === 'rest_mins') cur.restTimeSeconds = safeVal * 60 + (cur.restTimeSeconds % 60);
      if (field === 'rest_secs') cur.restTimeSeconds = Math.floor(cur.restTimeSeconds / 60) * 60 + (safeVal % 60);
      updatedDrills[activeDrillIndex] = cur;
      setSelectedPlan({ ...selectedPlan, drills: updatedDrills });
    } else {
      const curLive = { ...selectedPlan.liveRounds };
      if (field === 'rounds') curLive.roundCount = Math.max(1, safeVal);
      if (field === 'work_mins') curLive.roundTimeSeconds = safeVal * 60 + (curLive.roundTimeSeconds % 60);
      if (field === 'work_secs') curLive.roundTimeSeconds = Math.floor(curLive.roundTimeSeconds / 60) * 60 + (safeVal % 60);
      if (field === 'rest_mins') curLive.restTimeSeconds = safeVal * 60 + (curLive.restTimeSeconds % 60);
      if (field === 'rest_secs') curLive.restTimeSeconds = Math.floor(curLive.restTimeSeconds / 60) * 60 + (safeVal % 60);
      setSelectedPlan({ ...selectedPlan, liveRounds: curLive });
    }
  };

  const loadPlanToMat = (plan: LessonPlan) => {
    setSelectedPlan(plan);
    setActiveMode('warmup');
    setActiveDrillIndex(0);
    setCurrentRound(1);
    setIsActive(false);
    setIsRest(false);
    setSecondsLeft(plan.warmUp.roundTimeSeconds || 180);
    setActiveTab('mat');
  };

  const launchWarmUpOnly = (warmUp: WarmUp) => {
    const standalonePlan: LessonPlan = {
      id: `standalone-${Date.now()}`,
      className: `Warm-Up: ${warmUp.warmUpName}`,
      concept: 'Movement & Mobility',
      ageGroup: 'All Levels',
      beltRank: 'All Ranks',
      totalDurationMinutes: Math.ceil((warmUp.roundCount * (warmUp.roundTimeSeconds + warmUp.restTimeSeconds)) / 60),
      tags: ['Warm-Up', warmUp.type],
      warmUp: { ...warmUp },
      drills: [],
      liveRounds: { roundCount: 0, roundTimeSeconds: 0, restTimeSeconds: 0 },
      isPublic: true,
      authorInstructorId: currentInstructor?.id || 'inst-1',
      authorName: currentInstructor?.name || 'Coach'
    };
    loadPlanToMat(standalonePlan);
  };

  const applyPresetWarmUp = (warmUp: WarmUp) => {
    setBuilderForm((prev) => ({ ...prev, warmUp: { ...warmUp } }));
  };

  const handleSaveCurrentWarmUpAsPreset = () => {
    const name = builderForm.warmUp.warmUpName.trim();
    if (!name) return;
    const newPreset: WarmUp = { ...builderForm.warmUp, id: `custom-wu-${Date.now()}`, isCustom: true };
    setWarmUpPresets((prev) => [newPreset, ...prev]);
    alert(`Warm-Up "${name}" saved!`);
  };

  const handleCreateNewWarmUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWarmUpForm.warmUpName.trim()) return;
    setWarmUpPresets((prev) => [{ ...newWarmUpForm, id: `wu-hub-${Date.now()}`, isCustom: true }, ...prev]);
    setIsNewWarmUpModalOpen(false);
  };

  const handleAddNewConcept = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newConceptInput.trim();
    if (trimmed && !coreConcepts.includes(trimmed)) {
      setCoreConcepts([...coreConcepts, trimmed]);
      setBuilderForm((prev) => ({ ...prev, concept: trimmed }));
      setNewConceptInput('');
      setIsNewConceptModalOpen(false);
    }
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !builderForm.tags.includes(trimmed)) {
      setBuilderForm({ ...builderForm, tags: [...builderForm.tags, trimmed] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setBuilderForm({ ...builderForm, tags: builderForm.tags.filter((t) => t !== tagToRemove) });
  };

  const addDrillToForm = () => {
    const newDrill: Drill = {
      id: `drill-${Date.now()}`,
      drillName: `Positional Drill ${builderForm.drills.length + 1}`,
      drillConstraints: '',
      primaryGoal: '',
      immediateReset: '',
      roundCount: 4,
      roundTimeSeconds: 120,
      restTimeSeconds: 30,
    };
    setBuilderForm({ ...builderForm, drills: [...builderForm.drills, newDrill] });
  };

  const removeDrillFromForm = (id: string) => {
    if (builderForm.drills.length <= 1) return;
    setBuilderForm({ ...builderForm, drills: builderForm.drills.filter((d) => d.id !== id) });
  };

  const updateDrillField = (index: number, field: keyof Drill, value: any) => {
    const nextDrills = [...builderForm.drills];
    nextDrills[index] = { ...nextDrills[index], [field]: value };
    setBuilderForm({ ...builderForm, drills: nextDrills });
  };

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInstructor) {
      setIsLoginModalOpen(true);
      return;
    }
    const newPlan: LessonPlan = {
      ...builderForm,
      id: `plan-${Date.now()}`,
      authorInstructorId: currentInstructor.id,
      authorName: currentInstructor.name,
    };
    setPlans([newPlan, ...plans]);
    loadPlanToMat(newPlan);
  };

  // Auth & Roles Handlers
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const found = instructors.find(
      (inst) => inst.username.toLowerCase() === loginUsername.trim().toLowerCase() && inst.password === loginPassword
    );

    if (found) {
      setCurrentInstructor(found);
      setIsLoginModalOpen(false);
      setLoginUsername('');
      setLoginPassword('');
    } else {
      setLoginError('Invalid username or password. Default test credentials: owner / password123');
    }
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.username.trim() || !userFormData.name.trim()) return;

    if (isEditingUser) {
      setInstructors(instructors.map((inst) => inst.id === userFormData.id ? { ...userFormData } : inst));
      if (currentInstructor?.id === userFormData.id) setCurrentInstructor({ ...userFormData });
    } else {
      setInstructors([...instructors, { ...userFormData, id: `inst-${Date.now()}`, password: userFormData.password || 'password123' }]);
    }
    setIsUserModalOpen(false);
  };

  const handleDeleteUser = (id: string) => {
    if (id === currentInstructor?.id) {
      alert('You cannot delete the active account you are logged into.');
      return;
    }
    setInstructors(instructors.filter((inst) => inst.id !== id));
  };

  const canManageAcademy = currentInstructor?.role === 'owner' || currentInstructor?.role === 'manager';

  // Calendar Navigation & Actions
  const currentWeekMonday = getMondayOfWeek(calendarAnchorDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentWeekMonday);
    d.setDate(currentWeekMonday.getDate() + i);
    return d;
  });

  const shiftWeek = (offsetWeeks: number) => {
    const nextDate = new Date(calendarAnchorDate);
    nextDate.setDate(calendarAnchorDate.getDate() + offsetWeeks * 7);
    setCalendarAnchorDate(nextDate);
  };

  const setMonthAnchor = (monthIndex: number) => {
    const nextDate = new Date(calendarAnchorDate);
    nextDate.setMonth(monthIndex);
    setCalendarAnchorDate(nextDate);
  };

  const setYearAnchor = (year: number) => {
    const nextDate = new Date(calendarAnchorDate);
    nextDate.setFullYear(year);
    setCalendarAnchorDate(nextDate);
  };

  const handleSaveClassTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateFormData.name.trim()) return;
    if (isEditingTemplate) {
      setClassTemplates(classTemplates.map((ct) => (ct.id === templateFormData.id ? templateFormData : ct)));
    } else {
      setClassTemplates([...classTemplates, { ...templateFormData, id: `ct-${Date.now()}` }]);
    }
    setTemplateFormData({ id: '', name: '', ageGroup: 'Adults', durationMinutes: 60 });
    setIsEditingTemplate(false);
  };

  const handleDeleteClassTemplate = (id: string) => {
    setClassTemplates(classTemplates.filter((ct) => ct.id !== id));
  };

  const openAddClassModalForDate = (dateKey: string) => {
    setTargetDateForNewClass(dateKey);
    setSelectedTemplateForNewClass(classTemplates[0]?.id || '');
    setNewClassTime('06:00 PM');
    setNewClassInstructorId(currentInstructor?.id || instructors[0].id);
    setNewClassLessonId('');
    setIsAddClassModalOpen(true);
  };

  const handleScheduleNewClass = (e: React.FormEvent) => {
    e.preventDefault();
    const template = classTemplates.find((t) => t.id === selectedTemplateForNewClass);
    if (!template) return;

    const newScheduledItem: ScheduledClass = {
      id: `sch-${Date.now()}`,
      dateStr: targetDateForNewClass,
      time: newClassTime,
      title: template.name,
      ageGroup: template.ageGroup,
      durationMinutes: template.durationMinutes,
      assignedInstructorId: newClassInstructorId,
      assignedLessonId: newClassLessonId ? newClassLessonId : null,
      postClassNotes: '',
      modificationsSuggested: ''
    };

    setSchedule([...schedule, newScheduledItem]);
    setIsAddClassModalOpen(false);
  };

  const handleDeleteScheduledClass = (id: string) => {
    setSchedule(schedule.filter((s) => s.id !== id));
  };

  const updateScheduledClass = (classId: string, updates: Partial<ScheduledClass>) => {
    setSchedule(schedule.map((sc) => (sc.id === classId ? { ...sc, ...updates } : sc)));
  };

  const toggleConceptCollapse = (concept: string) => {
    setCollapsedConcepts((prev) => ({ ...prev, [concept]: !prev[concept] }));
  };

  const allUniqueTags = Array.from(new Set(plans.flatMap((p) => p.tags || [])));
  const filteredPlans = plans.filter((p) => {
    const matchesSearch =
      p.className.toLowerCase().includes(hubSearchTerm.toLowerCase()) ||
      p.concept.toLowerCase().includes(hubSearchTerm.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(hubSearchTerm.toLowerCase()));
    const matchesTag = selectedHubTag ? p.tags.includes(selectedHubTag) : true;
    return matchesSearch && matchesTag;
  });

  const filteredWarmUps = warmUpPresets.filter((wu) => {
    return (
      wu.warmUpName.toLowerCase().includes(hubSearchTerm.toLowerCase()) ||
      wu.description.toLowerCase().includes(hubSearchTerm.toLowerCase()) ||
      (wu.goals && wu.goals.toLowerCase().includes(hubSearchTerm.toLowerCase()))
    );
  });

  const allConceptKeys = Array.from(new Set([...coreConcepts, ...plans.map((p) => p.concept)]));
  const plansByConcept = allConceptKeys.reduce((acc, concept) => {
    const matching = filteredPlans.filter((p) => p.concept === concept);
    if (matching.length > 0 || (!hubSearchTerm && !selectedHubTag)) {
      acc[concept] = matching;
    }
    return acc;
  }, {} as Record<string, LessonPlan[]>);

  // Time Formatter declared inside component scope
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {/* HIDDEN HTML5 AUDIO ELEMENT FOR LOCAL AUDIO PLAYLIST */}
      <audio ref={localAudioRef} onEnded={() => skipTrack('next')} className="hidden" />

      {/* TOP NAVIGATION BAR */}
      <nav className="border-b border-slate-800 bg-slate-900/70 backdrop-blur px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 text-slate-950 font-black px-2.5 py-1 rounded-lg text-sm tracking-wider">
            MAT·OPS
          </div>
          <span className="font-bold text-base hidden md:inline text-slate-200">{academyName}</span>
        </div>

        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 flex-wrap">
          <button onClick={() => setActiveTab('mat')} className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition ${activeTab === 'mat' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}>Mat Timer</button>
          <button onClick={() => setActiveTab('builder')} className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition ${activeTab === 'builder' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}>Lesson Builder</button>
          <button onClick={() => setActiveTab('community')} className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition ${activeTab === 'community' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}>Curriculum Hub</button>
          <button onClick={() => setActiveTab('calendar')} className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition ${activeTab === 'calendar' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}>Academy Calendar</button>
          <button onClick={() => setActiveTab('chat')} className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold flex items-center gap-1.5 transition ${activeTab === 'chat' ? 'bg-indigo-600 text-white' : 'text-indigo-400 hover:text-indigo-300'}`}><Sparkles size={14} />Ask AI</button>
          <button onClick={() => setActiveTab('academy')} className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition ${activeTab === 'academy' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}>Roster & Roles</button>
        </div>

        {/* AUTHENTICATION & QUICK TOOLS */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMusicDeckOpen(!isMusicDeckOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition ${
              isMusicDeckOpen || isMusicPlaying
                ? 'bg-purple-950/60 border-purple-600 text-purple-300 shadow-md'
                : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:text-white'
            }`}
          >
            <Music size={15} className={isMusicPlaying ? 'animate-pulse text-purple-400' : 'text-slate-400'} />
            <span className="hidden sm:inline">Music</span>
          </button>

          <button
            onClick={() => setIsAudioModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-xs font-semibold hover:border-slate-700"
          >
            <Volume2 size={15} className="text-emerald-400" />
            <span className="hidden sm:inline">Bells</span>
          </button>

          {currentInstructor ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <button
                onClick={() => setActiveTab('profile')}
                className="flex items-center gap-2 text-left hover:opacity-80 transition bg-slate-900/60 border border-slate-800 px-2.5 py-1 rounded-xl"
                title="View Profile"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-xs flex items-center justify-center border border-emerald-500/30">
                  {currentInstructor.name[0]}
                </div>
                <div className="hidden lg:block">
                  <div className="text-xs font-bold text-slate-100">{currentInstructor.name}</div>
                  <div className="text-[10px] uppercase font-semibold text-emerald-400">{currentInstructor.role}</div>
                </div>
              </button>

              <button
                onClick={() => setCurrentInstructor(null)}
                title="Sign Out"
                className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-900"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setLoginError('');
                setIsLoginModalOpen(true);
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 px-3.5 py-1.5 rounded-xl shadow-md transition"
            >
              <LogIn size={14} />
              Log In
            </button>
          )}
        </div>
      </nav>

      {/* LOGIN MODAL */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <LogIn size={18} className="text-emerald-400" />
                Instructor Portal Login
              </h3>
              <button onClick={() => setIsLoginModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {loginError && (
                <div className="p-2.5 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs leading-relaxed">
                  {loginError}
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Username</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g., owner or mvance"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full mt-1.5 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Password</label>
                <input
                  type="password"
                  required
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full mt-1.5 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLoginModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg"
                >
                  Sign In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT USER MODAL */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <UserCheck size={18} className="text-emerald-400" />
                {isEditingUser ? 'Edit User Credentials & Role' : 'Create New Academy User'}
              </h3>
              <button onClick={() => setIsUserModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Marcus Vance"
                  value={userFormData.name}
                  onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Username</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., mvance"
                    value={userFormData.username}
                    onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Password</label>
                  <input
                    type="text"
                    required
                    placeholder="Set password"
                    value={userFormData.password || ''}
                    onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Role</label>
                  <select
                    value={userFormData.role}
                    onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value as UserRole })}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="owner">Owner (Full Control)</option>
                    <option value="manager">Manager (Manage Users & Classes)</option>
                    <option value="instructor">Instructor (Build Lessons & Teach)</option>
                    <option value="assistant">Assistant (Run Mat & Take Notes)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Belt Rank</label>
                  <select
                    value={userFormData.rank}
                    onChange={(e) => setUserFormData({ ...userFormData, rank: e.target.value })}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option>Black Belt</option>
                    <option>Brown Belt</option>
                    <option>Purple Belt</option>
                    <option>Blue Belt</option>
                    <option>White Belt</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="coach@matops.com"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg"
                >
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW 1: MAT TIMER VIEW */}
      {activeTab === 'mat' && (
        <main className="flex-1 flex flex-col justify-between p-4 md:p-8 max-w-6xl mx-auto w-full">
          <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-900 pb-4 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                  isRest ? 'bg-amber-500/20 text-amber-400' :
                  activeMode === 'warmup' ? 'bg-orange-500/20 text-orange-400' :
                  activeMode === 'drill' ? 'bg-emerald-500/20 text-emerald-400' :
                  'bg-indigo-500/20 text-indigo-400'
                }`}>
                  {isRest ? 'Rest Interval' : 
                   activeMode === 'warmup' ? 'Warm-Up Phase' : 
                   activeMode === 'drill' ? 'Positional Drill' : 'Live Rolling'}
                </span>
                <span className="text-xs font-bold text-indigo-400 bg-indigo-950/40 border border-indigo-800/40 px-2 py-0.5 rounded">
                  {selectedPlan.concept}
                </span>
                <span className="text-xs text-slate-400 border border-slate-800 px-2 py-0.5 rounded">{selectedPlan.ageGroup}</span>
              </div>
              <h1 className="text-xl md:text-3xl font-extrabold">{selectedPlan.className}</h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  value={
                    activeMode === 'warmup' ? 'warmup' :
                    activeMode === 'drill' ? `drill-${activeDrillIndex}` : 'live'
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'warmup') handleHUDTargetChange('warmup');
                    else if (val === 'live') handleHUDTargetChange('live');
                    else handleHUDTargetChange('drill', parseInt(val.replace('drill-', '')));
                  }}
                  className="bg-slate-900 border border-slate-700 text-slate-100 font-bold text-sm px-4 py-2.5 rounded-xl appearance-none pr-10 focus:outline-none focus:border-emerald-500"
                >
                  <optgroup label="Preparation">
                    <option value="warmup">Warm-Up: {selectedPlan.warmUp.warmUpName}</option>
                  </optgroup>
                  {selectedPlan.drills.length > 0 && (
                    <optgroup label="Drills">
                      {selectedPlan.drills.map((d, idx) => (
                        <option key={d.id} value={`drill-${idx}`}>
                          Drill {idx + 1}: {d.drillName}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {selectedPlan.liveRounds.roundCount > 0 && (
                    <optgroup label="Sparring">
                      <option value="live">Live Rounds ({selectedPlan.liveRounds.roundCount} Rounds)</option>
                    </optgroup>
                  )}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-3.5 pointer-events-none text-slate-400" />
              </div>

              <div className="text-right pl-3 border-l border-slate-800">
                <span className="text-xs text-slate-400 uppercase font-semibold">Round</span>
                <div className="text-2xl md:text-3xl font-black text-slate-100">{currentRound} / {maxRounds}</div>
              </div>
            </div>
          </header>

          {/* INTEGRATED MAT MUSIC DECK BAR */}
          <div className="bg-slate-900/70 border border-purple-900/40 rounded-2xl p-3 my-2 shadow-lg backdrop-blur">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
                  <button
                    onClick={() => setMusicSource('local')}
                    className={`px-2.5 py-1 rounded-lg transition ${musicSource === 'local' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    Local Files
                  </button>
                  <button
                    onClick={() => setMusicSource('spotify')}
                    className={`px-2.5 py-1 rounded-lg transition ${musicSource === 'spotify' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    Spotify
                  </button>
                  <button
                    onClick={() => setMusicSource('apple')}
                    className={`px-2.5 py-1 rounded-lg transition ${musicSource === 'apple' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    Apple Music
                  </button>
                </div>

                {musicSource === 'local' ? (
                  <div className="text-xs">
                    {localPlaylist.length > 0 ? (
                      <div className="flex items-center gap-1.5 font-bold text-purple-300 truncate max-w-xs sm:max-w-md">
                        <Disc3 size={14} className={isMusicPlaying ? 'animate-spin' : ''} />
                        <span className="truncate">{localPlaylist[currentTrackIndex]?.name}</span>
                        <span className="text-[10px] text-slate-500 font-semibold">({currentTrackIndex + 1}/{localPlaylist.length})</span>
                      </div>
                    ) : (
                      <span className="text-slate-500 italic">No audio files loaded yet</span>
                    )}
                  </div>
                ) : (
                  <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Radio size={14} className="text-emerald-400" />
                    <span>Streaming Widget Ready</span>
                  </div>
                )}
              </div>

              {musicSource === 'local' ? (
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl border border-slate-700 cursor-pointer">
                    <UploadCloud size={14} />
                    <span>Upload Tracks</span>
                    <input type="file" multiple accept="audio/*" onChange={handleLocalFilesUpload} className="hidden" />
                  </label>

                  <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-xl">
                    <button onClick={restartTrack} disabled={localPlaylist.length === 0} className="p-1.5 hover:text-white text-slate-400 disabled:opacity-40" title="Restart Track"><RotateCcw size={15} /></button>
                    <button onClick={() => skipTrack('prev')} disabled={localPlaylist.length === 0} className="p-1.5 hover:text-white text-slate-400 disabled:opacity-40" title="Previous Track"><SkipBack size={15} /></button>
                    <button onClick={toggleMusicPlayback} disabled={localPlaylist.length === 0} className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1 disabled:opacity-40">
                      {isMusicPlaying ? <Pause size={13} /> : <Play size={13} />}
                      <span>{isMusicPlaying ? 'Pause' : 'Play'}</span>
                    </button>
                    <button onClick={() => skipTrack('next')} disabled={localPlaylist.length === 0} className="p-1.5 hover:text-white text-slate-400 disabled:opacity-40" title="Skip Track"><SkipForward size={15} /></button>
                  </div>

                  <div className="hidden sm:flex items-center gap-1.5 w-24">
                    <Volume2 size={13} className="text-slate-400" />
                    <input type="range" min="0" max="1" step="0.05" value={musicVolume} onChange={(e) => setMusicVolume(parseFloat(e.target.value))} className="w-full accent-purple-500 bg-slate-950 rounded cursor-pointer" />
                  </div>
                </div>
              ) : musicSource === 'spotify' ? (
                <div className="flex items-center gap-2">
                  <a href="https://open.spotify.com" target="_blank" rel="noreferrer" className="text-xs font-bold text-emerald-400 hover:underline">Open App ↗</a>
                  <button onClick={() => setIsMusicDeckOpen(true)} className="text-xs bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 px-3 py-1 rounded-lg font-bold">Show Player</button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <a href="https://music.apple.com" target="_blank" rel="noreferrer" className="text-xs font-bold text-rose-400 hover:underline">Open App ↗</a>
                  <button onClick={() => setIsMusicDeckOpen(true)} className="text-xs bg-rose-600/30 text-rose-400 border border-rose-500/40 px-3 py-1 rounded-lg font-bold">Show Player</button>
                </div>
              )}
            </div>

            {isMusicDeckOpen && (
              <div className="mt-3 pt-3 border-t border-slate-800">
                {musicSource === 'spotify' && (
                  <div className="rounded-xl overflow-hidden shadow-2xl">
                    <iframe src={`https://open.spotify.com/embed/${spotifyEmbedUri}?utm_source=generator&theme=0`} width="100%" height="152" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" />
                  </div>
                )}
                {musicSource === 'apple' && (
                  <div className="rounded-xl overflow-hidden shadow-2xl">
                    <iframe src={appleMusicEmbedUrl} width="100%" height="152" frameBorder="0" allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write" sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation" loading="lazy" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* CENTRAL CLOCK */}
          <section className="text-center my-3">
            <div className={`text-8xl sm:text-9xl md:text-[11rem] font-black tracking-tighter tabular-nums ${isRest ? 'text-amber-400' : 'text-white'}`}>
              {formatTime(secondsLeft)}
            </div>

            <div className="flex justify-center items-center gap-3 mt-4 flex-wrap">
              <button
                onClick={() => {
                  playSoundTone('start');
                  setIsActive(!isActive);
                }}
                className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg shadow-xl transition active:scale-95 ${
                  isActive ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {isActive ? <Pause size={24} /> : <Play size={24} />}
                {isActive ? 'Pause' : 'Start Round'}
              </button>

              <button
                onClick={() => {
                  setIsActive(false);
                  setIsRest(false);
                  setSecondsLeft(workDuration);
                }}
                className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 font-semibold"
              >
                <RotateCcw size={20} />
                Reset
              </button>

              <button
                onClick={() => {
                  setIsActive(false);
                  setIsRest(false);
                  setCurrentRound((prev) => (prev < maxRounds ? prev + 1 : 1));
                  setSecondsLeft(workDuration);
                }}
                className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 font-semibold"
              >
                <SkipForward size={20} />
                Skip Round
              </button>
            </div>

            {/* DUAL PARAMETER MODIFIERS */}
            <div className="mt-5 bg-slate-900/50 border border-slate-800/80 p-3 rounded-2xl max-w-2xl mx-auto space-y-2">
              <div className="flex justify-center items-center gap-6 text-xs text-slate-300">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Immediate Modifiers:</span>
                <div className="flex items-center gap-1.5">
                  <span>Round:</span>
                  <button onClick={() => adjustHUDTimer('work', -60)} className="px-1.5 py-0.5 rounded bg-slate-800 hover:text-white font-bold">-1m</button>
                  <button onClick={() => adjustHUDTimer('work', 60)} className="px-1.5 py-0.5 rounded bg-slate-800 hover:text-white font-bold">+1m</button>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>Rest:</span>
                  <button onClick={() => adjustHUDTimer('rest', -30)} className="px-1.5 py-0.5 rounded bg-slate-800 hover:text-white font-bold">-30s</button>
                  <button onClick={() => adjustHUDTimer('rest', 30)} className="px-1.5 py-0.5 rounded bg-slate-800 hover:text-white font-bold">+30s</button>
                </div>
              </div>
            </div>
          </section>

          {/* CONTEXT FOOTER */}
          <footer className="space-y-4">
            {activeMode === 'warmup' ? (
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl border-l-4 border-l-orange-500">
                  <div className="text-xs uppercase font-bold text-slate-400">Warm-Up Activity</div>
                  <div className="text-base font-bold text-white mt-0.5">{currentWarmUp.warmUpName}</div>
                  <p className="text-xs text-slate-400 mt-1">{currentWarmUp.description}</p>
                </div>
                <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl border-l-4 border-l-amber-500">
                  <div className="text-xs uppercase font-bold text-slate-400">Game Rules</div>
                  <p className="text-sm font-semibold text-slate-200 mt-1.5">{currentWarmUp.gameRules || 'Standard movement rules.'}</p>
                </div>
                <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl border-l-4 border-l-rose-500">
                  <div className="text-xs uppercase font-bold text-slate-400">Constraints</div>
                  <p className="text-sm font-semibold text-slate-200 mt-1.5">{currentWarmUp.constraints || 'No additional constraints.'}</p>
                </div>
              </div>
            ) : activeMode === 'drill' ? (
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl border-l-4 border-l-emerald-500">
                  <div className="text-xs uppercase font-bold text-slate-400">Drill Name & Goal</div>
                  <div className="text-base font-bold text-white mt-0.5">{currentDrill.drillName}</div>
                  <p className="text-sm font-medium text-slate-300 mt-1">{currentDrill.primaryGoal}</p>
                </div>
                <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl border-l-4 border-l-amber-500">
                  <div className="text-xs uppercase font-bold text-slate-400">Drill Constraints</div>
                  <p className="text-sm font-semibold text-slate-200 mt-1.5">{currentDrill.drillConstraints}</p>
                </div>
                <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl border-l-4 border-l-rose-500">
                  <div className="text-xs uppercase font-bold text-slate-400">Immediate Reset Condition</div>
                  <p className="text-sm font-semibold text-slate-200 mt-1.5">{currentDrill.immediateReset}</p>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl text-center border-l-4 border-l-indigo-500">
                <h3 className="text-lg font-bold text-indigo-400 uppercase tracking-wider">Live Rounds in Progress</h3>
                <p className="text-sm text-slate-300 mt-1">Full situational or open sparring rounds according to class belt regulations.</p>
              </div>
            )}
          </footer>
        </main>
      )}

      {/* VIEW 2: LESSON BUILDER */}
      {activeTab === 'builder' && (
        <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">Lesson Plan Builder</h2>
              <p className="text-sm text-slate-400">Configure warm-ups, drill constraints, and live sparring.</p>
            </div>
            <button
              type="button"
              disabled={isGenerating}
              onClick={async () => {
                setIsGenerating(true);
                try {
                  const res = await fetch('/api/generate-lesson', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      concept: builderForm.concept,
                      ageGroup: builderForm.ageGroup,
                      beltRank: builderForm.beltRank,
                      totalDurationMinutes: builderForm.totalDurationMinutes,
                    }),
                  });
                  if (!res.ok) throw new Error('Generation failed');
                  const aiPlan = await res.json();
                  const formattedDrills = (aiPlan.drills || []).map((d: any, idx: number) => ({
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
                } catch (err) {
                  alert('Failed to connect to the AI model.');
                } finally {
                  setIsGenerating(false);
                }
              }}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs md:text-sm font-bold shadow-lg transition"
            >
              {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {isGenerating ? 'Designing Session...' : 'AI Black Belt Suggest'}
            </button>
          </div>

          <form onSubmit={handleCreatePlan} className="space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl grid sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase">Core Concept</label>
                  <button
                    type="button"
                    onClick={() => setIsNewConceptModalOpen(true)}
                    className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <Plus size={12} /> New Concept
                  </button>
                </div>
                <select
                  value={builderForm.concept}
                  onChange={(e) => setBuilderForm({ ...builderForm, concept: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                >
                  {coreConcepts.map((c) => (<option key={c} value={c}>{c}</option>))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Lesson / Class Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Dogfight Knee Lever Counter"
                  value={builderForm.className}
                  onChange={(e) => setBuilderForm({ ...builderForm, className: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Age Group</label>
                <select
                  value={builderForm.ageGroup}
                  onChange={(e) => setBuilderForm({ ...builderForm, ageGroup: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
                >
                  <option>Ages 3-6</option>
                  <option>Ages 7-12</option>
                  <option>Teens</option>
                  <option>Adults</option>
                  <option>Masters</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Belt Rank</label>
                <select
                  value={builderForm.beltRank}
                  onChange={(e) => setBuilderForm({ ...builderForm, beltRank: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
                >
                  <option>White Belt</option>
                  <option>White / Gray Belt</option>
                  <option>Yellow / Orange / Green</option>
                  <option>Blue Belt</option>
                  <option>Purple Belt +</option>
                  <option>All Ranks</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-400 uppercase">Searchable Tags</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    placeholder="Type tag (e.g., No-Gi, Overhook, Submissions) and press Enter"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
                  />
                  <button type="button" onClick={handleAddTag} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-bold">Add Tag</button>
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                  {builderForm.tags.map((t) => (
                    <span key={t} className="bg-slate-800 text-slate-200 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-slate-700">
                      #{t}
                      <button type="button" onClick={() => handleRemoveTag(t)} className="hover:text-rose-400">✕</button>
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
                  <select
                    onChange={(e) => {
                      const found = warmUpPresets.find((w) => (w.id || w.warmUpName) === e.target.value);
                      if (found) applyPresetWarmUp(found);
                    }}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                    value=""
                  >
                    <option value="" disabled>Load Reusable Preset...</option>
                    {warmUpPresets.map((wu) => (
                      <option key={wu.id || wu.warmUpName} value={wu.id || wu.warmUpName}>
                        {wu.warmUpName} ({wu.type === 'general' ? 'General' : 'Game'})
                      </option>
                    ))}
                  </select>

                  <button type="button" onClick={handleSaveCurrentWarmUpAsPreset} className="flex items-center gap-1 text-xs font-bold text-orange-400 bg-orange-950/40 border border-orange-800/40 hover:bg-orange-900/60 px-2.5 py-1.5 rounded-lg transition">
                    <BookmarkPlus size={14} /> Save Preset
                  </button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Warm-Up Name</label>
                  <input
                    type="text"
                    required
                    value={builderForm.warmUp.warmUpName}
                    onChange={(e) => setBuilderForm({ ...builderForm, warmUp: { ...builderForm.warmUp, warmUpName: e.target.value } })}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Warm-Up Type</label>
                  <select
                    value={builderForm.warmUp.type}
                    onChange={(e) => setBuilderForm({ ...builderForm, warmUp: { ...builderForm.warmUp, type: e.target.value as 'general' | 'game' } })}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="general">General Movement (Solo drills, mobility)</option>
                    <option value="game">Task-Based Game (Paired interaction, agility)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Description</label>
                <textarea
                  rows={2}
                  value={builderForm.warmUp.description}
                  onChange={(e) => setBuilderForm({ ...builderForm, warmUp: { ...builderForm.warmUp, description: e.target.value } })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              {builderForm.warmUp.type === 'game' && (
                <div className="grid sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800/80">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase">Game Rules</label>
                    <textarea rows={2} value={builderForm.warmUp.gameRules || ''} onChange={(e) => setBuilderForm({ ...builderForm, warmUp: { ...builderForm.warmUp, gameRules: e.target.value } })} className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase">Constraints</label>
                    <textarea rows={2} value={builderForm.warmUp.constraints || ''} onChange={(e) => setBuilderForm({ ...builderForm, warmUp: { ...builderForm.warmUp, constraints: e.target.value } })} className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase">Goals</label>
                    <textarea rows={2} value={builderForm.warmUp.goals || ''} onChange={(e) => setBuilderForm({ ...builderForm, warmUp: { ...builderForm.warmUp, goals: e.target.value } })} className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs" />
                  </div>
                </div>
              )}

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

            {/* DRILLS BLOCK SECTION */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Shield size={18} className="text-emerald-400" /> Drills
                </h3>
                <button type="button" onClick={addDrillToForm} className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-lg">
                  <PlusCircle size={15} /> Add Another Drill
                </button>
              </div>

              {builderForm.drills.map((drill, index) => (
                <div key={drill.id} className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black px-2 py-0.5 rounded bg-slate-800 text-slate-300">Drill #{index + 1}</span>
                    {builderForm.drills.length > 1 && (
                      <button type="button" onClick={() => removeDrillFromForm(drill.id)} className="text-slate-500 hover:text-rose-400 p-1"><Trash2 size={16} /></button>
                    )}
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
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={builderForm.isPublic} onChange={(e) => setBuilderForm({ ...builderForm, isPublic: e.target.checked })} className="w-4 h-4 rounded text-emerald-500 bg-slate-950 border-slate-800" />
                <span className="text-sm font-medium flex items-center gap-1.5">
                  {builderForm.isPublic ? <Globe size={16} className="text-emerald-400" /> : <Lock size={16} className="text-slate-400" />}
                  {builderForm.isPublic ? 'Publish to Curriculum Hub' : 'Keep Private'}
                </span>
              </label>

              <button type="submit" className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2">
                <PlusCircle size={18} /> Save & Load to Mat HUD
              </button>
            </div>
          </form>
        </main>
      )}

      {/* VIEW 3: CURRICULUM HUB */}
      {activeTab === 'community' && (
        <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-2xl font-bold">Curriculum Hub</h2>
              <p className="text-sm text-slate-400">
                {hubSection === 'lessons' ? 'Organized by core concepts. Filter by technique tags.' : 'Library of general flows and paired exploratory warm-up games.'}
              </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
              <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl">
                <button onClick={() => setHubSection('lessons')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${hubSection === 'lessons' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}>Concept Lessons</button>
                <button onClick={() => setHubSection('warmups')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${hubSection === 'warmups' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'}`}><Flame size={13} />Warm-Up Library</button>
              </div>

              {hubSection === 'lessons' ? (
                <button onClick={() => setIsNewConceptModalOpen(true)} className="flex items-center gap-1.5 bg-emerald-600/20 text-emerald-400 border border-emerald-600/40 hover:bg-emerald-600 hover:text-white px-3 py-2 rounded-xl text-xs md:text-sm font-bold"><FolderPlus size={16} />Add Concept</button>
              ) : (
                <button onClick={() => setIsNewWarmUpModalOpen(true)} className="flex items-center gap-1.5 bg-orange-600/20 text-orange-400 border border-orange-600/40 hover:bg-orange-600 hover:text-white px-3 py-2 rounded-xl text-xs md:text-sm font-bold"><PlusCircle size={16} />Add Warm-Up</button>
              )}

              <div className="relative flex-1 md:w-60">
                <Search size={16} className="absolute left-3 top-3 text-slate-400 pointer-events-none" />
                <input type="text" placeholder={hubSection === 'lessons' ? 'Search concepts, tags...' : 'Search warm-ups...'} value={hubSearchTerm} onChange={(e) => setHubSearchTerm(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-emerald-500" />
              </div>
            </div>
          </div>

          {hubSection === 'lessons' ? (
            <div className="space-y-6">
              {Object.entries(plansByConcept).map(([conceptName, conceptPlans]) => {
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
                        {conceptPlans.map((p) => (
                          <div key={p.id} className="bg-slate-950/80 border border-slate-800/80 p-5 rounded-xl flex flex-col justify-between">
                            <div>
                              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">{p.ageGroup} • {p.beltRank}</span>
                              <h4 className="font-bold text-base text-white mt-2">{p.className}</h4>
                              <div className="text-xs text-slate-400 mt-1">Instructor: {p.authorName}</div>
                            </div>
                            <div className="mt-5 pt-3 border-t border-slate-800 flex justify-between items-center">
                              <span className="text-xs text-slate-400">{p.liveRounds.roundCount} Sparring Rounds</span>
                              <button onClick={() => loadPlanToMat(p)} className="bg-emerald-600/20 text-emerald-400 border border-emerald-600/40 hover:bg-emerald-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"><Play size={13} />Run on Mat</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {filteredWarmUps.map((wu) => (
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
      )}

      {/* VIEW 4: ACADEMY CALENDAR */}
      {activeTab === 'calendar' && (
        <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <CalendarIcon size={22} className="text-emerald-400" /> Academy Schedule & Pacing
              </h2>
              <p className="text-sm text-slate-400">Plan classes by real calendar dates, assign coaches, and record class debriefs.</p>
            </div>
            <button onClick={() => setIsTemplateManagerOpen(true)} className="bg-slate-900 border border-slate-700 hover:bg-slate-800 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 text-slate-200">
              <PlusCircle size={15} className="text-emerald-400" /> Class Templates ({classTemplates.length})
            </button>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <select value={calendarAnchorDate.getMonth()} onChange={(e) => setMonthAnchor(parseInt(e.target.value))} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-100">
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, idx) => (
                  <option key={m} value={idx}>{m}</option>
                ))}
              </select>
              <select value={calendarAnchorDate.getFullYear()} onChange={(e) => setYearAnchor(parseInt(e.target.value))} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-100">
                {[2025, 2026, 2027, 2028].map((y) => (<option key={y} value={y}>{y}</option>))}
              </select>
              <button onClick={() => setCalendarAnchorDate(new Date())} className="bg-slate-800 hover:bg-slate-700 text-xs px-2.5 py-1.5 rounded-lg text-slate-300 font-semibold">Current Week</button>
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
              const dayName = dayDate.toLocaleDateString('en-US', { weekday: 'long' });
              const dateReadable = dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              const scheduledClassesForDay = schedule.filter((s) => s.dateStr === dayDateKey);

              return (
                <div key={dayDateKey} className="border border-slate-800 rounded-2xl p-5 space-y-4 bg-slate-900/40">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-3">
                      <h3 className="font-extrabold text-base text-white">{dayName}</h3>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-0.5 rounded-full">{dateReadable}</span>
                    </div>
                    <button onClick={() => openAddClassModalForDate(dayDateKey)} className="flex items-center gap-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl border border-slate-700">
                      <Plus size={14} className="text-emerald-400" /> Add Class
                    </button>
                  </div>

                  {scheduledClassesForDay.map((cl) => {
                    const assignedPlan = plans.find((p) => p.id === cl.assignedLessonId);
                    return (
                      <div key={cl.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-900">
                          <div>
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-xs font-black px-2 py-0.5 rounded bg-slate-800 text-slate-200">{cl.time}</span>
                              <h4 className="font-bold text-base text-white">{cl.title}</h4>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {assignedPlan && (
                              <button onClick={() => loadPlanToMat(assignedPlan)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"><Play size={13} />Run on Mat</button>
                            )}
                            <button onClick={() => handleDeleteScheduledClass(cl.id)} className="text-slate-500 hover:text-rose-400 p-1.5"><Trash2 size={16} /></button>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 pt-1">
                          <textarea rows={2} placeholder="Class Debrief Notes..." value={cl.postClassNotes} onChange={(e) => updateScheduledClass(cl.id, { postClassNotes: e.target.value })} className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-2.5 text-xs" />
                          <textarea rows={2} placeholder="Modifications Suggested..." value={cl.modificationsSuggested} onChange={(e) => updateScheduledClass(cl.id, { modificationsSuggested: e.target.value })} className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-2.5 text-xs" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </main>
      )}

      {/* VIEW 5: ASK AI */}
      {activeTab === 'chat' && (
        <main className="flex-1 flex flex-col p-4 md:p-8 max-w-4xl mx-auto w-full">
          <div className="border-b border-slate-800 pb-4 mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles size={22} className="text-indigo-400" /> AI Black Belt Mat Consultant
            </h2>
            <p className="text-sm text-slate-400">Ask pedagogical, technical, and live-sparring questions to refine your classes.</p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 min-h-[400px] max-h-[550px]">
            {chatMessages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-black text-xs shrink-0">BB</div>
                )}
                <div className={`p-4 rounded-2xl max-w-xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none whitespace-pre-line'}`}>
                  {msg.content}
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
            onSubmit={async (e) => {
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
                setChatMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: 'assistant', content: data.reply || 'Processed.' }]);
              } catch (err) {
                setChatMessages((prev) => [...prev, { id: `err-${Date.now()}`, role: 'assistant', content: 'Connection issue.' }]);
              } finally {
                setIsChatSending(false);
              }
            }}
            className="flex gap-2"
          >
            <input type="text" placeholder="Ask AI..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm" />
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-3 rounded-xl flex items-center gap-2"><Send size={16} />Ask</button>
          </form>
        </main>
      )}

      {/* VIEW 6: ROSTER & ROLES */}
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
                  {currentInstructor && <button onClick={() => setActiveTab('profile')} className="text-xs text-emerald-400 font-bold hover:underline">View Profile</button>}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">Authorized Instructors & Staff</h3>
                <p className="text-xs text-slate-400">{canManageAcademy ? 'Owners and managers can manage accounts, roles, and credentials.' : 'Viewing staff roster.'}</p>
              </div>
              {canManageAcademy && (
                <button
                  onClick={() => {
                    setIsEditingUser(false);
                    setUserFormData({ id: '', username: '', password: 'password123', name: '', email: '', role: 'instructor', rank: 'Purple Belt', bio: '' });
                    setIsUserModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl"
                >
                  <PlusCircle size={15} /> Add User
                </button>
              )}
            </div>

            <div className="divide-y divide-slate-800">
              {instructors.map((inst) => (
                <div key={inst.id} className="py-3.5 flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <div className="font-bold text-sm text-slate-100 flex items-center gap-2">{inst.name} <span className="text-xs font-normal text-slate-400">(@{inst.username})</span></div>
                    <div className="text-xs text-slate-400">{inst.email} • {inst.rank}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">{inst.role}</span>
                    {canManageAcademy && (
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setIsEditingUser(true); setUserFormData({ ...inst, password: inst.password || 'password123' }); setIsUserModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"><Edit3 size={15} /></button>
                        {inst.id !== currentInstructor?.id && (
                          <button onClick={() => handleDeleteUser(inst.id)} className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800"><Trash2 size={15} /></button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* VIEW 7: INSTRUCTOR PROFILE */}
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
                <input type="text" value={currentInstructor.name} onChange={(e) => {
                  const updated = { ...currentInstructor, name: e.target.value };
                  setCurrentInstructor(updated);
                  setInstructors(instructors.map((i) => i.id === updated.id ? updated : i));
                }} className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Email</label>
                <input type="email" value={currentInstructor.email} onChange={(e) => {
                  const updated = { ...currentInstructor, email: e.target.value };
                  setCurrentInstructor(updated);
                  setInstructors(instructors.map((i) => i.id === updated.id ? updated : i));
                }} className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
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
              <button onClick={() => setIsAudioModalOpen(false)} className="text-slate-400 hover:text-white text-sm">✕</button>
            </div>
            <div>
              <label className="text-xs uppercase font-bold text-slate-400">Tone Type</label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button type="button" onClick={() => setAlarmType('bell')} className={`py-3 px-4 rounded-xl font-bold text-sm border text-left ${alarmType === 'bell' ? 'border-emerald-500 bg-emerald-950/30 text-emerald-400' : 'border-slate-800 bg-slate-950 text-slate-400'}`}>Boxing Bell</button>
                <button type="button" onClick={() => setAlarmType('beep')} className={`py-3 px-4 rounded-xl font-bold text-sm border text-left ${alarmType === 'beep' ? 'border-emerald-500 bg-emerald-950/30 text-emerald-400' : 'border-slate-800 bg-slate-950 text-slate-400'}`}>Electronic Beep</button>
              </div>
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
              <input type="text" required placeholder="Class Name" value={templateFormData.name} onChange={(e) => setTemplateFormData({ ...templateFormData, name: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white" />
              <button type="submit" className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white">Save Template</button>
            </form>
            <div className="divide-y divide-slate-800">
              {classTemplates.map((t) => (
                <div key={t.id} className="py-2.5 flex items-center justify-between">
                  <div className="text-sm font-bold text-white">{t.name} ({t.durationMinutes}m)</div>
                  <button onClick={() => handleDeleteClassTemplate(t.id)} className="text-slate-400 hover:text-rose-400 p-1"><Trash2 size={15} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ADD CLASS MODAL */}
      {isAddClassModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-white">Add Class ({targetDateForNewClass})</h3>
              <button onClick={() => setIsAddClassModalOpen(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleScheduleNewClass} className="space-y-4">
              <select value={selectedTemplateForNewClass} onChange={(e) => setSelectedTemplateForNewClass(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm">
                {classTemplates.map((ct) => (<option key={ct.id} value={ct.id}>{ct.name}</option>))}
              </select>
              <input type="text" required placeholder="06:00 PM" value={newClassTime} onChange={(e) => setNewClassTime(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm" />
              <button type="submit" className="w-full py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white">Add Class</button>
            </form>
          </div>
        </div>
      )}

      {/* NEW CONCEPT MODAL */}
      {isNewConceptModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-white">Add New Core Concept</h3>
              <button onClick={() => setIsNewConceptModalOpen(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleAddNewConcept} className="space-y-4">
              <input type="text" required autoFocus placeholder="Concept Name" value={newConceptInput} onChange={(e) => setNewConceptInput(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm" />
              <button type="submit" className="w-full py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white">Save Concept</button>
            </form>
          </div>
        </div>
      )}

      {/* NEW WARM-UP MODAL */}
      {isNewWarmUpModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-white">Add New Warm-Up</h3>
              <button onClick={() => setIsNewWarmUpModalOpen(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateNewWarmUp} className="space-y-4">
              <input type="text" required placeholder="Warm-Up Name" value={newWarmUpForm.warmUpName} onChange={(e) => setNewWarmUpForm({ ...newWarmUpForm, warmUpName: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm" />
              <textarea rows={2} required placeholder="Description" value={newWarmUpForm.description} onChange={(e) => setNewWarmUpForm({ ...newWarmUpForm, description: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs" />
              <button type="submit" className="w-full py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white">Save Warm-Up</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}