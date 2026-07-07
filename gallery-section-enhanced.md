# Picture Gallery Section — Enhanced (copy-paste ready)

Yeh improved version original code ka hai — accessibility, keyboard navigation, touch swipe, optional autoplay, reduced-motion support, focus-trap for lightbox, aur crash-proof SVG placeholder (no `btoa`). CSS aur JS ko aapki site ke `index.html` mein paste karen: CSS inside `<style>`, HTML in `<body>`, JS in `<script>` after the HTML.

---

## 1) CSS — `<style>` ke andar paste karo

```css
/* ===== PICTURE GALLERY — ENHANCED 3D SECTION ===== */
:root{
  --gold: #F4B942;
  --coral: #FF6F61;
  --cream: #F6F4EB;
  --navy-deep: #071429;
  --slate: #B9C7DB;
}

.gallery{
  position: relative;
  z-index: 5;
  padding: 6vh 5% 14vh;
}

.gallery-wrap{
  max-width: 1080px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 40px;
  align-items: center;
}

.gallery-left{
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0;
  transform: translateX(-50px) rotateY(20deg);
  transition: opacity 0.8s ease, transform 0.8s ease;
}
.gallery-left.in-view{
  opacity: 1;
  transform: translateX(0) rotateY(0deg);
}

.gallery-caption{
  background: rgba(244,246,233,0.06);
  border: 1px solid rgba(244,185,66,0.3);
  border-radius: 12px;
  padding: 12px 18px;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--cream);
  text-align: center;
  margin-bottom: 18px;
  max-width: 360px;
  min-height: 24px;
}

.gallery-stage{
  display: flex;
  align-items: center;
  gap: 16px;
  perspective: 1400px;
}

.gallery-arrow{
  flex: 0 0 auto;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  border: 1px solid rgba(244,185,66,0.35);
  background: rgba(244,246,233,0.06);
  color: var(--gold);
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.18s, transform 0.18s;
}
.gallery-arrow:hover{
  background: linear-gradient(135deg, var(--gold), var(--coral));
  color: var(--navy-deep);
  transform: scale(1.08);
}

.gallery-frame{
  width: 340px;
  height: 340px;
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  background: linear-gradient(160deg, #16345E, #0A1D38);
  border: 1px solid rgba(244,185,66,0.25);
  box-shadow: 0 26px 55px rgba(0,0,0,0.4);
  cursor: pointer;
  transform-style: preserve-3d;
}

.gallery-photo{
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  pointer-events: none;
}

/* animation classes applied on change */
.gallery-photo.slide-in-next{
  animation: flipNext 0.55s ease forwards;
}
.gallery-photo.slide-in-prev{
  animation: flipPrev 0.55s ease forwards;
}

@keyframes flipNext{
  0%{ transform: rotateY(90deg) scale(0.85); opacity: 0; }
  100%{ transform: rotateY(0deg) scale(1); opacity: 1; }
}
@keyframes flipPrev{
  0%{ transform: rotateY(-90deg) scale(0.85); opacity: 0; }
  100%{ transform: rotateY(0deg) scale(1); opacity: 1; }
}

.gallery-counter{
  margin-top: 18px;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1px solid rgba(244,185,66,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--gold);
}

.gallery-right{
  display: flex;
  flex-direction: column;
  gap: 18px;
  opacity: 0;
  transform: translateX(50px) rotateY(-20deg);
  transition: opacity 0.8s ease 0.12s, transform 0.8s ease 0.12s;
}
.gallery-right.in-view{
  opacity: 1;
  transform: translateX(0) rotateY(0deg);
}

.gallery-heading{
  background: linear-gradient(135deg, var(--gold), var(--coral));
  color: var(--navy-deep);
  font-family: 'Baloo 2', sans-serif;
  font-weight: 800;
  font-size: 1.2rem;
  padding: 16px 22px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 10px 24px rgba(244,185,66,0.3);
}

.gallery-description{
  background: linear-gradient(160deg, #16345E, #0A1D38);
  border: 1px solid rgba(139,157,195,0.2);
  border-radius: 16px;
  padding: 22px;
  color: var(--slate);
  font-size: 0.95rem;
  line-height: 1.6;
  min-height: 140px;
}

/* ===== LIGHTBOX (full view on click) ===== */
.lightbox{
  position: fixed;
  inset: 0;
  background: rgba(7, 20, 41, 0.88);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}
.lightbox.open{
  opacity: 1;
  pointer-events: auto;
}

.lightbox-inner{
  max-width: min(94vw, 680px);
  width: 94vw;
  background: linear-gradient(160deg, #16345E, #0A1D38);
  border: 1px solid rgba(244,185,66,0.3);
  border-radius: 22px;
  padding: 20px;
  position: relative;
  transform: scale(0.74) rotateX(12deg);
  opacity: 0;
  transition: transform 0.42s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.35s ease;
}
.lightbox.open .lightbox-inner{
  transform: scale(1) rotateX(0deg);
  opacity: 1;
}

.lightbox-photo{
  width: 100%;
  border-radius: 14px;
  display: block;
  margin-bottom: 14px;
}

.lightbox-caption{
  color: var(--cream);
  font-size: 0.95rem;
  text-align: center;
  line-height: 1.5;
}

.lightbox-close{
  position: absolute;
  top: -14px;
  right: -14px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--gold), var(--coral));
  border: none;
  color: var(--navy-deep);
  font-weight: 700;
  font-size: 1.05rem;
  cursor: pointer;
  box-shadow: 0 8px 18px rgba(0,0,0,0.35);
}

/* Accessibility helpers */
.gallery-arrow:focus,
.lightbox-close:focus{
  outline: 3px solid rgba(244,185,66,0.35);
  outline-offset: 3px;
}

@media (max-width: 760px){
  .gallery-wrap{ grid-template-columns: 1fr; }
  .gallery-frame{ width: 260px; height: 260px; }
}

/* Respect reduced motion preference */
@media (prefers-reduced-motion: reduce){
  .gallery-left, .gallery-right, .gallery-photo, .lightbox-inner{
    transition: none !important;
    animation: none !important;
    transform: none !important;
  }
}
```

