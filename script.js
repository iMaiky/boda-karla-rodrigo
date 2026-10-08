const opening = document.getElementById('opening');
const enterButton = document.getElementById('enter');
const site = document.getElementById('site');
const music = document.getElementById('bgMusic');
const musicControl = document.getElementById('musicControl');
const songPlay = document.getElementById('songPlay');
const weddingDate = new Date('2026-12-12T13:00:00-04:00');

let fadeFrame = null;
let audioStarted = false;
let desiredVolume = 0.82;

function animateVolume(from, to, duration) {
  if (fadeFrame) cancelAnimationFrame(fadeFrame);
  const started = performance.now();
  const tick = (now) => {
    const progress = Math.min((now - started) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    music.volume = from + (to - from) * eased;
    if (progress < 1) fadeFrame = requestAnimationFrame(tick);
  };
  fadeFrame = requestAnimationFrame(tick);
}

function showSite() {
  document.body.classList.remove('is-locked');
  site.classList.add('visible');
  opening.classList.add('closed');
  setTimeout(() => document.querySelectorAll('.reveal').forEach((el) => el.classList.add('show')), 220);
}

async function startMusicWithFade() {
  music.pause();
  music.currentTime = 0;
  music.muted = false;
  music.volume = 0;
  try {
    await music.play();
    audioStarted = true;
    musicControl.classList.add('visible', 'playing');
    animateVolume(0, desiredVolume, 9000);
  } catch (err) {
    console.warn('No se pudo iniciar el audio:', err);
  }
}

enterButton.addEventListener('click', async () => {
  // Abrimos primero para que la transición nunca dependa del audio.
  showSite();
  // El play ocurre dentro del mismo gesto del usuario.
  await startMusicWithFade();
});

musicControl.addEventListener('click', async () => {
  if (!music.paused) {
    music.pause();
    audioStarted = false;
    musicControl.classList.remove('playing');
    return;
  }
  music.volume = 0.2;
  try {
    await music.play();
    audioStarted = true;
    musicControl.classList.add('playing');
    animateVolume(0.2, desiredVolume, 1300);
  } catch (err) {
    console.warn('No se pudo reanudar el audio:', err);
  }
});

if (songPlay) {
  songPlay.addEventListener('click', async () => {
    if (music.paused) {
      music.volume = 0.2;
      try {
        await music.play();
        audioStarted = true;
        musicControl.classList.add('playing');
        animateVolume(0.2, desiredVolume, 1300);
      } catch (err) {
        console.warn('No se pudo reproducir el audio:', err);
      }
    } else {
      music.pause();
      audioStarted = false;
      musicControl.classList.remove('playing');
    }
  });
}

function updateCountdown() {
  const diff = weddingDate.getTime() - Date.now();
  if (diff <= 0) {
    ['days', 'hours', 'minutes', 'seconds'].forEach((id) => {
      document.getElementById(id).textContent = id === 'days' ? '000' : '00';
    });
    return;
  }
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  document.getElementById('days').textContent = String(days).padStart(3, '0');
  document.getElementById('hours').textContent = String(hours).padStart(2, '0');
  document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
  document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}

updateCountdown();
setInterval(updateCountdown, 1000);

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

// Pequeño efecto de movimiento en el hero al mover el puntero en desktop.
const hero = document.querySelector('.hero');
if (hero && window.matchMedia('(hover:hover)').matches) {
  hero.addEventListener('pointermove', (event) => {
    const rect = hero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    document.querySelectorAll('.botanical').forEach((node, index) => {
      const factor = index === 0 ? 7 : -6;
      node.style.transform = `translate(${x * factor}px, ${y * factor}px) rotate(${index === 0 ? 18 : -160}deg)`;
    });
  });
}

