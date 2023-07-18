import { albumSeedArray as albums } from '../../../core/constants/seedHelpers/albums';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const fetchMasterRelease = async (artist: string, title: string) => {
  const response = await axios.get('http://localhost:3000/api/discogs', {
    params: {
      artist: artist,
      title: title,
    },
  });

  return response.data;
};

export async function main() {
  for (let album of albums) {
    const { artist, title } = album;

    // Fetch the master release from the discogs.ts API route
    const masterRelease = await fetchMasterRelease(artist, title);

    // Create or connect the Genre records
    const genres = masterRelease.genres;
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
    const styles = masterRelease.subgenres;
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
        discogsMasterId: masterRelease.discogsMasterId,
        title: masterRelease.title,
        artist: masterRelease.artist,
        label: masterRelease.label,
        releaseYear: parseInt(masterRelease.releaseYear),
        genres: { connect: createdGenres.map(genre => ({ id: genre.id })) },
        subgenres: { connect: createdSubgenres.map(subgenre => ({ id: subgenre.id })) },
        // imageUrl: masterRelease.imageUrl,
        imageUrl: '',
        tracklist: {
          create: masterRelease.tracklist.map((item: any) => ({
            title: item.name,
            order: item.order,
          })),
        },
      },
    });
  }
}
