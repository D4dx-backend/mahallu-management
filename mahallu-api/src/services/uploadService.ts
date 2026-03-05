import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

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

export async function uploadFileToSpaces(file: Express.Multer.File): Promise<string> {
  const s3 = getS3Client();

  const folder = process.env.DO_SPACES_FOLDER || 'uploads';
  const ext = file.originalname.split('.').pop() || 'bin';
  const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;
  const key = `${folder}/notifications/${uniqueName}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.DO_SPACES_BUCKET!,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read' as any,
    })
  );

  const cdnEndpoint = process.env.DO_SPACES_CDN_ENDPOINT;
  if (cdnEndpoint) {
    return `${cdnEndpoint.replace(/\/$/, '')}/${key}`;
  }

  return `https://${process.env.DO_SPACES_BUCKET}.${process.env.DO_SPACES_ENDPOINT}/${key}`;
}
