import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { query, selectedPage = 1, perPage = 15, expArtistResults = 0, expTitleResults = 0 } = req.query;

    let searchByTitleResults = [];
    let totalTitleResults = Number(expTitleResults);
    let searchByArtistResults = [];
    let totalArtistResults = Number(expArtistResults);

    // Ensure that the selectedPage won't error when requested
    if ((selectedPage as number) * (perPage as number) <= (totalTitleResults as number) || totalTitleResults === 0) {
      // Make a GET request to the Discogs API search endpoint
      const response = await axios.get('https://api.discogs.com/database/search', {
        params: {
          title: query,
          format: 'album',
          type: 'master',
          per_page: perPage,
          page: selectedPage,
          key: true,
        },
        headers: {
          Authorization: `Discogs key=${process.env.DISCOGS_API_KEY}, secret=${process.env.DISCOGS_API_SECRET}`,
        },
      });

      searchByTitleResults = [...response.data.results];
      totalTitleResults = response.data.pagination.items;
    }

    // Ensure that the selectedPage won't error when requested
    if ((selectedPage as number) * (perPage as number) <= (totalArtistResults as number) || totalArtistResults === 0) {
      // Make a GET request to the Discogs API search endpoint
      const response = await axios.get('https://api.discogs.com/database/search', {
        params: {
          artist: query,
          format: 'album',
          type: 'master',
          per_page: perPage,
          page: selectedPage,
          key: true,
        },
        headers: {
          Authorization: `Discogs key=${process.env.DISCOGS_API_KEY}, secret=${process.env.DISCOGS_API_SECRET}`,
        },
      });

      searchByArtistResults = [...response.data.results];
      totalArtistResults = response.data.pagination.items;
    }

    const combinedResults = [...searchByTitleResults, ...searchByArtistResults];

    const resultIds = combinedResults.map(result => ({
      discogsMasterId: result.id,
    }));

    let formattedResults = [];
    for (let id of resultIds) {
      // Update code here
      const releaseDetails = await axios.get(`https://api.discogs.com/masters/${id.discogsMasterId}`, {
        headers: {
          Authorization: `Discogs key=${process.env.DISCOGS_API_KEY}, secret=${process.env.DISCOGS_API_SECRET}`,
        },
      });

      const formattedResult = {
        discogsMasterId: id,
        title: releaseDetails.data.title,
        artist: releaseDetails.data.artists[0].name,
        imageUrl: releaseDetails.data.images[0].uri,
      };

      formattedResults.push(formattedResult);
    }

    // First time, need to return total expected items for each query
    const response = {
      expArtistResults: totalArtistResults,
      expTitleResults: totalTitleResults,
      formattedResults,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing the request.' });
  }
}
