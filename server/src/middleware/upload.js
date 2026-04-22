import fs from "fs";
import path from "path";
import multer from "multer";

const uploadsDir = path.resolve(process.cwd(), "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname || "").toLowerCase();
    const baseName = path
      .basename(file.originalname || "image", extension)
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .slice(0, 40);
    const safeExtension = extension || ".jpg";
    cb(null, Date.now() + "-" + baseName + safeExtension);
  }
});

function imageFilter(_req, file, cb) {
  if (file.mimetype && file.mimetype.startsWith("image/")) {
    cb(null, true);
    return;
  }

  cb(new Error("Seuls les fichiers image sont autorisés."));
}

const upload = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    files: 5,
    fileSize: 5 * 1024 * 1024
  }
});

export default upload;
