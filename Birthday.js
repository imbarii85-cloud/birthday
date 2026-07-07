// ===== target date: adjust year as needed =====
  const TARGET = new Date(2026, 7, 4, 0, 0, 1); // month is 0-indexed -> 7 = August

  const dEl = document.getElementById('d-days');
  const hEl = document.getElementById('d-hours');
  const mEl = document.getElementById('d-mins');
  const sEl = document.getElementById('d-secs');
  const lockBtn = document.getElementById('lockBtn');
  const btnLabel = document.getElementById('btnLabel');
  const statusNote = document.getElementById('statusNote');
  const navItems = document.querySelectorAll('.nav-item');
  const progressPercentage = 2;
  const gaugeValue = document.getElementById('gaugeValue');
  const gaugeFill = document.querySelector('.gauge-fill');
  const gaugeRefresh = document.getElementById('gaugeRefresh');
  const progressText = document.getElementById('progressText');
  const gaugePanel = document.querySelector('.progress-panel');
  let gaugeAnimated = false;

  function pad(n){ return String(n).padStart(2,'0'); }

  function tick(){
    const now = new Date();
    let diff = TARGET - now;

    if(diff <= 0){
      dEl.textContent = '00'; hEl.textContent = '00'; mEl.textContent = '00'; sEl.textContent = '00';
      unlockEverything();
      clearInterval(timer);
      return;
    }

    const days = Math.floor(diff / (1000*60*60*24));
    const hours = Math.floor((diff / (1000*60*60)) % 24);
    const mins = Math.floor((diff / (1000*60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);

    dEl.textContent = pad(days);
    hEl.textContent = pad(hours);
    mEl.textContent = pad(mins);
    sEl.textContent = pad(secs);
  }

  function unlockEverything(){
    lockBtn.disabled = false;
    lockBtn.classList.add('unlocked');
    btnLabel.textContent = 'Enter the Party';
    lockBtn.querySelector('svg').innerHTML = '<path d="M5 13l4 4L19 7"/>';
    statusNote.textContent = 'Unlocked! Ab menu aur login active hain.';

    navItems.forEach(item => {
      item.style.cursor = 'pointer';
      item.style.color = 'var(--cream)';
      item.style.background = 'rgba(244,185,66,0.12)';
      item.style.borderColor = 'rgba(244,185,66,0.35)';
      const tip = item.querySelector('.tip');
      if(tip) tip.remove();
      const lockIcon = item.querySelector('svg');
      if(lockIcon) lockIcon.style.display = 'none';
    });
  }

  let gaugeAnimationFrame = null;
  const circleRadius = 96;
  const circleCircumference = 2 * Math.PI * circleRadius;

  function setGaugeValue(value){
    gaugeValue.textContent = `${Math.round(value)}%`;
    const offset = circleCircumference * (1 - value / 100);
    gaugeFill.style.strokeDashoffset = offset;
  }

  function animateGauge(target, duration = 1400, callback){
    cancelAnimationFrame(gaugeAnimationFrame);
    const startTime = performance.now();
    const startValue = parseFloat(gaugeValue.textContent) || 0;

    function step(now){
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
      const current = startValue + (target - startValue) * eased;
      setGaugeValue(current);
      if(progress < 1){
        gaugeAnimationFrame = requestAnimationFrame(step);
      } else if(typeof callback === 'function'){
        callback();
      }
    }

    gaugeAnimationFrame = requestAnimationFrame(step);
  }

  function initializeGauge(){
    gaugeFill.style.strokeDasharray = circleCircumference;
    setGaugeValue(0);
    progressText.innerHTML = `Yeh page abhi <b>${progressPercentage}% complete</b> hai. Kaam jari hai aur aap niche scroll karte hi progress dial animation dekh sakte hain.`;
  }

  function playGaugeSequence(){
    setGaugeValue(0);
    animateGauge(100, 1200, () => {
      animateGauge(progressPercentage, 800);
    });
  }

  function startGaugeAnimation(){
    if(gaugeAnimated) return;
    gaugeAnimated = true;
    gaugePanel.classList.add('visible');
    playGaugeSequence();
  }

  function stopGaugeAnimation(){
    gaugeAnimated = false;
    gaugePanel.classList.remove('visible');
  }

  gaugeRefresh.addEventListener('click', () => {
    gaugeRefresh.classList.add('pressed');
    setTimeout(() => gaugeRefresh.classList.remove('pressed'), 360);
    playGaugeSequence();
  });

  lockBtn.addEventListener('click', () => {
    if(!lockBtn.disabled){
      window.location.href = 'home.html'; // change to your actual next-page path
    }
  });

  const timer = setInterval(tick, 1000);
  tick();
  initializeGauge();

  if('IntersectionObserver' in window && gaugePanel){
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          startGaugeAnimation();
        } else {
          stopGaugeAnimation();
        }
      });
    }, { threshold: 0.35 });
    observer.observe(gaugePanel);
  } else {
    startGaugeAnimation();
  }

  // background floating dots
  const decor = document.getElementById('bgDecor');
  const colors = ['#F4B942', '#FF6F61', '#8B9DC3'];
  for(let i=0;i<18;i++){
    const dot = document.createElement('div');
    dot.className = 'dot';
    const size = 6 + Math.random()*16;
    dot.style.width = size+'px';
    dot.style.height = size+'px';
    dot.style.left = Math.random()*100+'%';
    dot.style.top = Math.random()*100+'%';
    dot.style.background = colors[i % colors.length];
    dot.style.animationDelay = (Math.random()*6)+'s';
    dot.style.animationDuration = (10 + Math.random()*8)+'s';
    decor.appendChild(dot);
  }

  // balloons rising in a continuous loop, bottom to top
  const balloonColors = ['#F4B942', '#FF6F61', '#8B9DC3', '#F4B942', '#FF6F61'];
  const pairColors = ['#2E7D4F', '#1A1A1A']; // green + black, launched as close pairs
  function balloonSVG(color){
    return `
      <svg viewBox="0 0 60 90" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="30" cy="34" rx="26" ry="32" fill="${color}"/>
        <ellipse cx="21" cy="22" rx="7" ry="10" fill="rgba(255,255,255,0.18)"/>
        <path d="M30 66 Q34 70 30 74 Q26 78 30 82" stroke="rgba(253,246,233,0.5)" stroke-width="1.5" fill="none"/>
        <path d="M27 66 L33 66 L30 74 Z" fill="${color}"/>
      </svg>
    `;
  }

  function makeBalloon(color, leftPct, sizePx, duration, delay){
    const balloon = document.createElement('div');
    balloon.className = 'balloon';
    balloon.style.width = sizePx+'px';
    balloon.style.height = (sizePx*1.5)+'px';
    balloon.style.left = leftPct+'%';
    balloon.style.animationDuration = duration+'s';
    balloon.style.animationDelay = delay+'s';
    balloon.innerHTML = balloonSVG(color);
    decor.appendChild(balloon);
  }

  const balloonCount = 8;
  const usedSpots = [];
  const minGap = 11; // minimum % gap between regular balloons so they don't bunch up

  function pickSpot(){
    let attempt = 0;
    let leftPct;
    do{
      leftPct = 2 + Math.random()*94;
      attempt++;
    } while(usedSpots.some(s => Math.abs(s - leftPct) < minGap) && attempt < 30);
    usedSpots.push(leftPct);
    return leftPct;
  }

  for(let i=0;i<balloonCount;i++){
    const size = 38 + Math.random()*32;
    const leftPct = pickSpot();
    const duration = 16 + Math.random()*10;
    const delay = -(Math.random()*24); /* stagger so loop feels continuous from the start */
    makeBalloon(balloonColors[i % balloonColors.length], leftPct, size, duration, delay);
  }

  // green + black balloons, launched in close pairs with a small up/down offset
  const pairCount = 4;
  for(let i=0;i<pairCount;i++){
    const size = 38 + Math.random()*28;
    const leftPct = pickSpot();
    const duration = 16 + Math.random()*10;
    const baseDelay = -(Math.random()*24);

    // green balloon
    makeBalloon(pairColors[0], leftPct, size, duration, baseDelay);
    // black balloon right beside it, tiny horizontal gap + slight vertical (time) offset
    makeBalloon(pairColors[1], leftPct + 4, size, duration, baseDelay - 1.2);
  }

