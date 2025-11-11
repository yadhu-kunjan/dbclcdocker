import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create upload directories if they don't exist
const uploadsDir = path.join(__dirname, '../../uploads');
const photosDir = path.join(uploadsDir, 'photos');
const certificatesDir = path.join(uploadsDir, 'certificates');

[uploadsDir, photosDir, certificatesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log('Created directory:', dir);
  }
});

export const ensureUploadDirs = () => {
  [uploadsDir, photosDir, certificatesDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log('Created directory:', dir);
    }
  });
};

export { uploadsDir, photosDir, certificatesDir };