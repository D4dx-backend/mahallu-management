import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

function getS3Client(): S3Client {
  return new S3Client({
    endpoint: `https://${process.env.DO_SPACES_ENDPOINT}`,
    region: 'us-east-1',
    credentials: {
      accessKeyId: process.env.DO_SPACES_KEY!,
      secretAccessKey: process.env.DO_SPACES_SECRET!,
    },
    forcePathStyle: false,
  });
}

export async function uploadFileToSpaces(
  file: Express.Multer.File,
  folderType: 'notifications' | 'banners' = 'notifications'
): Promise<string> {
  const s3 = getS3Client();

  const folder = process.env.DO_SPACES_FOLDER || 'uploads';
  const ext = MIME_TO_EXT[file.mimetype] || 'bin';
  const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}.${ext}`;
  const key = `${folder}/${folderType}/${uniqueName}`;

  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.DO_SPACES_BUCKET!,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      })
    );
  } catch {
    throw new Error('Failed to upload image to object storage');
  }

  const cdnEndpoint = process.env.DO_SPACES_CDN_ENDPOINT;
  if (cdnEndpoint) {
    return `${cdnEndpoint.replace(/\/$/, '')}/${key}`;
  }

  return `https://${process.env.DO_SPACES_BUCKET}.${process.env.DO_SPACES_ENDPOINT}/${key}`;
}
