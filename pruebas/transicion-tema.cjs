const { chromium } = require('C:/Users/josue/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const stage = process.argv[2] || 'despues';
const root = path.resolve(__dirname, '..');

(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const results = [];
  try {
    for (const config of [
      { name: 'desktop', viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
      { name: 'desktop-125', viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.25 },
      { name: 'tablet', viewport: { width: 820, height: 1180 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
      { name: 'mobile', viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
    ]) {
      const { name, ...options } = config;
      const context = await browser.newContext(options);
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      // Isolate the reveal from third-party network availability, not from local animations/videos.
      await page.route('https://**/*', route => route.abort());
      await page.addInitScript(() => {
        localStorage.setItem('portfolio-theme', 'dark');
        window.revealSamples = [];
        const animate = Element.prototype.animate;
        Element.prototype.animate = function (frames, options) {
          const animation = animate.call(this, frames, options);
          if (options?.pseudoElement === '::view-transition-new(root)') {
            const r = document.querySelector('[data-theme-icon]').getBoundingClientRect();
            const match = /circle\(([-\d.]+)% at ([-\d.]+)% ([-\d.]+)%\)/.exec(frames.clipPath[0]);
            const x = Number(match[2]) / 100 * innerWidth, y = Number(match[3]) / 100 * innerHeight;
            window.revealSamples.push({ x, y, radius: Number(match[1]), iconX: r.left + r.width / 2, iconY: r.top + r.height / 2,
              error: Math.hypot(x - r.left - r.width / 2, y - r.top - r.height / 2),
              inside: x >= r.left && x <= r.right && y >= r.top && y <= r.bottom,
              theme: document.documentElement.dataset.theme });
          }
          return animation;
        };
      });
      await page.goto(pathToFileURL(path.join(root, 'index.html')).href);
      await page.waitForTimeout(3500);
      for (let i = 0; i < (stage === 'antes' ? 4 : 10); i++) {
        const prior = await page.evaluate(() => window.revealSamples.length);
        if (options.hasTouch) await page.locator('[data-theme-toggle]').tap();
        else if (i % 3 === 2) { await page.locator('[data-theme-toggle]').focus(); await page.keyboard.press('Enter'); }
        else await page.locator('[data-theme-toggle]').click();
        await page.waitForFunction(n => window.revealSamples.length > n, prior);
        // Fast repeated activations must not create overlapping transitions.
        await page.evaluate(() => { for (let j = 0; j < 5; j++) document.querySelector('[data-theme-toggle]').click(); });
        await page.waitForFunction(() => !document.querySelector('.is-theme-switching'));
      }
      const result = await page.evaluate(() => ({ samples: window.revealSamples, retained: document.getAnimations().filter(a => a.effect?.pseudoElement === '::view-transition-new(root)').length, overflow: document.documentElement.scrollWidth > innerWidth }));
      results.push({ name, ...result, errors });
      await context.close();
      console.log(name, 'max offset:', Math.max(...result.samples.map(r => r.error)), 'retained:', result.retained);
    }
    fs.writeFileSync(path.join(__dirname, `transicion-tema-${stage}.json`), JSON.stringify(results, null, 2));
    if (results.some(r => r.errors.length || r.retained || r.samples.some(s => !s.inside || s.error > 2))) process.exitCode = 1;
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
