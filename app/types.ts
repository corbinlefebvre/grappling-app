// app/types.ts
export type UserRole = 'owner' | 'manager' | 'instructor' | 'assistant';

export interface Instructor {
  id: string;
  username: string;
  password?: string;
  name: string;
  email: string;
  role: UserRole;
  rank: string;
  bio?: string;
}

export interface LocalTrack {
  id: string;
  name: string;
  fileUrl: string;
}

export interface FlowNode {
  id: string;
  techniqueName: string;
  opponentDefenseTrigger: string;
  transitionCue: string;
}

export interface FlowRoutine {
  id: string;
  title: string;
  concept: string;
  startingPosition: string;
  roundCount: number;
  roundTimeSeconds: number;
  restTimeSeconds: number;
  nodes: FlowNode[];
  isPublic?: boolean;
}

export interface WarmUp {
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

export interface Drill {
  id: string;
  drillName: string;
  drillConstraints: string;
  primaryGoal: string;
  immediateReset: string;
  roundCount: number;
  roundTimeSeconds: number;
  restTimeSeconds: number;
}

export interface LessonPlan {
  id: string;
  className: string;
  concept: string;
  ageGroup: string;
  beltRank: string;
  totalDurationMinutes: number;
  tags: string[];
  warmUp: WarmUp;
  flow?: FlowRoutine | null;
  drills: Drill[];
  liveRounds: {
    roundCount: number;
    roundTimeSeconds: number;
    restTimeSeconds: number;
  };
  isPublic: boolean;
  authorInstructorId: string;
  authorName: string;
  createdAt?: string;
}

export interface ClassTemplate {
  id: string;
  name: string;
  ageGroup: string;
  durationMinutes: number;
}

export interface ScheduledClass {
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

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  actionPayload?: {
    action: 'CREATE_CONCEPT' | 'POPULATE_LESSON' | 'POPULATE_WARMUP';
    conceptData?: { conceptName: string } | null;
    warmUpData?: WarmUp | null;
    lessonData?: any | null;
  };
}

export interface WeeklyTaxonomy {
  weekNum: number;
  monthNum: number;
  themeTitle: string;
  concept: string;
  lineage: string;
  techniqueThemes: string[];
}
