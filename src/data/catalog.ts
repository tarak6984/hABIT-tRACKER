import type { HabitColorId } from '@/theme/tokens';
import type { CategoryId, HabitGoal, MascotId, PlantSpecies } from '@/store/types';

export const APP_NAME = 'Bloomly';

export const FREE_HABIT_LIMIT = 5;
export const FREE_GROUP_LIMIT = 2;
export const FREE_PRIVATE_GROUP_LIMIT = 1;

type CategoryMeta = { id: CategoryId; label: string; emoji: string; color: HabitColorId; blurb: string };

export const categories: Record<CategoryId, CategoryMeta> = {
  health: { id: 'health', label: 'Health', emoji: '💧', color: 'sky', blurb: 'Hydrate, sleep and eat well' },
  fitness: { id: 'fitness', label: 'Fitness', emoji: '🏃', color: 'peach', blurb: 'Move your body every day' },
  mind: { id: 'mind', label: 'Mindfulness', emoji: '🧘', color: 'violet', blurb: 'Breathe, reflect, unwind' },
  learning: { id: 'learning', label: 'Learning', emoji: '📚', color: 'sun', blurb: 'Read, study, grow your skills' },
  productivity: { id: 'productivity', label: 'Productivity', emoji: '🎯', color: 'teal', blurb: 'Plan, focus and tidy up' },
  social: { id: 'social', label: 'Social', emoji: '💌', color: 'pink', blurb: 'Connect with people you love' },
};

export const categoryIds = Object.keys(categories) as CategoryId[];

type MascotMeta = { id: MascotId; name: string; personality: string; premium: boolean };

export const mascots: Record<MascotId, MascotMeta> = {
  sprout: { id: 'sprout', name: 'Sprout', personality: 'A cheerful little seedling', premium: false },
  mochi: { id: 'mochi', name: 'Mochi', personality: 'A sweet kitty who loves naps', premium: false },
  bun: { id: 'bun', name: 'Bun', personality: 'A bouncy bunny full of energy', premium: false },
  pip: { id: 'pip', name: 'Pip', personality: 'An early-bird chick', premium: false },
  boba: { id: 'boba', name: 'Boba', personality: 'A calm, cuddly bear', premium: false },
  ember: { id: 'ember', name: 'Ember', personality: 'A clever, curious fox', premium: false },
  nimbus: { id: 'nimbus', name: 'Nimbus', personality: 'A dreamy cloud puff', premium: true },
  luna: { id: 'luna', name: 'Luna', personality: 'A wise night owl', premium: true },
  zest: { id: 'zest', name: 'Zest', personality: 'A zippy little frog', premium: true },
};

export const mascotIds = Object.keys(mascots) as MascotId[];

type PlantMeta = { id: PlantSpecies; name: string; premium: boolean };

export const plants: Record<PlantSpecies, PlantMeta> = {
  daisy: { id: 'daisy', name: 'Daisy', premium: false },
  tulip: { id: 'tulip', name: 'Tulip', premium: false },
  sunflower: { id: 'sunflower', name: 'Sunflower', premium: false },
  cactus: { id: 'cactus', name: 'Cactus', premium: false },
  cherry: { id: 'cherry', name: 'Cherry Blossom', premium: true },
  lavender: { id: 'lavender', name: 'Lavender', premium: true },
};

export const plantIds = Object.keys(plants) as PlantSpecies[];

export const PLANT_STAGE_THRESHOLDS = [0, 3, 7, 14, 30] as const;
export const PLANT_STAGE_NAMES = ['Seed', 'Sprout', 'Sapling', 'Budding', 'In bloom'] as const;

export const habitEmojis = [
  '💧', '🏃', '🧘', '📚', '🥗', '😴', '🚶', '🏋️', '🎯', '📝', '🧹', '🎸',
  '💊', '🍎', '☀️', '🌙', '🧠', '💌', '📵', '🚴', '🏊', '🎨', '🪴', '🙏',
];

export type HabitTemplate = {
  id: string;
  name: string;
  emoji: string;
  category: CategoryId;
  color: HabitColorId;
  goal: HabitGoal;
  plant: PlantSpecies;
};

