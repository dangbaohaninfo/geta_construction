import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import crypto from "crypto";
import path from "path";

const accountId = process.env.R2_ACCOUNT_ID;
const bucket = process.env.R2_BUCKET;
const publicUrl = process.env.R2_PUBLIC_URL;

export const storageEnabled = Boolean(
  accountId && bucket && publicUrl && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY
);

const s3 = storageEnabled
  ? new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    })
  : null;

export async function uploadAttachment(file: Express.Multer.File): Promise<string> {
  if (!s3 || !bucket || !publicUrl) {
    throw new Error("Chưa cấu hình lưu trữ file (R2). Vui lòng đặt các biến môi trường R2_*.");
  }
  const ext = path.extname(file.originalname);
  const key = `attachments/${Date.now()}-${crypto.randomUUID()}${ext}`;
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  );
  return `${publicUrl.replace(/\/$/, "")}/${key}`;
}
