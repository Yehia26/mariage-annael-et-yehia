const bgImg       = document.querySelector('#bgZoom img');
const heroSection = document.querySelector('.section--hero');
const progressBar = document.getElementById('progressBar');

const ZOOM_MAX = 0.42; // scale(1) → scale(1.42) sur la hauteur du hero

function onScroll() {
  const scrolled  = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

  // Zoom lié au scroll dans la section héro
  if (bgImg && heroSection) {
    const heroH = heroSection.offsetHeight;
    const t     = Math.min(scrolled / heroH, 1);
    bgImg.style.transform = `scale(${1 + t * ZOOM_MAX})`;
  }

  // Barre de progression
  if (progressBar && maxScroll > 0) {
    progressBar.style.width = `${(scrolled / maxScroll) * 100}%`;
  }
}

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);
onScroll();

// Animations d'entrée (IntersectionObserver)
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.animate').forEach(el => observer.observe(el));
