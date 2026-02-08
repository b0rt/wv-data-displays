const fs = require('fs');
const path = require('path');
const https = require('https');

const libDir = path.join(__dirname, '..', 'lib');
const modelDir = path.join(libDir, 'blazeface-model');

// Ensure directories exist
if (!fs.existsSync(libDir)) {
  fs.mkdirSync(libDir, { recursive: true });
}
if (!fs.existsSync(modelDir)) {
  fs.mkdirSync(modelDir, { recursive: true });
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

// Download TensorFlow.js, BlazeFace, and model files for offline use
const downloads = [
  {
    url: 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.11.0/dist/tf.min.js',
    dest: 'tf.min.js',
    dir: libDir
  },
  {
    url: 'https://cdn.jsdelivr.net/npm/@tensorflow-models/blazeface@0.0.7/dist/blazeface.min.js',
    dest: 'blazeface.min.js',
    dir: libDir
  },
  // BlazeFace model files from TFHub
  {
    url: 'https://tfhub.dev/tensorflow/tfjs-model/blazeface/1/default/1/model.json?tfjs-format=file',
    dest: 'model.json',
    dir: modelDir
  },
  {
    url: 'https://tfhub.dev/tensorflow/tfjs-model/blazeface/1/default/1/group1-shard1of1.bin?tfjs-format=file',
    dest: 'group1-shard1of1.bin',
    dir: modelDir
  }
];

function downloadFile(url, dest, dir) {
  return new Promise((resolve, reject) => {
    const destPath = path.join(dir, dest);

    // Skip if already exists
    if (fs.existsSync(destPath)) {
      console.log(`✓ ${dest} already exists`);
      resolve();
      return;
    }

    const file = fs.createWriteStream(destPath);

    function doDownload(downloadUrl) {
      const protocol = downloadUrl.startsWith('https') ? https : require('http');
      protocol.get(downloadUrl, (response) => {
        // Handle redirects
        if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 303) {
          doDownload(response.headers.location);
          return;
        }

        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode} for ${dest}`));
          return;
        }

        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✓ Downloaded ${dest}`);
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

// Download all files
async function downloadAll() {
  for (const d of downloads) {
    try {
      await downloadFile(d.url, d.dest, d.dir);
    } catch (err) {
      console.error(`✗ Failed to download ${d.dest}: ${err.message}`);
    }
  }

  // Fix the model.json to use relative paths
  const modelJsonPath = path.join(modelDir, 'model.json');
  if (fs.existsSync(modelJsonPath)) {
    let modelJson = fs.readFileSync(modelJsonPath, 'utf8');
    // The model.json might have absolute URLs, we need relative paths
    modelJson = modelJson.replace(
      /https:\/\/tfhub\.dev\/tensorflow\/tfjs-model\/blazeface\/1\/default\/1\//g,
      ''
    );
    fs.writeFileSync(modelJsonPath, modelJson);
    console.log('✓ Fixed model.json paths');
  }

  console.log('✓ All libraries ready');
}

downloadAll().catch(err => console.error('Download failed:', err.message));
