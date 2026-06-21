if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

const bgImg       = document.getElementById('bgImg');
const progressBar = document.getElementById('progressBar');

const ZOOM_START    = 1.0;
const ZOOM_END      = 1.65;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let rafPending = false;

function update() {
  rafPending = false;

  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  if (maxScroll <= 0) return;

  const t     = Math.min(window.scrollY / maxScroll, 1);
  const scale = ZOOM_START + t * (ZOOM_END - ZOOM_START);

  if (bgImg && !reducedMotion) {
    bgImg.style.transform = `translate(-50%, -50%) scale(${scale.toFixed(4)})`;
  }

  if (progressBar) {
    progressBar.style.width = `${(t * 100).toFixed(1)}%`;
  }
}

function onScroll() {
  if (rafPending) return;
  rafPending = true;
  requestAnimationFrame(update);
}

window.addEventListener('scroll', onScroll, { passive: true });
update();

// Animations d'entrée au scroll
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.animate').forEach(el => observer.observe(el));

// ─── Musique de fond ────────────────────────────────
const audio     = document.getElementById('bg-audio');
const musicBtn  = document.getElementById('musicBtn');
const iconNote  = musicBtn && musicBtn.querySelector('.music-icon--note');
const iconMute  = musicBtn && musicBtn.querySelector('.music-icon--mute');

let musicStarted = false;
let muted        = false;

function setPlayingState(playing) {
  if (!musicBtn) return;
  musicBtn.classList.toggle('is-playing', playing);
  musicBtn.setAttribute('aria-label', playing ? 'Couper la musique' : 'Activer la musique');
  if (iconNote) iconNote.style.display = playing ? '' : 'none';
  if (iconMute) iconMute.style.display = playing ? 'none' : '';
}

function startMusic() {
  if (musicStarted || !audio) return;
  musicStarted = true;

  audio.volume = 0.45;
  audio.play()
    .then(() => setPlayingState(true))
    .catch(() => {
      // Autoplay bloqué malgré le geste (rare) — on réinitialise
      musicStarted = false;
    });
}

// Démarre sur le premier scroll ou tap
window.addEventListener('scroll',     startMusic, { once: true, passive: true });
document.addEventListener('touchstart', startMusic, { once: true, passive: true });

// Bouton : toggle mute / unmute
if (musicBtn) {
  musicBtn.addEventListener('click', () => {
    if (!musicStarted) {
      startMusic();
      return;
    }
    muted = !muted;
    audio.muted = muted;
    setPlayingState(!muted);
  });
}

// Initialisation visuelle : icône note visible, mute masquée
setPlayingState(false);
