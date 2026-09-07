const base = 'C:/Users/josue/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/';
const { chromium } = require(base + 'playwright');
const sharp = require(base + 'sharp');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const results = [];
  try {
    for (const config of [
      { name: 'desktop-100', width: 1440, height: 900, dpr: 1 },
      { name: 'desktop-125', width: 1440, height: 900, dpr: 1.25 },
      { name: 'tablet', width: 820, height: 1180, dpr: 2 },
      { name: 'mobile', width: 390, height: 844, dpr: 3 },
    ]) {
      const context = await browser.newContext({ viewport: { width: config.width, height: config.height }, deviceScaleFactor: config.dpr });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.route('https://**/*', route => route.abort());
      await page.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href);
      await page.waitForTimeout(3200);
      const samples = [];
      for (let i = 0; i < 6; i++) {
        await page.locator('[data-theme-toggle]').click();
        await page.waitForFunction(() => document.getAnimations().some(a => a.effect?.pseudoElement === '::view-transition-new(root)'));
        const icon = await page.evaluate(() => {
          const a = document.getAnimations().find(a => a.effect?.pseudoElement === '::view-transition-new(root)');
          window.testReveal = a;
          a.pause();
          const frames = a.effect.getKeyframes();
          window.testFrames = frames;
          // Keep the actual production origin. A small radius fits around the icon
          // so its full rendered bounding box can be measured from screenshot pixels.
          a.effect.setKeyframes([{ clipPath: frames[0].clipPath }, { clipPath: frames[1].clipPath.replace('150%', '2%') }]);
          a.effect.updateTiming({ duration: 1000, easing: 'linear' });
          a.currentTime = 500;
          const r = document.querySelector('[data-theme-icon]').getBoundingClientRect();
          return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        });
        const diagnostic = await page.addStyleTag({ content: '::view-transition { background: rgb(255,0,255) !important; } ::view-transition-old(root) { opacity: 0 !important; }' });
        const png = await page.screenshot();
        const { data, info } = await sharp(png).removeAlpha().raw().toBuffer({ resolveWithObject: true });
        let minX = info.width, minY = info.height, maxX = -1, maxY = -1;
        for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
          const n = (y * info.width + x) * info.channels;
          if (Math.abs(data[n] - 255) + data[n + 1] + Math.abs(data[n + 2] - 255) < 60) continue;
          minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
        }
        const center = { x: (minX + maxX + 1) / (2 * config.dpr), y: (minY + maxY + 1) / (2 * config.dpr) };
        const error = Math.hypot(center.x - icon.x, center.y - icon.y);
        samples.push({ icon, renderedCenter: center, error, detected: maxX >= 0 });
        if (i === 0) fs.writeFileSync(path.join(__dirname, `tema-centro-${config.name}.png`), png);
        await diagnostic.evaluate(el => el.remove());
        await page.evaluate(() => {
          window.testReveal.effect.setKeyframes(window.testFrames);
          window.testReveal.effect.updateTiming({ duration: 1000, easing: 'linear' });
          window.testReveal.currentTime = 90;
        });
        if (i === 0) await page.screenshot({ path: path.join(__dirname, `tema-real-${config.name}.png`) });
        await page.evaluate(() => { for (let n = 0; n < 5; n++) document.querySelector('[data-theme-toggle]').click(); window.testReveal.finish(); });
        await page.waitForFunction(() => !document.querySelector('.is-theme-switching'));
      }
      const retained = await page.evaluate(() => document.getAnimations().filter(a => a.effect?.pseudoElement === '::view-transition-new(root)').length);
      results.push({ ...config, samples, retained, errors });
      console.log(config.name, 'rendered max error:', Math.max(...samples.map(s => s.error)), 'retained:', retained);
      await context.close();
    }
    fs.writeFileSync(path.join(__dirname, 'transicion-tema-visual.json'), JSON.stringify(results, null, 2));
    if (results.some(r => r.retained || r.errors.length || r.samples.some(s => !s.detected || s.error > 1))) process.exitCode = 1;
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
