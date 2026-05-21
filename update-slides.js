const fs = require('fs');
const path = require('path');

const IMAGE_DIR = path.join(__dirname, 'image', '作業写真');
const HTML_FILE = path.join(__dirname, 'index.html');
const SUPPORTED_EXT = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.jfif', '.bmp', '.svg'];

const files = fs.readdirSync(IMAGE_DIR)
  .filter(f => SUPPORTED_EXT.includes(path.extname(f).toLowerCase()))
  .sort();

if (files.length === 0) {
  console.error('作業写真フォルダに画像が見つかりません');
  process.exit(1);
}

const slides = files
  .map(f => {
    const url = `url('image/作業写真/${f}')`;
    return `    <div class="page-bg-slide">\n      <div class="slide-blur" style="background-image:${url}"></div>\n      <div class="slide-sharp" style="background-image:${url}"></div>\n    </div>`;
  })
  .join('\n');

const newBlock = `  <div class="page-bg-slides">\n${slides}\n  </div>`;

let html = fs.readFileSync(HTML_FILE, 'utf8');
const updated = html.replace(
  /  <div class="page-bg-slides">[\s\S]*?\n  <\/div>/,
  newBlock
);

if (html === updated) {
  console.log('変更なし（既に最新の状態です）');
} else {
  fs.writeFileSync(HTML_FILE, updated, 'utf8');
  console.log('index.html を更新しました:');
  files.forEach(f => console.log(`  - ${f}`));
}
