"use strict";

(() => {
  const $ = (selector) => document.querySelector(selector);
  const logoRoot = $(".brand-svg");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const duration = 9800;
  const ease = "cubic-bezier(.16, 1, .3, 1)";
  let sequence = [];
  let ambient = [];
  let paused = false;
  let completed = false;
  let generation = 0;
  let initialized = false;
  let controlsTimer;

  const revealControls = () => {
    $(".intro").classList.add("controls-visible");
    clearTimeout(controlsTimer);
    controlsTimer = setTimeout(() => $(".intro").classList.remove("controls-visible"), 1800);
  };

  const animate = (element, frames, options, loop = false) => {
    if (!element) return;
    const animation = element.animate(frames, { duration: 1400, easing: ease, fill: "both", ...options });
    (loop ? ambient : sequence).push(animation);
    animation.finished.catch(() => {});
    return animation;
  };

  const syncControls = () => {
    $(".intro").classList.toggle("is-playing", !completed && !paused);
    $("[data-pause]").setAttribute("aria-pressed", String(paused));
    $("[data-pause]").setAttribute("aria-label", paused ? "Reanudar intro" : "Pausar intro");
    $("[data-pause-symbol]").setAttribute("d", paused ? "M8 5l10 7-10 7Z" : "M9 5v14M15 5v14");
    $("[data-pause]").disabled = reducedMotion.matches;
    $("[data-skip]").disabled = completed;
    $("[data-status]").textContent = reducedMotion.matches ? "Movimiento reducido" : paused ? "En pausa" : completed ? "Una nueva perspectiva" : "Todo comienza en el horizonte";
  };

  const startAmbient = () => {
    if (reducedMotion.matches) return;
    animate($(".sky-light"), [{opacity:.7},{opacity:1},{opacity:.7}], {duration:11000,easing:"ease-in-out",iterations:Infinity}, true);
    animate($(".brand-halo"), [{opacity:.35},{opacity:.75},{opacity:.35}], {duration:9500,easing:"ease-in-out",iterations:Infinity}, true);
    if (document.hidden || paused) ambient.forEach(a => a.pause());
  };

  const finish = () => {
    if (completed) return;
    completed = true;
    paused = false;
    sequence.forEach(a => a.finish());
    startAmbient();
    syncControls();
  };

  const play = () => {
    const run = ++generation;
    [...sequence, ...ambient].forEach(a => a.cancel());
    sequence = [];
    ambient = [];
    paused = false;
    completed = false;
    clearTimeout(controlsTimer);
    $(".intro").classList.remove("controls-visible");

    animate($(".horizon"), [{opacity:0,transform:"translateY(5%) scale(1.07)"},{opacity:1,transform:"translateY(0) scale(1)"}], {duration:5200,easing:"cubic-bezier(.22,.6,.25,1)"});
    animate($(".sky-light"), [{opacity:0},{opacity:1}], {delay:300,duration:4700});
    animate($(".stars"), [{opacity:0},{opacity:.5}], {delay:1900,duration:3500});
    animate($(".sunrise"), [{opacity:0,transform:"translateX(-50%) scaleX(.1)"},{opacity:.48,offset:.45},{opacity:0,transform:"translateX(-50%) scaleX(1.3)"}], {delay:1200,duration:4200});
    animate($(".brand"), [{opacity:0,transform:"translateY(12px) scale(.965)"},{opacity:1,transform:"translateY(0) scale(1)"}], {delay:2100,duration:2600});
    animate($(".brand-halo"), [{opacity:0},{opacity:.8,offset:.55},{opacity:.35}], {delay:2600,duration:4200});
    // Same ellipse and coordinate space as the planet, including mobile crop.
    [ [".travel-aura",.06,.58], [".travel-tail",.045,.65], [".travel-head",.004,1] ].forEach(([selector,tail,peak]) => {
      animate($(selector), [{strokeDashoffset:tail},{strokeDashoffset:tail-1}], {delay:1350,duration:2450,easing:"cubic-bezier(.4,0,.2,1)"});
      animate($(selector), [{opacity:0},{opacity:peak,offset:.2},{opacity:peak,offset:.8},{opacity:0}], {delay:1350,duration:2650,easing:"ease-in-out"});
    });

    if (logoRoot) {
      const dots = [...logoRoot.querySelectorAll(".logo-dot")];
      dots.forEach((dot) => {
        // Keep the original opacity differences between the three dot rings.
        const opacity = Number(getComputedStyle(dot).opacity);
        const angle = (Math.atan2(Number(dot.getAttribute("cy"))-300, Number(dot.getAttribute("cx"))-181)+Math.PI*2.5)%(Math.PI*2);
        const radius = Math.hypot(Number(dot.getAttribute("cx"))-181, Number(dot.getAttribute("cy"))-300);
        const ring = Math.max(0, Math.round((radius-48)/12));
        animate(dot, [{opacity:0,transform:"scale(.35)"},{opacity,transform:"scale(1)"}], {delay:2150+angle/(Math.PI*2)*1000+ring*120,duration:1250});
      });
      animate(logoRoot.querySelector("#emblem-letter-t"), [{opacity:0},{opacity:1}], {delay:2850,duration:1600});
      const letters = [...logoRoot.querySelectorAll("#wordmark path")];
      letters.forEach((letter,index) => animate(letter,[{opacity:0,transform:"translateY(9px)"},{opacity:1,transform:"translateY(0)"}],{delay:3150+index*82,duration:1750}));
      const line = logoRoot.querySelector("#accent-line");
      if(line){const length=line.getTotalLength();animate(line,[{strokeDasharray:`${length}`,strokeDashoffset:length,opacity:0},{strokeDasharray:`${length}`,strokeDashoffset:0,opacity:1}],{delay:4050,duration:2100,easing:"cubic-bezier(.65,0,.35,1)"});}
      animate(logoRoot.querySelector("#word-solutions"), [{fill:"#004aad"},{fill:"#79aaff",offset:.45},{fill:"#004aad"}], {delay:3150,duration:3200,easing:"ease-in-out"});
      animate(logoRoot.querySelector("#intro-sheen"), [{opacity:0},{opacity:.6,offset:.25},{opacity:.6,offset:.75},{opacity:0}], {delay:6200,duration:1200,easing:"ease-in-out"});
      animate(logoRoot.querySelector("#intro-sheen-band"), [{transform:"translateX(0)"},{transform:"translateX(1200px)"}], {delay:6200,duration:1200,easing:"cubic-bezier(.4,0,.25,1)"});
    }
    const timer = animate($(".progress-fill"), [{transform:"scaleX(0)"},{transform:"scaleX(1)"}], {duration,easing:"linear"});
    timer.finished.then(() => {if(run === generation) finish();}).catch(() => {});
    syncControls();
    if (reducedMotion.matches) finish();
    else if(document.hidden) [...sequence,...ambient].forEach(a=>a.pause());
  };

  const initialize = () => {
    if(initialized) return;
    initialized = true;
    // Inline SVG shares this document, including when opened through file://.
    if (logoRoot) {
      // Explicit clip shapes also work in browsers that restrict <use> of a
      // container inside clipPath. These copies are static and do not animate.
      const clip = logoRoot.querySelector("#intro-logo-silhouette");
      const shapes = [...logoRoot.querySelectorAll("#technova-solutions-logo circle, #technova-solutions-logo path:not(.logo-accent)")];
      clip?.replaceChildren(...shapes.map(shape => {
        const copy = shape.cloneNode(false);
        ["id", "class", "style", "opacity"].forEach(attribute => copy.removeAttribute(attribute));
        return copy;
      }));
    }
    play();
  };

  initialize();
  $("[data-replay]").addEventListener("click", () => {if(initialized)play();});
  $("[data-skip]").addEventListener("click", finish);
  $("[data-pause]").addEventListener("click", () => {
    paused = !paused;
    [...sequence,...ambient].forEach(a=>{if(paused)a.pause();else if(a.playState!=="finished")a.play();});
    syncControls();
  });
  $("[data-fullscreen]").hidden = !document.fullscreenEnabled;
  $("[data-fullscreen]").addEventListener("click", async () => {
    try {if(document.fullscreenElement)await document.exitFullscreen();else await $(".intro").requestFullscreen();}
    catch {$("[data-status]").textContent="Pantalla completa no disponible";}
  });
  document.addEventListener("fullscreenchange",()=>$("[data-fullscreen]").setAttribute("aria-label",document.fullscreenElement?"Salir de pantalla completa":"Pantalla completa"));
  document.addEventListener("visibilitychange",()=>{
    [...sequence,...ambient].forEach(a=>{if(a.playState==="finished")return;if(document.hidden)a.pause();else if(!paused)a.play();});
  });
  reducedMotion.addEventListener("change",()=>{if(initialized)play();});
  $(".intro").addEventListener("pointermove", revealControls, {passive:true});
  $(".intro").addEventListener("pointerdown", revealControls, {passive:true});
  $(".intro").addEventListener("focusin", revealControls);
})();
