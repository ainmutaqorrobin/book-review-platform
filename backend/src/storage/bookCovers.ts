import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

export type CoverImageSource = "upload" | "external" | null;

type BookLike = {
  cover_image_url?: string | null;
  [key: string]: unknown;
};

const COVER_KEY_PATTERN = /^covers\/\d+\/cover\.(jpg|jpeg|png|webp)$/i;

const MIME_EXTENSION_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required storage configuration: ${name}`);
  }

  return value;
}

function getPublicEndpointBase() {
  return getRequiredEnv("S3_PUBLIC_ENDPOINT").replace(/\/+$/, "");
}

function getBucketName() {
  return getRequiredEnv("S3_BUCKET");
}

function createS3Client() {
  return new S3Client({
    region: process.env.S3_REGION?.trim() || "us-east-1",
    endpoint: getRequiredEnv("S3_ENDPOINT"),
    credentials: {
      accessKeyId: getRequiredEnv("S3_ACCESS_KEY"),
      secretAccessKey: getRequiredEnv("S3_SECRET_KEY"),
    },
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
  });
}

export function isStoredCoverObjectKey(value?: string | null) {
  return Boolean(value && COVER_KEY_PATTERN.test(value));
}

export function getCoverSource(value?: string | null): CoverImageSource {
  if (!value) {
    return null;
  }

  return isStoredCoverObjectKey(value) ? "upload" : "external";
}

export function buildBookCoverKey(bookId: number, mimeType: string) {
  const extension = MIME_EXTENSION_MAP[mimeType];

  if (!extension) {
    throw new Error(`Unsupported cover mime type: ${mimeType}`);
  }

  return `covers/${bookId}/cover.${extension}`;
}

export function getPublicFileUrl(key: string) {
  return `${getPublicEndpointBase()}/${getBucketName()}/${key}`;
}

export function serializeStoredCoverValue(value?: string | null) {
  const storageValue = value ?? null;
  const source = getCoverSource(storageValue);

  return {
    cover_image_url:
      source === "upload" && storageValue
        ? getPublicFileUrl(storageValue)
        : storageValue,
    cover_image_storage_value: storageValue,
    cover_image_source: source,
  };
}

export function serializeBookRecord<T extends BookLike>(record: T) {
  return {
    ...record,
    ...serializeStoredCoverValue(record.cover_image_url),
  };
}

export function serializeBookCollection<T extends BookLike>(records: T[]) {
  return records.map((record) => serializeBookRecord(record));
}

export async function uploadBookCover(params: {
  bookId: number;
  buffer: Buffer;
  mimeType: string;
}) {
  const key = buildBookCoverKey(params.bookId, params.mimeType);
  const client = createS3Client();

  await client.send(
    new PutObjectCommand({
      Bucket: getBucketName(),
      Key: key,
      Body: params.buffer,
      ContentType: params.mimeType,
    }),
  );

  return key;
}

export async function deleteStoredCoverObject(key?: string | null) {
  if (!isStoredCoverObjectKey(key)) {
    return;
  }

  const client = createS3Client();

  await client.send(
    new DeleteObjectCommand({
      Bucket: getBucketName(),
      Key: key ?? undefined,
    }),
  );
}
