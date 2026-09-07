const { chromium } = require('C:/Users/josue/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const stage = process.argv[2] || 'antes';
const mime = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.svg':'image/svg+xml', '.mp4':'video/mp4', '.png':'image/png', '.woff2':'font/woff2' };
const server = http.createServer((req,res) => {
  const filename = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
  if (!filename.startsWith(root + path.sep) && filename !== root) { res.writeHead(403).end(); return; }
  const file = filename === root ? path.join(root,'index.html') : filename;
  if (req.url === '/favicon.ico') {res.writeHead(204).end();return;}
  fs.readFile(file,(err,data) => {
    if(err){res.writeHead(404).end();return;}
    if (stage === 'control' && path.basename(file) === 'index.html') {
      data = Buffer.from(data.toString().replace('navbar-logo-optimized.webp', 'navbar-logo.gif')
        .replaceAll('-faststart.mp4', '.mp4')
        .replace(/<script src="assets\/js\/media-performance[^>]*><\/script>/, ''));
    }
    const headers={'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','Accept-Ranges':'bytes'};
    const range=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range || '');
    if(range){const start=Number(range[1]),end=Math.min(range[2]?Number(range[2]):data.length-1,data.length-1);res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${data.length}`,'Content-Length':end-start+1});res.end(data.subarray(start,end+1));}
    else {res.writeHead(200,{...headers,'Content-Length':data.length});res.end(data);}
  });
});
(async () => {
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const results=[];
 try {
 for(const mobile of [true,false]){
  const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:900},deviceScaleFactor:mobile?3:1.25,isMobile:mobile,hasTouch:mobile});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{localStorage.setItem('portfolio-theme','dark');window.longTasks=[];new PerformanceObserver(list=>longTasks.push(...list.getEntries().map(e=>e.duration))).observe({type:'longtask',buffered:true});});
  const cdp=await context.newCDPSession(page);await cdp.send('Performance.enable');
  await page.goto(process.env.PORTFOLIO_URL||`http://127.0.0.1:${server.address().port}/`,{waitUntil:'load',timeout:90000});
  await page.waitForTimeout(4000);
  const before=(await cdp.send('Performance.getMetrics')).metrics;
  const sample=await page.evaluate(()=>new Promise(resolve=>{
   const times=[];let last=performance.now(),start=last;
   function frame(now){times.push(now-last);last=now;if(now-start<4000)requestAnimationFrame(frame);else{times.sort((a,b)=>a-b);resolve({frames:times.length,p95:times[Math.floor(times.length*.95)],longTasks:longTasks.length,maxLongTask:Math.max(0,...longTasks),resources:performance.getEntriesByType('resource').map(r=>({name:r.name.split('/').pop(),bytes:r.encodedBodySize})),videos:[...document.querySelectorAll('video')].map(v=>({paused:v.paused,time:v.currentTime,ready:v.readyState})),load:performance.getEntriesByType('navigation')[0].loadEventEnd});}}requestAnimationFrame(frame);
  }));
  const after=(await cdp.send('Performance.getMetrics')).metrics;
  const metric=(arr,name)=>arr.find(m=>m.name===name)?.value||0;
  await page.locator('[data-theme-toggle]').click();await page.waitForTimeout(1700);
  const light=await page.evaluate(()=>[...document.querySelectorAll('video')].map(v=>({paused:v.paused,time:v.currentTime})));
  await page.locator('[data-theme-toggle]').click();await page.waitForTimeout(2200);
  const resumed=await page.evaluate(()=>[...document.querySelectorAll('video')].map(v=>({paused:v.paused,time:v.currentTime})));
  results.push({mobile,...sample,taskSeconds:metric(after,'TaskDuration')-metric(before,'TaskDuration'),light,resumed,errors});
  console.log(JSON.stringify({mobile,load:sample.load,bytes:sample.resources.reduce((n,r)=>n+r.bytes,0),p95:sample.p95,light,resumed,errors}));
  await context.close();
 }
 fs.writeFileSync(path.join(__dirname,`general-${stage}.json`),JSON.stringify(results,null,2));
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
