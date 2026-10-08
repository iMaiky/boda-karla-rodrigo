const opening = document.getElementById('opening');
const enterButton = document.getElementById('enter');
const site = document.getElementById('site');
const music = document.getElementById('bgMusic');
const musicControl = document.getElementById('musicControl');
const songPlay = document.getElementById('songPlay');
const songSection = document.querySelector('.song-section');

const weddingDate = new Date('2026-12-12T13:00:00-04:00');
let fadeRaf = null;

function setMusicIcon(playing){
  musicControl.classList.toggle('playing', playing);
  musicControl.setAttribute('aria-pressed', String(playing));
  musicControl.setAttribute('aria-label', playing ? 'Pausar música' : 'Reproducir música');
  if(songPlay) songPlay.textContent = playing ? 'Ⅱ Pausar nuestra canción' : '▶ Escuchar nuestra canción';
  if(songSection) songSection.classList.toggle('playing', playing);
}

function fadeTo(target, duration){
  cancelAnimationFrame(fadeRaf);
  const startVolume = music.volume;
  const start = performance.now();
  function tick(now){
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    music.volume = Math.min(1, Math.max(0, startVolume + (target - startVolume) * eased));
    if(p < 1) fadeRaf = requestAnimationFrame(tick);
  }
  fadeRaf = requestAnimationFrame(tick);
}

async function startMusic(){
  cancelAnimationFrame(fadeRaf);
  music.muted = false;
  music.volume = 0;
  try{
    await music.play();
    setMusicIcon(true);
    fadeTo(0.82, 9000);
  }catch(err){
    console.warn('No se pudo reproducir el audio:', err);
    setMusicIcon(false);
  }
}

async function resumeMusic(){
  cancelAnimationFrame(fadeRaf);
  music.muted = false;
  music.volume = 0.18;
  try{
    await music.play();
    setMusicIcon(true);
    fadeTo(0.82, 1400);
  }catch(err){
    console.warn('No se pudo reanudar el audio:', err);
  }
}

function pauseMusic(){
  cancelAnimationFrame(fadeRaf);
  music.pause();
  setMusicIcon(false);
}

enterButton.addEventListener('click', async () => {
  // El clic del usuario inicia el audio; esto maximiza compatibilidad móvil.
  opening.classList.add('closed');
  document.body.classList.remove('preopen');
  site.classList.add('visible');
  site.setAttribute('aria-hidden','false');
  await startMusic();
});

musicControl.addEventListener('click', () => {
  if(music.paused) resumeMusic();
  else pauseMusic();
});

if(songPlay){
  songPlay.addEventListener('click', () => {
    if(music.paused) resumeMusic();
    else pauseMusic();
  });
}

function updateCountdown(){
  const diff = weddingDate - new Date();
  if(diff <= 0){
    ['days','hours','minutes','seconds'].forEach((id,i)=>{
      document.getElementById(id).textContent = i === 0 ? '000' : '00';
    });
    return;
  }
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff / 3600000) % 24);
  const minutes = Math.floor((diff / 60000) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  document.getElementById('days').textContent = String(days).padStart(3,'0');
  document.getElementById('hours').textContent = String(hours).padStart(2,'0');
  document.getElementById('minutes').textContent = String(minutes).padStart(2,'0');
  document.getElementById('seconds').textContent = String(seconds).padStart(2,'0');
}
updateCountdown();
setInterval(updateCountdown, 1000);

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add('show');
      observer.unobserve(entry.target);
    }
  });
},{threshold:0.13});

document.querySelectorAll('.section-reveal').forEach(el => observer.observe(el));

// Parallax suave para el efecto editorial/cinematográfico.
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  const heroImage = document.querySelector('.hero-image');
  if(heroImage && scrollY < window.innerHeight * 1.2){
    heroImage.style.transform = `scale(1.11) translateY(${scrollY * 0.055}px)`;
  }
},{passive:true});

