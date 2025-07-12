import { S3Client, PutObjectCommand, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

const BUCKET = process.env.COMMUNITY_MODELS_BUCKET || 'community-models';
const client = new S3Client({});

function streamToString(stream: Readable): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk) => chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
  });
}

export async function saveModel(version: string, weights: number[]): Promise<void> {
  await client.send(
    new PutObjectCommand({ Bucket: BUCKET, Key: `${version}.json`, Body: JSON.stringify(weights) })
  );
}

export async function listModels(): Promise<string[]> {
  const res = await client.send(new ListObjectsV2Command({ Bucket: BUCKET }));
  return (
    res.Contents?.map((c) => c.Key || '')
      .filter((k) => k.endsWith('.json'))
      .map((k) => k.replace(/\.json$/, '')) || []
  );
}

export async function loadModel(version: string): Promise<number[]> {
  const res = await client.send(new GetObjectCommand({ Bucket: BUCKET, Key: `${version}.json` }));
  const body = await streamToString(res.Body as Readable);
  return JSON.parse(body);
}
