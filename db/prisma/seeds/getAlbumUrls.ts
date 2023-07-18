// WIP

// import axios from 'axios';
// import dotenv from 'dotenv';
// import { PrismaClient } from '@prisma/client';

// dotenv.config();

// const prisma = new PrismaClient();

// export async function main() {
//   // Create Crate Albums
//   const albums = await prisma.album.findMany();

//   for (let album of albums) {
//     // Update the album in the database with the new imageUrl
//     if (!album.imageUrl) {
//       const imageUrl = await getCoverImage(album.title, album.artist, album.releaseYear, album.label);
//       await prisma.album.update({
//         where: { id: album.id },
//         data: { imageUrl },
//       });
//     }
//   }

//   console.log('Album artwork URLs updated. End of script.');
// }

// async function getCoverImage(title: string, artist: string, releaseYear: number, label: string) {
//   try {
//     // search for the album and return only US releases
//     const searchResponse = await axios.get('https://api.discogs.com/database/search', {
//       params: {
//         artist: artist,
//         title: title,
//         type: 'release',
//         key: true,
//         country: 'US',
//         year: releaseYear,
//         label: label
//       },
//       headers: {
//         Authorization: `Discogs key=${process.env.DISCOGS_API_KEY}, secret=${process.env.DISCOGS_API_SECRET}`,
//       },
//     });

//     // CDs and Albums only
//     const filterResults = searchResponse.data.results.filter((release: any) => (release.format.includes('Album')))

//     // Get first cover image
//     const imageUrl = filterResults[0].cover_image ? filterResults[0].cover_image : null;

//     return imageUrl;
//   } catch (error) {
//     console.error(error);
//     return undefined
//   }
// }