---

## 2) HTML — `<body>` mein jahan section chahiye wahan paste karo

```html
<!-- ===== PICTURE GALLERY — ENHANCED 3D SECTION ===== -->
<section class="gallery" id="gallerySection" role="region" aria-label="Picture gallery">
  <div class="gallery-wrap">

    <div class="gallery-left" id="galleryLeft">
      <div class="gallery-caption" id="galleryCaption" aria-live="polite"></div>

      <div class="gallery-stage">
        <button class="gallery-arrow" id="galleryPrev" aria-label="Previous picture">⬅</button>

        <div class="gallery-frame" id="galleryFrame" tabindex="0" role="button" aria-pressed="false" aria-label="Open full-size image">
          <img class="gallery-photo" id="galleryPhoto" src="" alt="">
        </div>

        <button class="gallery-arrow" id="galleryNext" aria-label="Next picture">➡</button>
      </div>

      <div class="gallery-counter" id="galleryCounter" aria-hidden="true">1</div>
    </div>

    <div class="gallery-right" id="galleryRight">
      <div class="gallery-heading" id="galleryHeading">Heading</div>
      <div class="gallery-description" id="galleryDescription">Description</div>
    </div>

  </div>
</section>

<!-- lightbox: full view when a picture is clicked -->
<div class="lightbox" id="lightbox" role="dialog" aria-modal="true" aria-hidden="true">
  <div class="lightbox-inner" role="document">
    <button class="lightbox-close" id="lightboxClose" aria-label="Close">✕</button>
    <img class="lightbox-photo" id="lightboxPhoto" src="" alt="">
    <div class="lightbox-caption" id="lightboxCaption"></div>
  </div>
</div>
```

---

## 3) JavaScript — `<script>` tag mein paste karo (HTML ke turant baad)

