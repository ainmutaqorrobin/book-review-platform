import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import { AppError } from "../utils/appError";

export const MAX_COVER_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const ALLOWED_COVER_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_COVER_FILE_SIZE_BYTES,
    files: 1,
  },
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    callback: FileFilterCallback,
  ) => {
    if (!ALLOWED_COVER_MIME_TYPES.has(file.mimetype)) {
      callback(
        new AppError(
          "Cover image must be a JPEG, PNG, or WebP file",
          400,
        ),
      );
      return;
    }

    callback(null, true);
  },
});

export const uploadBookCover = upload.single("cover");
