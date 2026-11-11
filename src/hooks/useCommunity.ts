import { router } from 'expo-router';
import { useMemo } from 'react';

import { FREE_GROUP_LIMIT, FREE_PRIVATE_GROUP_LIMIT } from '@/data/catalog';
import { ME, members, membersById, memberWeekXp, publicGroups, type Member } from '@/data/community';
import { useStore } from '@/store/AppStore';
import type { Group, MascotId } from '@/store/types';

export type Person = { id: string; name: string; handle: string; mascot: MascotId; weekXp: number; isMe: boolean };

export function useCommunity() {
  const { state, stats, today, dispatch, feedback } = useStore();
  const isPremium = state.profile.isPremium;

  const allGroups = useMemo(() => [...state.customGroups, ...publicGroups], [state.customGroups]);
  const myGroups = allGroups.filter((group) => state.customGroups.includes(group) || state.joinedGroupIds.includes(group.id));
  const discoverGroups = publicGroups.filter((group) => !state.joinedGroupIds.includes(group.id));
  const membershipCount = state.joinedGroupIds.length + state.customGroups.length;

  const me: Person = {
    id: ME,
    name: state.profile.name || 'You',
    handle: 'you',
    mascot: state.profile.mascot,
    weekXp: stats.weekXp,
    isMe: true,
  };

  const toPerson = (member: Member): Person => ({
    id: member.id,
    name: member.name,
    handle: member.handle,
    mascot: member.mascot,
    weekXp: memberWeekXp(member, today),
    isMe: false,
  });

  const personFor = (id: string): Person | undefined => {
    if (id === ME) return me;
    const member = membersById.get(id);
    return member ? toPerson(member) : undefined;
  };

  const friendIds = new Set(myGroups.flatMap((group) => group.memberIds).filter((id) => id !== ME));

  const leaderboard = (scope: 'global' | 'friends'): Person[] => {
    const pool = scope === 'global' ? members : members.filter((member) => friendIds.has(member.id));
    return [me, ...pool.map(toPerson)].sort((a, b) => b.weekXp - a.weekXp);
  };

  const joinGroup = (groupId: string) => {
    if (!isPremium && membershipCount >= FREE_GROUP_LIMIT) {
      router.push({ pathname: '/premium', params: { reason: 'groups' } });
      return false;
    }
    feedback.success();
    dispatch({ type: 'joinGroup', groupId });
    return true;
  };

  const openCreateGroup = () => {
    const isAtLimit = !isPremium && (state.customGroups.length >= FREE_PRIVATE_GROUP_LIMIT || membershipCount >= FREE_GROUP_LIMIT);
    if (isAtLimit) {
      router.push({ pathname: '/premium', params: { reason: 'groups' } });
      return;
    }
    router.push('/group/create');
  };

  const findGroup = (id: string): Group | undefined => allGroups.find((group) => group.id === id);
  const findByInviteCode = (code: string): Group | undefined =>
    allGroups.find((group) => group.inviteCode.toUpperCase() === code.trim().toUpperCase());

  return { allGroups, myGroups, discoverGroups, me, personFor, leaderboard, joinGroup, openCreateGroup, findGroup, findByInviteCode };
}
