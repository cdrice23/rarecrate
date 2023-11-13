import { NextApiRequest, NextApiResponse } from 'next';
import { S3Client, GetObjectCommand, DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const generatePresignedUrl = async (key, contentType) => {
  const command = new PutObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  return presignedUrl;
};

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

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    // Handle GET request
    const key = req.query.key as string;
    const params = {
      Bucket: process.env.BUCKET_NAME,
      Key: key,
    };

    const getCommand = new GetObjectCommand(params);

    const getSignedUrlWithRetry = withRetry(getSignedUrl);

    try {
      const url = await getSignedUrlWithRetry(s3Client, getCommand, { expiresIn: 3600 });
      res.status(200).json({ url });
    } catch (error) {
      console.error('Error generating signed URL:', error);
      if (error.name === 'NoSuchKey') {
        res.status(404).json({ error: 'Image not found' });
      } else {
        res.status(500).json({ error: 'Failed to generate signed URL' });
      }
    }
  } else if (req.method === 'POST') {
    try {
      const key = `${req.body.username}.jpg`;
      const contentType = 'image/jpeg';
      const presignedUrl = await generatePresignedUrl(key, contentType);
      res.status(200).json({ url: presignedUrl });
    } catch (error) {
      console.error('Failed to generate pre-signed URL', error);
      res.status(500).json({ error: 'Failed to generate pre-signed URL', message: error.message });
    }
  } else if (req.method === 'DELETE') {
    // Handle DELETE request
    const key = req.query.key.toString();
    const params = {
      Bucket: process.env.BUCKET_NAME,
      Key: key,
    };

    try {
      await s3Client.send(new DeleteObjectCommand(params));
      res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete file from S3', message: error.message });
    }
  } else {
    // Handle any other HTTP method
    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default handler;