// ===== Picture gallery section =====
const galleryItems = [
  { src: 'asest/Sorry%20Pictures/1.jpeg', caption: 'Yeh pehli yaad hai, jab har cheez itni simple aur khushgawar lagti thi.', heading: 'Yaad 1', description: 'Har pal apni jagah ek kahani ke saman hai. Yeh tasveer pehli shuruaat ka jashn hai.' },
  { src: 'asest/Sorry%20Pictures/2.jpeg', caption: 'Doosri tasveer mein woh pyara lamha saaf nazar ata hai.', heading: 'Yaad 2', description: 'Is lamhe se juda har jazba bohot qeemti hai. Usey dil se mehsoos karein.' },
  { src: 'asest/Sorry%20Pictures/3.jpeg', caption: 'Teesri yaad kuch khas aur mushkil se behtar hai.', heading: 'Yaad 3', description: 'Har muskurahat ka peecha koi khushi hoti hai. Is photo mein woh ghadi hai.' },
  { src: 'asest/Sorry%20Pictures/4.jpeg', caption: 'Yeh chauthi tasveer ek nayi raah ka ehsaas deti hai.', heading: 'Yaad 4', description: 'Jab naye manzilon par chalna hota hai, yaadein hamaare saath hoti hain.' },
  { src: 'asest/Sorry%20Pictures/5.jpeg', caption: 'College ke dinon ki yeh tasveer hamesha dil ke qareeb rahegi.', heading: 'Yaad 5', description: 'Woh din jab hasi, masti aur mushkilaat sab saath mil kar samjhe jaate thay.' },
  { src: 'asest/Sorry%20Pictures/6.jpeg', caption: 'Yeh photo husn-o-khubsurti aur dosti ka mix hai.', heading: 'Yaad 6', description: 'Har tasveer apni kahani bayaan karti hai - yeh us kahani ka ek hissa hai.' },
  { src: 'asest/Sorry%20Pictures/7.jpeg', caption: 'Saath guzra har lamha bohot pyaara hota hai.', heading: 'Yaad 7', description: 'Yeh tasveer dosti aur pyar bhari wafa ko yaad dilati hai.' },
  { src: 'asest/Sorry%20Pictures/8.jpeg', caption: 'Aathviya tasveer ek meethi yaad ban kar reh gayi.', heading: 'Yaad 8', description: 'Safar mein chhote pal hi ne humein mazboot banaya hai.' },
  { src: 'asest/Sorry%20Pictures/9.jpeg', caption: 'Yeh photo kuch khamosh lamhon ko chhupaye hue hai.', heading: 'Yaad 9', description: 'Kabhi kabhi sabse khubsurat tasveer woh hoti hai jisme shakal se zyada ehsaas nazar aaye.' },
  { src: 'asest/Sorry%20Pictures/10.jpeg', caption: 'Ek chhoti si trip, magar yaadon ka ek bada safar.', heading: 'Yaad 10', description: 'Har muskurahat aur har pal ke sath ek nayi yaad ban gayi thi.' },
  { src: 'asest/Sorry%20Pictures/11.jpeg', caption: 'Guzre hue waqt ki yaad is tasveer se aur gehri lagti hai.', heading: 'Yaad 11', description: 'Yaadein sirf dekhi nahi jaatiyaan, mehsoos bhi ki jaati hain.' },
  { src: 'asest/Sorry%20Pictures/12.jpeg', caption: 'Barahvi tasveer mein pyar aur shan hai.', heading: 'Yaad 12', description: 'Is photo ka har rang hamein ek khubsurat pal yaad dilata hai.' },
  { src: 'asest/Sorry%20Pictures/13.jpeg', caption: 'Tehqiq aur humdardi se bhari yeh yaad.', heading: 'Yaad 13', description: 'Yeh ek aisa pal hai jo dil se kabhi nahi nikalta.' },
  { src: 'asest/Sorry%20Pictures/14.jpeg', caption: 'Chaudahvi tasveer jazbaat ki gehrayi dikhati hai.', heading: 'Yaad 14', description: 'Iss lamhe mein chhupi khushi har baar dhundhne layak hoti hai.' },
  { src: 'asest/Sorry%20Pictures/15.jpeg', caption: 'Jashn ka din, khushiyon ka sab se pyara pal.', heading: 'Yaad 15', description: 'Aaj ki khushiyan kal ki sab se khoobsurat yaadon mein badal jaati hain.' },
  { src: 'asest/Sorry%20Pictures/16.jpeg', caption: 'Solahti tasveer ek nayi umeed ka paigham hai.', heading: 'Yaad 16', description: 'Har chhoti tasveer ke piche ek badi kahani hoti hai.' },
  { src: 'asest/Sorry%20Pictures/17.jpeg', caption: 'Satrahvi yaad hamare safar ka mazboot kirdar hai.', heading: 'Yaad 17', description: 'Is gallery ka aakhri pal ek haseen nateejah hai jo dil ko sukoon de.' }
];

