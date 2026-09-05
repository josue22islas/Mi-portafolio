// Tubes Cursor by Kevin Levron (@soju22).
// Original Pen: https://codepen.io/soju22/pen/qEbdVjK
// The referenced Pen declares CC BY-NC-SA 4.0.

const canvas = document.querySelector(".hero__tubes-cursor");
const desktopPointer = window.matchMedia(
  "(min-width: 821px) and (hover: hover) and (pointer: fine)"
);
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let tubesInitialized = false;
let tubesApp;
let cursorActive = false;

const shouldRenderCursor = () => Boolean(
  canvas && desktopPointer.matches && !reducedMotion.matches
  && !document.hidden && document.documentElement.dataset.theme === "dark"
);

const syncCursorVisibility = () => {
  cursorActive = shouldRenderCursor();
  if (!canvas) return;
  // The library observes intersection to stop its loop. display:none also
  // prevents its inline display:block from keeping a hidden mobile canvas alive.
  canvas.style.display = cursorActive ? "" : "none";
};

const randomColors = (count) =>
  new Array(count)
    .fill(0)
    .map(() => `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`);

const randomizeTubes = () => {
  if (!tubesApp || !cursorActive) return;

  tubesApp.tubes.setColors(randomColors(3));
  tubesApp.tubes.setLightsColors(randomColors(4));
};

const initializeTubesCursor = async () => {
  syncCursorVisibility();
  if (!cursorActive || tubesInitialized) return;

  tubesInitialized = true;

  try {
    const { default: TubesCursor } = await import(
      "https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js"
    );

    if (!shouldRenderCursor()) {
      tubesInitialized = false;
      return;
    }

    tubesApp = TubesCursor(canvas, {
      tubes: {
        colors: ["#f967fb", "#53bc28", "#6958d5"],
        lights: {
          intensity: 200,
          colors: ["#83f36e", "#fe8a2e", "#ff008a", "#60aed5"],
        },
      },
    });

    // Keep the original renderer, resolution, geometry and bloom settings.
    // Guard callbacks while intersection/visibility observers stop the loop.
    const three = tubesApp.three;
    const update = three.onBeforeRender;
    const render = three.render;
    three.onBeforeRender = function (time) {
      if (cursorActive) update.call(this, time);
    };
    three.render = function (...args) {
      if (cursorActive) return render.apply(this, args);
    };
    syncCursorVisibility();
    canvas.classList.add("is-ready");
    document.body.addEventListener("click", randomizeTubes);
  } catch (error) {
    tubesInitialized = false;
    canvas.classList.remove("is-ready");
    console.warn("No fue posible cargar el efecto de tubos 3D.", error);
  }
};

initializeTubesCursor();
desktopPointer.addEventListener("change", initializeTubesCursor);
reducedMotion.addEventListener("change", initializeTubesCursor);
document.addEventListener("visibilitychange", initializeTubesCursor);
new MutationObserver(initializeTubesCursor).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["data-theme"],
});
