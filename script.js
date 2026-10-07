const opening = document.getElementById("opening");
const enterButton = document.getElementById("enter");
const site = document.getElementById("site");
const music = document.getElementById("bgMusic");
const musicControl = document.getElementById("musicControl");
const songPlay = document.getElementById("songPlay");
const songSection = document.querySelector(".song");

const weddingDate = new Date("2026-12-12T13:00:00-04:00");

let audioStarted = false;
let audioContext = null;
let gainNode = null;
let mediaSource = null;
let fadeFrame = null;

function setupAudioGraph() {
  if (audioContext) return;

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  audioContext = new AudioContextClass();
  mediaSource = audioContext.createMediaElementSource(music);
  gainNode = audioContext.createGain();

  gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
  mediaSource.connect(gainNode);
  gainNode.connect(audioContext.destination);
}

function fadeVolume(target, duration = 6500) {
  if (!gainNode || !audioContext) {
    music.volume = Math.min(Math.max(target, 0), 1);
    return;
  }

  if (fadeFrame) cancelAnimationFrame(fadeFrame);

  const start = gainNode.gain.value;
  const startedAt = performance.now();

  function step(now) {
    const t = Math.min((now - startedAt) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    const value = start + (target - start) * eased;

    gainNode.gain.setValueAtTime(Math.max(value, 0.0001), audioContext.currentTime);

    if (t < 1) {
      fadeFrame = requestAnimationFrame(step);
    }
  }

  fadeFrame = requestAnimationFrame(step);
}

async function startMusicWithFade() {
  setupAudioGraph();

  try {
    if (audioContext && audioContext.state === "suspended") {
      await audioContext.resume();
    }

    if (!audioContext) {
      music.volume = 0;
    }

    await music.play();

    if (audioContext) {
      gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
      fadeVolume(0.88, 7000);
    } else {
      const started = performance.now();
      const duration = 7000;

      function nativeFade(now) {
        const t = Math.min((now - started) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        music.volume = 0.88 * eased;
        if (t < 1) requestAnimationFrame(nativeFade);
      }

      requestAnimationFrame(nativeFade);
    }

    audioStarted = true;
    musicControl.classList.add("visible", "playing");
    songSection.classList.add("playing");
  } catch (error) {
    console.warn("La reproducción necesita otro toque en este dispositivo.", error);
  }
}

async function pauseMusic() {
  if (!audioStarted) return;
  if (fadeFrame) cancelAnimationFrame(fadeFrame);

  if (gainNode && audioContext) {
    fadeVolume(0.0001, 500);
    setTimeout(() => music.pause(), 520);
  } else {
    music.pause();
  }

  musicControl.classList.remove("playing");
  songSection.classList.remove("playing");
}

async function resumeMusic() {
  try {
    if (audioContext && audioContext.state === "suspended") {
      await audioContext.resume();
    }

    await music.play();

    if (gainNode && audioContext) {
      fadeVolume(0.88, 900);
    } else {
      music.volume = 0;
      const started = performance.now();

      function nativeResume(now) {
        const t = Math.min((now - started) / 900, 1);
        music.volume = 0.88 * t;
        if (t < 1) requestAnimationFrame(nativeResume);
      }

      requestAnimationFrame(nativeResume);
    }

    musicControl.classList.add("playing");
    songSection.classList.add("playing");
  } catch (error) {
    console.warn(error);
  }
}

enterButton.addEventListener("click", async () => {
  await startMusicWithFade();

  opening.classList.add("closed");
  document.body.classList.remove("lock");
  site.classList.add("visible");

  setTimeout(() => {
    document.querySelectorAll(".reveal").forEach(el => el.classList.add("show"));
  }, 300);
});

musicControl.addEventListener("click", async () => {
  if (music.paused) {
    await resumeMusic();
  } else {
    await pauseMusic();
  }
});

songPlay.addEventListener("click", async () => {
  if (music.paused) {
    await resumeMusic();
  } else {
    await pauseMusic();
  }
});

// Countdown
function updateCountdown() {
  const now = new Date();
  const diff = weddingDate - now;

  if (diff <= 0) {
    ["days", "hours", "minutes", "seconds"].forEach(id => {
      document.getElementById(id).textContent = "0".padStart(id === "days" ? 3 : 2, "0");
    });
    return;
  }

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff / 3600000) % 24);
  const minutes = Math.floor((diff / 60000) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  document.getElementById("days").textContent = String(days).padStart(3, "0");
  document.getElementById("hours").textContent = String(hours).padStart(2, "0");
  document.getElementById("minutes").textContent = String(minutes).padStart(2, "0");
  document.getElementById("seconds").textContent = String(seconds).padStart(2, "0");
}

updateCountdown();
setInterval(updateCountdown, 1000);

// Reveal on scroll
const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 }
);

document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

// Accessibility / reduced motion
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.querySelectorAll("*").forEach(el => {
    el.style.scrollBehavior = "auto";
  });
}

