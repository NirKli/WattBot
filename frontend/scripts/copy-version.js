import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read version from VERSION file
const version = fs.readFileSync(path.join(__dirname, '..', 'VERSION'), 'utf8').trim();

// Create .env file with version
const envContent = `VITE_APP_VERSION=${version}\n`;
fs.writeFileSync(path.join(__dirname, '..', '.env'), envContent);

console.log(`Version ${version} copied to .env file`); 