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
    const headers={'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','Accept-Ranges':'bytes'};
    const range=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range || '');
    if(range){const start=Number(range[1]),end=Math.min(range[2]?Number(range[2]):data.length-1,data.length-1);res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${data.length}`,'Content-Length':end-start+1});res.end(data.subarray(start,end+1));}
    else {res.writeHead(200,{...headers,'Content-Length':data.length});res.end(data);}
  });
});
(async () => {
  await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
  const browser = await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--autoplay-policy=no-user-gesture-required',...(process.argv[3]==='decode-software'?['--disable-accelerated-video-decode']:[])]});
  try {
    const context = await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1.25});
    const page = await context.newPage();
    if(process.argv[3]==='webgl')await page.route('**/tubes1.min.js',async route=>{
      const response=await route.fetch();
      const source=await response.text();
      const original='rendererOptions:{alpha:!0,antialias:!1}';
      if(!source.includes(original))throw new Error('No se encontro la configuracion del renderer');
      await route.fulfill({response,body:source.replace(original,'rendererOptions:{alpha:!0,antialias:!1,forceWebGL:!0}')});
    });
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    // Repeat the same random tube geometry and lights in both measurements.
    await page.addInitScript(() => {let seed=20260904; Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};localStorage.setItem('portfolio-theme','dark');});
    const cdp=await context.newCDPSession(page);
    await cdp.send('Performance.enable');
    await page.goto(`http://127.0.0.1:${server.address().port}/`,{waitUntil:'load',timeout:90000});
    await page.waitForSelector('.hero__tubes-cursor.is-ready',{timeout:90000});
    await page.waitForTimeout(5500);
    if(process.argv[3]==='sin-mezcla')await page.addStyleTag({content:'.hero__tubes-cursor {mix-blend-mode:normal !important}'});
    if(process.argv[3]==='capa-video')await page.addStyleTag({content:'.hero__background-video {will-change:transform}'});
    if(process.argv[3]==='sin-cursor')await page.evaluate(()=>{tubesApp.three.onBeforeRender=()=>{};tubesApp.three.render=()=>{};});
    const config=await page.evaluate(()=>({backend:tubesApp.three.renderer.backend.isWebGLBackend?'WebGL':'WebGPU',canvas:[canvas.width,canvas.height],pixelRatio:tubesApp.three.size.pixelRatio,tubes:tubesApp.tubes.options.count,bloom:tubesApp.options.bloom,videos:[...document.querySelectorAll('video')].map(v=>({src:v.getAttribute('class'),width:v.videoWidth,height:v.videoHeight,duration:v.duration,paused:v.paused,readyState:v.readyState}))}));
    await page.evaluate(()=>{window.__renderCount=0;const render=tubesApp.three.render;tubesApp.three.render=function(...args){window.__renderCount++;return render.apply(this,args);};});
    const measures=[];
    for(const mode of ['quieto','movimiento']) {
      const perfBefore=(await cdp.send('Performance.getMetrics')).metrics;
      await page.evaluate(()=>{
        window.__videoStart=[...document.querySelectorAll('video')].map(v=>({...v.getVideoPlaybackQuality().toJSON?.(),total:v.getVideoPlaybackQuality().totalVideoFrames,dropped:v.getVideoPlaybackQuality().droppedVideoFrames}));
        window.__frameTimes=[];window.__sampling=true;window.__renderStart=window.__renderCount;
        window.__presented=[0,0];window.__videoCallbacks=[];
        document.querySelectorAll('video').forEach((v,i)=>{function frame(){window.__presented[i]++;window.__videoCallbacks[i]=v.requestVideoFrameCallback(frame);}window.__videoCallbacks[i]=v.requestVideoFrameCallback(frame);});
        let last=performance.now();function tick(now){window.__frameTimes.push(now-last);last=now;window.__sampleRaf=requestAnimationFrame(tick);}window.__sampleRaf=requestAnimationFrame(tick);
      });
      const started=Date.now();
      while(Date.now()-started<10000){
        if(mode==='movimiento'){const t=(Date.now()-started)/1000;await page.mouse.move(720+600*Math.sin(t*2.1),440+300*Math.cos(t*2.7));}
        await page.waitForTimeout(16);
      }
      const elapsed=Date.now()-started;
      const sample=await page.evaluate(()=>{cancelAnimationFrame(window.__sampleRaf);document.querySelectorAll('video').forEach((v,i)=>v.cancelVideoFrameCallback(window.__videoCallbacks[i]));const frames=window.__frameTimes.slice(1).sort((a,b)=>a-b);return{renders:window.__renderCount-window.__renderStart,rafFrames:frames.length,p95Ms:frames[Math.floor(frames.length*.95)],videos:[...document.querySelectorAll('video')].map((v,i)=>{const q=v.getVideoPlaybackQuality(),s=window.__videoStart[i];return{total:q.totalVideoFrames-s.total,dropped:q.droppedVideoFrames-s.dropped,presented:window.__presented[i],paused:v.paused,ended:v.ended,readyState:v.readyState,currentTime:v.currentTime};})};});
      const perfAfter=(await cdp.send('Performance.getMetrics')).metrics;
      const metrics={};for(const key of ['LayoutCount','RecalcStyleCount','LayoutDuration','RecalcStyleDuration','TaskDuration'])metrics[key]=perfAfter.find(m=>m.name===key).value-perfBefore.find(m=>m.name===key).value;
      measures.push({mode,elapsed,...sample,metrics});
    }
    await page.screenshot({path:path.join(__dirname,`${stage}-escritorio.png`)});
    await page.locator('[data-theme-toggle]').click();await page.waitForTimeout(2200);
    const lightStart=await page.evaluate(()=>window.__renderCount);await page.waitForTimeout(2000);
    const light=await page.evaluate(start=>({theme:document.documentElement.dataset.theme,renders:window.__renderCount-start}),lightStart);
    await page.setViewportSize({width:390,height:844});await page.waitForTimeout(1000);
    const mobileStart=await page.evaluate(()=>window.__renderCount);await page.waitForTimeout(1000);
    const mobile=await page.evaluate(start=>({renders:window.__renderCount-start,display:getComputedStyle(canvas).display,overflow:document.documentElement.scrollWidth>innerWidth}),mobileStart);
    await page.setViewportSize({width:1440,height:900});await page.locator('[data-theme-toggle]').click();await page.waitForTimeout(2200);
    const resumeStart=await page.evaluate(()=>window.__renderCount);await page.waitForTimeout(1000);
    const resumed=await page.evaluate(start=>({theme:document.documentElement.dataset.theme,renders:window.__renderCount-start,display:getComputedStyle(canvas).display}),resumeStart);
    const browserCdp=await browser.newBrowserCDPSession();
    const gpu=(await browserCdp.send('SystemInfo.getInfo')).gpu;
    const result={stage,config,measures,light,mobile,resumed,errors,gpu:{devices:gpu.devices,featureStatus:gpu.featureStatus}};
    fs.writeFileSync(path.join(__dirname,`${stage}.json`),JSON.stringify(result,null,2));
    console.log(JSON.stringify(result,null,2));
  } finally { await browser.close();server.close(); }
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
