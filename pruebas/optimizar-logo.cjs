const sharp = require('C:/Users/josue/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
// Keep every frame/timing; crop to the existing header and provide a 3x asset.
sharp(path.join(root, 'assets/images/navbar-logo.gif'), { animated: true, limitInputPixels: false })
  .resize({ width: 864, height: 212, fit: 'cover', position: 'centre' })
  .gif({ effort: 3, dither: 0 })
  .toBuffer()
  .then(buffer => sharp(buffer, { animated: true, limitInputPixels: false })
    .webp({ lossless: true, effort: 4 })
    .toFile(path.join(root, 'assets/images/navbar-logo-optimized.webp')))
  .then(console.log).catch(error => { console.error(error); process.exitCode = 1; });
