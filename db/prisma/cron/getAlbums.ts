import axios from 'axios';
import { recordLabelSearchArray } from '../../../core/constants/seedHelpers/recordLabels';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const user_agents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 11; SM-G975U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Mobile Safari/537.36',
  'Mozilla/5.0 (Linux; Android 11; SM-G975U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Mobile Safari/537.36 EdgA/46.1.2.5140',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36 Edg/92.0.902.78',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36 OPR/77.0.4054.277',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36 Vivaldi/4.1.2369.11',
];

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
  let lastProcessedLabel = lastRun ? lastRun.runs[0]?.lastProcessedLabel : 'Vandelay Industries';

  // Step 2 & 3: Create a new CronRun record and set targetEndTime
  const startAt = new Date();
  const endAt = new Date(startAt.getTime() + 5 * 60 * 60 * 1000); // End 5 Hours from now
  // const endAt = new Date(startAt.getTime() + 30000); // end in 30 seconds
  console.log(startAt.toLocaleString());
  console.log(endAt.toLocaleString());

  const newCronRun = await prisma.cronRun.create({
    data: {
      createdAt: startAt,
      cronJob: {
        connect: {
          id: 1,
        },
      },
    },
  });

  console.log('New CronRun started');

  // Step 4 & 5: Check current time and decide whether to proceed or not
  // Truncate the array of record labels to cycle through for the run based on the index of the last processed label
  const startLabelIndex = recordLabelSearchArray.findIndex(label => label.name === lastProcessedLabel);
  const labelArray: any =
    startLabelIndex === -1 ? recordLabelSearchArray : recordLabelSearchArray.slice(startLabelIndex + 1);
  let i = 0; // initialize index
  while (new Date().getTime() <= endAt.getTime() && i < labelArray.length) {
    const currentLabel: string = labelArray[i].name;
    console.log(`Now evaluating: ${currentLabel}`);

    // Step 6 & 7: Create an array labelSearchData that has all masters from the label search
    const labelSearchData = await searchDiscogsMasterByLabel(1, 1200, currentLabel);

    console.log(`Total records to process: ${labelSearchData.length}`);
    let count = 0;
    let previousWholePercent = 0;
    // Step 8: loop through each searchResult
    for (let result of labelSearchData) {
      // Check if master already exists in Albums
      const existingAlbum = await prisma.album.findUnique({
        where: {
          discogsMasterId: result.master_id,
        },
      });

      // Create the Album record if not existing
      if (!existingAlbum) {
        // Step 9: Hit master_id endpoint to get remaining album details
        const masterDetails = await getMasterDetails(result.master_id);

        // If no artist or title from getMasterDetails, skip record
        if (masterDetails.artist && masterDetails.title) {
          // Step 10: create dbAlbum from frankenstein details + result
          const dbAlbum = {
            discogsMasterId: result.master_id,
            title: masterDetails.title,
            artist: masterDetails.artist,
            label: result.label[0],
            releaseYear: result.year ?? null,
            genres: result.genre,
            subgenres: result.style,
            tracklist: masterDetails.tracklist.map((track: any, i: number) => ({
              order: i + 1,
              name: track.title,
            })),
            imageUrl: result.cover_image,
          };

          // Step 11: Create/connect genres + subgenres and create albums
          // Create or connect the Genre records
          const genres = result.genre;
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
          const styles = result.style;
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

          await prisma.album.create({
            data: {
              discogsMasterId: dbAlbum.discogsMasterId,
              title: dbAlbum.title,
              artist: dbAlbum.artist,
              label: dbAlbum.label,
              releaseYear: dbAlbum.releaseYear ? parseInt(dbAlbum.releaseYear) : null,
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
      }

      // Iterate count and calculate percentage of total releases processed
      count++;
      const percentageComplete = Math.floor((count / labelSearchData.length) * 100);

      if (percentageComplete > previousWholePercent) {
        console.log(`${percentageComplete}% completed`);
        previousWholePercent = percentageComplete;
      }
    }

    // Step 12: Set lastProcessedLabel as currentLabel
    lastProcessedLabel = currentLabel;

    // Increment index
    i++;
    // Cooldown for 1s to reduce CPU usage
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1200);
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
  const response = await makeDelayedRequest(apiUrl, 1200);
  // console.log(`masterId: ${masterId}`)
  // console.log(response.data.artists)

  return {
    title: response.data.title ?? null,
    artist: response.data.artists ? response.data.artists[0].name : null,
    tracklist: response.data.tracklist,
  };
}

async function makeDelayedRequest(url: string, delay: number): Promise<any> {
  return new Promise(resolve => {
    setTimeout(async () => {
      resolve(
        await axios.get(url, {
          headers: {
            Authorization: `Discogs key=${process.env.DISCOGS_API_KEY}, secret=${process.env.DISCOGS_API_SECRET}`,
            'User-Agent': user_agents[Math.floor(Math.random() * user_agents.length)],
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
    const queryRes = await makeDelayedRequest(
      `https://api.discogs.com/database/search?format=album&page=${page}&per_page=100&type=master&label=${label}`,
      1200,
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
