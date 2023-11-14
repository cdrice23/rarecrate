import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function removeAtHandles(): Promise<void> {
  const socialLinks = await prisma.socialLink.findMany();

  for (const socialLink of socialLinks) {
    const updatedUsername = socialLink.username.replace('@', '');

    // Update the SocialLink record in the database
    await prisma.socialLink.update({
      where: {
        id: socialLink.id,
      },
      data: {
        username: updatedUsername,
      },
    });
  }
}
