import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function main(): Promise<void> {
  const delayFetchPaginatedResults = 60000 / 60; // runs 60 times per minute (1x/s)

  const results = await fetchPaginatedResults(1, delayFetchPaginatedResults);

  results.sort((a, b) => b.label.releaseCount - a.label.releaseCount);

  const recordLabels = results.slice(0, 10000);

  for (let i = 0; i < recordLabels.length; i++) {
    const result = recordLabels[i];
    const releaseCount = await getReleaseCount(result.label.discogsLabelId);
    result.label.releaseCount = releaseCount;
    await prisma.recordLabel.create({ data: {
      name: result.label.name,
      discogsLabelId: result.label.discogsLabelId
    } });
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log('Seed script completed successfully!');
}

async function fetchPaginatedResults(page: number, delay: number): Promise<any[]> {
  const apiUrl = `https://api.discogs.com/database/search?type=label&page=${page}&per_page=50`;

  const response = await makeDelayedRequest(apiUrl, delay);

  const nextPageUrl = response.data.pagination.urls.next;
  const nextPageNumber = response.data.pagination.page + 1;
  const totalPages = response.data.pagination.pages;

  const nextPageResults = await Promise.all(
    response.data.results.map(async (result: any) => {
      return {
        label: {
          name: result.title,
          discogsLabelId: result.id,
        },
      };
    })
  );

  if (nextPageNumber <= totalPages && nextPageUrl !== null) {
    const remainingResults = await fetchPaginatedResults(nextPageNumber, delay);
    return [...nextPageResults, ...remainingResults];
  } else {
    return nextPageResults;
  }
}

async function makeDelayedRequest(url: string, delay: number): Promise<any> {
  return new Promise((resolve) => {
    setTimeout(async () => {
      resolve(
        await axios.get(url, {
          headers: {
            Authorization: `Discogs key=${process.env.DISCOGS_API_KEY}, secret=${process.env.DISCOGS_API_SECRET}`,
          },
        })
      );
    }, delay);
  });
}

async function getReleaseCount(discogsLabelId: number): Promise<number> {
  const apiUrl = `https://api.discogs.com/labels/${discogsLabelId}/releases`;

  const response = await axios.get(apiUrl, {
    headers: {
      Authorization: `Discogs key=${process.env.DISCOGS_API_KEY}, secret=${process.env.DISCOGS_API_SECRET}`,
    },
  });

  return response.data.pagination.items;
}