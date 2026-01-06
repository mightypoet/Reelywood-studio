
import prisma from '../_utils/prisma';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const { missionId, userIds } = request.body; // userIds: Array of firebaseUids

  if (!missionId || !userIds || !Array.isArray(userIds)) {
    return response.status(400).json({ error: 'Invalid parameters' });
  }

  try {
    const updatedMission = await prisma.mission.update({
      where: { id: missionId },
      data: {
        assignedUsers: {
          connect: userIds.map(uid => ({ firebaseUid: uid })),
        },
      },
    });

    return response.status(200).json({ success: true, mission: updatedMission });
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}
