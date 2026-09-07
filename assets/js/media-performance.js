"use strict";

(() => {
  const videos = [...document.querySelectorAll('.hero__background-video')];
  const visibility = new Map(videos.map(video => [video, true]));
  const shouldPlay = video => !document.hidden
    && document.documentElement.dataset.theme === 'dark'
    && visibility.get(video);
  const sync = () => videos.forEach(video => {
    if (!shouldPlay(video)) {
      video.pause();
    } else if (video.paused) {
      // Keep currentTime: switching theme must not restart the background.
      video.play()?.catch(() => { /* Autoplay may require a gesture on this device. */ });
    }
  });
  videos.forEach(video => {
    // Autoplay/late loading must not restart an invisible video.
    video.addEventListener('play', () => { if (!shouldPlay(video)) video.pause(); });
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => visibility.set(entry.target, entry.isIntersecting));
      sync();
    });
    videos.forEach(video => observer.observe(video));
  }
  new MutationObserver(sync).observe(document.documentElement, {
    attributes: true, attributeFilter: ['data-theme'],
  });
  document.addEventListener('visibilitychange', sync);
  // Retry mobile autoplay on a later user gesture if the browser rejected it.
  document.addEventListener('pointerdown', sync, { passive: true });
  window.addEventListener('pageshow', sync);
  sync();
})();
