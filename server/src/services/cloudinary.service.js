import fs from "fs/promises";
import { v2 as cloudinary } from "cloudinary";

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

const isCloudinaryEnabled = Boolean(
  CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET
);

if (isCloudinaryEnabled) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true
  });
}

function extractPublicIdFromUrl(url) {
  if (typeof url !== "string" || !url.includes("/upload/")) {
    return null;
  }

  const withoutQuery = url.split("?")[0];
  const uploadIndex = withoutQuery.indexOf("/upload/");
  if (uploadIndex < 0) {
    return null;
  }

  let tail = withoutQuery.slice(uploadIndex + "/upload/".length);
  tail = tail.replace(/^v\d+\//, "");

  const lastDotIndex = tail.lastIndexOf(".");
  if (lastDotIndex <= 0) {
    return null;
  }

  return tail.slice(0, lastDotIndex);
}

async function safeUnlink(filePath) {
  if (!filePath) return;

  try {
    await fs.unlink(filePath);
  } catch {
    // No-op: deletion failure should not break request flow.
  }
}

export async function uploadImages(files, options = {}) {
  const list = Array.isArray(files) ? files : [];
  if (list.length === 0) {
    return [];
  }

  if (!isCloudinaryEnabled) {
    return list.map((file) => "/uploads/" + file.filename).slice(0, 5);
  }

  const folder = options.folder || "dealspot/annonces";

  const uploadedUrls = await Promise.all(
    list.slice(0, 5).map(async (file) => {
      try {
        const result = await cloudinary.uploader.upload(file.path, {
          folder,
          resource_type: "image"
        });

        return result.secure_url;
      } finally {
        await safeUnlink(file.path);
      }
    })
  );

  return uploadedUrls;
}

export async function deleteImagesByUrls(urls) {
  const list = Array.isArray(urls) ? urls.filter((value) => typeof value === "string") : [];
  if (!isCloudinaryEnabled || list.length === 0) {
    return;
  }

  await Promise.allSettled(
    list.map(async (url) => {
      const publicId = extractPublicIdFromUrl(url);
      if (!publicId) {
        return;
      }

      await cloudinary.uploader.destroy(publicId, {
        resource_type: "image"
      });
    })
  );
}

export { isCloudinaryEnabled };
