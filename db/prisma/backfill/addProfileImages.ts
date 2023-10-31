import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import axios from 'axios';

const prisma = new PrismaClient();

export async function addProfileImages(): Promise<void> {
  const profiles = await prisma.profile.findMany();

  let picId = 10;
  for (const profile of profiles) {
    let validImageReturned = false;
    let attempts = 0;

    while (!validImageReturned && attempts < 5) {
      // Generate random lorem picsum square images with 320 px size
      const imageUrl = `https://picsum.photos/id/${picId}/320`;

      try {
        const response = await axios.get(imageUrl, { responseType: 'stream' });
        console.log(response ? `got a response for picId ${picId}` : 'there was a problem');

        const imagePath = `/tmp/${profile.id}.jpg`;
        const writer = fs.createWriteStream(imagePath);

        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });

        const data = await fs.promises.readFile(imagePath);
        const base64Data = data.toString('base64');

        try {
          const s3Response = await axios.post('http://localhost:3000/api/s3/image', {
            file: { name: `${profile.username}.jpg`, data: base64Data },
          });

          const uploadedImageUrl = s3Response.data.url;

          await prisma.profile.update({
            where: { id: profile.id },
            data: { image: uploadedImageUrl },
          });

          validImageReturned = true;
          picId++;
        } catch (error) {
          console.error(`Error with s3Response: ${error.response}`);
          process.exit(1);
        }
      } catch (error) {
        console.error(`Issue with picid: ${picId}, reattempting.`);
        attempts++;
        picId++;
      }
    }

    if (!validImageReturned) {
      console.error(`Could not find a valid image after 5 attempts with ${picId}`);
    }
  }
}
