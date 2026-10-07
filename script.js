const opening = document.getElementById("opening");
const enterButton = document.getElementById("enter");
const site = document.getElementById("site");

const music = document.getElementById("bgMusic");
const musicControl = document.getElementById("musicControl");
const songPlay = document.getElementById("songPlay");
const songSection = document.querySelector(".song");

const weddingDate = new Date("2026-12-12T13:00:00-04:00");

let audioStarted = false;
let fadeAnimation = null;

// ==========================================
// FADE NATIVO DE VOLUMEN
// ==========================================

function fadeVolume(target, duration = 7000) {

  if (fadeAnimation) {
    cancelAnimationFrame(fadeAnimation);
  }

  const startVolume = music.volume;
  const startTime = performance.now();

  function animate(currentTime) {

    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Curva suave
    const eased = 1 - Math.pow(1 - progress, 3);

    music.volume =
      startVolume + (target - startVolume) * eased;

    if (progress < 1) {
      fadeAnimation = requestAnimationFrame(animate);
    } else {
      music.volume = target;
    }
  }

  fadeAnimation = requestAnimationFrame(animate);
}

// ==========================================
// INICIAR MÚSICA
// ==========================================

async function startMusicWithFade() {

  music.volume = 0;

  try {

    /*
      play() se ejecuta directamente después
      de la interacción del usuario.
    */

    await music.play();

    audioStarted = true;

    musicControl.classList.add("visible");
    musicControl.classList.add("playing");

    if (songSection) {
      songSection.classList.add("playing");
    }

    // 7 segundos de entrada suave
    fadeVolume(0.88, 7000);

  } catch (error) {

    console.warn(
      "La música no pudo iniciarse:",
      error
    );

    /*
      IMPORTANTÍSIMO:
      Aunque la música falle, la invitación
      DEBE abrirse.
    */

    audioStarted = false;
  }
}

// ==========================================
// PAUSAR
// ==========================================

function pauseMusic() {

  if (fadeAnimation) {
    cancelAnimationFrame(fadeAnimation);
  }

  fadeVolume(0, 500);

  setTimeout(() => {
    music.pause();
  }, 520);

  musicControl.classList.remove("playing");

  if (songSection) {
    songSection.classList.remove("playing");
  }
}

// ==========================================
// REANUDAR
// ==========================================

async function resumeMusic() {

  try {

    music.volume = 0;

    await music.play();

    audioStarted = true;

    musicControl.classList.add("playing");

    if (songSection) {
      songSection.classList.add("playing");
    }

    fadeVolume(0.88, 900);

  } catch (error) {

    console.warn(
      "No se pudo reanudar la música:",
      error
    );

  }
}

// ==========================================
// BOTÓN PRINCIPAL
// ==========================================

enterButton.addEventListener("click", () => {

  /*
    Primero cerramos la pantalla de bienvenida.
    Así la invitación abre incluso si el audio
    tuviera algún problema.
  */

  opening.classList.add("closed");

  document.body.classList.remove("lock");

  site.classList.add("visible");

  /*
    La llamada ocurre como consecuencia
    directa del primer toque.
  */

  startMusicWithFade();

  /*
    Activamos las animaciones.
  */

  setTimeout(() => {

    document
      .querySelectorAll(".reveal")
      .forEach(element => {
        element.classList.add("show");
      });

  }, 300);

});

// ==========================================
// CONTROL FLOTANTE DE MÚSICA
// ==========================================

musicControl.addEventListener("click", async () => {

  if (music.paused) {
    await resumeMusic();
  } else {
    pauseMusic();
  }

});

// ==========================================
// BOTÓN DE LA SECCIÓN "NUESTRA CANCIÓN"
// ==========================================

songPlay.addEventListener("click", async () => {

  if (music.paused) {
    await resumeMusic();
  } else {
    pauseMusic();
  }

});

// ==========================================
// CUENTA REGRESIVA
// ==========================================

function updateCountdown() {

  const now = new Date();
  const difference = weddingDate - now;

  if (difference <= 0) {

    document.getElementById("days").textContent = "000";
    document.getElementById("hours").textContent = "00";
    document.getElementById("minutes").textContent = "00";
    document.getElementById("seconds").textContent = "00";

    return;
  }

  const days =
    Math.floor(
      difference /
      (1000 * 60 * 60 * 24)
    );

  const hours =
    Math.floor(
      (difference /
        (1000 * 60 * 60)) %
        24
    );

  const minutes =
    Math.floor(
      (difference /
        (1000 * 60)) %
        60
    );

  const seconds =
    Math.floor(
      (difference / 1000) %
        60
    );

  document.getElementById("days").textContent =
    String(days).padStart(3, "0");

  document.getElementById("hours").textContent =
    String(hours).padStart(2, "0");

  document.getElementById("minutes").textContent =
    String(minutes).padStart(2, "0");

  document.getElementById("seconds").textContent =
    String(seconds).padStart(2, "0");
}

updateCountdown();

setInterval(
  updateCountdown,
  1000
);

// ==========================================
// ANIMACIONES AL HACER SCROLL
// ==========================================

const observer =
  new IntersectionObserver(

    entries => {

      entries.forEach(entry => {

        if (entry.isIntersecting) {

          entry.target.classList.add("show");

          observer.unobserve(
            entry.target
          );

        }

      });

    },

    {
      threshold: 0.14
    }

  );

document
  .querySelectorAll(".reveal")
  .forEach(element => {

    observer.observe(element);

  });

// ==========================================
// REDUCED MOTION
// ==========================================

if (
  window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches
) {

  document
    .querySelectorAll("*")
    .forEach(element => {

      element.style.scrollBehavior =
        "auto";

    });

}
