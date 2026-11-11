import { addDays, daysBetween, startOfWeek, todayKey, weekdayOf, type DateKey } from '@/lib/dates';
import type { HabitColorId } from '@/theme/tokens';
import type { CategoryId, Group, MascotId, Post } from '@/store/types';

// Offline-first: the community layer runs on this local seed until a sync backend exists.
// Member activity is derived deterministically from the date, so it evolves day to day.

export const ME = 'me';

export type Member = {
  id: string;
  name: string;
  handle: string;
  mascot: MascotId;
  /** Typical XP per active day; drives leaderboard and challenge pace. */
  pace: number;
};

export const members: Member[] = [
  { id: 'm-aria', name: 'Aria', handle: 'aria.blooms', mascot: 'bun', pace: 62 },
  { id: 'm-kenji', name: 'Kenji', handle: 'kenji_runs', mascot: 'ember', pace: 74 },
  { id: 'm-maya', name: 'Maya', handle: 'mayareads', mascot: 'mochi', pace: 55 },
  { id: 'm-leo', name: 'Leo', handle: 'leo.lifts', mascot: 'boba', pace: 81 },
  { id: 'm-zara', name: 'Zara', handle: 'zarazen', mascot: 'luna', pace: 47 },
  { id: 'm-omar', name: 'Omar', handle: 'omar.codes', mascot: 'pip', pace: 58 },
  { id: 'm-ivy', name: 'Ivy', handle: 'ivy_greens', mascot: 'sprout', pace: 66 },
  { id: 'm-noah', name: 'Noah', handle: 'noahwalks', mascot: 'zest', pace: 39 },
  { id: 'm-sofia', name: 'Sofia', handle: 'sofia.sips', mascot: 'nimbus', pace: 52 },
  { id: 'm-ravi', name: 'Ravi', handle: 'ravi_rises', mascot: 'ember', pace: 69 },
  { id: 'm-emma', name: 'Emma', handle: 'emma.journals', mascot: 'bun', pace: 44 },
  { id: 'm-tariq', name: 'Tariq', handle: 'tariq.focus', mascot: 'boba', pace: 77 },
];

export const membersById = new Map(members.map((member) => [member.id, member]));

