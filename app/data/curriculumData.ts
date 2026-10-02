// app/data/curriculumData.ts

import { Instructor, WarmUp, FlowRoutine, LessonPlan, ClassTemplate, WeeklyTaxonomy } from '../types';

export const BASELINE_CONCEPTS: string[] = [
  'Closed Guard Dominance (Roger Gracie System)',
  'Half Guard & Chest Camping (Gordon Ryan System)',
  'Butterfly & X-Guard Dynamics (Marcelo Garcia System)',
  'Side Control & North-South Pins (Bernardo Faria System)',
  'Back Trapping & Straight Jacket (John Danaher System)',
  'K-Guard & 50/50 Heel Hooks (Lachlan Giles System)',
  'Open Guard Retention & Framing (Mikey Musumeci System)',
  'Front Headlock & Guillotine Hub (Marcelo Garcia System)'
];

export const BASELINE_WARMUPS: WarmUp[] = [
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

export const BASELINE_FLOWS: FlowRoutine[] = [
  {
    id: 'flow-roger-closed',
    title: 'Closed Guard Triple Threat Chain (Roger Gracie)',
    concept: 'Closed Guard Dominance (Roger Gracie System)',
    startingPosition: 'Closed Guard Bottom',
    roundCount: 4,
    roundTimeSeconds: 180,
    restTimeSeconds: 30,
    isPublic: true,
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
    isPublic: true,
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

export const INITIAL_INSTRUCTORS_SEED: Instructor[] = [
  { id: 'inst-1', username: 'owner', password: 'password123', name: 'Chief Instructor', email: 'owner@matops.com', role: 'owner', rank: 'Black Belt', bio: 'Head Coach and Program Director.' },
  { id: 'inst-2', username: 'mvance', password: 'password123', name: 'Marcus Vance', email: 'marcus@matops.com', role: 'manager', rank: 'Brown Belt', bio: 'Senior Instructor.' },
  { id: 'inst-3', username: 'sarah_bjj', password: 'password123', name: 'Sarah Jenkins', email: 'sarah@matops.com', role: 'instructor', rank: 'Purple Belt', bio: 'Fundamentals Lead.' },
  { id: 'inst-4', username: 'alex_coach', password: 'password123', name: 'Alex Rivera', email: 'alex@matops.com', role: 'assistant', rank: 'Blue Belt', bio: 'Assistant Coach.' },
];

export const INITIAL_CLASS_TEMPLATES_SEED: ClassTemplate[] = [
  { id: 'ct-1', name: 'Adult Fundamental Gi', ageGroup: 'Adults', durationMinutes: 60 },
  { id: 'ct-2', name: 'Youth BJJ Dynamics', ageGroup: 'Ages 7-12', durationMinutes: 45 },
  { id: 'ct-3', name: 'Advanced No-Gi & Sparring', ageGroup: 'Adults', durationMinutes: 75 },
  { id: 'ct-4', name: 'Tiny Champions Movement', ageGroup: 'Ages 3-6', durationMinutes: 30 },
  { id: 'ct-5', name: 'Weekend Open Mat', ageGroup: 'All Levels', durationMinutes: 90 },
];

// --- 6-MONTH (26 WEEKS) SYSTEMATIC CURRICULAR TAXONOMY ---
export const SIX_MONTH_TAXONOMY: WeeklyTaxonomy[] = [
  // MONTH 1: CLOSED GUARD DOMINANCE (ROGER GRACIE)
  { weekNum: 1, monthNum: 1, themeTitle: 'Posture Breaking & 2-on-1 Sleeve Drag', concept: 'Closed Guard Dominance (Roger Gracie System)', lineage: 'Roger Gracie', techniqueThemes: ['Sleeve Drag to High Diamond Guard', 'Posture Collapse & Head Control', 'Elbow Isolation Drills', 'Grip Stripping Mechanics', 'Centerline Crossing', 'Diamond Guard Pressure'] },
  { weekNum: 2, monthNum: 1, themeTitle: 'Roger Gracie Cross-Collar Strangle', concept: 'Closed Guard Dominance (Roger Gracie System)', lineage: 'Roger Gracie', techniqueThemes: ['Deep Four-Finger Collar Placement', 'Scissor Hip Tilt Choke', 'Thumb-Inside Anchor', 'Posture Defense Counters', 'Elbow Flaring & Throat Pressure', 'Cross-Choke Trap Variations'] },
  { weekNum: 3, monthNum: 1, themeTitle: 'Hip Bump to Kimura / Guillotine Trap', concept: 'Closed Guard Dominance (Roger Gracie System)', lineage: 'Roger Gracie', techniqueThemes: ['Hip Bump Commitment', 'Hand-Post Kimura Wrap', 'Kimura to Guillotine Dilemma', 'Kimura Re-Roll Sweep', 'Overhook Kimura Control', 'Wrist Lock / Americana Transitions'] },
  { weekNum: 4, monthNum: 1, themeTitle: 'Scissor Sweep & Pendulum Dynamics', concept: 'Closed Guard Dominance (Roger Gracie System)', lineage: 'Roger Gracie', techniqueThemes: ['Shin-Shield Collar Sweep', 'Pendulum / Flower Sweep Entry', 'Pendulum to Armbar Trap', 'Scissor Sweep Rebound to Mount', 'Underhooking Far Leg', 'Overhead Elevator Reversal'] },

  // MONTH 2: INSIDE CAMPING & HALF GUARD PASSING (GORDON RYAN)
  { weekNum: 5, monthNum: 2, themeTitle: 'Headquarters & Split-Squat Base', concept: 'Half Guard & Chest Camping (Gordon Ryan System)', lineage: 'Gordon Ryan', techniqueThemes: ['Split-Squat Shin Pinning', 'Inside Knee Wedge Control', 'Killing Reverse De La Riva', 'Posture Wedging & Balance', 'Ankle Pinning Transitions', 'Headquarters Low Camping'] },
  { weekNum: 6, monthNum: 2, themeTitle: 'Pummeling Underhooks & Crossface Drive', concept: 'Half Guard & Chest Camping (Gordon Ryan System)', lineage: 'Gordon Ryan', techniqueThemes: ['Crossface Crown Pressure', 'Far Underhook Finger Walking', 'Near-Side Underhook Flattening', 'Killing Hip Frames with Wedges', 'Chest-to-Jaw Weight Lines', 'Shoulder Rotation Control'] },
  { weekNum: 7, monthNum: 2, themeTitle: 'Tripod Free-Foot Extraction', concept: 'Half Guard & Chest Camping (Gordon Ryan System)', lineage: 'Gordon Ryan', techniqueThemes: ['High Hips Tripod Elevation', 'Heel-to-Heel Ankle Stripping', 'Peeling Low Quarter Guard', 'Quarter Guard to 3/4 Mount', 'Knee Slide vs Lockdown', 'Preventing Deep Half Sweeps'] },
  { weekNum: 8, monthNum: 2, themeTitle: 'Three-Quarter Mount to Full High Mount', concept: 'Half Guard & Chest Camping (Gordon Ryan System)', lineage: 'Gordon Ryan', techniqueThemes: ['Windshield Wiper Leg Extraction', 'Knee Walk to Armpits', 'S-Mount Hip Positioning', 'Chest Pressure Retention', 'Heavy Mount Posture', 'Low Grapevine Stabilization'] },

  // MONTH 3: BUTTERFLY & X-GUARD DYNAMICS (MARCELO GARCIA)
  { weekNum: 9, monthNum: 3, themeTitle: 'Seated Butterfly Posture & Distance', concept: 'Butterfly & X-Guard Dynamics (Marcelo Garcia System)', lineage: 'Marcelo Garcia', techniqueThemes: ['Inside Instep Hook Placement', 'Torso Angle Alignment', 'Belt & Overhook Elevation', 'Hand Fighting from Butt-Scoot', 'Butterfly Elevation Reversals', 'Head Position in Butterfly'] },
  { weekNum: 10, monthNum: 3, themeTitle: '2-on-1 Arm Drag to Direct Rear Mount', concept: 'Butterfly & X-Guard Dynamics (Marcelo Garcia System)', lineage: 'Marcelo Garcia', techniqueThemes: ['Tricep Snap & Drag Mechanic', 'Chest-to-Back Angle Shift', 'Arm Drag to Double Leg Takedown', 'Re-Drag vs Stiff Arm', 'Seatbelt Connection from Drag', 'Standing Arm Drag to Mat Return'] },
  { weekNum: 11, monthNum: 3, themeTitle: 'Single Leg X Base Off-Balancing', concept: 'Butterfly & X-Guard Dynamics (Marcelo Garcia System)', lineage: 'Marcelo Garcia', techniqueThemes: ['SLX Ankle Clamp & Hip Extension', 'Technical Standup Trip Sweep', 'Foot-on-Hip Off-Balancing', 'Overhook Ankle Lock Setup', 'Transition to Full X-Guard', 'Knockdown Sweep to Top Pin'] },
  { weekNum: 12, monthNum: 3, themeTitle: 'High-Elbow Guillotine (Marcelotine)', concept: 'Butterfly & X-Guard Dynamics (Marcelo Garcia System)', lineage: 'Marcelo Garcia', techniqueThemes: ['Chin-Strap Hand Cup', 'High-Elbow Over Shoulder Clearance', 'Rib-to-Jaw Choke Closure', 'Butterfly Guillotine Extension', 'Front Headlock to Guillotine Trap', 'Guillotine vs Single Leg Takedown'] },

  // MONTH 4: SIDE CONTROL & NORTH-SOUTH PINS (BERNARDO FARIA)
  { weekNum: 13, monthNum: 4, themeTitle: 'Crossface Pinning & Frame Destruction', concept: 'Side Control & North-South Pins (Bernardo Faria System)', lineage: 'Bernardo Faria', techniqueThemes: ['Near-Side Underhook Blocking', 'Killing Knee-Elbow Connection', 'Jaw-Turning Crossface Pin', 'Sprawled Toe Drive & Weight Drop', 'Walking Hips Around Head', 'Shoulder Pressure Maintenance'] },
  { weekNum: 14, monthNum: 4, themeTitle: 'Kesa Gatame to Reverse Scarf Hold', concept: 'Side Control & North-South Pins (Bernardo Faria System)', lineage: 'Bernardo Faria', techniqueThemes: ['Kesa Gatame Elbow Trapping', 'Americana with Legs from Kesa', 'Reverse Scarf Hold Hip Control', 'Kneebar Entry from Reverse Scarf', 'Weight Shifting vs Back Takes', 'Twister Hook Transition'] },
  { weekNum: 15, monthNum: 4, themeTitle: 'North-South Rotation & Hip Wedges', concept: 'Side Control & North-South Pins (Bernardo Faria System)', lineage: 'Bernardo Faria', techniqueThemes: ['Clockwise / Counter Rotation', 'Hip Blocking Armpit Pins', 'Killing Butterfly Hooks from Top', 'Double Tricep Control from N-S', 'Kimura Trap Grip Locking', 'Spinning to Opposite Side Control'] },
  { weekNum: 16, monthNum: 4, themeTitle: 'Marcelo Garcia North-South Strangle', concept: 'Side Control & North-South Pins (Bernardo Faria System)', lineage: 'Bernardo Faria', techniqueThemes: ['Bicep-to-Trachea Alignment', 'Low Rib Sliding Finish (No-Squeeze)', 'Chin-Trap Adjustment', 'Defense Mitigation & Trapping', 'North-South Strangle to Monoplata', 'Arm-In North-South Variation'] },

  // MONTH 5: BACK TRAPPING & STRAIGHT JACKET (JOHN DANAHER)
  { weekNum: 17, monthNum: 5, themeTitle: 'Seatbelt Control & Fall-Side Discipline', concept: 'Back Trapping & Straight Jacket (John Danaher System)', lineage: 'John Danaher', techniqueThemes: ['Over-Under Seatbelt Grip Connection', 'Underhook Fall-Side Alignment', 'Head-to-Jaw Wedge Positioning', 'Hook Maintenance & Body Clamps', 'Rotational Back Mount Control', 'Recovering Stripped Hooks'] },
  { weekNum: 18, monthNum: 5, themeTitle: 'Straight Jacket System (Arm Isolation)', concept: 'Back Trapping & Straight Jacket (John Danaher System)', lineage: 'John Danaher', techniqueThemes: ['Top-Hand Wrist Peeling', 'Leg Over Arm Trapping (Straight Jacket)', 'Two-on-One Choking Hand Isolation', 'Double Arm Trap Mechanics', 'Scraping the Arm Behind Back', 'Free Choke Hand Access'] },
  { weekNum: 19, monthNum: 5, themeTitle: 'Body Triangle Mastery & Turn Escapes', concept: 'Back Trapping & Straight Jacket (John Danaher System)', lineage: 'John Danaher', techniqueThemes: ['Locking Body Triangle on Top Side', 'Mitigating Ankle Lock Reversals', 'Switching Sides with Body Triangle', 'Belly-Down Back Mount Flattening', 'Smother Choke from Back', 'Hip Extension & Spine Compression'] },
  { weekNum: 20, monthNum: 5, themeTitle: 'Rear Naked Strangle (Elbow-Behind-Spine)', concept: 'Back Trapping & Straight Jacket (John Danaher System)', lineage: 'John Danaher', techniqueThemes: ['Rotational Wrist Blade Squeeze', 'Elbow-Behind-Spine Locking', 'Short Choke / Palm-to-Palm Grip', 'Finishing One-Handed Strangles', 'Over-Chin Strangle Mechanics', 'Jaw Compression to Strangle'] },

  // MONTH 6: K-GUARD & 50/50 HEEL HOOKS (LACHLAN GILES)
  { weekNum: 21, monthNum: 6, themeTitle: 'High Pummeling Guard Retention', concept: 'Open Guard Retention & Framing (Mikey Musumeci System)', lineage: 'Mikey Musumeci', techniqueThemes: ['High Knee Recovery vs Torreando', 'Granby Inversion on Upper Spine', 'Foot-in-Bicep Frame Defense', 'Knee-Shield Restoration', 'Framing with Shins and Wrists', 'Inverting to Neutral Guard'] },
  { weekNum: 22, monthNum: 6, themeTitle: 'K-Guard Entry from Open Guard', concept: 'K-Guard & 50/50 Heel Hooks (Lachlan Giles System)', lineage: 'Lachlan Giles', techniqueThemes: ['Scooping Arm Under Lead Thigh', 'Knee-Crease Shin Bite', 'Hamstring Clamping Force', 'K-Guard to Closed Guard Clamp', 'K-Guard to Triangle Dilemma', 'K-Guard Off-Balancing Tilt'] },
  { weekNum: 23, monthNum: 6, themeTitle: 'Inversion to Backside 50/50', concept: 'K-Guard & 50/50 Heel Hooks (Lachlan Giles System)', lineage: 'Lachlan Giles', techniqueThemes: ['Rolling Across Lead Shoulder', 'Clearing the Opponent Knee Line', 'Locking Backside 50/50 Triangle', 'Sprawl Defense Counters', 'Far Leg Trap (Double Trouble)', 'Knee Bar to Heel Hook Transition'] },
  { weekNum: 24, monthNum: 6, themeTitle: 'Heel Exposure Digging & Rotational Finish', concept: 'K-Guard & 50/50 Heel Hooks (Lachlan Giles System)', lineage: 'Lachlan Giles', techniqueThemes: ['Digging Calcaneous with Wrist Blade', 'Anchor Clamp to Ribcage', 'Bridge Hips & Rotational Torque', 'Mitigating Slipping & Roll Escapes', 'Belly-Down Breaking Rotation', 'Outside Heel Hook from 50/50'] },

  // MONTH 6 CULMINATION (WEEKS 25 & 26)
  { weekNum: 25, monthNum: 6, themeTitle: 'Championship Scramble & Dynamic Scenarios', concept: 'Front Headlock & Guillotine Hub (Marcelo Garcia System)', lineage: 'Marcelo Garcia', techniqueThemes: ['Turtle Front Headlock Snapdown', 'Darce Choke Trap from Half Guard', 'Anaconda Choke Roll-Through', 'High-Elbow Guillotine Scramble', 'Sprawl & Spin-Behind Back Take', 'Front Choke to Back Control'] },
  { weekNum: 26, monthNum: 6, themeTitle: 'Tactical Flow Linking & Belt Evaluations', concept: 'Closed Guard Dominance (Roger Gracie System)', lineage: 'Roger Gracie', techniqueThemes: ['Multi-Branch Tactical Chain Linking', 'Progressive Resistance Flow Rounds', 'Positional Sparring Gauntlets', 'Submissions Under High Fatigue', 'Curricular Review & Retention Test', 'Belt Graduation Tournament'] },
];

// --- COMPLETE 624-LESSON GENERATOR FUNCTION ---
export function generateSixMonthsCurriculum(): LessonPlan[] {
  const generatedPlans: LessonPlan[] = [];
  const ageProfiles = [
    { ageGroup: 'Ages 3-6', beltRank: 'White Belt', duration: 30, roundCount: 3, roundTime: 60, restTime: 20 },
    { ageGroup: 'Ages 7-12', beltRank: 'White / Gray Belt', duration: 45, roundCount: 4, roundTime: 90, restTime: 20 },
    { ageGroup: 'Adults', beltRank: 'White - Blue Belt', duration: 60, roundCount: 5, roundTime: 120, restTime: 30 },
    { ageGroup: 'Masters', beltRank: 'Purple Belt +', duration: 75, roundCount: 5, roundTime: 180, restTime: 45 },
  ];

  SIX_MONTH_TAXONOMY.forEach((week) => {
    // 6 Days per week: Mon through Sat
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
          wuIndex = 1; // Shoulder & Knee Tag
          formattedTitle = `Tiny Champs: ${theme} Adventure Game`;
          drillConstraint = 'Top player cannot stand up; bottom cannot use fingers inside gi cuffs.';
          drillGoal = 'Bottom player pins or sweeps partner before the timer bell.';
          resetTrigger = 'Sweep achieved or partner stands up.';
        } else if (profile.ageGroup === 'Ages 7-12') {
          wuIndex = 2; // Hand Fight & Pummel
          formattedTitle = `Youth: ${theme} Mechanics & Scramble`;
          drillConstraint = 'No submissions allowed; focus strictly on posture and positional control.';
          drillGoal = 'Bottom scores sweep or back take; top achieves chest-to-chest pin.';
          resetTrigger = 'Dominant pin established for 3 seconds.';
        } else if (profile.ageGroup === 'Adults') {
          wuIndex = 0; // Dynamic Movement
          formattedTitle = `Adult Fundamentals: ${theme}`;
          drillConstraint = 'Strict representative rules: top cannot disengage beyond arms reach.';
          drillGoal = 'Execute technical connection or submission trap; opponent counters with defensive trigger.';
          resetTrigger = 'Clean submission lock, pass completion, or sweep.';
        } else {
          wuIndex = 0; // Dynamic Movement
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
          flow: null,
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

export const PREBAKED_LESSONS: LessonPlan[] = generateSixMonthsCurriculum();
