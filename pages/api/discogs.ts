import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { artist, title } = req.query;

    // Make a GET request to the Discogs API search endpoint
    const searchResponse = await axios.get('https://api.discogs.com/database/search', {
      params: {
        artist: artist,
        title: title,
        format: 'album',
        key: true,
      },
      headers: {
        Authorization: `Discogs key=${process.env.DISCOGS_API_KEY}, secret=${process.env.DISCOGS_API_SECRET}`,
      },
    });

    const releaseResponse = await axios.get('https://api.discogs.com/masters/8471', {
      headers: {
        Authorization: `Discogs key=${process.env.DISCOGS_API_KEY}, secret=${process.env.DISCOGS_API_SECRET}`,
      },
    });

    // Extract and return the master release where the artist and title match
    const keyReleaseData = processDiscogsSearch(searchResponse.data);

    // Extract and return the artist and name based on key release
    const releaseDetailData = fetchReleaseDetails(releaseResponse.data);

    // Build the album object
    const album = {
      discogsMasterId: keyReleaseData.release.master_id,
      title: releaseDetailData.title,
      artist: releaseDetailData.artist,
      label: keyReleaseData.label,
      releaseYear: keyReleaseData.release.year,
      genres: keyReleaseData.release.genre,
      subgenres: keyReleaseData.release.style,
      tracklist: releaseDetailData.tracklist.map((track: any, i: number) => ({
        order: i + 1,
        name: track.title,
      })),
    };

    res.status(200).json(album);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing the request.' });
  }
}

// Extracts most of the details minus Name and Artist from Search
function processDiscogsSearch(data: any) {
  // Filter the response to include only releases with the format "album"
  const albumReleases = data.results.filter((release: any) => release.format.includes('Album'));

  // Sort the releases by their respective release years in ascending order
  albumReleases.sort((a: any, b: any) => a.year - b.year);

  // Find the earliest release
  const earliestRelease = albumReleases[0];

  // Flatten the array of labels
  const flattenedLabels = albumReleases.flatMap((release: any) => release.label);

  // Count the frequency of each label in all responses
  const labelCounts: { [label: string]: number } = {};
  flattenedLabels.forEach((label: string) => {
    if (labelCounts[label]) {
      labelCounts[label]++;
    } else {
      labelCounts[label] = 1;
    }
  });

  // Find the label with the highest frequency
  let mostFrequentLabel = '';
  let highestFrequency = 0;
  for (const label in labelCounts) {
    if (labelCounts[label] > highestFrequency) {
      mostFrequentLabel = label;
      highestFrequency = labelCounts[label];
    }
  }

  // Filter the releases with the earliest release date and most frequent label
  const filteredReleases = albumReleases.filter(
    (release: any) => release.year === earliestRelease.year && release.label.includes(mostFrequentLabel),
  );

  // Return the first release from the filtered releases
  return { release: filteredReleases[0], label: mostFrequentLabel };
}

// Get exact artist and album title helper
function fetchReleaseDetails(data: any) {
  const artist = data.artists[0].name;
  const title = data.title;
  const tracklist = data.tracklist;

  return { artist, title, tracklist };
}