function hashString(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** Deterministic pseudo-random number in [0, 1) for a given seed string. */
export function seededRandom(seed: string): number {
  let state = hashString(seed) || 1;
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return (state >>> 0) / 4294967296;
}

export function memberXpOn(member: Member, key: DateKey): number {
  const roll = seededRandom(`${member.id}:${key}`);
  if (roll < 0.12) return 0;
  return Math.round(member.pace * (0.55 + roll * 0.9));
}

export function memberWeekXp(member: Member, today: DateKey): number {
  const start = startOfWeek(today);
  let total = 0;
  for (let key = start; key <= today; key = addDays(key, 1)) total += memberXpOn(member, key);
  return total;
}

export function memberStreak(member: Member, today: DateKey): number {
  let streak = 0;
  for (let offset = 0; offset < 120; offset += 1) {
    if (memberXpOn(member, addDays(today, -offset)) === 0) break;
    streak += 1;
  }
  return streak;
}

export function memberLevel(member: Member): number {
  return 3 + Math.round(member.pace / 9);
}

export const publicGroups: Group[] = [
  {
    id: 'g-early', name: 'Early Birds Club', emoji: '🌅', color: 'sun', isPrivate: false, inviteCode: 'EARLY1',
    description: 'Rise before 7 AM and own your mornings together.',
    memberIds: ['m-aria', 'm-kenji', 'm-omar', 'm-ravi', 'm-tariq'], memberCount: 1284, ownerId: 'm-ravi',
  },
  {
    id: 'g-hydrate', name: 'Hydration Nation', emoji: '💧', color: 'sky', isPrivate: false, inviteCode: 'HYDRO8',
    description: 'Eight glasses a day keeps the headaches away.',
    memberIds: ['m-sofia', 'm-maya', 'm-ivy', 'm-noah'], memberCount: 2310, ownerId: 'm-sofia',
  },
  {
    id: 'g-books', name: 'Bookworm Corner', emoji: '📚', color: 'violet', isPrivate: false, inviteCode: 'READ20',
    description: 'Twenty pages a day. Share what you are reading.',
    memberIds: ['m-maya', 'm-emma', 'm-zara', 'm-omar'], memberCount: 956, ownerId: 'm-maya',
  },
  {
    id: 'g-mindful', name: 'Mindful Minutes', emoji: '🧘', color: 'mint', isPrivate: false, inviteCode: 'CALM10',
    description: 'Ten quiet minutes a day for a calmer mind.',
    memberIds: ['m-zara', 'm-ivy', 'm-emma', 'm-aria'], memberCount: 1742, ownerId: 'm-zara',
  },
  {
    id: 'g-fit', name: 'Move Squad', emoji: '💪', color: 'peach', isPrivate: false, inviteCode: 'MOVE30',
    description: 'Workouts, walks and stretches. Every bit of movement counts.',
    memberIds: ['m-leo', 'm-kenji', 'm-tariq', 'm-noah'], memberCount: 3105, ownerId: 'm-leo',
  },
];

export type Challenge = {
  id: string;
  title: string;
  emoji: string;
  description: string;
  category: CategoryId;
  durationDays: number;
  color: HabitColorId;
  participants: number;
  rewardCoins: number;
  memberIds: string[];
};

export const challenges: Challenge[] = [
  {
    id: 'c-water7', title: '7-Day Water Warrior', emoji: '💧', category: 'health', durationDays: 7, color: 'sky',
    description: 'Complete a health habit every day for a week. Your body will thank you.',
    participants: 4820, rewardCoins: 60, memberIds: ['m-sofia', 'm-ivy', 'm-noah', 'm-maya'],
  },
  {
    id: 'c-move14', title: '14 Days of Movement', emoji: '🏃', category: 'fitness', durationDays: 14, color: 'peach',
    description: 'Any fitness habit counts: a walk, a stretch, a workout. Just move!',
    participants: 3610, rewardCoins: 120, memberIds: ['m-leo', 'm-kenji', 'm-tariq', 'm-ravi'],
  },
  {
    id: 'c-read30', title: '30-Day Reading Quest', emoji: '📖', category: 'learning', durationDays: 30, color: 'sun',
    description: 'Learn something every day for a month. Finish a book or two along the way.',
    participants: 2155, rewardCoins: 250, memberIds: ['m-maya', 'm-emma', 'm-omar', 'm-zara'],
  },
  {
    id: 'c-calm7', title: 'Calm Week', emoji: '🌿', category: 'mind', durationDays: 7, color: 'mint',
    description: 'Seven days of mindfulness. Meditate, journal or simply breathe.',
    participants: 2980, rewardCoins: 60, memberIds: ['m-zara', 'm-aria', 'm-ivy', 'm-emma'],
  },
  {
    id: 'c-focus10', title: 'Focus Sprint', emoji: '🎯', category: 'productivity', durationDays: 10, color: 'teal',
    description: 'Ten days of planning and deep work. Get the important stuff done.',
    participants: 1430, rewardCoins: 90, memberIds: ['m-tariq', 'm-omar', 'm-kenji', 'm-ravi'],
  },
];

export const challengesById = new Map(challenges.map((challenge) => [challenge.id, challenge]));

/** Simulated member progress: they "joined" on a seeded day and keep a seeded success rate. */
export function memberChallengeProgress(member: Member, challenge: Challenge, today: DateKey): number {
  const offset = Math.floor(seededRandom(`${member.id}:${challenge.id}:start`) * challenge.durationDays);
  const joined = addDays(today, -offset);
  const elapsed = Math.min(challenge.durationDays, daysBetween(joined, today) + 1);
  let done = 0;
  for (let index = 0; index < elapsed; index += 1) {
    if (seededRandom(`${member.id}:${challenge.id}:${addDays(joined, index)}`) < 0.82) done += 1;
  }
  return done;
}

const seededPostTemplates: { authorId: string; kind: Post['kind']; text: string; hoursAgo: number; cheers: number; groupId: string | null }[] = [
  { authorId: 'm-kenji', kind: 'streak', text: 'Hit a 21-day running streak this morning! Legs are tired but the mind is clear 🏃‍♂️', hoursAgo: 1, cheers: 34, groupId: 'g-fit' },
  { authorId: 'm-maya', kind: 'text', text: 'Finished "The Midnight Library" today. 20 pages a day really adds up 📚✨', hoursAgo: 3, cheers: 21, groupId: 'g-books' },
  { authorId: 'm-sofia', kind: 'badge', text: 'Unlocked the Hydration Hero badge! 💧 Who else is sipping right now?', hoursAgo: 5, cheers: 18, groupId: 'g-hydrate' },
  { authorId: 'm-zara', kind: 'text', text: 'Tried a 10-minute body scan before bed. Slept like a baby 🌙', hoursAgo: 8, cheers: 27, groupId: 'g-mindful' },
  { authorId: 'm-leo', kind: 'level', text: 'Level 12 reached! My garden finally has a sunflower in full bloom 🌻', hoursAgo: 11, cheers: 42, groupId: null },
  { authorId: 'm-ravi', kind: 'text', text: 'Up at 5:45 again. Coffee, journal, then a quick walk. Best part of my day ☀️', hoursAgo: 14, cheers: 16, groupId: 'g-early' },
  { authorId: 'm-ivy', kind: 'challenge', text: 'Completed the Calm Week challenge 🌿 Feeling lighter already.', hoursAgo: 20, cheers: 23, groupId: null },
  { authorId: 'm-emma', kind: 'text', text: 'Gratitude list today: sunshine, my cat, and you all for the motivation 💜', hoursAgo: 26, cheers: 31, groupId: 'g-mindful' },
  { authorId: 'm-tariq', kind: 'streak', text: '30 days of planning my day the night before. Game changer 🎯', hoursAgo: 33, cheers: 19, groupId: 'g-early' },
  { authorId: 'm-noah', kind: 'text', text: 'Missed two days but back on track today. Progress, not perfection 🌱', hoursAgo: 40, cheers: 38, groupId: 'g-hydrate' },
];

/** Seed posts are anchored to the current day so the feed always looks fresh. */
export function seededPosts(now: Date = new Date()): Post[] {
  const dayAnchor = todayKey();
  return seededPostTemplates.map((template, index) => ({
    id: `seed-${index}`,
    authorId: template.authorId,
    kind: template.kind,
    text: template.text,
    createdAt: new Date(now.getTime() - template.hoursAgo * 3_600_000).toISOString(),
    groupId: template.groupId,
    baseCheers: template.cheers + Math.floor(seededRandom(`${dayAnchor}:${index}`) * 8) + weekdayOf(dayAnchor),
  }));
}
