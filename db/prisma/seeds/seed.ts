import { main as bigUserSeed } from './bigUserSeed';
import { main as resetDb } from './resetDb';
import { main as bigCrateSeed } from './bigCrateSeed';
import { main as albumSeed } from './albumSeed';
import { main as connectAlbumSeed } from './connectAlbumSeed';
import { main as getAlbumImageUrls } from './getAlbumImageUrls';
import { fixTagDuplicates } from '../backfill/fixTagDuplicates';
import { removeAtHandles } from '../backfill/removeAtHandles';
import { deleteCrateAlbums } from '../backfill/deleteCrateAlbums';
import { addNotificationSettings } from '../backfill/addNotificationSettings';
import { generateProfileDeleteTest } from '../backfill/generateProfileDeleteTest';
import { randomizeCrateAndFollowDates } from '../backfill/randomizeCrateAndFollowDates';
import { generateNotifications } from '../backfill/generateNotifications';
import { deleteAllNotifications } from '../backfill/deleteAllNotifications';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // await bigUserSeed();
  // await bigCrateSeed();
  // await albumSeed();
  // await connectAlbumSeed();
  // await getAlbumImageUrls();
  // await resetDb();
  // await fixTagDuplicates();
  // await removeAtHandles();
  // await deleteCrateAlbums();
  // await addNotificationSettings();
  // await generateProfileDeleteTest();
  // await randomizeCrateAndFollowDates();
  await generateNotifications();
  // await deleteAllNotifications();
}

main()
  .catch(e => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
