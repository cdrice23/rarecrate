import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { NextApiRequest, NextApiResponse } from 'next';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case 'POST':
      const { file } = req.body;

      if (!file || !file.data) {
        res.status(400).json({ error: 'Missing file data' });
        return;
      }

      const paramsForPost = {
        Bucket: process.env.BUCKET_NAME,
        Key: file.name,
        Body: Buffer.from(file.data, 'base64'),
        ContentType: 'image/jpeg',
      };

      const putCommand = new PutObjectCommand(paramsForPost);

      try {
        await s3Client.send(putCommand);
        res
          .status(200)
          .json({ url: `https://${process.env.BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.name}` });
      } catch (error) {
        res.status(500).json({ error: 'Failed to upload file' });
      }
      break;
    case 'GET':
      let { key } = req.query;

      if (Array.isArray(key)) {
        key = key[0];
      }

      if (!key) {
        res.status(400).json({ error: 'Missing image key' });
        return;
      }

      const paramsForGet = {
        Bucket: process.env.BUCKET_NAME,
        Key: key,
      };

      const getCommand = new GetObjectCommand(paramsForGet);

      const getSignedUrlWithRetry = withRetry(getSignedUrl);

      try {
        const url = await getSignedUrlWithRetry(s3Client, getCommand, { expiresIn: 60 });
        res.status(200).json({ url });
      } catch (error) {
        console.error('Error generating signed URL:', error);
        res.status(500).json({ error: 'Failed to generate signed URL' });
      }
      break;
    case 'DELETE':
      // Add your DELETE method logic here
      break;
    default:
      // Method Not Allowed
      res.status(405).end();
      break;
  }
};

export default handler;

const withRetry =
  (fn, retries = 3, delay = 500) =>
  async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      if (retries <= 0) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2)(...args);
    }
  };
