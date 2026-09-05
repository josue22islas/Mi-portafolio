const {chromium}=require('C:/Users/josue/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end();return;}res.writeHead(200,{'Content-Type':({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream'});res.end(data);});});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});try{
const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(`http://127.0.0.1:${server.address().port}/`);await page.waitForTimeout(3900);await page.screenshot({path:path.join(__dirname,'01-aparicion.png')});

const inspectLetters=()=>{const letters=[...document.querySelectorAll('.brand-svg #wordmark path')];return {count:letters.length,animated:letters.filter(el=>el.getAnimations().length>0).length,first:Number(getComputedStyle(letters[0]).opacity),last:Number(getComputedStyle(letters.at(-1)).opacity)};};
const httpLetters=await page.evaluate(inspectLetters);

await page.evaluate(()=>document.getAnimations().forEach(a=>{a.currentTime=6750;}));
await page.screenshot({path:path.join(__dirname,'04-reflejo.png')});
await page.evaluate(()=>document.getAnimations().forEach(a=>{a.currentTime=3900;}));
await page.waitForTimeout(6400);await page.screenshot({path:path.join(__dirname,'02-final-escritorio.png')});
const end=await page.evaluate(()=>({status:document.querySelector('[data-status]').textContent,skip:document.querySelector('[data-skip]').disabled,logoParts:document.querySelectorAll('.brand-svg #wordmark path').length,logoOpacity:getComputedStyle(document.querySelector('.brand')).opacity}));
await page.locator('[data-replay]').click();await page.waitForTimeout(2800);
const controlsHidden=await page.locator('.preview-footer').evaluate(el=>getComputedStyle(el).opacity==='0');
await page.keyboard.press('Tab');await page.waitForTimeout(650);
const keyboardControlsVisible=await page.locator('.preview-footer').evaluate(el=>getComputedStyle(el).opacity==='1');
await page.mouse.move(720,700);await page.locator('[data-pause]').click();await page.evaluate(()=>Promise.all(document.getAnimations().map(a=>a.ready)));
const pauseBefore=await page.evaluate(()=>document.querySelector('.brand').getAnimations()[0].currentTime);await page.waitForTimeout(450);const pauseAfter=await page.evaluate(()=>document.querySelector('.brand').getAnimations()[0].currentTime);
await page.locator('[data-pause]').click();await page.waitForTimeout(200);await page.locator('[data-skip]').click();
const skip=await page.locator('[data-skip]').isDisabled();
await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(__dirname,'03-final-movil.png')});
const mobile=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,logo:(()=>{const r=document.querySelector('.brand').getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height};})()}));
await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(150);const reduce=await page.evaluate(()=>({status:document.querySelector('[data-status]').textContent,animations:document.getAnimations().filter(a=>a.playState==='running').length,logoOpacity:getComputedStyle(document.querySelector('.brand')).opacity}));
const local=await browser.newPage({viewport:{width:1440,height:900}});
local.on('pageerror',e=>errors.push(e.message));
await local.goto(require('node:url').pathToFileURL(path.join(root,'index.html')).href);
await local.waitForTimeout(3900);
const fileLetters=await local.evaluate(inspectLetters);
await local.screenshot({path:path.join(__dirname,'05-aparicion-archivo-local.png')});
const individualAnimationPassed=[httpLetters,fileLetters].every(r=>r.count===18&&r.animated===18&&r.first>r.last);
await local.close();
const result={httpLetters,fileLetters,individualAnimationPassed,end,controlsHidden,keyboardControlsVisible,pause:{before:pauseBefore,after:pauseAfter,passed:pauseBefore===pauseAfter},skip,mobile,reduce,errors};fs.writeFileSync(path.join(__dirname,'resultados.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
if(!individualAnimationPassed||errors.length||!controlsHidden||!keyboardControlsVisible||end.logoParts!==18||!result.pause.passed||!skip||mobile.overflow||reduce.animations!==0)process.exitCode=1;
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
