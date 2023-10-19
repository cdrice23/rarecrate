import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function updateLabelsAndTagsToLower(): Promise<void> {
  // Fetch all tags
  const tags = await prisma.tag.findMany();
  // Update each tag name to lowercase
  for (let tag of tags) {
    await prisma.tag.update({
      where: { id: tag.id },
      data: { name: tag.name.toLowerCase() },
    });
  }

  // Fetch all labels
  const labels = await prisma.label.findMany();
  // Update each label name to lowercase
  for (let label of labels) {
    await prisma.label.update({
      where: { id: label.id },
      data: { name: label.name.toLowerCase() },
    });
  }
}
