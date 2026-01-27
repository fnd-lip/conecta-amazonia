import multer from 'multer';
import path from 'path';

const MAX_IMAGE_SIZE_MB = 5;
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve('uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
    cb(null, uniqueName);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: MAX_IMAGE_SIZE_MB * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      const err = new Error(
        'Formato de imagem invalido. Envie JPG, PNG ou WebP.'
      ) as Error & { code?: string };
      err.code = 'INVALID_FILE_TYPE';
      return cb(err);
    }
    return cb(null, true);
  },
});
