import axios from 'axios';
import dotenv from 'dotenv';
import { NextApiRequest, NextApiResponse } from 'next';
import { calculateSimilarity } from '../../core/helpers/discogs';

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

    // Extract and return the master release where the artist and title match
    const keyReleaseData = processDiscogsSearch(searchResponse.data, title);
    // console.log(searchResponse)
    const releaseResponse = await axios.get(keyReleaseData.release.master_url, {
      headers: {
        Authorization: `Discogs key=${process.env.DISCOGS_API_KEY}, secret=${process.env.DISCOGS_API_SECRET}`,
      },
    });

    // Extract and return the artist and name based on key release
    const releaseDetailData = fetchReleaseDetails(releaseResponse.data);

    // console.log(keyReleaseData.release)
    // Build the album object
    const album = {
      discogsMasterId: keyReleaseData.release.master_id,
      title: releaseDetailData.title,
      artist: releaseDetailData.artist,
      label: keyReleaseData.label,
      releaseYear: releaseDetailData.year,
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
function processDiscogsSearch(data: any, searchTitle: any) {
  // Filter the response to include only releases with the format "album"
  const albumReleases = data.results.filter(
    (release: any) => release.format.includes('Album') && release.title && release.year && release.master_id,
  );
  // Sort the releases by their similarity to the search prompts, then by release order
  albumReleases.sort((a: any, b: any) => {
    const similarityScoreTitleA = calculateSimilarity(searchTitle, a.title);
    const similarityScoreTitleB = calculateSimilarity(searchTitle, b.title);

    if (similarityScoreTitleA === similarityScoreTitleB) {
      return a.year - b.year;
    } else {
      return similarityScoreTitleB - similarityScoreTitleA;
    }
  });

  // // Get most similar releases to search
  const highestSimilarityReleases = albumReleases.filter((release: any) => {
    const similarityScoreTitle = calculateSimilarity(searchTitle, release.title);
    return similarityScoreTitle === calculateSimilarity(searchTitle, albumReleases[0].title);
  });

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

  // Count the frequency of each master
  const masterCounts: { [masterId: number]: number } = {};
  albumReleases
    .map((album: any) => album.master_id)
    .forEach((masterId: number) => {
      if (masterCounts[masterId]) {
        masterCounts[masterId]++;
      } else {
        masterCounts[masterId] = 1;
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

  // Find the master with the highest frequency
  let mostFrequentMaster = '';
  let highestMasterFrequency = 0;
  for (const masterId in masterCounts) {
    if (masterCounts[masterId] > highestMasterFrequency) {
      mostFrequentMaster = masterId;
      highestMasterFrequency = masterCounts[masterId];
    }
  }

  // // Find the earliest release
  // highestSimilarityReleases.sort((a: any, b: any) => a.year - b.year);
  const earliestRelease = albumReleases.filter((album: any) => album.master_id === parseInt(mostFrequentMaster))[0];
  // console.log(earliestRelease)

  // Filter the releases with the earliest release date and most frequent label
  const filteredReleases = albumReleases.filter((release: any) => release.year === earliestRelease.year);
  // console.log(filteredReleases[0])

  // Return the first release from the filtered releases
  return { release: filteredReleases[0], label: mostFrequentLabel };
}

// Get exact artist and album title helper
function fetchReleaseDetails(data: any) {
  const artist = data.artists[0].name;
  const title = data.title;
  const tracklist = data.tracklist;
  const year = data.year;

  return { artist, title, tracklist, year };
}