```html
<script>
  // ===== CONFIG / DATA =====
  const galleryItems = [
    { src: null, caption: 'Yeh page hamari pehli mulaqaat ka hai', heading: 'Hamari Kahani', description: 'Is section mein hum apni yaadgar tasveerein aur unke peechay ki kahaniyan share kar rahay hain. Har tasveer par click karo poori tarah dekhne ke liye.' },
    { src: null, caption: 'Yeh page college ke dinon ki hai', heading: 'College Days', description: 'Un pur-maza dinon ki yaadein jab hum sab saath thay aur zindagi bilkul simple thi.' },
    { src: null, caption: 'Yeh page pehli trip ki hai', heading: 'Woh Yadgar Safar', description: 'Wo trip jo humesha yaad rahega — hasi, masti aur bohat sari tasveerein.' },
    { src: null, caption: 'Yeh page birthday celebration ki hai', heading: 'Jashn Ka Din', description: 'Har saal ki tarah is saal bhi khushiyan double karne ka waqt aa gaya hai.' }
  ];

  // optional autoplay (set to true to enable)
  const AUTOPLAY = false;
  const AUTOPLAY_DELAY = 5000;

  const galleryColors = ['#F4B942', '#FF6F61', '#8B9DC3', '#2E7D4F'];

  // crash-proof placeholder using encodeURIComponent (no btoa)
  function placeholderImage(index){
    const color = galleryColors[index % galleryColors.length];
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
        <rect width="600" height="600" fill="${color}" opacity="0.14"/>
        <circle cx="300" cy="260" r="72" fill="none" stroke="${color}" stroke-width="14" opacity="0.95"/>
        <rect x="180" y="380" width="240" height="26" rx="13" fill="${color}" opacity="0.95"/>
        <rect x="220" y="420" width="160" height="20" rx="10" fill="${color}" opacity="0.7"/>
      </svg>
    `;
    return 'data:image/svg+xml,' + encodeURIComponent(svg);
  }

  // ---- state + elements ----
  let galleryIndex = 0;
  let autoplayTimer = null;
  let lastTouchX = null;
  let pointerDown = false;

  const galleryPhoto = document.getElementById('galleryPhoto');
  const galleryCaption = document.getElementById('galleryCaption');
  const galleryCounter = document.getElementById('galleryCounter');
  const galleryHeading = document.getElementById('galleryHeading');
  const galleryDescription = document.getElementById('galleryDescription');
  const galleryFrame = document.getElementById('galleryFrame');
  const galleryPrev = document.getElementById('galleryPrev');
  const galleryNext = document.getElementById('galleryNext');

  const lightbox = document.getElementById('lightbox');
  const lightboxPhoto = document.getElementById('lightboxPhoto');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');

  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function updateCounter(){
    galleryCounter.textContent = `${galleryIndex + 1}`;
  }

  function renderGallery(direction){
    const item = galleryItems[galleryIndex];
    const src = item.src || placeholderImage(galleryIndex);
    galleryPhoto.src = src;
    galleryPhoto.alt = item.caption || item.heading || 'Gallery image';
    galleryCaption.textContent = item.caption || '';
    galleryHeading.textContent = item.heading || '';
    galleryDescription.textContent = item.description || '';
    updateCounter();

    // animations: skip if reduced-motion
    galleryPhoto.classList.remove('slide-in-next', 'slide-in-prev');
    if(!prefersReducedMotion){
      void galleryPhoto.offsetWidth; // restart animation
      galleryPhoto.classList.add(direction === 'prev' ? 'slide-in-prev' : 'slide-in-next');
    }
  }

  function nextImage(){
    galleryIndex = (galleryIndex + 1) % galleryItems.length;
    renderGallery('next');
  }
  function prevImage(){
    galleryIndex = (galleryIndex - 1 + galleryItems.length) % galleryItems.length;
    renderGallery('prev');
  }

  galleryNext.addEventListener('click', () => { nextImage(); resetAutoplay(); });
  galleryPrev.addEventListener('click', () => { prevImage(); resetAutoplay(); });

  // keyboard navigation for gallery and lightbox
  document.addEventListener('keydown', (e) => {
    if(lightbox.classList.contains('open')){
      if(e.key === 'Escape') closeLightbox();
      if(e.key === 'ArrowRight') { e.preventDefault(); focusLightboxNext(); }
      if(e.key === 'ArrowLeft') { e.preventDefault(); focusLightboxPrev(); }
    } else {
      if(e.key === 'ArrowRight') { nextImage(); resetAutoplay(); }
      if(e.key === 'ArrowLeft') { prevImage(); resetAutoplay(); }
      if(e.key === 'Enter' && document.activeElement === galleryFrame){ openLightbox(); }
    }
  });

  // touch / pointer swipe support on galleryFrame
  galleryFrame.addEventListener('pointerdown', (e) => {
    pointerDown = true;
    lastTouchX = e.clientX;
    galleryFrame.setPointerCapture(e.pointerId);
  });
  galleryFrame.addEventListener('pointermove', (e) => {
    if(!pointerDown) return;
    const dx = e.clientX - lastTouchX;
    // slight visual feedback could be added here
  });
  galleryFrame.addEventListener('pointerup', (e) => {
    if(!pointerDown) return;
    pointerDown = false;
    const dx = e.clientX - lastTouchX;
    if(Math.abs(dx) > 40){
      if(dx < 0) nextImage(); else prevImage();
      resetAutoplay();
    }
  });
  galleryFrame.addEventListener('pointercancel', () => { pointerDown = false; });

  // open lightbox
  let lastFocusedElement = null;
  function openLightbox(){
    const item = galleryItems[galleryIndex];
    const src = item.src || placeholderImage(galleryIndex);
    lightboxPhoto.src = src;
    lightboxPhoto.alt = item.caption || item.heading || 'Full size image';
    lightboxCaption.textContent = item.caption || '';
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    lastFocusedElement = document.activeElement;
    lightboxClose.focus();
    disableAutoplay();
    trapFocus(lightbox);
  }

  function closeLightbox(){
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    if(lastFocusedElement) lastFocusedElement.focus();
    enableAutoplayIfNeeded();
  }

  galleryFrame.addEventListener('click', openLightbox);
  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if(e.target === lightbox) closeLightbox(); });

  // small helpers for focus trapping inside lightbox
  function trapFocus(container){
    const focusable = container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if(focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    function handle(e){
      if(e.key !== 'Tab') return;
      if(e.shiftKey){ if(document.activeElement === first){ e.preventDefault(); last.focus(); } }
      else { if(document.activeElement === last){ e.preventDefault(); first.focus(); } }
    }
    container.addEventListener('keydown', handle);
    // remove listener when closed
    const observer = new MutationObserver(() => {
      if(!container.classList.contains('open')){
        container.removeEventListener('keydown', handle);
        observer.disconnect();
      }
    });
    observer.observe(container, { attributes: true, attributeFilter: ['class'] });
  }

  // lightbox navigation placeholders (could implement gallery prev/next inside lightbox)
  function focusLightboxNext(){ /* optional: move to next image while lightbox open */ nextImage(); updateLightboxContent(); }
  function focusLightboxPrev(){ prevImage(); updateLightboxContent(); }
  function updateLightboxContent(){
    const item = galleryItems[galleryIndex];
    const src = item.src || placeholderImage(galleryIndex);
    lightboxPhoto.src = src;
    lightboxCaption.textContent = item.caption || '';
  }

  // autoplay utilities
  function startAutoplay(){
    if(!AUTOPLAY) return;
    if(autoplayTimer) clearInterval(autoplayTimer);
    autoplayTimer = setInterval(() => { nextImage(); }, AUTOPLAY_DELAY);
  }
  function disableAutoplay(){ if(autoplayTimer) clearInterval(autoplayTimer); autoplayTimer = null; }
  function enableAutoplayIfNeeded(){ if(AUTOPLAY) startAutoplay(); }
  function resetAutoplay(){ disableAutoplay(); enableAutoplayIfNeeded(); }

  // pause autoplay on hover / focus
  [galleryFrame, galleryPrev, galleryNext].forEach(el => {
    el.addEventListener('mouseenter', disableAutoplay);
    el.addEventListener('mouseleave', enableAutoplayIfNeeded);
    el.addEventListener('focusin', disableAutoplay);
    el.addEventListener('focusout', enableAutoplayIfNeeded);
  });

  // IntersectionObserver to reveal panels every time they appear
  const galleryLeft = document.getElementById('galleryLeft');
  const galleryRight = document.getElementById('galleryRight');

  const galleryObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
      } else {
        entry.target.classList.remove('in-view');
      }
    });
  }, { threshold: 0.2 });

  galleryObserver.observe(galleryLeft);
  galleryObserver.observe(galleryRight);

  // Initialize
  renderGallery('next');
  enableAutoplayIfNeeded();

  // Accessibility: lazy-load images where provided, otherwise placeholder already data-uri
  // Ensure images are loaded with `loading="lazy"` attribute when external
  galleryPhoto.loading = 'lazy';
  lightboxPhoto.loading = 'lazy';
</script>
```

---

## Naye Pictures Add Karne Ke Liye

Sirf `galleryItems` array mein naya object add karo:

```js
{
  src: 'images/apni-photo.jpg', // apni image ka path
  caption: 'Chota caption text',
  heading: 'Section ka title',
  description: 'Detail wala paragraph'
}
```

Notes:
- Placeholder SVGs use only shapes (no emoji) and `encodeURIComponent()` to safely embed.
- Keyboard: `ArrowLeft`/`ArrowRight` navigate; `Enter` opens when `galleryFrame` focused; `Escape` closes lightbox.
- Touch: swipe left/right on the main frame changes images.
- Autoplay: toggle `AUTOPLAY` constant.

---

If you want, I can now: (a) patch this into your `index.html`, (b) replace the old `gallery-section-code.md` with this enhanced file, or (c) run a quick sanity check in the browser if you want instructions. Which one next?
