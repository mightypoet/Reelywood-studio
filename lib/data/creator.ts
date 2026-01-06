
import { prisma } from '../prisma';

/**
 * Fetches dashboard data with strict status-based filtering.
 */
export async function getCreatorDashboard(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      missions: true,
      vouchers: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Strictly enforce the Lock Logic
  if (user.cardStatus === 'PENDING' || user.cardStatus === 'REJECTED') {
    return {
      status: 'LOCKED' as const,
      message: user.cardStatus === 'PENDING' 
        ? 'Card application under review' 
        : 'Application rejected',
      cardStatus: user.cardStatus,
    };
  }

  // Return full data for ACTIVE users
  return {
    status: 'UNLOCKED' as const,
    data: {
      user: {
        email: user.email,
        walletBalance: user.walletBalance,
        cardStatus: user.cardStatus,
      },
      missions: user.missions,
      vouchers: user.vouchers,
    },
  };
}
