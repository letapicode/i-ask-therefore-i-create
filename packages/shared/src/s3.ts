import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const client = new S3Client({});

export async function uploadObject(bucket: string, key: string, body: string | Uint8Array) {
  await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body }));
}
