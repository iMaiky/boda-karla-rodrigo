const opening = document.getElementById('opening');
const openButton = document.getElementById('openButton');
const site = document.getElementById('site');
const music = document.getElementById('weddingMusic');
const musicButton = document.getElementById('musicButton');
const songButton = document.getElementById('songButton');
const menuButton = document.getElementById('menuButton');
const quickMenu = document.getElementById('quickMenu');

const weddingDate = new Date('2026-12-12T13:00:00-04:00');
let fadeFrame = null;

function fadeVolume(target, duration) {
  if (fadeFrame) cancelAnimationFrame(fadeFrame);
  const start = performance.now();
  const from = music.volume;
  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    music.volume = from + (target - from) * eased;
    if (progress < 1) fadeFrame = requestAnimationFrame(tick);
  };
  fadeFrame = requestAnimationFrame(tick);
}

function setPlayingUI(isPlaying) {
  musicButton.classList.toggle('playing', isPlaying);
  musicButton.setAttribute('aria-pressed', String(isPlaying));
  musicButton.setAttribute('aria-label', isPlaying ? 'Pausar música' : 'Reproducir música');
}

function revealVisibleContent() {
  document.querySelectorAll('.reveal').forEach((element) => {
    const box = element.getBoundingClientRect();
    if (box.top < window.innerHeight * 0.92) element.classList.add('show');
  });
}

function startAudioFromFirstTap() {
  music.pause();
  music.currentTime = 0;
  music.muted = false;
  music.volume = 0.015;

  // The play() call is intentionally triggered from the same user gesture.
  const promise = music.play();
  if (promise && typeof promise.then === 'function') {
    promise.then(() => {
      setPlayingUI(true);
      fadeVolume(0.78, 8500);
    }).catch((error) => {
      console.warn('El navegador no permitió reproducir el audio:', error);
      setPlayingUI(false);
    });
  }
}

openButton.addEventListener('click', () => {
  // Never make the opening transition depend on audio success.
  opening.classList.add('closed');
  document.body.classList.remove('locked');
  site.classList.add('visible');
  site.setAttribute('aria-hidden', 'false');
  document.querySelector('.floating-tools').classList.add('visible');

  startAudioFromFirstTap();
  setTimeout(revealVisibleContent, 180);
});

musicButton.addEventListener('click', () => {
  if (music.paused) {
    music.volume = Math.max(music.volume, 0.18);
    music.play().then(() => {
      setPlayingUI(true);
      fadeVolume(0.78, 1300);
    }).catch((error) => console.warn('No se pudo reanudar la música:', error));
  } else {
    if (fadeFrame) cancelAnimationFrame(fadeFrame);
    music.pause();
    setPlayingUI(false);
  }
});

songButton.addEventListener('click', () => {
  if (music.paused) {
    music.volume = Math.max(music.volume, 0.18);
    music.play().then(() => {
      setPlayingUI(true);
      fadeVolume(0.78, 1300);
    }).catch((error) => console.warn('No se pudo reproducir la música:', error));
  } else {
    music.pause();
    setPlayingUI(false);
  }
});

menuButton.addEventListener('click', () => {
  const isOpen = quickMenu.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
  quickMenu.setAttribute('aria-hidden', String(!isOpen));
});

quickMenu.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    quickMenu.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    quickMenu.setAttribute('aria-hidden', 'true');
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

function updateCountdown() {
  const diff = weddingDate.getTime() - Date.now();
  if (diff <= 0) {
    document.getElementById('days').textContent = '000';
    document.getElementById('hours').textContent = '00';
    document.getElementById('minutes').textContent = '00';
    document.getElementById('seconds').textContent = '00';
    return;
  }
  const total = Math.floor(diff / 1000);
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  document.getElementById('days').textContent = String(days).padStart(3, '0');
  document.getElementById('hours').textContent = String(hours).padStart(2, '0');
  document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
  document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}

updateCountdown();
setInterval(updateCountdown, 1000);

// Also reveal content after a short first paint in case the browser has not emitted intersections yet.
setTimeout(revealVisibleContent, 700);