const galleryColors = ['#F4B942', '#FF6F61', '#8B9DC3', '#2E7D4F'];

function placeholderImage(index){
  const color = galleryColors[index % galleryColors.length];
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
      <rect width="300" height="300" fill="${color}" opacity="0.25"/>
      <circle cx="150" cy="130" r="38" fill="none" stroke="${color}" stroke-width="6"/>
      <rect x="90" y="180" width="120" height="14" rx="7" fill="${color}"/>
      <rect x="110" y="204" width="80" height="10" rx="5" fill="${color}" opacity="0.6"/>
    </svg>
  `;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

let galleryIndex = 0;
const galleryPhoto = document.getElementById('galleryPhoto');
const galleryCaption = document.getElementById('galleryCaption');
const galleryCounter = document.getElementById('galleryCounter');
const galleryHeading = document.getElementById('galleryHeading');
const galleryDescription = document.getElementById('galleryDescription');
const galleryFrame = document.getElementById('galleryFrame');
const lightbox = document.getElementById('lightbox');
const lightboxPhoto = document.getElementById('lightboxPhoto');
const lightboxCaption = document.getElementById('lightboxCaption');
const galleryLeft = document.getElementById('galleryLeft');
const galleryRight = document.getElementById('galleryRight');

function renderGallery(direction){
  const item = galleryItems[galleryIndex];
  galleryPhoto.src = item?.src || placeholderImage(galleryIndex);
  galleryPhoto.alt = item?.heading || 'Gallery photo';
  galleryCaption.textContent = item?.caption || '';
  galleryCounter.textContent = String(galleryIndex + 1);
  galleryHeading.textContent = item?.heading || 'Gallery';
  galleryDescription.textContent = item?.description || '';

  galleryPhoto.classList.remove('slide-in-next', 'slide-in-prev');
  void galleryPhoto.offsetWidth;
  galleryPhoto.classList.add(direction === 'prev' ? 'slide-in-prev' : 'slide-in-next');
}

document.getElementById('galleryNext').addEventListener('click', () => {
  galleryIndex = (galleryIndex + 1) % galleryItems.length;
  renderGallery('next');
});

document.getElementById('galleryPrev').addEventListener('click', () => {
  galleryIndex = (galleryIndex - 1 + galleryItems.length) % galleryItems.length;
  renderGallery('prev');
});

galleryFrame.addEventListener('click', () => {
  const item = galleryItems[galleryIndex];
  lightboxPhoto.src = item?.src || placeholderImage(galleryIndex);
  lightboxPhoto.alt = item?.heading || 'Gallery photo';
  lightboxCaption.textContent = item?.caption || '';
  lightbox.classList.add('open');
});

document.getElementById('lightboxClose').addEventListener('click', () => {
  lightbox.classList.remove('open');
});

lightbox.addEventListener('click', (e) => {
  if(e.target === lightbox){
    lightbox.classList.remove('open');
  }
});

if('IntersectionObserver' in window && galleryLeft && galleryRight){
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
} else {
  galleryLeft?.classList.add('in-view');
  galleryRight?.classList.add('in-view');
}

renderGallery('next');

// ===== Scroll reveal for points rows (IntersectionObserver) =====
if('IntersectionObserver' in window){
  const pointRows = document.querySelectorAll('.point-row');
  if(pointRows.length){
    const rowObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          entry.target.classList.add('in-view');
        } else {
          entry.target.classList.remove('in-view');
        }
      });
    }, { threshold: 0.24 });
    pointRows.forEach(r => rowObserver.observe(r));
  }
}

// ===== Global cursor-follow spotlight =====
(function(){
  const spotlight = document.createElement('div');
  spotlight.id = 'cursorSpot';
  document.body.appendChild(spotlight);

  const state = { tx: window.innerWidth / 2, ty: window.innerHeight / 2, cx: window.innerWidth / 2, cy: window.innerHeight / 2 };
  let rafId = null;

  function rafLoop(){
    state.cx += (state.tx - state.cx) * 0.16;
    state.cy += (state.ty - state.cy) * 0.16;
    spotlight.style.left = state.cx + 'px';
    spotlight.style.top = state.cy + 'px';
    rafId = requestAnimationFrame(rafLoop);
  }

  function startLoop(){ if(!rafId) rafLoop(); }
  function stopLoop(){ if(rafId){ cancelAnimationFrame(rafId); rafId = null; } }

  document.addEventListener('mousemove', (e) => {
    state.tx = e.clientX;
    state.ty = e.clientY;
    startLoop();
    document.documentElement.classList.add('spotlight-on');
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    document.documentElement.classList.remove('spotlight-on');
    state.tx = window.innerWidth / 2; state.ty = window.innerHeight / 2;
    setTimeout(() => { stopLoop(); }, 320);
  });

  document.addEventListener('touchstart', (ev) => {
    const t = ev.touches[0];
    if(!t) return;
    state.tx = t.clientX;
    state.ty = t.clientY;
    document.documentElement.classList.add('spotlight-on');
    startLoop();
  }, { passive: true });

  document.addEventListener('touchend', () => {
    document.documentElement.classList.remove('spotlight-on');
    state.tx = window.innerWidth / 2; state.ty = window.innerHeight / 2;
    setTimeout(() => { stopLoop(); }, 320);
  });
})();
