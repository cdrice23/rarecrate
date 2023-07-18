import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { artist, title, masterId } = req.query;

  try {
    // search for the album and return only US releases
    const searchResponse = await axios.get('https://api.discogs.com/database/search', {
      params: {
        artist: artist,
        title: title,
        type: 'release',
        format: 'album',
        key: true,
        country: 'US',
      },
      headers: {
        Authorization: `Discogs key=${process.env.DISCOGS_API_KEY}, secret=${process.env.DISCOGS_API_SECRET}`,
      },
    });
    // filter by masters w/ cover images
    const onlyMasters = searchResponse.data.results.filter(
      (release: any) => release.master_id == masterId && release.cover_image,
    );

    // // Get first cover image
    const imageUrl = onlyMasters[0].cover_image;

    res.status(200).json(imageUrl);
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while fetching the cover image');
  }
}
