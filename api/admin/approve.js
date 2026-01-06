
import prisma from '../_utils/prisma';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, status } = request.body; // status: 'ACTIVE' or 'REJECTED'

  try {
    const updatedUser = await prisma.user.update({
      where: { firebaseUid: userId },
      data: { cardStatus: status },
    });

    return response.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}
