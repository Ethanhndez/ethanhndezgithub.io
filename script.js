// Minimal loader for category JSON -> masonry (multi-column) grid

const CATS = ["street", "landscape", "architecture"];
const galleryEl = document.getElementById("gallery");
const navLinks = Array.from(document.querySelectorAll('.nav a[data-cat]'));

async function load(cat = "street") {
  // set active link
  navLinks.forEach(a => a.classList.toggle('active', a.dataset.cat === cat));

  // fetch image list
  const url = `data/${cat}.json?${Date.now()}`; // cache-bust while developing
  let list = [];
  try {
    const res = await fetch(url);
    list = await res.json();
  } catch (e) {
    console.error("Failed to load", url, e);
  }

  // render
  galleryEl.innerHTML = "";
  list.forEach(src => {
    const a = document.createElement("a");
    a.href = src;                 // open full image on click (optional)
    a.target = "_blank";
    a.rel = "noopener";

    const img = new Image();
    img.src = src;
    img.loading = "lazy";
    img.decoding = "async";
    img.alt = "";                // decorative grid

    a.appendChild(img);
    galleryEl.appendChild(a);
  });

  // small scroll reset for nicer feel when switching cats
  window.scrollTo({ top: 0, behavior: "instant" });
}

function wireNav() {
  navLinks.forEach(a => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const cat = a.dataset.cat;
      if (CATS.includes(cat)) load(cat);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  wireNav();
  load("street"); // default section on first load
});


(function () {
  if (document.body.dataset.page !== 'home') return;

  const stack = document.getElementById('stack');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const pageIndicator = document.getElementById('pageIndicator');

  let slides = [];
  let current = 0;

  initHome();

  async function initHome() {
    try {
      const res = await fetch('data/home.json', { cache: 'no-store' });
      const files = await res.json(); // array of "images/<file>"
      // Build slides
      slides = files.map(src => createSlide(src));
      slides.forEach(s => stack.appendChild(s));
      updateIndicator();

      // Events
      prevBtn.addEventListener('click', prev);
      nextBtn.addEventListener('click', next);
      stack.addEventListener('scroll', onScrollThrottled, { passive: true });

      // Keyboard: arrows / space / j k
      window.addEventListener('keydown', (e) => {
        const code = e.key.toLowerCase();
        if (['arrowright','arrowdown',' '].includes(code) || code === 'j') { e.preventDefault(); next(); }
        if (['arrowleft','arrowup'].includes(code) || code === 'k') { e.preventDefault(); prev(); }
      });

      // Basic touch swipe
      let startY = null;
      stack.addEventListener('touchstart', (e) => { startY = e.touches[0].clientY; }, { passive: true });
      stack.addEventListener('touchend', (e) => {
        if (startY == null) return;
        const dy = (e.changedTouches[0].clientY - startY);
        if (Math.abs(dy) > 40) { dy < 0 ? next() : prev(); }
        startY = null;
      }, { passive: true });

      // Ensure first slide is visible
      scrollTo(current, false);
    } catch (err) {
      console.error('Failed to init home:', err);
      stack.innerHTML = `<p style="padding:24px;color:#888">Couldn’t load home images.</p>`;
    }
  }

  function createSlide(src) {
    const div = document.createElement('div');
    div.className = 'slide';
    const img = document.createElement('img');
    img.loading = 'lazy';
    img.decoding = 'async';
    img.src = src;
    img.alt = '';
    div.appendChild(img);
    return div;
  }

  function next() {
    if (current < slides.length - 1) {
      current++;
      scrollTo(current);
    }
  }
  function prev() {
    if (current > 0) {
      current--;
      scrollTo(current);
    }
  }

  function scrollTo(i, smooth = true) {
    const el = slides[i];
    if (!el) return;
    el.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant', block: 'start' });
    updateIndicator();
  }

  // Keep the indicator in sync when the user scrolls manually
  let ticking = false;
  function onScrollThrottled() {
    if (ticking) return;
    window.requestAnimationFrame(() => {
      const top = stack.scrollTop;
      const vh = stack.clientHeight;
      let closest = 0;
      let best = Infinity;
      slides.forEach((s, i) => {
        const d = Math.abs(s.offsetTop - top);
        if (d < best) { best = d; closest = i; }
      });
      current = closest;
      updateIndicator();
      ticking = false;
    });
    ticking = true;
  }

  function updateIndicator() {
    pageIndicator.textContent = `${current + 1} / ${slides.length || 1}`;
  }
})();
