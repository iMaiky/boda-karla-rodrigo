const openingScreen = document.getElementById("opening-screen");
const enterButton = document.getElementById("enter-button");
const mainContent = document.getElementById("main-content");

const music = document.getElementById("background-music");
const musicToggle = document.getElementById("music-toggle");

const weddingDate = new Date("2026-12-12T13:00:00-04:00");

let musicPlaying = false;

// ===============================
// ABRIR INVITACIÓN
// ===============================

enterButton.addEventListener("click", async () => {

  openingScreen.classList.add("hidden");
  mainContent.classList.add("visible");

  try {
    await music.play();
    musicPlaying = true;
    musicToggle.textContent = "Ⅱ";
  } catch (error) {
    musicPlaying = false;
    musicToggle.textContent = "♪";
  }

  revealElements();
});

// ===============================
// BOTÓN DE MÚSICA
// ===============================

musicToggle.addEventListener("click", async () => {

  if (musicPlaying) {

    music.pause();
    musicPlaying = false;
    musicToggle.textContent = "♪";

  } else {

    try {
      await music.play();
      musicPlaying = true;
      musicToggle.textContent = "Ⅱ";
    } catch (error) {
      console.log("No se pudo reproducir el audio.");
    }

  }
});

// ===============================
// CUENTA REGRESIVA
// ===============================

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

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (difference / (1000 * 60 * 60)) % 24
  );

  const minutes = Math.floor(
    (difference / (1000 * 60)) % 60
  );

  const seconds = Math.floor(
    (difference / 1000) % 60
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
setInterval(updateCountdown, 1000);

// ===============================
// ANIMACIONES AL HACER SCROLL
// ===============================

function revealElements() {

  const elements = document.querySelectorAll(".reveal");

  const observer = new IntersectionObserver(
    (entries) => {

      entries.forEach((entry) => {

        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          observer.unobserve(entry.target);
        }

      });

    },
    {
      threshold: 0.15
    }
  );

  elements.forEach((element) => {
    observer.observe(element);
  });
}

// ===============================
// INICIAR REVEAL
// ===============================

revealElements();
