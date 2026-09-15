import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Building Soki Production Bundle...');

// 1. Pastikan index.html di root memiliki entrypoint vite
if (fs.existsSync('index.template.html')) {
  fs.copyFileSync('index.template.html', 'index.html');
}

// 2. Jalankan vite build & esbuild
execSync('vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs', { stdio: 'inherit' });

// 3. Salin api.php ke dist/ dan root
fs.copyFileSync('public/api.php', 'dist/api.php');
fs.copyFileSync('public/api.php', 'api.php');

// 4. Salin dist/index.html ke root index.html agar hosting langsung menyajikan bundle produksi siap pakai
if (fs.existsSync('dist/index.html')) {
  fs.copyFileSync('dist/index.html', 'index.html');
  console.log('Synchronized dist/index.html to root index.html');
}

// 5. Salin dist/assets ke root assets
if (fs.existsSync('dist/assets')) {
  if (fs.existsSync('assets')) {
    fs.rmSync('assets', { recursive: true, force: true });
  }
  fs.cpSync('dist/assets', 'assets', { recursive: true });
  console.log('Synchronized dist/assets to root assets/');
}

// 6. Pastikan .htaccess ada di root dan dist
if (fs.existsSync('public/.htaccess')) {
  fs.copyFileSync('public/.htaccess', 'dist/.htaccess');
  fs.copyFileSync('public/.htaccess', '.htaccess');
}

console.log('Build & Synchronization completed successfully!');
