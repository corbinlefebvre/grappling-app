'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, SkipForward, SkipBack, PlusCircle, Trash2,
  Globe, Lock, Sparkles, BookOpen, Clock, Shield, Users, 
  Volume2, ChevronDown, ChevronRight, ChevronLeft, Plus, Minus, LogOut,
  Calendar as CalendarIcon, Tag, Search, FolderPlus, X, Loader2, MessageSquare, 
  Send, UserCheck, FileText, CheckCircle2, Flame, BookmarkPlus, Edit3, Key, User,
  ShieldCheck, LogIn, Music, Disc3, Radio, UploadCloud, GitBranch, ArrowRight,
  ExternalLink
} from 'lucide-react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// --- SUPABASE CLIENT INITIALIZATION ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
const supabase: SupabaseClient | null = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

const DEFAULT_ACADEMY_ID = '00000000-0000-0000-0000-000000000001';

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

interface FlowNode {
  id: string;
  techniqueName: string;
  opponentDefenseTrigger: string;
  transitionCue: string;
}

interface FlowRoutine {
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
  actionPayload?: {
    action: 'CREATE_CONCEPT' | 'POPULATE_LESSON';
    conceptData?: { conceptName: string } | null;
    lessonData?: any | null;
  };
}

// --- CURATED PRE-BAKED BASELINE LIBRARY ---
const BASELINE_CONCEPTS: string[] = [
  'Closed Guard Dominance (Roger Gracie System)',
  'Half Guard & Chest Camping (Gordon Ryan System)',
  'Butterfly & X-Guard Dynamics (Marcelo Garcia System)',
  'Side Control & North-South Pins (Bernardo Faria System)',
  'Back Trapping & Straight Jacket (John Danaher System)',
  'K-Guard & 50/50 Heel Hooks (Lachlan Giles System)',
  'Open Guard Retention & Framing (Mikey Musumeci System)',
  'Front Headlock & Guillotine Hub (Marcelo Garcia System)'
];

const BASELINE_WARMUPS: WarmUp[] = [
  {
    id: 'wu-flow-1',
    warmUpName: 'General Dynamic Movement Flow',
    type: 'general',
    description: 'Solo locomotion down mat lines: hip escapes, granby rolls, technical standups, and animal crawls.',
    gameRules: 'Continuous movement down lines with active mat engagement.',
    constraints: 'No resting on heels; maintain active posting hands.',
    goals: 'Elevate core body temperature and prime spinal flexion/extension.',
    roundCount: 1,
    roundTimeSeconds: 300,
    restTimeSeconds: 30,
    isCustom: false,
  },
  {
    id: 'wu-tag-1',
    warmUpName: 'Shoulder & Knee Tag Agility',
    type: 'game',
    description: 'Standing agility priming stance, level changes, and defensive framing.',
    gameRules: 'Touch opponent lead knee or shoulder to score 1 point. First to 5 points wins.',
    constraints: 'No grabbing clothing/gi; no collar ties. Defensive posts must touch hands or forearms only.',
    goals: 'Touch targets while maintaining your base stance.',
    roundCount: 3,
    roundTimeSeconds: 90,
    restTimeSeconds: 20,
    isCustom: false,
  },
  {
    id: 'wu-pummel-1',
    warmUpName: 'Inside Hand Fight & Pummel Relay',
    type: 'game',
    description: 'Standing or kneeling clinch pummeling focusing on interior head and arm frame control.',
    gameRules: 'Continuous contact. Fight for double underhooks or double inside bicep control.',
    constraints: 'No tripping or takedowns; arms cannot leave opponent torso or bicep frames.',
    goals: 'Win inside position for 3 consecutive seconds.',
    roundCount: 4,
    roundTimeSeconds: 60,
    restTimeSeconds: 15,
    isCustom: false,
  }
];

const BASELINE_FLOWS: FlowRoutine[] = [
  {
    id: 'flow-roger-closed',
    title: 'Closed Guard Triple Threat Chain (Roger Gracie)',
    concept: 'Closed Guard Dominance (Roger Gracie System)',
    startingPosition: 'Closed Guard Bottom',
    roundCount: 4,
    roundTimeSeconds: 180,
    restTimeSeconds: 30,
    nodes: [
      {
        id: 'rg-1',
        techniqueName: 'Straight Armbar from Guard',
        opponentDefenseTrigger: 'Opponent turns thumb inward, pulls elbow across centerline, and stacks forward.',
        transitionCue: 'Pass leg over head, shoot far hamstring over collarbone into Triangle lock.'
      },
      {
        id: 'rg-2',
        techniqueName: 'Triangle Choke',
        opponentDefenseTrigger: 'Opponent hides trapped arm behind your back or slips elbow deep toward mat.',
        transitionCue: 'Underhook far leg or arm, pivot hips 90 degrees, sweep legs around into Omoplata.'
      },
      {
        id: 'rg-3',
        techniqueName: 'Omoplata Shoulder Lock',
        opponentDefenseTrigger: 'Opponent rolls forward over trapped shoulder to relieve joint pressure.',
        transitionCue: 'Catch the roll, re-lock legs around neck to re-enter Triangle.'
      },
      {
        id: 'rg-4',
        techniqueName: 'Secondary Triangle Finish',
        opponentDefenseTrigger: 'Opponent posture breaks forward, driving straight arm between knees.',
        transitionCue: 'Bite knees tight, clamp two-on-one on the wrist, bridge hips into Shotgun Armbar finish.'
      },
      {
        id: 'rg-5',
        techniqueName: 'Shotgun Armbar Finish',
        opponentDefenseTrigger: 'Immediate tap or reset.',
        transitionCue: 'Controlled joint extension. Reset to closed guard for opposite side or partner swap.'
      }
    ]
  },
  {
    id: 'flow-gordon-half',
    title: 'Chest-to-Chest Half Guard Passing (Gordon Ryan)',
    concept: 'Half Guard & Chest Camping (Gordon Ryan System)',
    startingPosition: 'Headquarters / Split-Squat',
    roundCount: 4,
    roundTimeSeconds: 180,
    restTimeSeconds: 30,
    nodes: [
      {
        id: 'gr-1',
        techniqueName: 'Split-Squat Shin Pin',
        opponentDefenseTrigger: 'Opponent flares knee shield high across your sternum to prevent forward chest contact.',
        transitionCue: 'Weave lead arm under bottom ankle, post crown of head under chin, force hips flat into half guard.'
      },
      {
        id: 'gr-2',
        techniqueName: 'Chest-to-Chest Flattening',
        opponentDefenseTrigger: 'Opponent frames on hip bone and frames with forearm across throat to deny underhook.',
        transitionCue: 'Pummel under far armpit, walk fingers up mat, drive crossface jaw pressure until opponent turns head.'
      },
      {
        id: 'gr-3',
        techniqueName: 'Tripod Free-Foot Extraction',
        opponentDefenseTrigger: 'Opponent locks a low low-quarter lockdown around your trapped shin.',
        transitionCue: 'Tripod hips high above opponent chest, use free heel to peel ankle lock, slide knee to mat.'
      },
      {
        id: 'gr-4',
        techniqueName: 'High Mount Slide',
        opponentDefenseTrigger: 'Opponent reaches down to grab your escaping foot.',
        transitionCue: 'Step outside foot over trapped ankle, windshield-wiper legs, slide both knees into armpit mount.'
      }
    ]
  }
];

interface WeeklyTaxonomy {
  weekNum: number;
  monthNum: number;
  themeTitle: string;
  concept: string;
  lineage: string;
  techniqueThemes: string[];
}

