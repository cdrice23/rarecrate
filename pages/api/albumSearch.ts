import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { query } = req.query;

    // Make a GET request to the Discogs API search endpoint
    const searchByTitle = await axios.get('https://api.discogs.com/database/search', {
      params: {
        title: query,
        format: 'album',
        type: 'master',
        per_page: 15,
        key: true,
      },
      headers: {
        Authorization: `Discogs key=${process.env.DISCOGS_API_KEY}, secret=${process.env.DISCOGS_API_SECRET}`,
      },
    });

    const searchByArtist = await axios.get('https://api.discogs.com/database/search', {
      params: {
        artist: query,
        format: 'album',
        type: 'master',
        per_page: 15,
        key: true,
      },
      headers: {
        Authorization: `Discogs key=${process.env.DISCOGS_API_KEY}, secret=${process.env.DISCOGS_API_SECRET}`,
      },
    });

    const combinedResults = [...searchByTitle.data.results, ...searchByArtist.data.results];

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

    res.status(200).json(formattedResults);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing the request.' });
  }
}
