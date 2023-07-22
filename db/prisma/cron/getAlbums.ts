import axios from 'axios';
import { recordLabelSearchArray } from '../../../core/constants/seedHelpers/recordLabels';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const initCronRun = async () => {
  const currentScript = 'getAlbumsFromRecordLabelString';
  // Step 1: Check the CronRuns model for the last run
  const lastRun: any = await prisma.cronJob.findFirst({
    where: {
      scriptName: currentScript,
    },
    include: {
      runs: {
        orderBy: {
          completedAt: 'desc',
        },
        take: 1,
      },
    },
  });

  // Get the last Label that was used in the last cron job run
  let lastProcessedLabel = lastRun[0]?.lastProcessedLabel || null;

  // Step 2 & 3: Create a new CronRun record and set targetEndTime
  const startAt = new Date();
  const endAt = new Date(startAt.getTime() + 3 * 60 * 60 * 1000); // 3 Hours from now

  const newCronRun = await prisma.cronRun.create({
    data: {
      createdAt: startAt,
      cronJob: {
        connect: {
          id:
            (
              await prisma.cronJob.findUnique({
                where: {
                  scriptName: 'getAlbums.ts',
                },
              })
            )?.id || undefined,
        },
      },
    },
  });

  console.log('New CronRun started');

  // Step 4 & 5: Check current time and decide whether to proceed or not
  // Truncate the array of record labels to cycle through for the run based on the index of the last processed label
  const startLabelIndex = recordLabelSearchArray.findIndex(label => label.name === lastProcessedLabel);
  const labelArray: any =
    startLabelIndex === -1 ? recordLabelSearchArray : recordLabelSearchArray.slice(startLabelIndex);
  let i = 0; // initialize index
  while (new Date().getTime() <= endAt.getTime() && i < labelArray.length) {
    const currentLabel: string = labelArray[i].name;

    // Step 6 & 7: Create an array labelSearchData that has all masters from the label search
    const labelSearchData = await searchDiscogsMasterByLabel(1, 1000, currentLabel);

    // Step 8: loop through each searchResult
    for (let result of labelSearchData) {
      // Step 9: Hit master_id endpoint to get remaining album details
      const masterDetails = await getMasterDetails(result.master_id);

      // Step 10: create dbAlbum from frankenstein details + result
      const dbAlbum = {
        discogsMasterId: result.master_id,
        title: masterDetails.title,
        artist: masterDetails.artist[0],
        label: result.labels[0],
        releaseYear: result.year,
        genres: result.genre,
        subgenres: result.style,
        tracklist: masterDetails.tracklist.map((track: any, i: number) => ({
          order: i + 1,
          name: track.title,
        })),
        imageUrl: result.images[0].uri,
      };

      // Step 11: Create/connect genres + subgenres and create albums
      // Create or connect the Genre records
      const genres = result.genres;
      const genrePromises = genres.map(async (genre: string) => {
        const existingGenre = await prisma.genre.findFirst({
          where: { name: genre },
        });

        if (existingGenre) {
          return { ...existingGenre };
        } else {
          return prisma.genre.create({
            data: { name: genre },
          });
        }
      });
      const createdGenres = await Promise.all(genrePromises);

      // Create or connect the Subgenre records
      const styles = result.subgenres;
      const subgenrePromises = styles.map(async (subgenre: string) => {
        const existingSubgenre = await prisma.subgenre.findFirst({
          where: { name: subgenre },
        });

        if (existingSubgenre) {
          return { ...existingSubgenre };
        } else {
          const parentGenreName = genres[0];
          const parentGenre = createdGenres.find(genre => genre.name === parentGenreName);

          return prisma.subgenre.create({
            data: {
              name: subgenre,
              parentGenre: { connect: { id: parentGenre.id } },
            },
          });
        }
      });
      const createdSubgenres = await Promise.all(subgenrePromises);

      // Create the Album record
      await prisma.album.create({
        data: {
          discogsMasterId: dbAlbum.discogsMasterId,
          title: dbAlbum.title,
          artist: dbAlbum.artist,
          label: dbAlbum.label,
          releaseYear: parseInt(dbAlbum.releaseYear),
          genres: { connect: createdGenres.map(genre => ({ id: genre.id })) },
          subgenres: { connect: createdSubgenres.map(subgenre => ({ id: subgenre.id })) },
          // imageUrl: masterRelease.imageUrl,
          imageUrl: dbAlbum.imageUrl,
          tracklist: {
            create: dbAlbum.tracklist.map((item: any) => ({
              title: item.name,
              order: item.order,
            })),
          },
        },
      });
    }

    // Step 12: Set lastProcessedLabel as currentLabel
    lastProcessedLabel = currentLabel;

    // Increment index
    i++;
    // Cooldown for 1s to reduce CPU usage
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000);
  }

  // Step 13: Update the CronRun with endTime and lastProcessedLabel
  console.log('Exceeded the target end time. Exiting the script...');
  await prisma.cronRun.update({
    where: { id: newCronRun.id },
    data: { completedAt: new Date(), lastProcessedLabel },
  });

  console.log('CronRun Completed Successfully');
};

initCronRun()
  .catch(e => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// Helpers
async function getMasterDetails(masterId: number) {
  const apiUrl = `https://api.discogs.com/masters/${masterId}`;
  const response = await makeDelayedRequest(apiUrl, 1000);

  return {
    title: response.title,
    artist: response.artists[0],
    tracklist: response.tracklist,
  };
}

async function makeDelayedRequest(url: string, delay: number): Promise<any> {
  return new Promise(resolve => {
    setTimeout(async () => {
      resolve(
        await axios.get(url, {
          headers: {
            Authorization: `Discogs key=${process.env.DISCOGS_API_KEY}, secret=${process.env.DISCOGS_API_SECRET}`,
          },
        }),
      );
    }, delay);
  });
}

async function searchDiscogsMasterByLabel(
  page: number,
  delay: number,
  label: string,
  checkCount: boolean = false,
): Promise<any[]> {
  // On initial search, if limited by Discogs 10k result limit, truncate search to only include US masters
  let truncateSearch = checkCount;
  if (page === 1) {
    const queryRes = await axios.get(
      `https://api.discogs.com/database/search?format=album&page=${page}&per_page=100&type=master&label=${label}`,
      {
        headers: {
          Authorization: `Discogs key=${process.env.DISCOGS_API_KEY}, secret=${process.env.DISCOGS_API_SECRET}`,
        },
      },
    );
    const totalCount = queryRes.data.pagination.items;
    totalCount > 10000 ? (truncateSearch = true) : (truncateSearch = false);
  }
  // Step 6b: Build the url endpoint based on length of results
  const apiUrl = truncateSearch
    ? `https://api.discogs.com/database/search?format=album&page=${page}&per_page=100&type=master&label=${label}&country=US`
    : `https://api.discogs.com/database/search?format=album&page=${page}&per_page=100&type=master&label=${label}`;

  const response = await makeDelayedRequest(apiUrl, delay);

  const nextPageUrl = response.data.pagination.urls.next;
  const nextPageNumber = response.data.pagination.page + 1;
  const totalPages = response.data.pagination.pages;

  const nextPageResults = response.data.results;

  // Step 7: Loop through the pages until all results are returned
  if (nextPageNumber <= totalPages && nextPageUrl !== null) {
    const remainingResults = await searchDiscogsMasterByLabel(nextPageNumber, delay, label, truncateSearch);
    return [...nextPageResults, ...remainingResults];
  } else {
    return nextPageResults;
  }
}