const SIX_MONTH_TAXONOMY: WeeklyTaxonomy[] = [
  { weekNum: 1, monthNum: 1, themeTitle: 'Posture Breaking & 2-on-1 Sleeve Drag', concept: 'Closed Guard Dominance (Roger Gracie System)', lineage: 'Roger Gracie', techniqueThemes: ['Sleeve Drag to High Diamond Guard', 'Posture Collapse & Head Control', 'Elbow Isolation Drills', 'Grip Stripping Mechanics', 'Centerline Crossing', 'Diamond Guard Pressure'] },
  { weekNum: 2, monthNum: 1, themeTitle: 'Roger Gracie Cross-Collar Strangle', concept: 'Closed Guard Dominance (Roger Gracie System)', lineage: 'Roger Gracie', techniqueThemes: ['Deep Four-Finger Collar Placement', 'Scissor Hip Tilt Choke', 'Thumb-Inside Anchor', 'Posture Defense Counters', 'Elbow Flaring & Throat Pressure', 'Cross-Choke Trap Variations'] },
  { weekNum: 3, monthNum: 1, themeTitle: 'Hip Bump to Kimura / Guillotine Trap', concept: 'Closed Guard Dominance (Roger Gracie System)', lineage: 'Roger Gracie', techniqueThemes: ['Hip Bump Commitment', 'Hand-Post Kimura Wrap', 'Kimura to Guillotine Dilemma', 'Kimura Re-Roll Sweep', 'Overhook Kimura Control', 'Wrist Lock / Americana Transitions'] },
  { weekNum: 4, monthNum: 1, themeTitle: 'Scissor Sweep & Pendulum Dynamics', concept: 'Closed Guard Dominance (Roger Gracie System)', lineage: 'Roger Gracie', techniqueThemes: ['Shin-Shield Collar Sweep', 'Pendulum / Flower Sweep Entry', 'Pendulum to Armbar Trap', 'Scissor Sweep Rebound to Mount', 'Underhooking Far Leg', 'Overhead Elevator Reversal'] },
  { weekNum: 5, monthNum: 2, themeTitle: 'Headquarters & Split-Squat Base', concept: 'Half Guard & Chest Camping (Gordon Ryan System)', lineage: 'Gordon Ryan', techniqueThemes: ['Split-Squat Shin Pinning', 'Inside Knee Wedge Control', 'Killing Reverse De La Riva', 'Posture Wedging & Balance', 'Ankle Pinning Transitions', 'Headquarters Low Camping'] },
  { weekNum: 6, monthNum: 2, themeTitle: 'Pummeling Underhooks & Crossface Drive', concept: 'Half Guard & Chest Camping (Gordon Ryan System)', lineage: 'Gordon Ryan', techniqueThemes: ['Crossface Crown Pressure', 'Far Underhook Finger Walking', 'Near-Side Underhook Flattening', 'Killing Hip Frames with Wedges', 'Chest-to-Jaw Weight Lines', 'Shoulder Rotation Control'] },
  { weekNum: 7, monthNum: 2, themeTitle: 'Tripod Free-Foot Extraction', concept: 'Half Guard & Chest Camping (Gordon Ryan System)', lineage: 'Gordon Ryan', techniqueThemes: ['High Hips Tripod Elevation', 'Heel-to-Heel Ankle Stripping', 'Peeling Low Quarter Guard', 'Quarter Guard to 3/4 Mount', 'Knee Slide vs Lockdown', 'Preventing Deep Half Sweeps'] },
  { weekNum: 8, monthNum: 2, themeTitle: 'Three-Quarter Mount to Full High Mount', concept: 'Half Guard & Chest Camping (Gordon Ryan System)', lineage: 'Gordon Ryan', techniqueThemes: ['Windshield Wiper Leg Extraction', 'Knee Walk to Armpits', 'S-Mount Hip Positioning', 'Chest Pressure Retention', 'Heavy Mount Posture', 'Low Grapevine Stabilization'] },
  { weekNum: 9, monthNum: 3, themeTitle: 'Seated Butterfly Posture & Distance', concept: 'Butterfly & X-Guard Dynamics (Marcelo Garcia System)', lineage: 'Marcelo Garcia', techniqueThemes: ['Inside Instep Hook Placement', 'Torso Angle Alignment', 'Belt & Overhook Elevation', 'Hand Fighting from Butt-Scoot', 'Butterfly Elevation Reversals', 'Head Position in Butterfly'] },
  { weekNum: 10, monthNum: 3, themeTitle: '2-on-1 Arm Drag to Direct Rear Mount', concept: 'Butterfly & X-Guard Dynamics (Marcelo Garcia System)', lineage: 'Marcelo Garcia', techniqueThemes: ['Tricep Snap & Drag Mechanic', 'Chest-to-Back Angle Shift', 'Arm Drag to Double Leg Takedown', 'Re-Drag vs Stiff Arm', 'Seatbelt Connection from Drag', 'Standing Arm Drag to Mat Return'] },
  { weekNum: 11, monthNum: 3, themeTitle: 'Single Leg X Base Off-Balancing', concept: 'Butterfly & X-Guard Dynamics (Marcelo Garcia System)', lineage: 'Marcelo Garcia', techniqueThemes: ['SLX Ankle Clamp & Hip Extension', 'Technical Standup Trip Sweep', 'Foot-on-Hip Off-Balancing', 'Overhook Ankle Lock Setup', 'Transition to Full X-Guard', 'Knockdown Sweep to Top Pin'] },
  { weekNum: 12, monthNum: 3, themeTitle: 'High-Elbow Guillotine (Marcelotine)', concept: 'Butterfly & X-Guard Dynamics (Marcelo Garcia System)', lineage: 'Marcelo Garcia', techniqueThemes: ['Chin-Strap Hand Cup', 'High-Elbow Over Shoulder Clearance', 'Rib-to-Jaw Choke Closure', 'Butterfly Guillotine Extension', 'Front Headlock to Guillotine Trap', 'Guillotine vs Single Leg Takedown'] },
  { weekNum: 13, monthNum: 4, themeTitle: 'Crossface Pinning & Frame Destruction', concept: 'Side Control & North-South Pins (Bernardo Faria System)', lineage: 'Bernardo Faria', techniqueThemes: ['Near-Side Underhook Blocking', 'Killing Knee-Elbow Connection', 'Jaw-Turning Crossface Pin', 'Sprawled Toe Drive & Weight Drop', 'Walking Hips Around Head', 'Shoulder Pressure Maintenance'] },
  { weekNum: 14, monthNum: 4, themeTitle: 'Kesa Gatame to Reverse Scarf Hold', concept: 'Side Control & North-South Pins (Bernardo Faria System)', lineage: 'Bernardo Faria', techniqueThemes: ['Kesa Gatame Elbow Trapping', 'Americana with Legs from Kesa', 'Reverse Scarf Hold Hip Control', 'Kneebar Entry from Reverse Scarf', 'Weight Shifting vs Back Takes', 'Twister Hook Transition'] },
  { weekNum: 15, monthNum: 4, themeTitle: 'North-South Rotation & Hip Wedges', concept: 'Side Control & North-South Pins (Bernardo Faria System)', lineage: 'Bernardo Faria', techniqueThemes: ['Clockwise / Counter Rotation', 'Hip Blocking Armpit Pins', 'Killing Butterfly Hooks from Top', 'Double Tricep Control from N-S', 'Kimura Trap Grip Locking', 'Spinning to Opposite Side Control'] },
  { weekNum: 16, monthNum: 4, themeTitle: 'Marcelo Garcia North-South Strangle', concept: 'Side Control & North-South Pins (Bernardo Faria System)', lineage: 'Bernardo Faria', techniqueThemes: ['Bicep-to-Trachea Alignment', 'Low Rib Sliding Finish (No-Squeeze)', 'Chin-Trap Adjustment', 'Defense Mitigation & Trapping', 'North-South Strangle to Monoplata', 'Arm-In North-South Variation'] },
  { weekNum: 17, monthNum: 5, themeTitle: 'Seatbelt Control & Fall-Side Discipline', concept: 'Back Trapping & Straight Jacket (John Danaher System)', lineage: 'John Danaher', techniqueThemes: ['Over-Under Seatbelt Grip Connection', 'Underhook Fall-Side Alignment', 'Head-to-Jaw Wedge Positioning', 'Hook Maintenance & Body Clamps', 'Rotational Back Mount Control', 'Recovering Stripped Hooks'] },
  { weekNum: 18, monthNum: 5, themeTitle: 'Straight Jacket System (Arm Isolation)', concept: 'Back Trapping & Straight Jacket (John Danaher System)', lineage: 'John Danaher', techniqueThemes: ['Top-Hand Wrist Peeling', 'Leg Over Arm Trapping (Straight Jacket)', 'Two-on-One Choking Hand Isolation', 'Double Arm Trap Mechanics', 'Scraping the Arm Behind Back', 'Free Choke Hand Access'] },
  { weekNum: 19, monthNum: 5, themeTitle: 'Body Triangle Mastery & Turn Escapes', concept: 'Back Trapping & Straight Jacket (John Danaher System)', lineage: 'John Danaher', techniqueThemes: ['Locking Body Triangle on Top Side', 'Mitigating Ankle Lock Reversals', 'Switching Sides with Body Triangle', 'Belly-Down Back Mount Flattening', 'Smother Choke from Back', 'Hip Extension & Spine Compression'] },
  { weekNum: 20, monthNum: 5, themeTitle: 'Rear Naked Strangle (Elbow-Behind-Spine)', concept: 'Back Trapping & Straight Jacket (John Danaher System)', lineage: 'John Danaher', techniqueThemes: ['Rotational Wrist Blade Squeeze', 'Elbow-Behind-Spine Locking', 'Short Choke / Palm-to-Palm Grip', 'Finishing One-Handed Strangles', 'Over-Chin Strangle Mechanics', 'Jaw Compression to Strangle'] },
  { weekNum: 21, monthNum: 6, themeTitle: 'High Pummeling Guard Retention', concept: 'Open Guard Retention & Framing (Mikey Musumeci System)', lineage: 'Mikey Musumeci', techniqueThemes: ['High Knee Recovery vs Torreando', 'Granby Inversion on Upper Spine', 'Foot-in-Bicep Frame Defense', 'Knee-Shield Restoration', 'Framing with Shins and Wrists', 'Inverting to Neutral Guard'] },
  { weekNum: 22, monthNum: 6, themeTitle: 'K-Guard Entry from Open Guard', concept: 'K-Guard & 50/50 Heel Hooks (Lachlan Giles System)', lineage: 'Lachlan Giles', techniqueThemes: ['Scooping Arm Under Lead Thigh', 'Knee-Crease Shin Bite', 'Hamstring Clamping Force', 'K-Guard to Closed Guard Clamp', 'K-Guard to Triangle Dilemma', 'K-Guard Off-Balancing Tilt'] },
  { weekNum: 23, monthNum: 6, themeTitle: 'Inversion to Backside 50/50', concept: 'K-Guard & 50/50 Heel Hooks (Lachlan Giles System)', lineage: 'Lachlan Giles', techniqueThemes: ['Rolling Across Lead Shoulder', 'Clearing the Opponent Knee Line', 'Locking Backside 50/50 Triangle', 'Sprawl Defense Counters', 'Far Leg Trap (Double Trouble)', 'Knee Bar to Heel Hook Transition'] },
  { weekNum: 24, monthNum: 6, themeTitle: 'Heel Exposure Digging & Rotational Finish', concept: 'K-Guard & 50/50 Heel Hooks (Lachlan Giles System)', lineage: 'Lachlan Giles', techniqueThemes: ['Digging Calcaneous with Wrist Blade', 'Anchor Clamp to Ribcage', 'Bridge Hips & Rotational Torque', 'Mitigating Slipping & Roll Escapes', 'Belly-Down Breaking Rotation', 'Outside Heel Hook from 50/50'] },
  { weekNum: 25, monthNum: 6, themeTitle: 'Championship Scramble & Dynamic Scenarios', concept: 'Front Headlock & Guillotine Hub (Marcelo Garcia System)', lineage: 'Marcelo Garcia', techniqueThemes: ['Turtle Front Headlock Snapdown', 'Darce Choke Trap from Half Guard', 'Anaconda Choke Roll-Through', 'High-Elbow Guillotine Scramble', 'Sprawl & Spin-Behind Back Take', 'Front Choke to Back Control'] },
  { weekNum: 26, monthNum: 6, themeTitle: 'Tactical Flow Linking & Belt Evaluations', concept: 'Closed Guard Dominance (Roger Gracie System)', lineage: 'Roger Gracie', techniqueThemes: ['Multi-Branch Tactical Chain Linking', 'Progressive Resistance Flow Rounds', 'Positional Sparring Gauntlets', 'Submissions Under High Fatigue', 'Curricular Review & Retention Test', 'Belt Graduation Tournament'] },
];

