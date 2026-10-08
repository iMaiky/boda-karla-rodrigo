const opening = document.getElementById("opening");
const enterButton = document.getElementById("enter");
const site = document.getElementById("site");

const music = document.getElementById("bgMusic");
const musicControl = document.getElementById("musicControl");
const songPlay = document.getElementById("songPlay");
const songSection = document.querySelector(".song");

const weddingDate = new Date("2026-12-12T13:00:00-04:00");

let fadeFrame = null;
let isPlaying = false;


// ==========================================
// FADE-IN DE AUDIO
// ==========================================

function fadeInMusic(duration = 8000, targetVolume = 0.85) {

    if (fadeFrame) {
        cancelAnimationFrame(fadeFrame);
    }

    const startTime = performance.now();

    function step(now) {

        const elapsed = now - startTime;

        const progress = Math.min(
            elapsed / duration,
            1
        );

        // Curva suave "ease out"
        const eased =
            1 - Math.pow(1 - progress, 3);

        music.volume =
            targetVolume * eased;

        if (progress < 1) {

            fadeFrame =
                requestAnimationFrame(step);

        } else {

            music.volume =
                targetVolume;
        }
    }

    fadeFrame =
        requestAnimationFrame(step);
}


// ==========================================
// INICIAR MÚSICA
// ==========================================

function startMusic() {

    // MUY IMPORTANTE:
    // comenzar completamente en silencio
    music.volume = 0;

    music.muted = false;

    const playPromise = music.play();

    if (playPromise !== undefined) {

        playPromise
            .then(() => {

                isPlaying = true;

                musicControl.classList.add("visible");
                musicControl.classList.add("playing");

                if (songSection) {
                    songSection.classList.add("playing");
                }

                // 🎵 0% → 85% en 8 segundos
                fadeInMusic(8000, 0.85);

            })
            .catch((error) => {

                console.error(
                    "Error reproduciendo audio:",
                    error
                );

            });

    }
}


// ==========================================
// BOTÓN "TOCAR PARA COMENZAR"
// ==========================================

enterButton.addEventListener("click", () => {

    // Primero fijamos volumen 0
    music.volume = 0;

    // Abrimos la invitación
    opening.classList.add("closed");

    document.body.classList.remove("lock");

    site.classList.add("visible");

    // 🎵 El mismo clic inicia la música
    startMusic();

    // Animaciones iniciales
    setTimeout(() => {

        document
            .querySelectorAll(".reveal")
            .forEach(element => {

                element.classList.add("show");

            });

    }, 300);

});


// ==========================================
// CONTROL DE MÚSICA
// ==========================================

musicControl.addEventListener(
    "click",
    () => {

        if (!music.paused) {

            music.pause();

            isPlaying = false;

            musicControl.classList.remove(
                "playing"
            );

            if (songSection) {
                songSection.classList.remove(
                    "playing"
                );
            }

        } else {

            music.volume = 0.25;

            music.play()
                .then(() => {

                    isPlaying = true;

                    musicControl.classList.add(
                        "playing"
                    );

                    if (songSection) {
                        songSection.classList.add(
                            "playing"
                        );
                    }

                    fadeInMusic(
                        1200,
                        0.85
                    );

                })
                .catch(error => {

                    console.error(
                        error
                    );

                });

        }
    }
);


// ==========================================
// BOTÓN DE LA SECCIÓN CANCIÓN
// ==========================================

if (songPlay) {

    songPlay.addEventListener(
        "click",
        () => {

            if (music.paused) {

                music.volume = 0.25;

                music.play()
                    .then(() => {

                        isPlaying = true;

                        musicControl.classList.add(
                            "playing"
                        );

                        fadeInMusic(
                            1200,
                            0.85
                        );

                    });

            } else {

                music.pause();

                isPlaying = false;

                musicControl.classList.remove(
                    "playing"
                );

            }

        }
    );

}


// ==========================================
// CUENTA REGRESIVA
// ==========================================

function updateCountdown() {

    const now = new Date();

    const difference =
        weddingDate - now;

    if (difference <= 0) {

        document.getElementById("days").textContent =
            "000";

        document.getElementById("hours").textContent =
            "00";

        document.getElementById("minutes").textContent =
            "00";

        document.getElementById("seconds").textContent =
            "00";

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
            (1000 * 60 * 60)) % 24
        );

    const minutes =
        Math.floor(
            (difference /
            (1000 * 60)) % 60
        );

    const seconds =
        Math.floor(
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

                    entry.target.classList.add(
                        "show"
                    );

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
