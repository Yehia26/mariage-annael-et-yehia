const bg          = document.getElementById('bg');
const progressBar = document.getElementById('progressBar');
const sections    = [...document.querySelectorAll('.section')];

// Niveaux de zoom cibles par section (1 → 2 → 3)
const ZOOM_LEVELS   = [1.0, 1.15, 1.30];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let sectionTops = [];
let rafPending  = false;

// Cache les offsetTop des sections (positions dans le document)
function cacheTops() {
  sectionTops = sections.map(s => s.offsetTop);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Retourne un index flottant : 0.0 = début section 1, 1.0 = début section 2, etc.
function getSectionProgress() {
  const mid  = window.scrollY + window.innerHeight * 0.5;
  const last = sectionTops.length - 1;

  for (let i = 0; i < last; i++) {
    if (mid >= sectionTops[i] && mid < sectionTops[i + 1]) {
      return i + (mid - sectionTops[i]) / (sectionTops[i + 1] - sectionTops[i]);
    }
  }
  return mid < sectionTops[0] ? 0 : last;
}

function update() {
  rafPending = false;
  if (sectionTops.length < 2) return;

  const progress = getSectionProgress();
  const maxIdx   = ZOOM_LEVELS.length - 2;
  const idx      = Math.min(Math.floor(progress), maxIdx);
  const frac     = Math.min(progress - idx, 1);
  const scale    = lerp(ZOOM_LEVELS[idx], ZOOM_LEVELS[idx + 1], frac);

  if (bg && !reducedMotion) {
    bg.style.transform = `scale(${scale.toFixed(4)})`;
  }

  // Barre de progression (linéaire, indépendante du zoom)
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  if (progressBar && maxScroll > 0) {
    progressBar.style.width = `${((window.scrollY / maxScroll) * 100).toFixed(1)}%`;
  }
}

function onScroll() {
  if (rafPending) return;
  rafPending = true;
  requestAnimationFrame(update);
}

// Resize debounce 200ms — ignore les sauts de barre d'adresse mobile
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    cacheTops();
    onScroll();
  }, 200);
}, { passive: true });

window.addEventListener('scroll', onScroll, { passive: true });

// Init
cacheTops();
update();

// ─── Animations d'entrée par section ────────────────
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