function buildComprehensiveCurriculum(): LessonPlan[] {
  const generatedPlans: LessonPlan[] = [];
  const ageProfiles = [
    { ageGroup: 'Ages 3-6', beltRank: 'White Belt', duration: 30, roundCount: 3, roundTime: 60, restTime: 20 },
    { ageGroup: 'Ages 7-12', beltRank: 'White / Gray Belt', duration: 45, roundCount: 4, roundTime: 90, restTime: 20 },
    { ageGroup: 'Adults', beltRank: 'White - Blue Belt', duration: 60, roundCount: 5, roundTime: 120, restTime: 30 },
    { ageGroup: 'Masters', beltRank: 'Purple Belt +', duration: 75, roundCount: 5, roundTime: 180, restTime: 45 },
  ];

  SIX_MONTH_TAXONOMY.forEach((week: WeeklyTaxonomy) => {
    for (let dayIdx = 0; dayIdx < 6; dayIdx++) {
      const theme = week.techniqueThemes[dayIdx % week.techniqueThemes.length];

      ageProfiles.forEach((profile) => {
        const lessonId = `plan-w${week.weekNum}-d${dayIdx + 1}-${profile.ageGroup.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`;
        
        let formattedTitle = '';
        let drillConstraint = '';
        let drillGoal = '';
        let resetTrigger = '';
        let wuIndex = 0;

        if (profile.ageGroup === 'Ages 3-6') {
          wuIndex = 1;
          formattedTitle = `Tiny Champs: ${theme} Adventure Game`;
          drillConstraint = 'Top player cannot stand up; bottom cannot use fingers inside gi cuffs.';
          drillGoal = 'Bottom player pins or sweeps partner before the timer bell.';
          resetTrigger = 'Sweep achieved or partner stands up.';
        } else if (profile.ageGroup === 'Ages 7-12') {
          wuIndex = 2;
          formattedTitle = `Youth: ${theme} Mechanics & Scramble`;
          drillConstraint = 'No submissions allowed; focus strictly on posture and positional control.';
          drillGoal = 'Bottom scores sweep or back take; top achieves chest-to-chest pin.';
          resetTrigger = 'Dominant pin established for 3 seconds.';
        } else if (profile.ageGroup === 'Adults') {
          wuIndex = 0;
          formattedTitle = `Adult Fundamentals: ${theme}`;
          drillConstraint = 'Strict representative rules: top cannot disengage beyond arms reach.';
          drillGoal = 'Execute technical connection or submission trap; opponent counters with defensive trigger.';
          resetTrigger = 'Clean submission lock, pass completion, or sweep.';
        } else {
          wuIndex = 0;
          formattedTitle = `Advanced & Masters: ${theme} Dilemma Workshop`;
          drillConstraint = 'High-resistance live mini-game with full tactical submission options.';
          drillGoal = 'Chain secondary and tertiary counters off opponent defensive reactions.';
          resetTrigger = 'Submission, escape to standing, or complete pass.';
        }

        generatedPlans.push({
          id: lessonId,
          className: formattedTitle,
          concept: week.concept,
          ageGroup: profile.ageGroup,
          beltRank: profile.beltRank,
          totalDurationMinutes: profile.duration,
          tags: [week.lineage, 'Week ' + week.weekNum, 'Day ' + (dayIdx + 1), profile.ageGroup],
          warmUp: BASELINE_WARMUPS[wuIndex],
          drills: [
            {
              id: `${lessonId}-d1`,
              drillName: `${theme} - Positional Scenario`,
              drillConstraints: drillConstraint,
              primaryGoal: drillGoal,
              immediateReset: resetTrigger,
              roundCount: profile.roundCount,
              roundTimeSeconds: profile.roundTime,
              restTimeSeconds: profile.restTime,
            }
          ],
          liveRounds: {
            roundCount: profile.roundCount,
            roundTimeSeconds: profile.ageGroup.includes('Ages') ? 120 : 300,
            restTimeSeconds: profile.restTime,
          },
          isPublic: true,
          authorInstructorId: 'inst-1',
          authorName: 'Chief Instructor'
        });
      });
    }
  });

  return generatedPlans;
}

const INITIAL_INSTRUCTORS_SEED: Instructor[] = [
  { id: 'inst-1', username: 'owner', password: 'password123', name: 'Chief Instructor', email: 'owner@matops.com', role: 'owner', rank: 'Black Belt', bio: 'Head Coach and Program Director.' },
  { id: 'inst-2', username: 'mvance', password: 'password123', name: 'Marcus Vance', email: 'marcus@matops.com', role: 'manager', rank: 'Brown Belt', bio: 'Senior Instructor.' },
  { id: 'inst-3', username: 'sarah_bjj', password: 'password123', name: 'Sarah Jenkins', email: 'sarah@matops.com', role: 'instructor', rank: 'Purple Belt', bio: 'Fundamentals Lead.' },
  { id: 'inst-4', username: 'alex_coach', password: 'password123', name: 'Alex Rivera', email: 'alex@matops.com', role: 'assistant', rank: 'Blue Belt', bio: 'Assistant Coach.' },
];

