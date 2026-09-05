"use strict";

(() => {
  const root = document.documentElement;
  const languageButton = document.querySelector("[data-language-toggle]");
  const languageIcon = document.querySelector("[data-language-icon]");
  const themeButton = document.querySelector("[data-theme-toggle]");
  const themeIcon = document.querySelector("[data-theme-icon]");
  const preferenceKeys = {
    language: "portfolio-language",
    theme: "portfolio-theme",
  };
  const translations = {
    es: {
      "meta.title": "Josue Islas | Desarrollador",
      "meta.description": "Portafolio profesional de Josue Islas, desarrollador web y móvil.",
      "brand.home": "Ir al inicio",
      "preferences.label": "Preferencias del sitio",
      "language.current": "Español",
      "language.toggle": "Cambiar idioma a inglés",
      "theme.dark": "Oscuro",
      "theme.light": "Claro",
      "theme.toDark": "Cambiar al tema oscuro",
      "theme.toLight": "Cambiar al tema claro",
      "hero.greeting": "Hola, ",
      "hero.identity": "soy josue",
      "hero.typewriterInitial": "Hola, soy josue islas",
      "hero.typewriterWelcome": "Bienvenido a mi portafolio web",
      "hero.role": "Desarrollador Junior",
      "hero.summary": "Desarrollador Junior con experiencia en el diseño y desarrollo de aplicaciones web y móviles, utilizando tecnologías front-end, back-end y IA. Apasionado por construir soluciones interactivas, funcionales y eficientes que combinen tecnología y experiencia de usuario.",
      "actions.label": "Enlaces profesionales",
      "actions.githubLabel": "Visitar el perfil de GitHub de Josue Islas",
      "actions.linkedinLabel": "Visitar el perfil de LinkedIn de Josue Islas",
      "actions.cvLabel": "Descargar el currículum de Josue Islas",
      "actions.cv": "Descargar CV",
      "actions.aboutLabel": "Ir a la sección Sobre mí",
      "actions.about": "Sobre mí",
      "orbit.caption": "Tecnologías y herramientas que forman parte de mi experiencia.",
      "about.title": "Sobre mí",
    },
    en: {
      "meta.title": "Josue Islas | Developer",
      "meta.description": "Professional portfolio of Josue Islas, web and mobile developer.",
      "brand.home": "Go to home",
      "preferences.label": "Site preferences",
      "language.current": "English",
      "language.toggle": "Switch language to Spanish",
      "theme.dark": "Dark",
      "theme.light": "Light",
      "theme.toDark": "Switch to dark theme",
      "theme.toLight": "Switch to light theme",
      "hero.greeting": "Hello, ",
      "hero.identity": "I'm josue",
      "hero.typewriterInitial": "Hello, I'm josue islas",
      "hero.typewriterWelcome": "Welcome to my web portfolio",
      "hero.role": "Junior Developer",
      "hero.summary": "Junior Developer with experience designing and building web and mobile applications using front-end and back-end technologies. Passionate about creating interactive, functional, and efficient solutions that combine technology with user experience.",
      "actions.label": "Professional links",
      "actions.githubLabel": "Visit Josue Islas' GitHub profile",
      "actions.linkedinLabel": "Visit Josue Islas' LinkedIn profile",
      "actions.cvLabel": "Download Josue Islas' résumé",
      "actions.cv": "Download CV",
      "actions.aboutLabel": "Go to the About me section",
      "actions.about": "About me",
      "orbit.caption": "Technologies and tools that are part of my experience.",
      "about.title": "About me",
    },
  };

  const getStoredPreference = (key, fallback) => {
    try {
      return window.localStorage.getItem(key) || fallback;
    } catch {
      return fallback;
    }
  };

  const storePreference = (key, value) => {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // The preference still works for the current session.
    }
  };

  let currentLanguage = getStoredPreference(preferenceKeys.language, "es");
  let currentTheme = getStoredPreference(preferenceKeys.theme, "dark");

  if (!translations[currentLanguage]) currentLanguage = "es";
  if (!["dark", "light"].includes(currentTheme)) currentTheme = "dark";

  const translate = (key) => translations[currentLanguage][key] || key;

  const applyTheme = (theme, persist = true) => {
    currentTheme = theme === "light" ? "light" : "dark";
    root.dataset.theme = currentTheme;

    const isDark = currentTheme === "dark";
    themeButton?.setAttribute("aria-pressed", String(isDark));
    themeButton?.setAttribute(
      "aria-label",
      translate(isDark ? "theme.toLight" : "theme.toDark")
    );

    const themeLabel = themeButton?.querySelector("[data-theme-label]");
    if (themeLabel) {
      themeLabel.textContent = translate(isDark ? "theme.dark" : "theme.light");
    }

    if (themeIcon) {
      themeIcon.src = isDark
        ? "assets/images/theme-dark.svg"
        : "assets/images/theme-light.svg";
    }

    if (persist) storePreference(preferenceKeys.theme, currentTheme);
  };

  const applyLanguage = (language, persist = true) => {
    currentLanguage = translations[language] ? language : "es";
    root.lang = currentLanguage;

    document.querySelectorAll("[data-i18n]").forEach((element) => {
      element.textContent = translate(element.dataset.i18n);
    });

    document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
      element.setAttribute("aria-label", translate(element.dataset.i18nAriaLabel));
    });

    document.title = translate("meta.title");
    document.querySelector('meta[name="description"]')?.setAttribute(
      "content",
      translate("meta.description")
    );

    languageButton?.setAttribute("aria-label", translate("language.toggle"));
    languageButton?.setAttribute("aria-pressed", String(currentLanguage === "en"));

    if (languageIcon) {
      languageIcon.src = currentLanguage === "es"
        ? "assets/images/language-mx.png"
        : "assets/images/language-us.svg";
    }

    applyTheme(currentTheme, false);
    if (persist) storePreference(preferenceKeys.language, currentLanguage);
  };

  languageButton?.addEventListener("click", () => {
    applyLanguage(currentLanguage === "es" ? "en" : "es");

    if (root.classList.contains("motion-settled") || reducedMotion.matches) {
      startHeroTypewriter();
    } else {
      prepareHeroTypewriterInitial();
    }
  });

  themeButton?.addEventListener("click", () => {
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    startThemeTransition(nextTheme);
  });

  applyLanguage(currentLanguage, false);
  applyTheme(currentTheme, false);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const desktopPointer = window.matchMedia(
    "(min-width: 821px) and (hover: hover) and (pointer: fine)"
  );
  const cometMotionViewport = window.matchMedia("(min-width: 821px)");
  const blackHoleVideo = document.querySelector(".hero__background-video--overlay");
  const blackHoleTint = document.querySelector(".hero__background-tint--overlay");
  const siteHeader = document.querySelector(".site-header");
  const heroTitle = document.querySelector("#hero-title");
  const typewriterPrefix = document.querySelector("[data-typewriter-prefix]");
  const typewriterAccent = document.querySelector("[data-typewriter-accent]");
  const typewriterTail = document.querySelector("[data-typewriter-tail]");
  const typewriterBreak = document.querySelector("[data-typewriter-break]");
  const heroRole = document.querySelector(".hero__role");
  const heroDescription = document.querySelector(".hero__summary > p:last-child");
  const heroActionLinks = [...document.querySelectorAll(".hero__action-row a")];
  const orbitFigure = document.querySelector(".technology-orbit");
  const orbitShell = document.querySelector(".orbit-motion-shell");
  const orbitVisual = document.querySelector(".technology-orbit__visual");
  const orbitIntroLayers = [
    document.querySelector(".orbit-system--outer"),
    document.querySelector(".orbit-system--inner"),
    document.querySelector(".orbit-core"),
  ].filter(Boolean);
  const technologyNodes = [...document.querySelectorAll(".technology-node")];
  const cometSystems = orbitFigure
    ? [...orbitFigure.querySelectorAll(".orbit-system")]
        .map((system) => ({
          head: system.querySelector(".orbit-comet__head"),
          nodes: [...system.querySelectorAll(".technology-node")],
        }))
        .filter(({ head, nodes }) => head && nodes.length)
    : [];
  const cometGlowMinimumMs = 240;
  const cometNodeStates = new WeakMap(
    technologyNodes.map((node) => [node, { isTouching: false, visibleUntil: 0 }])
  );
  let entranceTimeline;
  let blackHoleIntro;
  let themeViewTransition;
  let typewriterTimeline;
  let orbitFrame;
  let orbitSpeedFrame;
  let orbitProximityFrame;
  let cometCollisionFrame;
  let lastCometCollisionTime = 0;
  let orbitPointerX = 0;
  let orbitPointerY = 0;
  let orbitPlaybackRate = 1;
  let orbitTargetPlaybackRate = 1;

  const orbitMotion = {
    currentX: 0,
    currentY: 0,
    targetX: 0,
    targetY: 0,
  };

  const renderOrbitDepth = () => {
    const ease = 0.12;

    orbitMotion.currentX += (orbitMotion.targetX - orbitMotion.currentX) * ease;
    orbitMotion.currentY += (orbitMotion.targetY - orbitMotion.currentY) * ease;

    orbitShell.style.setProperty("--orbit-tilt-x", `${-orbitMotion.currentY * 2.6}deg`);
    orbitShell.style.setProperty("--orbit-tilt-y", `${orbitMotion.currentX * 3.4}deg`);
    orbitShell.style.setProperty("--orbit-shift-x", `${orbitMotion.currentX * 3}px`);
    orbitShell.style.setProperty("--orbit-shift-y", `${orbitMotion.currentY * 2}px`);
    orbitShell.style.setProperty("--orbit-outer-x", `${orbitMotion.currentX * -4.5}px`);
    orbitShell.style.setProperty("--orbit-outer-y", `${orbitMotion.currentY * -3}px`);
    orbitShell.style.setProperty("--orbit-outer-z", "-12px");
    orbitShell.style.setProperty("--orbit-inner-x", `${orbitMotion.currentX * 2.5}px`);
    orbitShell.style.setProperty("--orbit-inner-y", `${orbitMotion.currentY * 2}px`);
    orbitShell.style.setProperty("--orbit-inner-z", "8px");
    orbitShell.style.setProperty("--orbit-core-x", `${orbitMotion.currentX * 5}px`);
    orbitShell.style.setProperty("--orbit-core-y", `${orbitMotion.currentY * 4}px`);
    orbitShell.style.setProperty("--orbit-core-z", "20px");
    orbitShell.style.setProperty("--orbit-glow-x", `${50 + orbitMotion.currentX * 14}%`);
    orbitShell.style.setProperty("--orbit-glow-y", `${50 + orbitMotion.currentY * 11}%`);

    const depthAmount = Math.min(1, Math.hypot(orbitMotion.currentX, orbitMotion.currentY));
    orbitShell.style.setProperty("--orbit-outer-blur", `${depthAmount * 0.34}px`);
    orbitShell.style.setProperty("--orbit-inner-blur", `${depthAmount * 0.1}px`);

    const distance = Math.max(
      Math.abs(orbitMotion.targetX - orbitMotion.currentX),
      Math.abs(orbitMotion.targetY - orbitMotion.currentY)
    );

    if (distance > 0.002) {
      orbitFrame = window.requestAnimationFrame(renderOrbitDepth);
      return;
    }

    orbitMotion.currentX = orbitMotion.targetX;
    orbitMotion.currentY = orbitMotion.targetY;
    orbitFrame = undefined;

    if (orbitMotion.targetX === 0 && orbitMotion.targetY === 0) {
      resetOrbitDepth(true);
    }
  };

  const requestOrbitDepthFrame = () => {
    if (!orbitFrame) {
      orbitFrame = window.requestAnimationFrame(renderOrbitDepth);
    }
  };

  const resetOrbitDepth = (immediate = false) => {
    orbitMotion.targetX = 0;
    orbitMotion.targetY = 0;

    if (!orbitShell) return;

    if (immediate) {
      window.cancelAnimationFrame(orbitFrame);
      orbitFrame = undefined;
      orbitMotion.currentX = 0;
      orbitMotion.currentY = 0;
      orbitShell.classList.remove("orbit-depth-active");
      orbitShell.style.removeProperty("--orbit-tilt-x");
      orbitShell.style.removeProperty("--orbit-tilt-y");
      orbitShell.style.removeProperty("--orbit-shift-x");
      orbitShell.style.removeProperty("--orbit-shift-y");
      orbitShell.style.removeProperty("--orbit-outer-x");
      orbitShell.style.removeProperty("--orbit-outer-y");
      orbitShell.style.removeProperty("--orbit-outer-z");
      orbitShell.style.removeProperty("--orbit-inner-x");
      orbitShell.style.removeProperty("--orbit-inner-y");
      orbitShell.style.removeProperty("--orbit-inner-z");
      orbitShell.style.removeProperty("--orbit-core-x");
      orbitShell.style.removeProperty("--orbit-core-y");
      orbitShell.style.removeProperty("--orbit-core-z");
      orbitShell.style.removeProperty("--orbit-glow-x");
      orbitShell.style.removeProperty("--orbit-glow-y");
      orbitShell.style.removeProperty("--orbit-outer-blur");
      orbitShell.style.removeProperty("--orbit-inner-blur");
      return;
    }

    requestOrbitDepthFrame();
  };

  const getRotationalAnimations = () => {
    if (!orbitFigure) return [];

    return orbitFigure.getAnimations({ subtree: true }).filter((animation) =>
      /orbit-(?:spin|icon-(?:clockwise|counterclockwise))/.test(animation.animationName)
    );
  };

  const renderOrbitSpeed = () => {
    orbitPlaybackRate += (orbitTargetPlaybackRate - orbitPlaybackRate) * 0.1;

    getRotationalAnimations().forEach((animation) => {
      animation.updatePlaybackRate(orbitPlaybackRate);
    });

    if (Math.abs(orbitTargetPlaybackRate - orbitPlaybackRate) > 0.001) {
      orbitSpeedFrame = window.requestAnimationFrame(renderOrbitSpeed);
      return;
    }

    orbitPlaybackRate = orbitTargetPlaybackRate;
    getRotationalAnimations().forEach((animation) => {
      animation.updatePlaybackRate(orbitPlaybackRate);
    });
    orbitSpeedFrame = undefined;
  };

  const setOrbitSpeed = (rate, immediate = false) => {
    orbitTargetPlaybackRate = rate;

    if (immediate) {
      window.cancelAnimationFrame(orbitSpeedFrame);
      orbitSpeedFrame = undefined;
      orbitPlaybackRate = rate;
      getRotationalAnimations().forEach((animation) => {
        animation.updatePlaybackRate(rate);
      });
      return;
    }

    if (!orbitSpeedFrame) {
      orbitSpeedFrame = window.requestAnimationFrame(renderOrbitSpeed);
    }
  };

  const engageOrbit = () => {
    if (!desktopPointer.matches || reducedMotion.matches) return;
    orbitFigure?.classList.add("orbit-engaged");
    setOrbitSpeed(1.08);
  };

  const releaseOrbit = () => {
    orbitFigure?.classList.remove("orbit-engaged");
    setOrbitSpeed(1);
  };

  const clearOrbitProximity = () => {
    technologyNodes.forEach((node) => node.classList.remove("is-near"));
  };

  const renderOrbitProximity = () => {
    orbitProximityFrame = undefined;

    if (!desktopPointer.matches || reducedMotion.matches) {
      clearOrbitProximity();
      return;
    }

    let nearestNode;
    let nearestDistance = 72;

    technologyNodes.forEach((node) => {
      const bounds = node.getBoundingClientRect();
      const distance = Math.hypot(
        orbitPointerX - (bounds.left + bounds.width / 2),
        orbitPointerY - (bounds.top + bounds.height / 2)
      );

      node.classList.remove("is-near");

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestNode = node;
      }
    });

    nearestNode?.classList.add("is-near");
  };

  const trackOrbitProximity = (event) => {
    orbitPointerX = event.clientX;
    orbitPointerY = event.clientY;

    if (!orbitProximityFrame) {
      orbitProximityFrame = window.requestAnimationFrame(renderOrbitProximity);
    }
  };

  const trackOrbitDepth = (event) => {
    if (
      !orbitShell ||
      !desktopPointer.matches ||
      reducedMotion.matches ||
      !root.classList.contains("motion-settled")
    ) {
      return;
    }

    const bounds = orbitShell.getBoundingClientRect();
    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;
    const rangeX = Math.max(window.innerWidth * 0.5, bounds.width);
    const rangeY = Math.max(window.innerHeight * 0.5, bounds.height);

    orbitMotion.targetX = Math.max(-1, Math.min(1, (event.clientX - centerX) / rangeX));
    orbitMotion.targetY = Math.max(-1, Math.min(1, (event.clientY - centerY) / rangeY));
    orbitShell.classList.add("orbit-depth-active");
    requestOrbitDepthFrame();
  };

  const clearCometHits = () => {
    technologyNodes.forEach((node) => {
      const state = cometNodeStates.get(node);

      node.classList.remove(
        "is-comet-hit",
        "is-comet-glowing",
        "is-orbit-back",
        "is-orbit-front"
      );

      if (state) {
        state.isTouching = false;
        state.visibleUntil = 0;
      }
    });

  };

  const getCometHeadPosition = (head) => {
    if (
      typeof head.getPointAtLength !== "function" ||
      typeof head.getScreenCTM !== "function"
    ) {
      return null;
    }

    const matrix = head.getScreenCTM();
    if (!matrix) return null;

    const point = head.getPointAtLength(0);
    const x = matrix.a * point.x + matrix.c * point.y + matrix.e;
    const y = matrix.b * point.x + matrix.d * point.y + matrix.f;

    return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null;
  };

  const canTrackCometCollisions = () =>
    Boolean(
      orbitFigure &&
        cometSystems.length &&
        cometMotionViewport.matches &&
        !document.hidden &&
        !reducedMotion.matches &&
        !orbitFigure.classList.contains("orbit-offscreen")
    );

  const renderCometCollisions = (timestamp) => {
    cometCollisionFrame = undefined;

    if (!canTrackCometCollisions()) {
      clearCometHits();
      return;
    }

    if (timestamp - lastCometCollisionTime >= 30) {
      lastCometCollisionTime = timestamp;
      const orbitBounds = orbitFigure.getBoundingClientRect();
      const orbitCenterY = orbitBounds.top + orbitBounds.height / 2;

      // Finish geometry reads for both rings before any class changes. This
      // avoids forcing a new style/layout pass between consecutive icons.
      const measuredSystems = cometSystems.map(({ head, nodes }) => ({
        cometPosition: getCometHeadPosition(head),
        nodes: nodes.map((node) => ({ node, bounds: node.getBoundingClientRect() })),
      }));

      measuredSystems.forEach(({ cometPosition, nodes }) => {
        nodes.forEach(({ node, bounds }) => {
          const state = cometNodeStates.get(node);
          const centerX = bounds.left + bounds.width / 2;
          const centerY = bounds.top + bounds.height / 2;
          const depthRatio = (centerY - orbitCenterY) / Math.max(1, orbitBounds.height / 2);
          let isTouching = false;

          node.classList.toggle("is-orbit-back", depthRatio < -0.08);
          node.classList.toggle("is-orbit-front", depthRatio > 0.08);

          if (cometPosition) {
            const contactRadius = Math.max(
              10,
              Math.min(bounds.width, bounds.height) * 0.58 + 4
            );

            isTouching =
              Math.hypot(cometPosition.x - centerX, cometPosition.y - centerY) <=
              contactRadius;
          }

          node.classList.toggle("is-comet-hit", isTouching);

          if (!state) return;

          if (isTouching) {
            if (!state.isTouching) {
              state.visibleUntil = timestamp + cometGlowMinimumMs;
            }

            node.classList.add("is-comet-glowing");
          } else if (timestamp >= state.visibleUntil) {
            node.classList.remove("is-comet-glowing");
          }

          state.isTouching = isTouching;
        });
      });
    }

    cometCollisionFrame = window.requestAnimationFrame(renderCometCollisions);
  };

  const syncCometCollisions = () => {
    if (!canTrackCometCollisions()) {
      window.cancelAnimationFrame(cometCollisionFrame);
      cometCollisionFrame = undefined;
      lastCometCollisionTime = 0;
      clearCometHits();
      return;
    }

    if (!cometCollisionFrame) {
      cometCollisionFrame = window.requestAnimationFrame(renderCometCollisions);
    }
  };

  const resetHeroTypewriter = () => {
    typewriterTimeline?.kill();
    typewriterTimeline = undefined;
    heroTitle?.classList.remove("is-typing", "is-typewriter-glowing");
  };

  const renderHeroTypewriter = (text, visibleCharacters, mode) => {
    if (!typewriterPrefix || !typewriterAccent || !typewriterTail || !typewriterBreak) {
      return;
    }

    const visibleText = text.slice(0, Math.max(0, Math.min(text.length, visibleCharacters)));
    const firstSpace = text.indexOf(" ");
    const prefixEnd = firstSpace >= 0 ? firstSpace + 1 : text.length;
    const lastSpace = mode === "initial" ? text.lastIndexOf(" ") : -1;

    typewriterPrefix.textContent = visibleText.slice(0, prefixEnd);

    if (mode === "initial" && lastSpace > prefixEnd) {
      typewriterAccent.textContent = visibleText.slice(
        prefixEnd,
        Math.min(visibleText.length, lastSpace)
      );
      typewriterTail.textContent = visibleText.slice(lastSpace + 1);
      typewriterBreak.hidden = visibleText.length <= lastSpace + 1;
      return;
    }

    typewriterAccent.textContent = visibleText.slice(prefixEnd);
    typewriterTail.textContent = "";
    typewriterBreak.hidden = true;
  };

  const prepareHeroTypewriterInitial = () => {
    resetHeroTypewriter();
    const initialText = translate("hero.typewriterInitial");
    renderHeroTypewriter(initialText, initialText.length, "initial");
    heroTitle?.setAttribute("aria-label", initialText);
  };

  const showHeroTypewriterWelcome = () => {
    const welcomeText = translate("hero.typewriterWelcome");
    renderHeroTypewriter(welcomeText, welcomeText.length, "welcome");
    heroTitle?.setAttribute("aria-label", welcomeText);
  };

  const startHeroTypewriter = () => {
    prepareHeroTypewriterInitial();

    if (!heroTitle || !window.gsap || reducedMotion.matches) {
      showHeroTypewriterWelcome();
      return;
    }

    const initialText = translate("hero.typewriterInitial");
    const welcomeText = translate("hero.typewriterWelcome");
    const deleteInitialState = { count: initialText.length };
    const writeWelcomeState = { count: 0 };
    const deleteWelcomeState = { count: welcomeText.length };
    const writeInitialState = { count: 0 };
    const cycleClock = { step: 0 };

    heroTitle.classList.add("is-typing");
    typewriterTimeline = window.gsap.timeline({
      paused: true,
      repeat: -1,
      repeatDelay: 0.8,
    });

    const addCharacterTween = ({
      state,
      text,
      mode,
      targetCount,
      secondsPerCharacter,
      minimumDuration,
      position,
    }) => {
      typewriterTimeline.to(
        state,
        {
          count: targetCount,
          duration: Math.max(
            minimumDuration,
            Math.abs(targetCount - state.count) * secondsPerCharacter
          ),
          ease: "sine.inOut",
          onStart: () => {
            heroTitle.classList.add("is-typewriter-glowing");
          },
          onUpdate: () => {
            renderHeroTypewriter(text, Math.round(state.count), mode);
          },
          onComplete: () => {
            heroTitle.classList.remove("is-typewriter-glowing");
          },
        },
        position
      );
    };

    typewriterTimeline.to(cycleClock, { step: 1, duration: 2.5, ease: "none" });
    addCharacterTween({
      state: deleteInitialState,
      text: initialText,
      mode: "initial",
      targetCount: 0,
      secondsPerCharacter: 0.105,
      minimumDuration: 2.2,
    });
    typewriterTimeline.call(() => {
      renderHeroTypewriter(welcomeText, 0, "welcome");
    });
    addCharacterTween({
      state: writeWelcomeState,
      text: welcomeText,
      mode: "welcome",
      targetCount: welcomeText.length,
      secondsPerCharacter: 0.135,
      minimumDuration: 3,
      position: "+=0.7",
    });
    typewriterTimeline
      .call(() => {
        renderHeroTypewriter(welcomeText, welcomeText.length, "welcome");
        heroTitle.setAttribute("aria-label", welcomeText);
      })
      .to(cycleClock, { step: 2, duration: 3.4, ease: "none" });
    addCharacterTween({
      state: deleteWelcomeState,
      text: welcomeText,
      mode: "welcome",
      targetCount: 0,
      secondsPerCharacter: 0.105,
      minimumDuration: 2.4,
    });
    typewriterTimeline.call(() => {
      renderHeroTypewriter(initialText, 0, "initial");
    });
    addCharacterTween({
      state: writeInitialState,
      text: initialText,
      mode: "initial",
      targetCount: initialText.length,
      secondsPerCharacter: 0.125,
      minimumDuration: 2.5,
      position: "+=0.7",
    });
    typewriterTimeline.call(() => {
      renderHeroTypewriter(initialText, initialText.length, "initial");
      heroTitle.setAttribute("aria-label", initialText);
    });

    typewriterTimeline.play(0);
  };

  const entranceTargets = [
    siteHeader,
    heroTitle,
    heroRole,
    heroDescription,
    ...heroActionLinks,
    orbitVisual,
    ...orbitIntroLayers,
  ].filter(Boolean);

  const clearEntranceStyles = () => {
    entranceTargets.forEach((element) => {
      element.style.removeProperty("opacity");
      element.style.removeProperty("visibility");
      element.style.removeProperty("transform");
      element.style.removeProperty("filter");
      element.style.removeProperty("will-change");
    });
  };

  const resetEntranceMotion = () => {
    entranceTimeline?.kill();
    entranceTimeline = undefined;
    clearEntranceStyles();
  };

  const clearBlackHoleIntroStyles = () => {
    [blackHoleVideo, blackHoleTint].filter(Boolean).forEach((element) => {
      element.style.removeProperty("transform");
      element.style.removeProperty("will-change");
    });

    blackHoleVideo?.style.removeProperty("opacity");
  };

  const resetBlackHoleIntro = () => {
    blackHoleIntro?.kill();
    blackHoleIntro = undefined;
    clearBlackHoleIntroStyles();
  };

  const startBlackHoleIntro = () => {
    resetBlackHoleIntro();

    if (
      !window.gsap ||
      !blackHoleVideo ||
      reducedMotion.matches ||
      currentTheme !== "dark"
    ) {
      return;
    }

    const targets = [blackHoleVideo, blackHoleTint].filter(Boolean);
    const startOffset = -(window.innerHeight + Math.min(340, blackHoleVideo.offsetHeight * 0.55));

    blackHoleIntro = window.gsap.timeline({
      paused: true,
      defaults: { overwrite: "auto" },
    });

    blackHoleIntro
      .set(targets, {
        y: startOffset,
        willChange: "transform, opacity",
        force3D: true,
      })
      .set(blackHoleVideo, { opacity: 0 }, 0)
      .to(
        targets,
        {
          y: 0,
          duration: 1.7,
          ease: "power4.out",
          force3D: true,
        },
        0.08
      )
      .to(
        blackHoleVideo,
        {
          opacity: 0.6,
          duration: 1.05,
          ease: "power2.out",
        },
        0.24
      );

    blackHoleIntro.eventCallback("onComplete", () => {
      blackHoleIntro = undefined;
      clearBlackHoleIntroStyles();
    });
    blackHoleIntro.play(0);
  };

  const commitThemeChange = (nextTheme) => {
    applyTheme(nextTheme);

    if (nextTheme === "dark") {
      startBlackHoleIntro();
    } else {
      resetBlackHoleIntro();
    }
  };

  const startThemeTransition = (nextTheme) => {
    if (nextTheme === currentTheme || themeViewTransition) return;

    if (
      reducedMotion.matches ||
      !themeButton ||
      typeof document.startViewTransition !== "function"
    ) {
      commitThemeChange(nextTheme);
      return;
    }

    const iconBounds = themeIcon?.getBoundingClientRect();
    const buttonBounds = themeButton.getBoundingClientRect();
    const originBounds = iconBounds?.width && iconBounds?.height
      ? iconBounds
      : buttonBounds;
    const activeViewport = window.visualViewport;
    const viewportOffsetX = activeViewport?.offsetLeft || 0;
    const viewportOffsetY = activeViewport?.offsetTop || 0;
    const viewportWidth = activeViewport?.width || window.innerWidth;
    const viewportHeight = activeViewport?.height || window.innerHeight;
    const originX = originBounds.left + originBounds.width / 2 - viewportOffsetX;
    const originY = originBounds.top + originBounds.height / 2 - viewportOffsetY;
    const originRadius = Math.ceil(
      Math.hypot(originBounds.width, originBounds.height) / 2
    );
    const horizontalDistance = Math.max(originX, viewportWidth - originX);
    const verticalDistance = Math.max(originY, viewportHeight - originY);
    const radius = Math.ceil(Math.hypot(horizontalDistance, verticalDistance)) + 3;
    const viewportScale = Math.max(1, activeViewport?.scale || 1);
    const transitionScale = Math.max(
      1,
      (window.devicePixelRatio || 1) / viewportScale
    );
    const transitionOriginX = originX * transitionScale;
    const transitionOriginY = originY * transitionScale;
    const transitionOriginRadius = originRadius * transitionScale;
    const transitionRadius = radius * transitionScale;
    const transitionDuration = viewportWidth <= 560
      ? 760
      : viewportWidth <= 1120
        ? 840
        : 920;
    themeButton.classList.add("is-theme-switching");

    const cleanup = () => {
      themeButton.classList.remove("is-theme-switching");
      themeViewTransition = undefined;
    };

    themeViewTransition = document.startViewTransition(() => {
      commitThemeChange(nextTheme);
    });

    themeViewTransition.ready
      .then(() => root.animate(
        {
          clipPath: [
            `circle(${transitionOriginRadius}px at ${transitionOriginX}px ${transitionOriginY}px)`,
            `circle(${transitionRadius}px at ${transitionOriginX}px ${transitionOriginY}px)`,
          ],
        },
        {
          duration: transitionDuration,
          easing: "cubic-bezier(0.76, 0, 0.24, 1)",
          fill: "both",
          pseudoElement: "::view-transition-new(root)",
        }
      ))
      .catch(() => {
        // The theme is already applied; only the unsupported reveal is skipped.
      });

    themeViewTransition.finished.then(cleanup, cleanup);
  };

  const startEntrance = () => {
    prepareHeroTypewriterInitial();
    resetEntranceMotion();
    root.classList.remove("motion-enabled", "motion-entered", "motion-settled");

    if (reducedMotion.matches) {
      resetBlackHoleIntro();
      showHeroTypewriterWelcome();
      return;
    }

    startBlackHoleIntro();

    if (!window.gsap) {
      root.classList.add("motion-enabled", "motion-entered", "motion-settled");
      showHeroTypewriterWelcome();
      return;
    }

    root.classList.add("motion-enabled", "motion-entered");

    entranceTimeline = window.gsap.timeline({
      paused: true,
      defaults: { overwrite: "auto" },
    });

    entranceTimeline
      .set(entranceTargets, { willChange: "transform, opacity, filter" }, 0)
      .fromTo(
        siteHeader,
        { autoAlpha: 0, y: -18 },
        { autoAlpha: 1, y: 0, duration: 0.78, ease: "power3.out" },
        0.2
      )
      .fromTo(
        heroTitle,
        { autoAlpha: 0, y: 36, filter: "blur(8px)" },
        {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.92,
          ease: "power4.out",
        },
        0.42
      )
      .fromTo(
        heroRole,
        { autoAlpha: 0, y: 20, filter: "blur(5px)" },
        {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.72,
          ease: "power3.out",
        },
        0.72
      )
      .fromTo(
        heroDescription,
        { autoAlpha: 0, y: 20, filter: "blur(5px)" },
        {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.78,
          ease: "power3.out",
        },
        0.84
      )
      .fromTo(
        heroActionLinks,
        { autoAlpha: 0, y: 20, scale: 0.94 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.68,
          ease: "power3.out",
          stagger: 0.075,
        },
        0.98
      )
      .fromTo(
        orbitVisual,
        { autoAlpha: 0, scale: 0.88, rotation: -2.5, filter: "blur(7px)" },
        {
          autoAlpha: 1,
          scale: 1,
          rotation: 0,
          filter: "blur(0px)",
          duration: 1.12,
          ease: "power4.out",
        },
        0.92
      )
      .fromTo(
        orbitIntroLayers,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.82,
          ease: "sine.out",
          stagger: 0.12,
        },
        1.08
      );

    entranceTimeline.eventCallback("onComplete", () => {
      entranceTimeline = undefined;
      clearEntranceStyles();
      root.classList.add("motion-settled");
      syncCometCollisions();
      startHeroTypewriter();
    });
    entranceTimeline.play(0);
  };

  const syncVisibility = () => {
    root.classList.toggle("page-hidden", document.hidden);

    if (document.hidden) {
      resetOrbitDepth(true);
      setOrbitSpeed(1, true);
    }

    syncCometCollisions();
  };

  startEntrance();
  syncVisibility();

  document.addEventListener("visibilitychange", syncVisibility);
  orbitFigure?.addEventListener("pointerenter", engageOrbit);
  orbitFigure?.addEventListener("pointermove", trackOrbitDepth, { passive: true });
  orbitFigure?.addEventListener("pointermove", trackOrbitProximity, { passive: true });
  orbitFigure?.addEventListener("pointerleave", () => {
    resetOrbitDepth();
    releaseOrbit();
    clearOrbitProximity();
  });
  desktopPointer.addEventListener("change", () => {
    resetOrbitDepth(true);
    releaseOrbit();
  });
  cometMotionViewport.addEventListener("change", syncCometCollisions);
  reducedMotion.addEventListener("change", () => {
    resetOrbitDepth(true);
    releaseOrbit();
    startEntrance();
    syncCometCollisions();
  });

  if (orbitFigure && "IntersectionObserver" in window) {
    const orbitVisibility = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting && entry.intersectionRatio > 0;
        orbitFigure.classList.toggle("orbit-offscreen", !isVisible);

        if (!isVisible) {
          resetOrbitDepth(true);
          releaseOrbit();
          clearOrbitProximity();
        }

        syncCometCollisions();
      },
      { threshold: 0.01 }
    );

    orbitVisibility.observe(orbitFigure);
  }
})();
