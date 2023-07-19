// WIP

import axios from 'axios';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();

export async function main() {
  // Create Crate Albums
  const albums = await prisma.album.findMany();

  for (let album of albums) {
    // Update the album in the database with the new imageUrl
    if (!album.imageUrl) {
      const imageUrl = await getCoverImage(album.discogsMasterId);
      await prisma.album.update({
        where: { id: album.id },
        data: { imageUrl },
      });
    }
  }

  console.log('Album artwork URLs updated. End of script.');
}

async function getCoverImage(masterId: number) {
  try {
    // search for the album and return only US releases
    const searchResponse = await axios.get(`https://api.discogs.com/masters/${masterId}`, {
      headers: {
        Authorization: `Discogs key=${process.env.DISCOGS_API_KEY}, secret=${process.env.DISCOGS_API_SECRET}`,
      },
    });

    // Get first cover image
    const imageUrl = searchResponse.data.images[0].uri ? searchResponse.data.images[0].uri : null;

    return imageUrl;
  } catch (error) {
    console.error(error);
    return undefined;
  }
}
