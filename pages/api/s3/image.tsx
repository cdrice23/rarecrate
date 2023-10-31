import { S3 } from 'aws-sdk';
import type { NextApiRequest, NextApiResponse } from 'next';

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { file } = req.body;

    if (!file || !file.data) {
      res.status(400).json({ error: 'Missing file data' });
      return;
    }

    const params = {
      Bucket: process.env.BUCKET_NAME,
      Key: file.name,
      Body: Buffer.from(file.data, 'base64'),
      ContentType: 'image/jpeg',
    };

    try {
      const response = await s3.upload(params).promise();
      res.status(200).json({ url: response.Location });
    } catch (error) {
      res.status(500).json({ error: 'Failed to upload file' });
    }
  } else {
    // Method Not Allowed
    res.status(405).end();
  }
};

export default handler;