export const habitTemplates: HabitTemplate[] = [
  { id: 't-water', name: 'Drink water', emoji: '💧', category: 'health', color: 'sky', goal: { kind: 'count', target: 8, unit: 'glasses' }, plant: 'tulip' },
  { id: 't-sleep', name: 'Sleep by 11 PM', emoji: '😴', category: 'health', color: 'violet', goal: { kind: 'check' }, plant: 'daisy' },
  { id: 't-fruit', name: 'Eat a fruit', emoji: '🍎', category: 'health', color: 'coral', goal: { kind: 'check' }, plant: 'tulip' },
  { id: 't-vitamins', name: 'Take vitamins', emoji: '💊', category: 'health', color: 'teal', goal: { kind: 'check' }, plant: 'daisy' },
  { id: 't-walk', name: 'Walk 8,000 steps', emoji: '🚶', category: 'fitness', color: 'peach', goal: { kind: 'check' }, plant: 'sunflower' },
  { id: 't-workout', name: 'Workout', emoji: '🏋️', category: 'fitness', color: 'coral', goal: { kind: 'count', target: 30, unit: 'min' }, plant: 'cactus' },
  { id: 't-stretch', name: 'Morning stretch', emoji: '🤸', category: 'fitness', color: 'mint', goal: { kind: 'check' }, plant: 'daisy' },
  { id: 't-meditate', name: 'Meditate', emoji: '🧘', category: 'mind', color: 'violet', goal: { kind: 'count', target: 10, unit: 'min' }, plant: 'daisy' },
  { id: 't-journal', name: 'Gratitude journal', emoji: '📝', category: 'mind', color: 'pink', goal: { kind: 'check' }, plant: 'tulip' },
  { id: 't-breathe', name: 'Deep breathing', emoji: '🌬️', category: 'mind', color: 'sky', goal: { kind: 'count', target: 3, unit: 'rounds' }, plant: 'daisy' },
  { id: 't-read', name: 'Read', emoji: '📚', category: 'learning', color: 'sun', goal: { kind: 'count', target: 20, unit: 'pages' }, plant: 'sunflower' },
  { id: 't-language', name: 'Practice a language', emoji: '🗣️', category: 'learning', color: 'teal', goal: { kind: 'check' }, plant: 'cactus' },
  { id: 't-study', name: 'Study session', emoji: '🧠', category: 'learning', color: 'violet', goal: { kind: 'count', target: 2, unit: 'sessions' }, plant: 'sunflower' },
  { id: 't-plan', name: 'Plan my day', emoji: '🎯', category: 'productivity', color: 'teal', goal: { kind: 'check' }, plant: 'cactus' },
  { id: 't-tidy', name: 'Tidy up 10 min', emoji: '🧹', category: 'productivity', color: 'mint', goal: { kind: 'check' }, plant: 'tulip' },
  { id: 't-screen', name: 'No phone after 10 PM', emoji: '📵', category: 'productivity', color: 'coral', goal: { kind: 'check' }, plant: 'cactus' },
  { id: 't-call', name: 'Call a loved one', emoji: '💌', category: 'social', color: 'pink', goal: { kind: 'check' }, plant: 'tulip' },
  { id: 't-kind', name: 'One act of kindness', emoji: '🙏', category: 'social', color: 'sun', goal: { kind: 'check' }, plant: 'sunflower' },
];

export const quotes: { text: string; author: string }[] = [
  { text: 'Small steps every day add up to big results.', author: 'Unknown' },
  { text: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.', author: 'Will Durant' },
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { text: 'You do not rise to the level of your goals. You fall to the level of your systems.', author: 'James Clear' },
  { text: 'A flower does not think of competing with the flower next to it. It just blooms.', author: 'Zen Shin' },
  { text: 'Motivation gets you going, but habit gets you there.', author: 'Zig Ziglar' },
  { text: 'Be patient with yourself. Nothing in nature blooms all year.', author: 'Unknown' },
  { text: 'Success is the sum of small efforts, repeated day in and day out.', author: 'Robert Collier' },
  { text: 'The best time to plant a tree was 20 years ago. The second best time is now.', author: 'Proverb' },
  { text: 'Progress, not perfection.', author: 'Unknown' },
];

export type Decor = { id: string; name: string; emoji: string; price: number; premium: boolean };

export const decorItems: Decor[] = [
  { id: 'd-mushroom', name: 'Lucky Mushroom', emoji: '🍄', price: 30, premium: false },
  { id: 'd-butterfly', name: 'Butterfly', emoji: '🦋', price: 40, premium: false },
  { id: 'd-snail', name: 'Snail Friend', emoji: '🐌', price: 45, premium: false },
  { id: 'd-bee', name: 'Busy Bee', emoji: '🐝', price: 50, premium: false },
  { id: 'd-rock', name: 'Zen Stones', emoji: '🪨', price: 60, premium: false },
  { id: 'd-lantern', name: 'Paper Lantern', emoji: '🏮', price: 80, premium: false },
  { id: 'd-bird', name: 'Songbird', emoji: '🐦', price: 90, premium: false },
  { id: 'd-rainbow', name: 'Rainbow', emoji: '🌈', price: 150, premium: true },
  { id: 'd-unicorn', name: 'Unicorn', emoji: '🦄', price: 200, premium: true },
  { id: 'd-castle', name: 'Tiny Castle', emoji: '🏰', price: 250, premium: true },
];

export const moodOptions = [
  { value: 1, emoji: '😣', label: 'Rough' },
  { value: 2, emoji: '😕', label: 'Meh' },
  { value: 3, emoji: '🙂', label: 'Okay' },
  { value: 4, emoji: '😊', label: 'Good' },
  { value: 5, emoji: '🤩', label: 'Great' },
] as const;

export const premiumPlans = [
  { id: 'monthly', label: 'Monthly', price: '$4.99', cadence: '/month', note: 'Cancel anytime' },
  { id: 'yearly', label: 'Yearly', price: '$29.99', cadence: '/year', note: 'Save 50% · 7-day free trial' },
  { id: 'lifetime', label: 'Lifetime', price: '$59.99', cadence: 'once', note: 'Pay once, bloom forever' },
] as const;

// Flip once a real billing provider (e.g. RevenueCat) is wired in; until then purchases are simulated locally.
export const IS_BILLING_LIVE = false;
