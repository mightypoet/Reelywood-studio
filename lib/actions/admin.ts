
import { prisma } from '../prisma';
import { CardStatus } from '@prisma/client';

/**
 * Updates a user's card status to ACTIVE.
 */
export async function approveCreatorCard(userId: string) {
  return await prisma.user.update({
    where: { id: userId },
    data: { cardStatus: 'ACTIVE' },
  });
}

/**
 * Assigns a mission to a group of users, ensuring they are ACTIVE.
 */
export async function assignMissionToGroup(missionId: string, userIds: string[]) {
  // Only target users who are currently ACTIVE
  const activeUsers = await prisma.user.findMany({
    where: {
      id: { in: userIds },
      cardStatus: 'ACTIVE',
    },
    select: { id: true },
  });

  const validIds = activeUsers.map((u) => u.id);

  return await prisma.mission.update({
    where: { id: missionId },
    data: {
      assignedUsers: {
        connect: validIds.map((id) => ({ id })),
      },
    },
  });
}

/**
 * Grants a specific voucher to a user.
 */
export async function grantVoucherAccess(voucherId: string, userId: string) {
  return await prisma.voucher.update({
    where: { id: voucherId },
    data: {
      allowedUsers: {
        connect: { id: userId },
      },
    },
  });
}
