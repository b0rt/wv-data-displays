const fs = require('fs');
const path = require('path');
const https = require('https');

const libDir = path.join(__dirname, '..', 'lib');
const mediapipeDir = path.join(libDir, 'mediapipe');
const wasmDir = path.join(mediapipeDir, 'wasm');

// Ensure directories exist
for (const dir of [libDir, mediapipeDir, wasmDir]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Copy Three.js
const threeSrc = path.join(__dirname, '..', 'node_modules', 'three', 'build', 'three.min.js');
const threeDest = path.join(libDir, 'three.min.js');

if (fs.existsSync(threeSrc)) {
  fs.copyFileSync(threeSrc, threeDest);
  console.log('✓ Copied three.min.js to /lib');
} else {
  console.error('✗ Could not find three.min.js');
}

// Copy MediaPipe WASM files from pilot's node_modules
const mediapipeWasmSrc = path.join(__dirname, '..', 'pilot', 'node_modules', '@mediapipe', 'tasks-vision', 'wasm');
const wasmFiles = [
  'vision_wasm_internal.js',
  'vision_wasm_internal.wasm',
  'vision_wasm_nosimd_internal.js',
  'vision_wasm_nosimd_internal.wasm'
];

for (const file of wasmFiles) {
  const src = path.join(mediapipeWasmSrc, file);
  const dest = path.join(wasmDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`✓ Copied ${file} to /lib/mediapipe/wasm`);
  } else {
    console.error(`✗ Could not find ${file}`);
  }
}

// Download MediaPipe face detection model
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(destPath)) {
      console.log(`✓ ${path.basename(destPath)} already exists`);
      resolve();
      return;
    }

    const file = fs.createWriteStream(destPath);

    function doDownload(downloadUrl) {
      const protocol = downloadUrl.startsWith('https') ? https : require('http');
      protocol.get(downloadUrl, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 303) {
          doDownload(response.headers.location);
          return;
        }

        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode} for ${path.basename(destPath)}`));
          return;
        }

        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✓ Downloaded ${path.basename(destPath)}`);
          resolve();
        });
      }).on('error', (err) => {
        fs.unlink(destPath, () => {});
        reject(err);
      });
    }

    doDownload(url);
  });
}

async function downloadAll() {
  try {
    await downloadFile(
      'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
      path.join(mediapipeDir, 'blaze_face_short_range.tflite')
    );
  } catch (err) {
    console.error(`✗ Failed to download model: ${err.message}`);
  }

  console.log('✓ All libraries ready');
}

downloadAll().catch(err => console.error('Download failed:', err.message));
