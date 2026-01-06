
import prisma from '../_utils/prisma';

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = request.query;

  if (!userId) {
    return response.status(400).json({ error: 'User ID is required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { firebaseUid: userId },
      include: {
        missions: true,
        vouchers: true,
      },
    });

    if (!user) {
      // Auto-create user record if they exist in Firebase but not in Postgres yet
      // This handles first-time logins smoothly
      return response.status(200).json({ 
        status: 'LOCKED', 
        message: 'Identity record initializing...',
        cardStatus: 'PENDING'
      });
    }

    // 🔒 THE LOCK LOGIC: Explicitly filter data based on status
    if (user.cardStatus !== 'ACTIVE') {
      return response.status(200).json({
        status: 'LOCKED',
        cardStatus: user.cardStatus,
        message: user.cardStatus === 'REJECTED' 
          ? "Application rejected by admin." 
          : "Your Creator Card is under review."
        // We do NOT return user.missions or user.walletBalance here
      });
    }

    // 🔓 THE UNLOCK: User is ACTIVE, return full operational data
    return response.status(200).json({
      status: 'UNLOCKED',
      cardStatus: 'ACTIVE',
      walletBalance: user.walletBalance,
      missions: user.missions,
      vouchers: user.vouchers,
      user: {
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
}
