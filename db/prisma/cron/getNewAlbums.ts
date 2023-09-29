import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

const maxAttempts = 5;
const backoffInterval = 60000; // 1 minute

const retryWithBackoff = async (fn, attempts = 0) => {
  try {
    return await fn();
  } catch (error) {
    if (attempts >= maxAttempts) {
      console.log(`Max attempts reached. Exiting.`);
      throw error;
    }

    console.log(`Attempt ${attempts + 1} failed. Retrying in ${backoffInterval / 1000}s...`);
    await new Promise(resolve => setTimeout(resolve, backoffInterval * (attempts + 1)));
    return retryWithBackoff(fn, attempts + 1);
  }
};

const initCronRun = async () => {
  // Step 1: Create a new CronRun record and set targetEndTime
  const startAt = new Date();
  const endAt = new Date(startAt.getTime() + 5 * 60 * 60 * 1000); // End 5 Hours from now

  const newCronRun = await prisma.cronRun.create({
    data: {
      createdAt: startAt,
      cronJob: {
        connect: {
          // CronJob: getNewRecordMasters
          id: 2,
        },
      },
    },
  });

  console.log('New CronRun started');
  // Step 2: Grab the AllMusic endpoint at the most recent new release date
  // let dayOfWeek = startAt.getDay();
  // let daysFromFriday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  // let lastNewMusicFriday = new Date(startAt.getTime() - daysFromFriday * 24 * 60 * 60 * 1000);
  let year = startAt.getFullYear();
  let month = String(startAt.getMonth() + 1).padStart(2, '0');
  let date = String(startAt.getDate()).padStart(2, '0');
  const currentReleaseDate = `${year}${month}${date}`;
  console.log(`Now evaluating: ${currentReleaseDate}`);

  let albumsWithIssues = [];
  let newReleaseData: { artist: string; title: string }[] = [];

  // Step 4: Extract array of releases from HTML table
  try {
    const response = await axios.get(`https://www.allmusic.com/newreleases/all/${currentReleaseDate}`);

    const $ = cheerio.load(response.data);
    const table = $('.nr-table');
    const rows = table.find('tr');

    rows.each((index, row) => {
      if (index === 0) return; // skip the header
      if (index === rows.length) return; //skip the empty row

      const artist = $(row).find('td').first().text().trim();
      const title = $(row).find('td').eq(1).text().trim();

      newReleaseData.push({ artist, title });
    });
  } catch (err) {
    console.log(err);
  }

  // Track progress
  console.log(`Total records to process: ${newReleaseData.length}`);
  let count = 0;
  let previousWholePercent = 0;

  // Remove dupes from newReleaseData
  const uniqueNewReleaseData = newReleaseData.filter(
    (release, index, self) => index === self.findIndex(r => r.artist === release.artist && r.title === release.title),
  );

  // Step 3: Check current time and decide whether to proceed or not
  while (new Date().getTime() <= endAt.getTime() && count < uniqueNewReleaseData.length) {
    // Step 4: For each item in Step 4 array, search discogs API endpoint for each album and get master data; if it doesn't exist, create Album in db
    for (let result of uniqueNewReleaseData) {
      // Clean up the artist input in case there are multiple artists
      const position = result.artist.indexOf(' / ');
      let singleArtist = '';
      if (position !== -1) {
        singleArtist = result.artist.substring(0, position);
      } else {
        singleArtist = result.artist;
      }

      // Search for result on discogs API
      const discogsMaster = await searchDiscogsMasterByReleaseData(singleArtist, result.title);

      if (discogsMaster.length > 0) {
        // Check if master already exists in Albums
        const existingAlbum = await prisma.album.findUnique({
          where: {
            discogsMasterId: discogsMaster[0].master_id,
          },
        });

        // Create the Album record if not existing
        if (!existingAlbum) {
          // Hit master_id endpoint to get remaining album details
          const masterDetails = await getMasterDetails(discogsMaster[0].master_id);

          // If no artist or title from getMasterDetails, skip record and log issueAlbum
          if (!masterDetails.artist || !masterDetails.title) {
            albumsWithIssues.push({ ...result, issue: 'No artist name or title on master detail search' });
          }

          if (masterDetails.artist && masterDetails.title) {
            // Create dbAlbum from frankenstein details + result
            const dbAlbum = {
              discogsMasterId: discogsMaster[0].master_id,
              title: masterDetails.title,
              artist: masterDetails.artist,
              label: discogsMaster[0].label[0],
              releaseYear: discogsMaster[0].year ?? null,
              genres: discogsMaster[0].genre,
              subgenres: discogsMaster[0].style,
              tracklist: masterDetails.tracklist.map((track: any, i: number) => ({
                order: i + 1,
                name: track.title,
              })),
              imageUrl: discogsMaster[0].cover_image,
            };

            // Create or connect the Genre records
            const genres = discogsMaster[0].genre;
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
            const styles = discogsMaster[0].style;
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
      } else {
        albumsWithIssues.push({ ...result, issue: 'No discogs record' });
      }

      // Iterate count and calculate percentage of total releases processed
      count++;
      const percentageComplete = Math.floor((count / uniqueNewReleaseData.length) * 100);

      if (percentageComplete > previousWholePercent) {
        console.log(`${percentageComplete}% completed`);
        previousWholePercent = percentageComplete;
      }
    }

    // Cooldown for 1s to reduce CPU usage
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1200);
  }

  // Log issue albums
  console.log(
    `Total albums with issues: ${albumsWithIssues.length}. Release to created albums conversion: ${
      (uniqueNewReleaseData.length - albumsWithIssues.length) / uniqueNewReleaseData.length
    }`,
  );
  console.log('Albums with Issues', albumsWithIssues);

  // Step 5: Update the CronRun with endTime and lastProcessedLabel
  if (new Date().getTime() <= endAt.getTime()) {
    console.log('Exceeded the target end time. Exiting the script...');
  } else {
    console.log('Completed processing all new releases from date.');
  }

  await prisma.cronRun.update({
    where: { id: newCronRun.id },
    data: { completedAt: new Date(), lastProcessedItem: currentReleaseDate },
  });

  console.log('CronRun Completed Successfully');
};

retryWithBackoff(initCronRun)
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
            // 'User-Agent': user_agents[Math.floor(Math.random() * user_agents.length)],
            'User-Agent': 'RareCrate/1.0 (+https://github.com/cdrice23;)',
          },
        }),
      );
    }, delay);
  });
}

async function searchDiscogsMasterByReleaseData(artist: string, title: string): Promise<any[]> {
  const url = `https://api.discogs.com/database/search?format=album&key=true&per_page=100&type=master&title=${title}&artist=${artist}`;
  const searchRes = await makeDelayedRequest(url, 1200);

  // Step 6b: Build the url endpoint based on length of results
  return searchRes.data.results;
}