const INITIAL_CLASS_TEMPLATES_SEED: ClassTemplate[] = [
  { id: 'ct-1', name: 'Adult Fundamental Gi', ageGroup: 'Adults', durationMinutes: 60 },
  { id: 'ct-2', name: 'Youth BJJ Dynamics', ageGroup: 'Ages 7-12', durationMinutes: 45 },
  { id: 'ct-3', name: 'Advanced No-Gi & Sparring', ageGroup: 'Adults', durationMinutes: 75 },
  { id: 'ct-4', name: 'Tiny Champions Movement', ageGroup: 'Ages 3-6', durationMinutes: 30 },
  { id: 'ct-5', name: 'Weekend Open Mat', ageGroup: 'All Levels', durationMinutes: 90 },
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
  const [activeTab, setActiveTab] = useState<'mat' | 'builder' | 'community' | 'flows' | 'calendar' | 'chat' | 'academy' | 'profile'>('mat');
  const [currentInstructor, setCurrentInstructor] = useState<Instructor | null>(INITIAL_INSTRUCTORS_SEED[0]);
  const [instructors, setInstructors] = useState<Instructor[]>(INITIAL_INSTRUCTORS_SEED);
  const [academyName, setAcademyName] = useState('Pacific Training Academy');

  const [musicSource, setMusicSource] = useState<'local' | 'spotify' | 'apple'>('local');
  const [localPlaylist, setLocalPlaylist] = useState<LocalTrack[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.7);
  const [isMusicDeckOpen, setIsMusicDeckOpen] = useState(false);
  const localAudioRef = useRef<HTMLAudioElement | null>(null);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [userFormData, setUserFormData] = useState<Instructor>({
    id: '', username: '', password: '', name: '', email: '', role: 'instructor', rank: 'Blue Belt', bio: ''
  });

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

  const [flowLibrary, setFlowLibrary] = useState<FlowRoutine[]>(BASELINE_FLOWS);
  const [activeFlowInStudio, setActiveFlowInStudio] = useState<FlowRoutine>(() => BASELINE_FLOWS[0]);
  const [isEditingExistingFlow, setIsEditingExistingFlow] = useState(false);

  const [activeHUDMode, setActiveHUDMode] = useState<'warmup' | 'flow' | 'drill' | 'live'>('warmup');
  const [activeLoadedFlow, setActiveLoadedFlow] = useState<FlowRoutine | null>(() => BASELINE_FLOWS[0]);
  const [activeFlowNodeIndex, setActiveFlowNodeIndex] = useState(0);

  const [calendarAnchorDate, setCalendarAnchorDate] = useState<Date>(() => new Date());
  const [schedule, setSchedule] = useState<ScheduledClass[]>(() => {
    const monday = getMondayOfWeek(new Date());
    return [
      {
        id: 'sch-1', dateStr: formatDateKey(monday), time: '06:00 PM', title: 'Adult Fundamental Gi', ageGroup: 'Adults', durationMinutes: 60, assignedInstructorId: 'inst-1', assignedLessonId: 'plan-w1-d1-adults', postClassNotes: '', modificationsSuggested: ''
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

  const [templateFormData, setTemplateFormData] = useState<ClassTemplate>({ id: '', name: '', ageGroup: 'Adults', durationMinutes: 60 });
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);

  const [plans, setPlans] = useState<LessonPlan[]>(() => buildComprehensiveCurriculum());
  const [selectedPlan, setSelectedPlan] = useState<LessonPlan>(() => buildComprehensiveCurriculum()[0]);
  const [activeDrillIndex, setActiveDrillIndex] = useState(0);

  const [hubSearchTerm, setHubSearchTerm] = useState('');
  const [selectedHubTag, setSelectedHubTag] = useState<string | null>(null);
  const [collapsedConcepts, setCollapsedConcepts] = useState<Record<string, boolean>>({});

  const [alarmType, setAlarmType] = useState<'bell' | 'beep'>('bell');
  const [volume, setVolume] = useState<number>(0.8);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);

  const [secondsLeft, setSecondsLeft] = useState(selectedPlan?.warmUp?.roundTimeSeconds || 300);
  const [isActive, setIsActive] = useState(false);
  const [isRest, setIsRest] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);

  const [isGenerating, setIsGenerating] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'assistant', content: 'Oss Coach! I am your AI Black Belt assistant. Ask me anything about lesson designs, flow routines, or class mechanics.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatSending, setIsChatSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [tagInput, setTagInput] = useState('');
  const [builderForm, setBuilderForm] = useState<Omit<LessonPlan, 'id' | 'authorInstructorId' | 'authorName'>>({
    className: '',
    concept: BASELINE_CONCEPTS[0],
    ageGroup: 'Adults',
    beltRank: 'White Belt',
    totalDurationMinutes: 60,
    tags: ['Fundamentals', 'No-Gi'],
    isPublic: false,
    warmUp: BASELINE_WARMUPS[0],
    drills: [
      {
        id: 'drill-1',
        drillName: 'Positional Drill 1',
        drillConstraints: 'Top player cannot stall; bottom cannot transition to closed guard.',
        primaryGoal: 'Bottom achieves sweep to top position.',
        immediateReset: 'Sweep completed or top passes.',
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

  // --- AUDIO CONTEXT RESILIENCE ---
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = () => {
    if (typeof window === 'undefined') return null;
    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioContextRef.current = new AudioCtx();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  };

  useEffect(() => {
    const handleFocus = () => {
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, []);

  // --- SYNC DATA FROM SUPABASE ON MOUNT ---
  useEffect(() => {
    if (!supabase) return;

    async function loadAllSupabaseData() {
      try {
        // 1. Fetch Lessons
        const { data: lessonData } = await supabase!.from('lessons').select('*').eq('is_public', true);
        if (lessonData && lessonData.length > 0) {
          const remotePlans: LessonPlan[] = lessonData.map((item: any) => ({
            id: item.id,
            className: item.class_name,
            concept: item.concept,
            ageGroup: item.age_group,
            beltRank: item.belt_rank,
            totalDurationMinutes: item.total_duration_minutes,
            tags: item.tags || [],
            warmUp: item.warm_up,
            drills: item.drills || [],
            liveRounds: item.live_rounds,
            isPublic: item.is_public,
            authorInstructorId: item.author_id || 'remote-author',
            authorName: item.author_name || 'Community Academy'
          }));
          setPlans((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const freshItems = remotePlans.filter((item) => !existingIds.has(item.id));
            return [...freshItems, ...prev];
          });
        }

        // 2. Fetch Tactical Flows
        const { data: flowData } = await supabase!.from('flow_routines').select('*');
        if (flowData && flowData.length > 0) {
          const remoteFlows: FlowRoutine[] = flowData.map((f: any) => ({
            id: f.id,
            title: f.title,
            concept: f.concept,
            startingPosition: f.starting_position,
            roundCount: f.round_count,
            roundTimeSeconds: f.round_time_seconds,
            restTimeSeconds: f.rest_time_seconds,
            nodes: f.nodes || [],
            isPublic: f.is_public
          }));
          setFlowLibrary((prev) => {
            const existingIds = new Set(prev.map((f) => f.id));
            const freshFlows = remoteFlows.filter((f) => !existingIds.has(f.id));
            return [...freshFlows, ...prev];
          });
        }

        // 3. Fetch Scheduled Classes
        const { data: scheduleData } = await supabase!.from('schedules').select('*');
        if (scheduleData && scheduleData.length > 0) {
          const remoteSchedule: ScheduledClass[] = scheduleData.map((s: any) => ({
            id: s.id,
            dateStr: s.date_str,
            time: s.time_str,
            title: s.title,
            ageGroup: s.age_group,
            durationMinutes: s.duration_minutes,
            assignedInstructorId: s.assigned_instructor_id,
            assignedLessonId: s.assigned_lesson_id,
            postClassNotes: s.post_class_notes || '',
            modificationsSuggested: s.modifications_suggested || ''
          }));
          setSchedule(remoteSchedule);
        }

        // 4. Fetch Custom Warm-Up Presets
        const { data: warmupData } = await supabase!.from('warmup_presets').select('*');
        if (warmupData && warmupData.length > 0) {
          const remoteWarmups: WarmUp[] = warmupData.map((w: any) => ({
            id: w.id,
            warmUpName: w.name,
            type: w.type as 'general' | 'game',
            description: w.description,
            gameRules: w.game_rules,
            constraints: w.constraints,
            goals: w.goals,
            roundCount: w.round_count,
            roundTimeSeconds: w.round_time_seconds,
            restTimeSeconds: w.rest_time_seconds,
            isCustom: true
          }));
          setWarmUpPresets((prev) => {
            const existingIds = new Set(prev.map((wu) => wu.id));
            const freshWus = remoteWarmups.filter((wu) => !existingIds.has(wu.id));
            return [...freshWus, ...prev];
          });
        }
      } catch (err) {
        console.warn('Supabase initial fetch warning:', err);
      }
    }

    loadAllSupabaseData();
  }, []);

  // --- AUTO SCROLL CHAT ---
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatSending]);

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
      if (wakeLock) {
        wakeLock.release();
      }
    };
  }, [isActive]);

  const handleLocalFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newTracks: LocalTrack[] = Array.from(files).map((f: File) => ({
      id: `track-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: f.name.replace(/\.[^/.]+$/, ''),
      fileUrl: URL.createObjectURL(f),
    }));

    setLocalPlaylist((prev: LocalTrack[]) => [...prev, ...newTracks]);
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

  const playSoundTone = (phase: 'start' | 'rest') => {
    if (typeof window === 'undefined' || volume === 0) return;
    try {
      const audioCtx = getAudioContext();
      if (!audioCtx) return;

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
          [0, 0.4, 0.8].forEach((delay: number) => {
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
          [0, 0.25, 0.5].forEach((delay: number) => {
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

  const currentWarmUp: WarmUp = selectedPlan?.warmUp || BASELINE_WARMUPS[0];
  const currentDrill: Drill = (selectedPlan?.drills && selectedPlan.drills[activeDrillIndex]) || selectedPlan?.drills?.[0] || {
    id: 'd-fallback',
    drillName: 'Positional Drill',
    drillConstraints: 'Active work',
    primaryGoal: 'Win position',
    immediateReset: 'Reset upon score',
    roundCount: 4,
    roundTimeSeconds: 120,
    restTimeSeconds: 30
  };

  const maxRounds: number = 
    activeHUDMode === 'flow' && activeLoadedFlow ? activeLoadedFlow.roundCount :
    activeHUDMode === 'warmup' ? currentWarmUp.roundCount :
    activeHUDMode === 'drill' ? currentDrill.roundCount : 
    selectedPlan?.liveRounds?.roundCount || 5;

  const workDuration: number = 
    activeHUDMode === 'flow' && activeLoadedFlow ? activeLoadedFlow.roundTimeSeconds :
    activeHUDMode === 'warmup' ? currentWarmUp.roundTimeSeconds :
    activeHUDMode === 'drill' ? currentDrill.roundTimeSeconds : 
    selectedPlan?.liveRounds?.roundTimeSeconds || 300;

  const restDuration: number = 
    activeHUDMode === 'flow' && activeLoadedFlow ? activeLoadedFlow.restTimeSeconds :
    activeHUDMode === 'warmup' ? currentWarmUp.restTimeSeconds :
    activeHUDMode === 'drill' ? currentDrill.restTimeSeconds : 
    selectedPlan?.liveRounds?.restTimeSeconds || 60;

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => setSecondsLeft((prev: number) => prev - 1), 1000);
    } else if (isActive && secondsLeft === 0) {
      if (!isRest && restDuration > 0) {
        playSoundTone('rest');
        setIsRest(true);
        setSecondsLeft(restDuration);
      } else {
        playSoundTone('start');
        setIsRest(false);
        if (currentRound < maxRounds) {
          setCurrentRound((prev: number) => prev + 1);
          setSecondsLeft(workDuration);
        } else {
          if (activeHUDMode === 'warmup' && selectedPlan?.drills && selectedPlan.drills.length > 0) {
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
          } else {
            setIsActive(false);
            setCurrentRound(1);
            setSecondsLeft(workDuration);
          }
        }
      }
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isActive, secondsLeft, isRest, currentRound, activeHUDMode, activeDrillIndex, maxRounds, workDuration, restDuration, selectedPlan, activeLoadedFlow]);

  const handleHUDTargetChange = (type: 'warmup' | 'flow' | 'drill' | 'live', drillIdx: number = 0) => {
    setIsActive(false);
    setIsRest(false);
    setCurrentRound(1);
    setActiveHUDMode(type);
    if (type === 'warmup') {
      setSecondsLeft(selectedPlan?.warmUp?.roundTimeSeconds || 180);
    } else if (type === 'flow' && activeLoadedFlow) {
      setSecondsLeft(activeLoadedFlow.roundTimeSeconds);
      setActiveFlowNodeIndex(0);
    } else if (type === 'drill' && selectedPlan?.drills?.[drillIdx]) {
      setActiveDrillIndex(drillIdx);
      setSecondsLeft(selectedPlan.drills[drillIdx].roundTimeSeconds);
    } else {
      setSecondsLeft(selectedPlan?.liveRounds?.roundTimeSeconds || 300);
    }
  };

  const adjustHUDTimer = (field: 'rounds' | 'work' | 'rest', delta: number) => {
    if (activeHUDMode === 'flow' && activeLoadedFlow) {
      const curFlow = { ...activeLoadedFlow };
      if (field === 'rounds') curFlow.roundCount = Math.max(1, curFlow.roundCount + delta);
      if (field === 'work') {
        curFlow.roundTimeSeconds = Math.max(15, curFlow.roundTimeSeconds + delta);
        if (!isRest) setSecondsLeft((prev: number) => Math.max(1, prev + delta));
      }
      if (field === 'rest') {
        curFlow.restTimeSeconds = Math.max(0, curFlow.restTimeSeconds + delta);
        if (isRest) setSecondsLeft((prev: number) => Math.max(1, prev + delta));
      }
      setActiveLoadedFlow(curFlow);
      setFlowLibrary(flowLibrary.map((f: FlowRoutine) => f.id === curFlow.id ? curFlow : f));
    } else if (activeHUDMode === 'warmup' && selectedPlan?.warmUp) {
      const curWu = { ...selectedPlan.warmUp };
      if (field === 'rounds') curWu.roundCount = Math.max(1, curWu.roundCount + delta);
      if (field === 'work') {
        curWu.roundTimeSeconds = Math.max(15, curWu.roundTimeSeconds + delta);
        if (!isRest) setSecondsLeft((prev: number) => Math.max(1, prev + delta));
      }
      if (field === 'rest') {
        curWu.restTimeSeconds = Math.max(0, curWu.restTimeSeconds + delta);
        if (isRest) setSecondsLeft((prev: number) => Math.max(1, prev + delta));
      }
      setSelectedPlan({ ...selectedPlan, warmUp: curWu });
    } else if (activeHUDMode === 'drill' && selectedPlan?.drills) {
      const updatedDrills = [...selectedPlan.drills];
      const cur = { ...updatedDrills[activeDrillIndex] };
      if (field === 'rounds') cur.roundCount = Math.max(1, cur.roundCount + delta);
      if (field === 'work') {
        cur.roundTimeSeconds = Math.max(15, cur.roundTimeSeconds + delta);
        if (!isRest) setSecondsLeft((prev: number) => Math.max(1, prev + delta));
      }
      if (field === 'rest') {
        cur.restTimeSeconds = Math.max(0, cur.restTimeSeconds + delta);
        if (isRest) setSecondsLeft((prev: number) => Math.max(1, prev + delta));
      }
      updatedDrills[activeDrillIndex] = cur;
      setSelectedPlan({ ...selectedPlan, drills: updatedDrills });
    } else if (selectedPlan?.liveRounds) {
      const curLive = { ...selectedPlan.liveRounds };
      if (field === 'rounds') curLive.roundCount = Math.max(1, curLive.roundCount + delta);
      if (field === 'work') {
        curLive.roundTimeSeconds = Math.max(15, curLive.roundTimeSeconds + delta);
        if (!isRest) setSecondsLeft((prev: number) => Math.max(1, prev + delta));
      }
      if (field === 'rest') {
        curLive.restTimeSeconds = Math.max(0, curLive.restTimeSeconds + delta);
        if (isRest) setSecondsLeft((prev: number) => Math.max(1, prev + delta));
      }
      setSelectedPlan({ ...selectedPlan, liveRounds: curLive });
    }
  };

  const loadPlanToMat = (plan: LessonPlan) => {
    setSelectedPlan(plan);
    setActiveHUDMode('warmup');
    setActiveDrillIndex(0);
    setCurrentRound(1);
    setIsActive(false);
    setIsRest(false);
    setSecondsLeft(plan?.warmUp?.roundTimeSeconds || 180);
    setActiveTab('mat');
  };

  const launchFlowToMat = (flow: FlowRoutine) => {
    setActiveLoadedFlow(flow);
    setActiveHUDMode('flow');
    setActiveFlowNodeIndex(0);
    setCurrentRound(1);
    setIsActive(false);
    setIsRest(false);
    setSecondsLeft(flow.roundTimeSeconds);
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

  const handleSaveCurrentWarmUpAsPreset = async () => {
    const name = builderForm.warmUp.warmUpName.trim();
    if (!name) return;
    const newPreset: WarmUp = { ...builderForm.warmUp, id: `custom-wu-${Date.now()}`, isCustom: true };
    setWarmUpPresets((prev: WarmUp[]) => [newPreset, ...prev]);

    if (supabase) {
      await supabase.from('warmup_presets').insert([{
        id: newPreset.id,
        academy_id: DEFAULT_ACADEMY_ID,
        name: newPreset.warmUpName,
        type: newPreset.type,
        description: newPreset.description,
        game_rules: newPreset.gameRules || '',
        constraints: newPreset.constraints || '',
        goals: newPreset.goals || '',
        round_count: newPreset.roundCount,
        round_time_seconds: newPreset.roundTimeSeconds,
        rest_time_seconds: newPreset.restTimeSeconds,
        is_custom: true
      }]);
    }

    alert(`Warm-Up "${name}" saved to library and synchronized!`);
  };

  const handleCreateNewWarmUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWarmUpForm.warmUpName.trim()) return;
    const created: WarmUp = { ...newWarmUpForm, id: `wu-hub-${Date.now()}`, isCustom: true };
    setWarmUpPresets((prev: WarmUp[]) => [created, ...prev]);
    setIsNewWarmUpModalOpen(false);

    if (supabase) {
      await supabase.from('warmup_presets').insert([{
        id: created.id,
        academy_id: DEFAULT_ACADEMY_ID,
        name: created.warmUpName,
        type: created.type,
        description: created.description,
        game_rules: created.gameRules || '',
        constraints: created.constraints || '',
        goals: created.goals || '',
        round_count: created.roundCount,
        round_time_seconds: created.roundTimeSeconds,
        rest_time_seconds: created.restTimeSeconds,
        is_custom: true
      }]);
    }
  };

  const handleSaveFlowRoutine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFlowInStudio.title.trim()) {
      alert('Please provide a title for this flow routine.');
      return;
    }

    let routineToPersist: FlowRoutine;
    if (isEditingExistingFlow) {
      routineToPersist = activeFlowInStudio;
      setFlowLibrary(flowLibrary.map((f: FlowRoutine) => f.id === routineToPersist.id ? routineToPersist : f));
      if (activeLoadedFlow?.id === routineToPersist.id) setActiveLoadedFlow(routineToPersist);
    } else {
      routineToPersist = { ...activeFlowInStudio, id: `flow-${Date.now()}` };
      setFlowLibrary([routineToPersist, ...flowLibrary]);
    }

    if (supabase) {
      await supabase.from('flow_routines').upsert([{
        id: routineToPersist.id,
        academy_id: DEFAULT_ACADEMY_ID,
        title: routineToPersist.title,
        concept: routineToPersist.concept,
        starting_position: routineToPersist.startingPosition,
        round_count: routineToPersist.roundCount,
        round_time_seconds: routineToPersist.roundTimeSeconds,
        rest_time_seconds: routineToPersist.restTimeSeconds,
        nodes: routineToPersist.nodes,
        is_public: true
      }]);
    }

    alert(`Flow "${routineToPersist.title}" saved to library and synchronized!`);
    setIsEditingExistingFlow(false);
  };

  const handleDeleteFlow = async (id: string) => {
    setFlowLibrary((prev: FlowRoutine[]) => prev.filter((f: FlowRoutine) => f.id !== id));
    if (activeLoadedFlow?.id === id) setActiveLoadedFlow(null);
    if (supabase) {
      await supabase.from('flow_routines').delete().eq('id', id);
    }
  };

  const addFlowNode = () => {
    const newNode: FlowNode = {
      id: `fn-${Date.now()}`,
      techniqueName: `Technique ${activeFlowInStudio.nodes.length + 1}`,
      opponentDefenseTrigger: 'Opponent defends by...',
      transitionCue: 'Transition by...'
    };
    setActiveFlowInStudio({
      ...activeFlowInStudio,
      nodes: [...activeFlowInStudio.nodes, newNode]
    });
  };

  const updateFlowNode = (index: number, field: keyof FlowNode, value: string) => {
    const nextNodes = [...activeFlowInStudio.nodes];
    nextNodes[index] = { ...nextNodes[index], [field]: value };
    setActiveFlowInStudio({ ...activeFlowInStudio, nodes: nextNodes });
  };

  const removeFlowNode = (id: string) => {
    if (activeFlowInStudio.nodes.length <= 2) return;
    setActiveFlowInStudio({
      ...activeFlowInStudio,
      nodes: activeFlowInStudio.nodes.filter((n: FlowNode) => n.id !== id)
    });
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
    setBuilderForm({ ...builderForm, tags: builderForm.tags.filter((t: string) => t !== tagToRemove) });
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
    setBuilderForm({ ...builderForm, drills: builderForm.drills.filter((d: Drill) => d.id !== id) });
  };

  const updateDrillField = (index: number, field: keyof Drill, value: string | number) => {
    const nextDrills = [...builderForm.drills];
    nextDrills[index] = { ...nextDrills[index], [field]: value };
    setBuilderForm({ ...builderForm, drills: nextDrills });
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
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

    if (newPlan.isPublic && supabase) {
      await supabase.from('lessons').insert([{
        id: newPlan.id,
        academy_id: DEFAULT_ACADEMY_ID,
        author_name: newPlan.authorName,
        class_name: newPlan.className,
        concept: newPlan.concept,
        age_group: newPlan.ageGroup,
        belt_rank: newPlan.beltRank,
        total_duration_minutes: newPlan.totalDurationMinutes,
        tags: newPlan.tags,
        warm_up: newPlan.warmUp,
        drills: newPlan.drills,
        live_rounds: newPlan.liveRounds,
        is_public: true
      }]);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const found = instructors.find(
      (inst: Instructor) => inst.username.toLowerCase() === loginUsername.trim().toLowerCase() && inst.password === loginPassword
    );
    if (found) {
      setCurrentInstructor(found);
      setIsLoginModalOpen(false);
      setLoginUsername('');
      setLoginPassword('');
    } else {
      setLoginError('Invalid username or password. Default credentials: owner / password123');
    }
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.username.trim() || !userFormData.name.trim()) return;

    if (isEditingUser) {
      setInstructors(instructors.map((inst: Instructor) => inst.id === userFormData.id ? { ...userFormData } : inst));
      if (currentInstructor?.id === userFormData.id) setCurrentInstructor({ ...userFormData });
    } else {
      setInstructors([...instructors, { ...userFormData, id: `inst-${Date.now()}`, password: userFormData.password || 'password123' }]);
    }
    setIsUserModalOpen(false);
  };

  const handleDeleteUser = (id: string) => {
    if (id === currentInstructor?.id) {
      alert('You cannot delete the active account you are currently logged into.');
      return;
    }
    setInstructors((prev: Instructor[]) => prev.filter((inst: Instructor) => inst.id !== id));
  };

  const canManageAcademy = currentInstructor?.role === 'owner' || currentInstructor?.role === 'manager';

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
      setClassTemplates(classTemplates.map((ct: ClassTemplate) => ct.id === templateFormData.id ? templateFormData : ct));
    } else {
      setClassTemplates([...classTemplates, { ...templateFormData, id: `ct-${Date.now()}` }]);
    }
    setTemplateFormData({ id: '', name: '', ageGroup: 'Adults', durationMinutes: 60 });
    setIsEditingTemplate(false);
  };

  const handleDeleteClassTemplate = (id: string) => {
    setClassTemplates((prev: ClassTemplate[]) => prev.filter((ct: ClassTemplate) => ct.id !== id));
  };

  const openAddClassModalForDate = (dateKey: string) => {
    setTargetDateForNewClass(dateKey);
    setSelectedTemplateForNewClass(classTemplates[0]?.id || '');
    setNewClassTime('06:00 PM');
    setNewClassInstructorId(currentInstructor?.id || instructors[0].id);
    setNewClassLessonId('');
    setIsAddClassModalOpen(true);
  };

  const handleScheduleNewClass = async (e: React.FormEvent) => {
    e.preventDefault();
    const template = classTemplates.find((t: ClassTemplate) => t.id === selectedTemplateForNewClass);
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

    if (supabase) {
      await supabase.from('schedules').insert([{
        id: newScheduledItem.id,
        academy_id: DEFAULT_ACADEMY_ID,
        date_str: newScheduledItem.dateStr,
        time_str: newScheduledItem.time,
        title: newScheduledItem.title,
        age_group: newScheduledItem.ageGroup,
        duration_minutes: newScheduledItem.durationMinutes,
        assigned_lesson_id: newScheduledItem.assignedLessonId,
        post_class_notes: '',
        modifications_suggested: ''
      }]);
    }
  };

  const handleDeleteScheduledClass = async (id: string) => {
    setSchedule((prev: ScheduledClass[]) => prev.filter((s: ScheduledClass) => s.id !== id));
    if (supabase) {
      await supabase.from('schedules').delete().eq('id', id);
    }
  };

const updateScheduledClass = async (classId: string, updates: Partial<ScheduledClass>) => {
    // 1. Immediately update UI state so typing feels instantaneous
    const nextSchedule = schedule.map((sc: ScheduledClass) => (sc.id === classId ? { ...sc, ...updates } : sc));
    setSchedule(nextSchedule);

    // 2. Persist to Supabase
    if (supabase) {
      const dbUpdates: any = {};
      if (updates.postClassNotes !== undefined) dbUpdates.post_class_notes = updates.postClassNotes;
      if (updates.modificationsSuggested !== undefined) dbUpdates.modifications_suggested = updates.modificationsSuggested;

      if (Object.keys(dbUpdates).length > 0) {
        const { error } = await supabase
          .from('schedules')
          .update(dbUpdates)
          .eq('id', classId);

        if (error) {
          console.error('Supabase notes sync error:', error.message, error.details);
        } else {
          console.log('Notes successfully persisted to Supabase for class:', classId);
        }
      }
    }
  };

  const toggleConceptCollapse = (concept: string) => {
    setCollapsedConcepts((prev: Record<string, boolean>) => ({ ...prev, [concept]: !prev[concept] }));
  };

  const allUniqueTags: string[] = Array.from(new Set(plans.flatMap((p: LessonPlan) => p.tags || [])));
  const filteredPlans: LessonPlan[] = plans.filter((p: LessonPlan) => {
    const matchesSearch =
      p.className.toLowerCase().includes(hubSearchTerm.toLowerCase()) ||
      p.concept.toLowerCase().includes(hubSearchTerm.toLowerCase()) ||
      p.tags.some((t: string) => t.toLowerCase().includes(hubSearchTerm.toLowerCase()));
    const matchesTag = selectedHubTag ? p.tags.includes(selectedHubTag) : true;
    return matchesSearch && matchesTag;
  });

  const filteredWarmUps: WarmUp[] = warmUpPresets.filter((wu: WarmUp) => {
    return (
      wu.warmUpName.toLowerCase().includes(hubSearchTerm.toLowerCase()) ||
      wu.description.toLowerCase().includes(hubSearchTerm.toLowerCase()) ||
      Boolean(wu.goals && wu.goals.toLowerCase().includes(hubSearchTerm.toLowerCase()))
    );
  });

  const allConceptKeys: string[] = Array.from(new Set([...coreConcepts, ...plans.map((p: LessonPlan) => p.concept)]));
  const plansByConcept: Record<string, LessonPlan[]> = allConceptKeys.reduce((acc: Record<string, LessonPlan[]>, concept: string) => {
    const matching = filteredPlans.filter((p: LessonPlan) => p.concept === concept);
    if (matching.length > 0 || (!hubSearchTerm && !selectedHubTag)) {
      acc[concept] = matching;
    }
    return acc;
  }, {});

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
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
          <button onClick={() => setActiveTab('flows')} className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold flex items-center gap-1.5 transition ${activeTab === 'flows' ? 'bg-cyan-600 text-white' : 'text-cyan-400 hover:text-cyan-300'}`}><GitBranch size={14} />Flow Chains</button>
          <button onClick={() => setActiveTab('calendar')} className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition ${activeTab === 'calendar' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}>Academy Calendar</button>
          <button onClick={() => setActiveTab('chat')} className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold flex items-center gap-1.5 transition ${activeTab === 'chat' ? 'bg-indigo-600 text-white' : 'text-indigo-400 hover:text-indigo-300'}`}><Sparkles size={14} />Ask AI</button>
          <button onClick={() => setActiveTab('academy')} className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition ${activeTab === 'academy' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}>Roster & Roles</button>
        </div>

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
              onClick={() => { setLoginError(''); setIsLoginModalOpen(true); }}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 px-3.5 py-1.5 rounded-xl shadow-md transition"
            >
              <LogIn size={14} /> Log In
            </button>
          )}
        </div>
      </nav>

      {/* VIEW 1: MAT TIMER VIEW */}
      {activeTab === 'mat' && (
        <main className="flex-1 flex flex-col justify-between p-4 md:p-8 max-w-6xl mx-auto w-full">
          <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-900 pb-4 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                  isRest ? 'bg-amber-500/20 text-amber-400' :
                  activeHUDMode === 'flow' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-800/40' :
                  activeHUDMode === 'warmup' ? 'bg-orange-500/20 text-orange-400' :
                  activeHUDMode === 'drill' ? 'bg-emerald-500/20 text-emerald-400' :
                  'bg-indigo-500/20 text-indigo-400'
                }`}>
                  {isRest ? 'Rest Interval' : 
                   activeHUDMode === 'flow' ? 'Tactical Flow Chain' :
                   activeHUDMode === 'warmup' ? 'Warm-Up Phase' : 
                   activeHUDMode === 'drill' ? 'Positional Drill' : 'Live Rolling'}
                </span>
                <span className="text-xs font-bold text-indigo-400 bg-indigo-950/40 border border-indigo-800/40 px-2 py-0.5 rounded">
                  {activeHUDMode === 'flow' && activeLoadedFlow ? activeLoadedFlow.concept : selectedPlan?.concept}
                </span>
                <span className="text-xs text-slate-400 border border-slate-800 px-2 py-0.5 rounded">{selectedPlan?.ageGroup}</span>
              </div>
              <h1 className="text-xl md:text-3xl font-extrabold">
                {activeHUDMode === 'flow' && activeLoadedFlow ? activeLoadedFlow.title : selectedPlan?.className}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  value={
                    activeHUDMode === 'flow' ? 'flow' :
                    activeHUDMode === 'warmup' ? 'warmup' :
                    activeHUDMode === 'drill' ? `drill-${activeDrillIndex}` : 'live'
                  }
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    const val = e.target.value;
                    if (val === 'flow') handleHUDTargetChange('flow');
                    else if (val === 'warmup') handleHUDTargetChange('warmup');
                    else if (val === 'live') handleHUDTargetChange('live');
                    else handleHUDTargetChange('drill', parseInt(val.replace('drill-', '')));
                  }}
                  className="bg-slate-900 border border-slate-700 text-slate-100 font-bold text-sm px-4 py-2.5 rounded-xl appearance-none pr-10 focus:outline-none focus:border-emerald-500"
                >
                  {activeLoadedFlow && (
                    <optgroup label="Tactical Flow">
                      <option value="flow">Flow Chain: {activeLoadedFlow.title}</option>
                    </optgroup>
                  )}
                  <optgroup label="Preparation">
                    <option value="warmup">Warm-Up: {selectedPlan?.warmUp?.warmUpName || 'Warm-Up'}</option>
                  </optgroup>
                  {selectedPlan?.drills && selectedPlan.drills.length > 0 && (
                    <optgroup label="Drills">
                      {selectedPlan.drills.map((d: Drill, idx: number) => (
                        <option key={d.id} value={`drill-${idx}`}>Drill {idx + 1}: {d.drillName}</option>
                      ))}
                    </optgroup>
                  )}
                  <optgroup label="Sparring">
                    <option value="live">Live Rounds ({selectedPlan?.liveRounds?.roundCount || 5} Rounds)</option>
                  </optgroup>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-3.5 pointer-events-none text-slate-400" />
              </div>

              <div className="text-right pl-3 border-l border-slate-800">
                <span className="text-xs text-slate-400 uppercase font-semibold">Round</span>
                <div className="text-2xl md:text-3xl font-black text-slate-100">{currentRound} / {maxRounds}</div>
              </div>
            </div>
          </header>

          {/* MUSIC DECK */}
          <div className="bg-slate-900/70 border border-purple-900/40 rounded-2xl p-3 my-2 shadow-lg backdrop-blur">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
                  <button onClick={() => setMusicSource('local')} className={`px-2.5 py-1 rounded-lg transition ${musicSource === 'local' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>Local Files</button>
                  <button onClick={() => setMusicSource('spotify')} className={`px-2.5 py-1 rounded-lg transition ${musicSource === 'spotify' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}>Spotify</button>
                  <button onClick={() => setMusicSource('apple')} className={`px-2.5 py-1 rounded-lg transition ${musicSource === 'apple' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}>Apple Music</button>
                </div>
                {musicSource === 'local' ? (
                  <div className="text-xs">
                    {localPlaylist.length > 0 ? (
                      <div className="flex items-center gap-1.5 font-bold text-purple-300 truncate max-w-xs sm:max-w-md">
                        <Disc3 size={14} className={isMusicPlaying ? 'animate-spin' : ''} />
                        <span className="truncate">{localPlaylist[currentTrackIndex]?.name}</span>
                        <span className="text-[10px] text-slate-500 font-semibold">({currentTrackIndex + 1}/{localPlaylist.length})</span>
                      </div>
                    ) : (<span className="text-slate-500 italic">No audio files loaded yet</span>)}
                  </div>
                ) : (
                  <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5"><Radio size={14} className="text-emerald-400" /><span>Streaming Ready</span></div>
                )}
              </div>

              {musicSource === 'local' ? (
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl border border-slate-700 cursor-pointer">
                    <UploadCloud size={14} /><span>Upload Tracks</span>
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
              ) : null}
            </div>
          </div>

          {/* CENTRAL CLOCK */}
          <section className="text-center my-3">
            <div className={`text-8xl sm:text-9xl md:text-[11rem] font-black tracking-tighter tabular-nums ${isRest ? 'text-amber-400' : 'text-white'}`}>
              {formatTime(secondsLeft)}
            </div>

            <div className="flex justify-center items-center gap-3 mt-4 flex-wrap">
              <button
                onClick={() => { playSoundTone('start'); setIsActive(!isActive); }}
                className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg shadow-xl transition active:scale-95 ${
                  isActive ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {isActive ? <Pause size={24} /> : <Play size={24} />}
                {isActive ? 'Pause' : 'Start Round'}
              </button>

              <button onClick={() => { setIsActive(false); setIsRest(false); setSecondsLeft(workDuration); }} className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 font-semibold">
                <RotateCcw size={20} /> Reset
              </button>

              <button onClick={() => { setIsActive(false); setIsRest(false); setCurrentRound((prev: number) => (prev < maxRounds ? prev + 1 : 1)); setSecondsLeft(workDuration); }} className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 font-semibold">
                <SkipForward size={20} /> Skip Round
              </button>
            </div>

            <div className="mt-5 bg-slate-900/50 border border-slate-800/80 p-3 rounded-2xl max-w-2xl mx-auto flex justify-center items-center gap-6 text-xs text-slate-300">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Modifiers:</span>
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
          </section>

          {/* CONTEXT FOOTER */}
          <footer className="space-y-4">
            {activeHUDMode === 'flow' && activeLoadedFlow ? (
              <div className="bg-slate-900/90 border border-cyan-900/50 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <GitBranch size={18} className="text-cyan-400" />
                    <span className="text-sm font-extrabold text-white">Flow: {activeLoadedFlow.title}</span>
                    <span className="text-xs bg-cyan-950/60 text-cyan-300 border border-cyan-800/40 px-2 py-0.5 rounded">
                      Starts in {activeLoadedFlow.startingPosition}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Node {activeFlowNodeIndex + 1} of {activeLoadedFlow.nodes.length}</span>
                    <button onClick={() => setActiveFlowNodeIndex(Math.max(0, activeFlowNodeIndex - 1))} disabled={activeFlowNodeIndex === 0} className="p-1 rounded bg-slate-800 disabled:opacity-40"><ChevronLeft size={16} /></button>
                    <button onClick={() => setActiveFlowNodeIndex(Math.min(activeLoadedFlow.nodes.length - 1, activeFlowNodeIndex + 1))} disabled={activeFlowNodeIndex === activeLoadedFlow.nodes.length - 1} className="p-1 rounded bg-slate-800 disabled:opacity-40"><ChevronRight size={16} /></button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 pb-2">
                  {activeLoadedFlow.nodes.map((node: FlowNode, idx: number) => (
                    <button
                      key={node.id}
                      onClick={() => setActiveFlowNodeIndex(idx)}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        activeFlowNodeIndex === idx ? 'border-cyan-500 bg-cyan-950/50 shadow-md' : 'border-slate-800 bg-slate-950/60 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <div className="text-[10px] font-black uppercase text-cyan-400">Node {idx + 1}</div>
                      <div className="text-xs font-bold text-white truncate">{node.techniqueName}</div>
                    </button>
                  ))}
                </div>

                {activeLoadedFlow.nodes[activeFlowNodeIndex] && (
                  <div className="grid md:grid-cols-3 gap-4 pt-1">
                    <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-xl border-l-4 border-l-cyan-500">
                      <div className="text-xs uppercase font-bold text-slate-400">Technique State</div>
                      <div className="text-lg font-black text-white mt-1">{activeLoadedFlow.nodes[activeFlowNodeIndex].techniqueName}</div>
                    </div>
                    <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-xl border-l-4 border-l-amber-500">
                      <div className="text-xs uppercase font-bold text-slate-400">Defense / Reaction Trigger</div>
                      <p className="text-xs font-semibold text-amber-200 mt-1">{activeLoadedFlow.nodes[activeFlowNodeIndex].opponentDefenseTrigger}</p>
                    </div>
                    <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-xl border-l-4 border-l-emerald-500">
                      <div className="text-xs uppercase font-bold text-slate-400">Transition Cue</div>
                      <p className="text-xs font-semibold text-emerald-200 mt-1">{activeLoadedFlow.nodes[activeFlowNodeIndex].transitionCue}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : activeHUDMode === 'warmup' ? (
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
            ) : activeHUDMode === 'drill' ? (
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
              <p className="text-sm text-slate-400">Configure class metadata, warm-up routines, drill constraints, and sparring rounds.</p>
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
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setBuilderForm({ ...builderForm, concept: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                >
                  {coreConcepts.map((c: string) => (<option key={c} value={c}>{c}</option>))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Lesson / Class Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Dogfight Knee Lever Counter"
                  value={builderForm.className}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBuilderForm({ ...builderForm, className: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Age Group</label>
                <select
                  value={builderForm.ageGroup}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setBuilderForm({ ...builderForm, ageGroup: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm"
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
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setBuilderForm({ ...builderForm, beltRank: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm"
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTagInput(e.target.value)}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
                  />
                  <button type="button" onClick={handleAddTag} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-bold">Add Tag</button>
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                  {builderForm.tags.map((t: string) => (
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
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      const found = warmUpPresets.find((w: WarmUp) => (w.id || w.warmUpName) === e.target.value);
                      if (found) applyPresetWarmUp(found);
                    }}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                    value=""
                  >
                    <option value="" disabled>Load Reusable Preset...</option>
                    {warmUpPresets.map((wu: WarmUp) => (
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBuilderForm({ ...builderForm, warmUp: { ...builderForm.warmUp, warmUpName: e.target.value } })}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Warm-Up Type</label>
                  <select
                    value={builderForm.warmUp.type}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setBuilderForm({ ...builderForm, warmUp: { ...builderForm.warmUp, type: e.target.value as 'general' | 'game' } })}
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
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBuilderForm({ ...builderForm, warmUp: { ...builderForm.warmUp, description: e.target.value } })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              {builderForm.warmUp.type === 'game' && (
                <div className="grid sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800/80">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase">Game Rules</label>
                    <textarea rows={2} value={builderForm.warmUp.gameRules || ''} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBuilderForm({ ...builderForm, warmUp: { ...builderForm.warmUp, gameRules: e.target.value } })} className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase">Constraints</label>
                    <textarea rows={2} value={builderForm.warmUp.constraints || ''} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBuilderForm({ ...builderForm, warmUp: { ...builderForm.warmUp, constraints: e.target.value } })} className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase">Goals</label>
                    <textarea rows={2} value={builderForm.warmUp.goals || ''} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBuilderForm({ ...builderForm, warmUp: { ...builderForm.warmUp, goals: e.target.value } })} className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs" />
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-3">
                <div>
                  <span className="text-[11px] text-slate-500">Rounds</span>
                  <input type="number" value={builderForm.warmUp.roundCount} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBuilderForm({ ...builderForm, warmUp: { ...builderForm.warmUp, roundCount: Number(e.target.value) } })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500">Round Time (Sec)</span>
                  <input type="number" value={builderForm.warmUp.roundTimeSeconds} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBuilderForm({ ...builderForm, warmUp: { ...builderForm.warmUp, roundTimeSeconds: Number(e.target.value) } })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500">Rest Time (Sec)</span>
                  <input type="number" value={builderForm.warmUp.restTimeSeconds} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBuilderForm({ ...builderForm, warmUp: { ...builderForm.warmUp, restTimeSeconds: Number(e.target.value) } })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white" />
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

              {builderForm.drills.map((drill: Drill, index: number) => (
                <div key={drill.id} className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black px-2 py-0.5 rounded bg-slate-800 text-slate-300">Drill #{index + 1}</span>
                    {builderForm.drills.length > 1 && (
                      <button type="button" onClick={() => removeDrillFromForm(drill.id)} className="text-slate-500 hover:text-rose-400 p-1"><Trash2 size={16} /></button>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase">Drill Name</label>
                    <input type="text" required value={drill.drillName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateDrillField(index, 'drillName', e.target.value)} className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase">Drill Constraints</label>
                    <textarea rows={2} required value={drill.drillConstraints} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateDrillField(index, 'drillConstraints', e.target.value)} className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase">Primary Goal</label>
                      <input type="text" required value={drill.primaryGoal} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateDrillField(index, 'primaryGoal', e.target.value)} className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase">Immediate Reset Condition</label>
                      <input type="text" required value={drill.immediateReset} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateDrillField(index, 'immediateReset', e.target.value)} className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-800">
                    <div>
                      <span className="text-[11px] text-slate-400">Rounds</span>
                      <input type="number" value={drill.roundCount} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateDrillField(index, 'roundCount', Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white" />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400">Work Time (s)</span>
                      <input type="number" value={drill.roundTimeSeconds} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateDrillField(index, 'roundTimeSeconds', Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white" />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400">Rest Time (s)</span>
                      <input type="number" value={drill.restTimeSeconds} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateDrillField(index, 'restTimeSeconds', Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* LIVE ROUNDS SECTION TIMER */}
            <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400">Live Rounds Configuration</h3>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-400">Live Rounds Count</label>
                  <input type="number" value={builderForm.liveRounds.roundCount} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBuilderForm({ ...builderForm, liveRounds: { ...builderForm.liveRounds, roundCount: Number(e.target.value) } })} className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Round Duration (Sec)</label>
                  <input type="number" value={builderForm.liveRounds.roundTimeSeconds} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBuilderForm({ ...builderForm, liveRounds: { ...builderForm.liveRounds, roundTimeSeconds: Number(e.target.value) } })} className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Rest Duration (Sec)</label>
                  <input type="number" value={builderForm.liveRounds.restTimeSeconds} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBuilderForm({ ...builderForm, liveRounds: { ...builderForm.liveRounds, restTimeSeconds: Number(e.target.value) } })} className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm" />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={builderForm.isPublic} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBuilderForm({ ...builderForm, isPublic: e.target.checked })} className="w-4 h-4 rounded text-emerald-500 bg-slate-950 border-slate-800" />
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
                {hubSection === 'lessons' ? 'Organized by core concepts. Filter by technique tags or search keywords.' : 'Library of general flows and paired exploratory warm-up games.'}
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
                                  <div className="text-xs font-bold text-slate-400 uppercase mt-2">Drills ({p.drills.length}):</div>
                                  <ul className="text-xs text-slate-300 list-disc list-inside">
                                    {p.drills.map((d: Drill) => (<li key={d.id}>{d.drillName}</li>))}
                                  </ul>
                                </div>
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
      )}

      {/* VIEW 4: FLOW CHAINS */}
      {activeTab === 'flows' && (
        <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <GitBranch size={22} className="text-cyan-400" />
                Tactical Flow Chains Library
              </h2>
              <p className="text-sm text-slate-400">Design, refine, and launch connected submission and counter-reaction sequences.</p>
            </div>
            <button
              onClick={() => {
                setActiveFlowInStudio({
                  id: `flow-${Date.now()}`,
                  title: '',
                  concept: BASELINE_CONCEPTS[0],
                  startingPosition: 'Closed Guard',
                  roundCount: 4,
                  roundTimeSeconds: 180,
                  restTimeSeconds: 30,
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
              <button
                type="button"
                onClick={addFlowNode}
                className="text-xs font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-cyan-900/60"
              >
                <Plus size={13} /> Add Transition Stage
              </button>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Flow Routine Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Mount Defense to Back Escape Flow"
                  value={activeFlowInStudio.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setActiveFlowInStudio({ ...activeFlowInStudio, title: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Core Concept Track</label>
                <select
                  value={activeFlowInStudio.concept}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setActiveFlowInStudio({ ...activeFlowInStudio, concept: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-bold"
                >
                  {coreConcepts.map((c: string) => (<option key={c} value={c}>{c}</option>))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Starting Position</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Closed Guard Bottom"
                  value={activeFlowInStudio.startingPosition}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setActiveFlowInStudio({ ...activeFlowInStudio, startingPosition: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold uppercase text-slate-400">Sequential Nodes (A &rarr; B &rarr; C)</span>
              {activeFlowInStudio.nodes.map((node: FlowNode, index: number) => (
                <div key={node.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                      Stage #{index + 1}
                    </span>
                    {activeFlowInStudio.nodes.length > 2 && (
                      <button type="button" onClick={() => removeFlowNode(node.id)} className="text-slate-500 hover:text-rose-400 p-1">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 uppercase">Technique / Position</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Straight Armbar"
                        value={node.techniqueName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFlowNode(index, 'techniqueName', e.target.value)}
                        className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-amber-400 uppercase">Opponent Reaction Trigger</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Stacks forward & turns thumb in"
                        value={node.opponentDefenseTrigger}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFlowNode(index, 'opponentDefenseTrigger', e.target.value)}
                        className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-emerald-400 uppercase">Transition Cue</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Pass leg over, shoot Triangle lock"
                        value={node.transitionCue}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFlowNode(index, 'transitionCue', e.target.value)}
                        className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-800">
              <div>
                <span className="text-[11px] text-slate-400">Flow Rounds</span>
                <input
                  type="number"
                  value={activeFlowInStudio.roundCount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setActiveFlowInStudio({ ...activeFlowInStudio, roundCount: Number(e.target.value) })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-400">Work Time (Sec)</span>
                <input
                  type="number"
                  value={activeFlowInStudio.roundTimeSeconds}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setActiveFlowInStudio({ ...activeFlowInStudio, roundTimeSeconds: Number(e.target.value) })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-400">Rest Time (Sec)</span>
                <input
                  type="number"
                  value={activeFlowInStudio.restTimeSeconds}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setActiveFlowInStudio({ ...activeFlowInStudio, restTimeSeconds: Number(e.target.value) })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="submit"
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg"
              >
                {isEditingExistingFlow ? 'Update Flow Chain' : 'Save Chain to Library'}
              </button>
            </div>
          </form>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Saved Flow Chains ({flowLibrary.length})</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {flowLibrary.map((flow: FlowRoutine) => (
                <div key={flow.id} className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-700">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded">
                        {flow.concept}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">Starts: {flow.startingPosition}</span>
                    </div>

                    <h4 className="font-bold text-lg text-white">{flow.title}</h4>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {flow.nodes.map((n: FlowNode, i: number) => (
                        <React.Fragment key={n.id}>
                          <span className="text-[11px] bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-slate-200">
                            {n.techniqueName}
                          </span>
                          {i < flow.nodes.length - 1 && <ArrowRight size={11} className="text-cyan-400" />}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      {flow.roundCount} Rounds &times; {flow.roundTimeSeconds}s
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setActiveFlowInStudio(flow);
                          setIsEditingExistingFlow(true);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                        title="Edit Flow"
                      >
                        <Edit3 size={15} />
                      </button>

                      {flowLibrary.length > 1 && (
                        <button
                          onClick={() => handleDeleteFlow(flow.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                          title="Delete Flow"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}

                      <button
                        onClick={() => launchFlowToMat(flow)}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-md transition"
                      >
                        <Play size={13} /> Run on Mat
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* VIEW 5: ACADEMY CALENDAR */}
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
              <select value={calendarAnchorDate.getMonth()} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setMonthAnchor(parseInt(e.target.value))} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-100">
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m: string, idx: number) => (
                  <option key={m} value={idx}>{m}</option>
                ))}
              </select>
              <select value={calendarAnchorDate.getFullYear()} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setYearAnchor(parseInt(e.target.value))} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-100">
                {[2025, 2026, 2027, 2028].map((y: number) => (<option key={y} value={y}>{y}</option>))}
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
            {weekDays.map((dayDate: Date) => {
              const dayDateKey = formatDateKey(dayDate);
              const dayName = dayDate.toLocaleDateString('en-US', { weekday: 'long' });
              const dateReadable = dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              const scheduledClassesForDay = schedule.filter((s: ScheduledClass) => s.dateStr === dayDateKey);

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

                  {scheduledClassesForDay.map((cl: ScheduledClass) => {
                    const assignedPlan = plans.find((p: LessonPlan) => p.id === cl.assignedLessonId);
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
      )}

      {/* VIEW 6: ASK AI */}
      {activeTab === 'chat' && (
        <main className="flex-1 flex flex-col p-4 md:p-8 max-w-4xl mx-auto w-full">
          <div className="border-b border-slate-800 pb-4 mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles size={22} className="text-indigo-400" /> AI Black Belt Mat Consultant
            </h2>
            <p className="text-sm text-slate-400">Ask pedagogical, technical, and live-sparring questions to refine your classes.</p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 min-h-[400px] max-h-[550px]">
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
                setChatMessages((prev: ChatMessage[]) => [...prev, { id: `err-${Date.now()}`, role: 'assistant', content: 'Connection issue.' }]);
              } finally {
                setIsChatSending(false);
              }
            }}
            className="flex gap-2"
          >
            <input type="text" placeholder="Ask AI..." value={chatInput} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setChatInput(e.target.value)} className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm" />
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-3 rounded-xl flex items-center gap-2"><Send size={16} />Ask</button>
          </form>
        </main>
      )}

      {/* VIEW 7: ROSTER & ROLES */}
      {activeTab === 'academy' && (
        <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full space-y-8">
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
            <h2 className="text-xl font-bold flex items-center gap-2"><Users size={20} className="text-emerald-400" />Academy Settings</h2>
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Academy Name</label>
                <input type="text" value={academyName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAcademyName(e.target.value)} disabled={!canManageAcademy} className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm disabled:opacity-60" />
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
              {instructors.map((inst: Instructor) => (
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

      {/* VIEW 8: INSTRUCTOR PROFILE */}
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
                <input type="text" value={currentInstructor.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const updated = { ...currentInstructor, name: e.target.value };
                  setCurrentInstructor(updated);
                  setInstructors(instructors.map((i: Instructor) => i.id === updated.id ? updated : i));
                }} className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Email</label>
                <input type="email" value={currentInstructor.email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const updated = { ...currentInstructor, email: e.target.value };
                  setCurrentInstructor(updated);
                  setInstructors(instructors.map((i: Instructor) => i.id === updated.id ? updated : i));
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
              <input type="text" required placeholder="Class Name" value={templateFormData.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTemplateFormData({ ...templateFormData, name: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white" />
              <button type="submit" className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white">Save Template</button>
            </form>
            <div className="divide-y divide-slate-800">
              {classTemplates.map((t: ClassTemplate) => (
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
              <select value={selectedTemplateForNewClass} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedTemplateForNewClass(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm">
                {classTemplates.map((ct: ClassTemplate) => (<option key={ct.id} value={ct.id}>{ct.name}</option>))}
              </select>
              <input type="text" required placeholder="06:00 PM" value={newClassTime} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewClassTime(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm" />
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
              <h3 className="font-bold text-lg text-white flex items-center gap-2"><FolderPlus size={18} className="text-emerald-400" />Add New Core Concept</h3>
              <button onClick={() => setIsNewConceptModalOpen(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleAddNewConcept} className="space-y-4">
              <input type="text" required autoFocus placeholder="e.g., Mount Defense & Counters" value={newConceptInput} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewConceptInput(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white" />
              <button type="submit" className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs">Save Concept</button>
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
              <button type="submit" className="w-full py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-xs">Save to Library</button>
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
            <input type="text" placeholder="Username" value={loginUsername} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoginUsername(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white" />
            <input type="password" placeholder="Password" value={loginPassword} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoginPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white" />
            <button onClick={handleLoginSubmit} className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm">Sign In</button>
          </div>
        </div>
      )}
    </div>
  );
}