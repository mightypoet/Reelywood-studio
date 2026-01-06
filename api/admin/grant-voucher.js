
import prisma from '../_utils/prisma';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const { voucherId, userIds } = request.body;

  try {
    const updatedVoucher = await prisma.voucher.update({
      where: { id: voucherId },
      data: {
        allowedUsers: {
          connect: userIds.map(uid => ({ firebaseUid: uid })),
        },
      },
    });

    return response.status(200).json({ success: true, voucher: updatedVoucher });
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}
