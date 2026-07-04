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
  const progressPercentage = 1;
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
