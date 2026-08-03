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
const progressPercentage = 75;
const gaugeValue = document.getElementById('gaugeValue');
const gaugeFill = document.querySelector('.gauge-fill');
const gaugeRefresh = document.getElementById('gaugeRefresh');
const progressText = document.getElementById('progressText');
const gaugePanel = document.querySelector('.progress-panel');
let gaugeAnimated = false;

function pad(n) { return String(n).padStart(2, '0'); }

function tick() {
  const now = new Date();
  let diff = TARGET - now;

  if (diff <= 0) {
    dEl.textContent = '00'; hEl.textContent = '00'; mEl.textContent = '00'; sEl.textContent = '00';
    unlockEverything();
    clearInterval(timer);
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);

  dEl.textContent = pad(days);
  hEl.textContent = pad(hours);
  mEl.textContent = pad(mins);
  sEl.textContent = pad(secs);
}

function unlockEverything() {
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
    if (tip) tip.remove();
    const lockIcon = item.querySelector('svg');
    if (lockIcon) lockIcon.style.display = 'none';
  });
}

let gaugeAnimationFrame = null;
const circleRadius = 96;
const circleCircumference = 2 * Math.PI * circleRadius;

function setGaugeValue(value) {
  gaugeValue.textContent = `${Math.round(value)}%`;
  const offset = circleCircumference * (1 - value / 100);
  gaugeFill.style.strokeDashoffset = offset;
}

function animateGauge(target, duration = 1400, callback) {
  cancelAnimationFrame(gaugeAnimationFrame);
  const startTime = performance.now();
  const startValue = parseFloat(gaugeValue.textContent) || 0;

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
    const current = startValue + (target - startValue) * eased;
    setGaugeValue(current);
    if (progress < 1) {
      gaugeAnimationFrame = requestAnimationFrame(step);
    } else if (typeof callback === 'function') {
      callback();
    }
  }

  gaugeAnimationFrame = requestAnimationFrame(step);
}

function initializeGauge() {
  gaugeFill.style.strokeDasharray = circleCircumference;
  setGaugeValue(0);
  progressText.innerHTML = `Yeh page abhi <b>${progressPercentage}% complete</b> hai. Kaam jari hai aur aap niche scroll karte hi progress dial animation dekh sakte hain.`;
}

function playGaugeSequence() {
  setGaugeValue(0);
  animateGauge(100, 1200, () => {
    animateGauge(progressPercentage, 800);
  });
}

function startGaugeAnimation() {
  if (gaugeAnimated) return;
  gaugeAnimated = true;
  gaugePanel.classList.add('visible');
  playGaugeSequence();
}

function stopGaugeAnimation() {
  gaugeAnimated = false;
  gaugePanel.classList.remove('visible');
}

gaugeRefresh.addEventListener('click', () => {
  gaugeRefresh.classList.add('pressed');
  setTimeout(() => gaugeRefresh.classList.remove('pressed'), 360);
  playGaugeSequence();
});

lockBtn.addEventListener('click', () => {
  if (!lockBtn.disabled) {
    window.location.href = 'home.html'; // change to your actual next-page path
  }
});

const timer = setInterval(tick, 1000);
tick();
initializeGauge();

if ('IntersectionObserver' in window && gaugePanel) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
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
for (let i = 0; i < 18; i++) {
  const dot = document.createElement('div');
  dot.className = 'dot';
  const size = 6 + Math.random() * 16;
  dot.style.width = size + 'px';
  dot.style.height = size + 'px';
  dot.style.left = Math.random() * 100 + '%';
  dot.style.top = Math.random() * 100 + '%';
  dot.style.background = colors[i % colors.length];
  dot.style.animationDelay = (Math.random() * 6) + 's';
  dot.style.animationDuration = (10 + Math.random() * 8) + 's';
  decor.appendChild(dot);
}

// balloons rising in a continuous loop, bottom to top
const balloonColors = ['#F4B942', '#FF6F61', '#8B9DC3', '#F4B942', '#FF6F61'];
const pairColors = ['#2E7D4F', '#1A1A1A']; // green + black, launched as close pairs
function balloonSVG(color) {
  return `
      <svg viewBox="0 0 60 90" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="30" cy="34" rx="26" ry="32" fill="${color}"/>
        <ellipse cx="21" cy="22" rx="7" ry="10" fill="rgba(255,255,255,0.18)"/>
        <path d="M30 66 Q34 70 30 74 Q26 78 30 82" stroke="rgba(253,246,233,0.5)" stroke-width="1.5" fill="none"/>
        <path d="M27 66 L33 66 L30 74 Z" fill="${color}"/>
      </svg>
    `;
}

function makeBalloon(color, leftPct, sizePx, duration, delay) {
  const balloon = document.createElement('div');
  balloon.className = 'balloon';
  balloon.style.width = sizePx + 'px';
  balloon.style.height = (sizePx * 1.5) + 'px';
  balloon.style.left = leftPct + '%';
  balloon.style.animationDuration = duration + 's';
  balloon.style.animationDelay = delay + 's';
  balloon.innerHTML = balloonSVG(color);
  decor.appendChild(balloon);
}

const balloonCount = 8;
const usedSpots = [];
const minGap = 11; // minimum % gap between regular balloons so they don't bunch up

function pickSpot() {
  let attempt = 0;
  let leftPct;
  do {
    leftPct = 2 + Math.random() * 94;
    attempt++;
  } while (usedSpots.some(s => Math.abs(s - leftPct) < minGap) && attempt < 30);
  usedSpots.push(leftPct);
  return leftPct;
}

for (let i = 0; i < balloonCount; i++) {
  const size = 38 + Math.random() * 32;
  const leftPct = pickSpot();
  const duration = 16 + Math.random() * 10;
  const delay = -(Math.random() * 24); /* stagger so loop feels continuous from the start */
  makeBalloon(balloonColors[i % balloonColors.length], leftPct, size, duration, delay);
}

// green + black balloons, launched in close pairs with a small up/down offset
const pairCount = 4;
for (let i = 0; i < pairCount; i++) {
  const size = 38 + Math.random() * 28;
  const leftPct = pickSpot();
  const duration = 16 + Math.random() * 10;
  const baseDelay = -(Math.random() * 24);

  // green balloon
  makeBalloon(pairColors[0], leftPct, size, duration, baseDelay);
  // black balloon right beside it, tiny horizontal gap + slight vertical (time) offset
  makeBalloon(pairColors[1], leftPct + 4, size, duration, baseDelay - 1.2);
}

// ===== Picture gallery section =====
// const galleryItems = [
//   { src: 'asest/Sorry%20Pictures/1.jpeg', caption: 'Sorry Yara. 🤝💚', heading: 'Yaad 1', description: 'Har pal apni jagah ek kahani ke saman hai. Yeh tasveer pehli shuruaat ka jashn hai.' },
//   { src: 'asest/Sorry%20Pictures/2.jpeg', caption: 'Sorry Janu. 🥰🔒', heading: 'Yaad 2', description: 'Is lamhe se juda har jazba bohot qeemti hai. Usey dil se mehsoos karein.' },
//   { src: 'asest/Sorry%20Pictures/3.jpeg', caption: 'Sorry Kojii. 🙈💚', heading: 'Yaad 3', description: 'Har muskurahat ka peecha koi khushi hoti hai. Is photo mein woh ghadi hai.' },
//   { src: 'asest/Sorry%20Pictures/4.jpeg', caption: 'Sorry Jana. ✨🌹💚', heading: 'Yaad 4', description: 'Jab naye manzilon par chalna hota hai, yaadein hamaare saath hoti hain.' },
//   { src: 'asest/Sorry%20Pictures/5.jpeg', caption: 'Sorry So Sorry. 🥺🙏💚', heading: 'Yaad 5', description: 'Woh din jab hasi, masti aur mushkilaat sab saath mil kar samjhe jaate thay.' },
//   { src: 'asest/Sorry%20Pictures/6.jpeg', caption: 'Sorry Meri Jan. 💚👑', heading: 'Yaad 6', description: 'Har tasveer apni kahani bayaan karti hai - yeh us kahani ka ek hissa hai.' },
//   { src: 'asest/Sorry%20Pictures/7.jpeg', caption: 'Sorry Sehroo. 🌸💚🌍', heading: 'Yaad 7', description: 'Yeh tasveer dosti aur pyar bhari wafa ko yaad dilati hai.' },
//   { src: 'asest/Sorry%20Pictures/8.jpeg', caption: 'I love you. 💚🖤', heading: 'Yaad 8', description: 'Safar mein chhote pal hi ne humein mazboot banaya hai.' },
//   { src: 'asest/Sorry%20Pictures/9.jpeg', caption: 'Sorry Shona. 🧸💚', heading: 'Yaad 9', description: 'Kabhi kabhi sabse khubsurat tasveer woh hoti hai jisme shakal se zyada ehsaas nazar aaye.' },
//   { src: 'asest/Sorry%20Pictures/10.jpeg', caption: 'Sorry Sweeto. 🍭🎈', heading: 'Yaad 10', description: 'Har muskurahat aur har pal ke sath ek nayi yaad ban gayi thi.' },
//   { src: 'asest/Sorry%20Pictures/11.jpeg', caption: 'I love you Shona. 😍🦋', heading: 'Yaad 11', description: 'Yaadein sirf dekhi nahi jaatiyaan, mehsoos bhi ki jaati hain.' },
//   { src: 'asest/Sorry%20Pictures/12.jpeg', caption: 'Sorry plz. ✨🎨', heading: 'Yaad 12', description: 'Is photo ka har rang hamein ek khubsurat pal yaad dilata hai.' },
//   { src: 'asest/Sorry%20Pictures/13.jpeg', caption: 'Sorry Bacha. 🥺💬', heading: 'Yaad 13', description: 'Yeh ek aisa pal hai jo dil se kabhi nahi nikalta.' },
//   { src: 'asest/Sorry%20Pictures/14.jpeg', caption: 'M Sorry. 🐣💗', heading: 'Yaad 14', description: 'Iss lamhe mein chhupi khushi har baar dhundhne layak hoti hai.' },
//   { src: 'asest/Sorry%20Pictures/15.jpeg', caption: 'Sorry miss u. 😔📜', heading: 'Yaad 15', description: 'Aaj ki khushiyan kal ki sab se khoobsurat yaadon mein badal jaati hain.' },
//   { src: 'asest/Sorry%20Pictures/16.jpeg', caption: 'Sorry Plz Maan Jao. 💔⏳', heading: 'Yaad 16', description: 'Har chhoti tasveer ke piche ek badi kahani hoti hai.' },
//   { src: 'asest/Sorry%20Pictures/17.jpeg', caption: 'I am so Sorry. 🥺💚', heading: 'Yaad 17', description: 'Is gallery ka aakhri pal ek haseen nateejah hai jo dil ko sukoon de.' }
// ];

// const galleryColors = ['#F4B942', '#FF6F61', '#8B9DC3', '#2E7D4F'];

// function placeholderImage(index) {
//   const color = galleryColors[index % galleryColors.length];
//   const svg = `
//     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
//       <rect width="300" height="300" fill="${color}" opacity="0.25"/>
//       <circle cx="150" cy="130" r="38" fill="none" stroke="${color}" stroke-width="6"/>
//       <rect x="90" y="180" width="120" height="14" rx="7" fill="${color}"/>
//       <rect x="110" y="204" width="80" height="10" rx="5" fill="${color}" opacity="0.6"/>
//     </svg>
//   `;
//   return 'data:image/svg+xml,' + encodeURIComponent(svg);
// }

// let galleryIndex = 0;
// const galleryPhoto = document.getElementById('galleryPhoto');
// const galleryCaption = document.getElementById('galleryCaption');
// const galleryCounter = document.getElementById('galleryCounter');
// const galleryHeading = document.getElementById('galleryHeading');
// const galleryDescription = document.getElementById('galleryDescription');
// const galleryFrame = document.getElementById('galleryFrame');
// const lightbox = document.getElementById('lightbox');
// const lightboxPhoto = document.getElementById('lightboxPhoto');
// const lightboxCaption = document.getElementById('lightboxCaption');
// const galleryLeft = document.getElementById('galleryLeft');
// const galleryRight = document.getElementById('galleryRight');

// function renderGallery(direction) {
//   const item = galleryItems[galleryIndex];
//   galleryPhoto.src = item?.src || placeholderImage(galleryIndex);
//   galleryPhoto.alt = item?.heading || 'Gallery photo';
//   galleryCaption.textContent = item?.caption || '';
//   galleryCounter.textContent = String(galleryIndex + 1);

//   galleryPhoto.classList.remove('slide-in-next', 'slide-in-prev');
//   void galleryPhoto.offsetWidth;
//   galleryPhoto.classList.add(direction === 'prev' ? 'slide-in-prev' : 'slide-in-next');
// }

// document.getElementById('galleryNext').addEventListener('click', () => {
//   galleryIndex = (galleryIndex + 1) % galleryItems.length;
//   renderGallery('next');
// });

// document.getElementById('galleryPrev').addEventListener('click', () => {
//   galleryIndex = (galleryIndex - 1 + galleryItems.length) % galleryItems.length;
//   renderGallery('prev');
// });

// galleryFrame.addEventListener('click', () => {
//   const item = galleryItems[galleryIndex];
//   lightboxPhoto.src = item?.src || placeholderImage(galleryIndex);
//   lightboxPhoto.alt = item?.heading || 'Gallery photo';
//   lightboxCaption.textContent = item?.caption || '';
//   lightbox.classList.add('open');
// });

// document.getElementById('lightboxClose').addEventListener('click', () => {
//   lightbox.classList.remove('open');
// });

// lightbox.addEventListener('click', (e) => {
//   if (e.target === lightbox) {
//     lightbox.classList.remove('open');
//   }
// });

// if ('IntersectionObserver' in window && galleryLeft && galleryRight) {
//   const galleryObserver = new IntersectionObserver((entries) => {
//     entries.forEach(entry => {
//       if (entry.isIntersecting) {
//         entry.target.classList.add('in-view');
//       } else {
//         entry.target.classList.remove('in-view');
//       }
//     });
//   }, { threshold: 0.2 });

//   galleryObserver.observe(galleryLeft);
//   galleryObserver.observe(galleryRight);
// } else {
//   galleryLeft?.classList.add('in-view');
//   galleryRight?.classList.add('in-view');
// }

// renderGallery('next');

// ===== Work log table section =====
const worklogData = [
  {
    date: '5-Jul-26',
    hours: '05:00',
    title: 'Aaj is website mein aap ke liye kya naya add hua? 💚',
    subtitle: 'Aaj poore 5 ghanton ki mehnat, taake aap ki website behtar bane...',
    points: [
      { title: 'Ek haseen countdown aur intezar ⏳', detail: 'Website ka main page bilkul taiyar hai jahan ek bohot hi pyara countdown chal raha hai, jo 4th August ke ek ek second ka hisab rakh raha hai.' },
      { title: 'Surprise menu aur secure locks 🔒', detail: 'Story, Gallery, Guestbook, aur Surprise ke buttons add kar diye hain. Yeh sab abhi locked hain taake suspense aakhri waqt tak barkarar rahe.' },
      { title: 'Chalti hui ghari ka dial (Progress Tracker) 🔄', detail: 'Ek haseen progress dial banaya hai jo scroll karne par bohot hi smooth chalta hai aur yeh show karta hai ke website ka kaam kitna percent complete ho chuka hai.' },
      { title: 'Khushiyon bhare udte balloons aur confetti 🎈✨', detail: 'Background mein har taraf rang-birange gubbare aur confetti add kiye hain jo screen par bohot hi naram aur silky motion ke sath float karte hain, jo jashn ka mahol banate hain.' }
    ]
  },
  {
    date: '6-Jul-26',
    hours: '04:00',
    title: 'Aaj is website mein aap ke liye kya naya add hua? 💚',
    subtitle: 'Aaj poore 4 ghanton ki mehnat, chize aur behtar banane ke liye...',
    points: [
      { title: 'Har ek corner ko aasan banaya 💚', detail: 'Hum ne is baat ka poora khayal rakha hai ke aap ko is website ko chalane mein koi mushkil na ho; har ek button aur click ko bilkul flawless kar diya hai.' },
      { title: 'Super-fast speed aur performance ⚡', detail: 'Piche ka sara code aur images ko itna optimize kar diya hai ke page bina kisi rukawoat ke, palkon ke jhapakte hi bohot fast load ho jata hai.' }
    ]
  },
  {
    date: '7-Jul-26',
    hours: '06:00',
    title: 'Aaj is website mein aap ke liye kya naya rang bhara? 💚',
    subtitle: 'Aaj poore 6 ghanton se zyada ki mehnat, sirf aap ki ek smile ke liye...',
    points: [
      { title: '1000 Martaba Sorry Lekhi (Handwritten Gallery) 📝📜', detail: 'Website ke sabse khas hisse par kaam kiya—jahan maine apne haath se poore 1000 dafa "Sorry" likha tha. Us poore 2 ghante, 33 minute ki mehnat lagi or sliding gallery may dekh sakhtay hai.' },
      { title: 'Alag Alag Pages Ka Structure Aur Smart Unlock 🔐🔢', detail: 'Har ek section ke liye alag se page numbers ka poora structure design kar diya hai. Yeh saare pages abhi poori tarah secure aur locked hain; sahi waqt aane par countdown khatam hote hi yeh khud-ba-khud unlock ho jayenge aur aap inhein dekh sakeingi!' },
      { title: 'Mobile Ke Liye Ekdam Perfect Alignment 📱✨', detail: 'Website ke layout aur body structure ko is tarah behtar aur responsive banaya hai ke yeh sirf PC par nahi, balki aapke mobile phone par bhi bilkul center mein aur behad haseen aur balanced nazar aaye.' }
    ]
  },
  {
    date: '8-Jul-26',
    hours: '04:00',
    title: 'Aaj is website mein aap ke liye kya naya banaya? 🌟',
    subtitle: 'Aaj poore 4 ghanton ki lagan se kaam kiya, taake yeh website aur bhi khaas bane...',
    points: [
      { title: 'Naye Pages Ke Liye Khoobsurat Background Design ✨🎨', detail: 'Aaj kuch naye pages ke liye ekdum naye aur dilkash background designs tayar kiye hain. Har page ab apni alag roshni aur rang lekar aaya hai jo pehli nazar mein hi dil jeet leta hai.' },
      { title: 'Daily Updates Ka Record — Har Din Ka Hisaab Kitaab 📋📅', detail: 'Ab is website mein ek special table add kar di hai jahan har din ka kaam, ghante aur mehnat ka mukammal record mojood hai. Is tarah aap dekh sakti hain ke har roz kya kya naya bana aur kitni mehnat lagi!' },
      { title: 'Quiz Section Ka Design Tayar — 2 Din Mein Aayega Aap Ke Liye 🧠🎯', detail: 'Aap ke liye ek mazedaar Quiz Section ka design tayar kiya hai jahan aap ke man pasand sawaal honge. Yeh quiz 2 din ke andar website par live ho jayegen aur phir rozana aap ko naye sawalon ka jawab dena hoga — ready ho jaiye!' }
    ]
  },
  {
    date: '9-Jul-26',
    hours: '02:00',
    title: 'Aaj is website mein aap ke liye kya aur naya bana? 🧩',
    subtitle: 'Aaj 2 ghante lagaye — chhota lekin khaas kaam, aap ke liye...',
    points: [
      { title: 'Main Page Par Quiz Ka Button Add Ho Gaya! 🎯🔘', detail: 'Aaj main page par aap ke liye ek khas Quiz Button add kiya hai. Ab website par aate hi seedha quiz ka raasta nazar aayega — ek click aur sawaalon ki ap kaysamnay shuru! Yeh button ekdum stylish aur eye-catching banaya hai Likin yeh kal tak ap koh ap ki screen pay show ho ga.' },
      { title: 'Quiz Page Aadha Tayar Ho Gaya — Kal Tak Mukammal Hoga 🧠⏳', detail: 'Quiz ka page aaj aadha complete ho chuka hai — design, layout aur kuch sawal taiyar hain. Baaki kaam reh gaya hai jo umeed hai kal tak poora ho jayega. Phir aap ko rozana naye sawalon ke jawab dene honge — tayar ho jaiye! 😊' }
    ]
  },
  {
    date: '10-Jul-26',
    hours: '03:30',
    title: 'Aaj Quiz Ka Starting Page Design Hua! 🧩🎨',
    subtitle: 'Aaj 3:30 ghante lagaye — quiz page ka design aur starting page banaya...',
    points: [
      { title: 'Quiz Ka Design Shuru Ho Gaya! 🎨🧩', detail: 'Aaj se quiz page par kaam shuru kiya hai. Poora din quiz ke design aur layout par focus kiya — colors, structure aur look decide kiya taake quiz page bhi baaki website jaisa hi khoobsurat aur professional lage.' },
      { title: 'Quiz Ka Starting Page Ban Gaya! 🚀⏳', detail: 'Aaj quiz ka pehla page — yaani starting/intro page — bana diya hai. Yehi wo page hoga jahan se aap quiz shuru karenge. Baaki sawalon wala hissa abhi baaki hai, jo aane wale dinon mein mukammal hoga. 😊' }
    ]
  },
  {
    date: '11-Jul-26',
    hours: '0:30',
    title: 'Aaj Technical Issue Ki Wajah Se Kaam Ruk Gaya ⚠️🔧',
    subtitle: 'Aaj sirf 30 min kaam ho saka — tool kaam nahi kar raha tha...',
    points: [
      { title: 'Tool Mein Technical Issue Aa Gaya ⚠️💻', detail: 'Aaj kaam shuru karne ki koshish ki lekin tool theek se chal nahi raha tha. Kaafi der try kiya lekin issue resolve nahi ho saka, is wajah se planned kaam continue nahi ho saka.' },
      { title: 'Sirf 30 Minute Kaam Ho Paya ⏳', detail: 'Technical dikkat ki wajah se aaj sirf 30 minute hi kaam ho saka. Baaki bacha hua kaam agle din continue kiya jayega jab tool sahi tarah se kaam karega. 😊' }
    ]
  },
  {
    date: '12-Jul-26',
    hours: '2:00',
    title: 'Aaj Technical Issue Theek Karne Mein 2 Ghante Lag Gaye ⚠️🔧',
    subtitle: 'Aaj 2 ghante tool ka issue resolve karne mein lagaye — poora setup dobara kiya...',
    points: [
      { title: 'Tool Mein Technical Issue Aa Gaya ⚠️💻', detail: 'Aaj kaam shuru karte hi tool theek se chalna band ho gaya. Kaafi try kiya lekin normal tareeqe se issue theek nahi hua, is liye poora setup dobara se karna pada.' },
      { title: 'Tool Uninstall Kar Ke Dobara Install Kiya 🔄🛠️', detail: 'Sab se pehle tool ka poora setup uninstall kiya, phir usay dobara install kiya. Uske baad tool ke saare steps ko reload aur reconfigure karna pada — is poore process mein hi taqreeban 2 ghante lag gaye.' },
      { title: 'Settings Dobara Set Ki Aur Issue Resolve Hua ⚙️✅', detail: 'Reinstall ke baad tool ki saari settings dobara se set ki. Kaafi der lagi lekin aakhirkar issue resolve ho gaya aur tool normal tarah se kaam karne laga. 😊' }
    ]
  },
  {
    date: '13-Jul-26',
    hours: '4:30',
    title: 'Aaj Quiz Ke Question Pages Ban Gaye! 🧩✅',
    subtitle: 'Aaj 4:30 ghante lagaye — quiz ke agle sawal wale pages banaye...',
    points: [
      { title: 'Quiz Ke Sawal-Jawab Pages Taiyar 📝❓', detail: 'Aaj quiz ke next question pages banaye jin mein sawal aur unke jawab likhe gaye. Har question ke saath options wala part bhi add kiya taake user asani se apna jawab select kar sake.' },
      { title: 'Options Wala Part Add Kiya 🔘🎯', detail: 'Har sawal ke sath multiple options add kiye taake aap un mein se sahi jawab choose kar sakein. Ye options ka system ab quiz ko interactive aur user-friendly banata hai.' },
      { title: 'Maqsad — Aap Ko Behtar Jaanna Aur Pehchanna 💭❤️', detail: 'In sawalon ka asal maqsad ye hai ke hum dekh sakein aap humare baare mein kitna jaante hain aur kitna pehchante hain. Yeh sawal-jawab ka silsila humein aap se aur qareeb laane ke liye banaya gaya hai. 😊' }
    ]
  },
  {
    date: '14-Jul-26',
    hours: '0:00',
    title: 'Aaj Kaam Nahi Ho Saka — Off Day 🌧️😔',
    subtitle: 'Aaj mood theek nahi tha aur kaafi low feel ho raha tha...',
    points: [
      { title: 'Aaj Mood Low Tha 😔🌧️', detail: 'Aaj kaafi thaka hua aur low feel ho raha tha, is wajah se kaam par focus nahi ho saka. Is liye aaj koi kaam continue nahi kiya ja saka.' },
      { title: 'Kal Se Dobara Shuru Karenge 💪🌅', detail: 'Aaj rest le liya hai taake fresh mind ke sath kal se dobara kaam shuru kiya ja sake. Break lena bhi zaroori hota hai. 😊' }
    ]
  },
  {
    date: '15-Jul-26',
    hours: '3:30',
    title: 'Aaj Quiz Ka Last Page Mukammal Ho Gaya! 🏁🎉',
    subtitle: 'Aaj 3:30 ghante lagaye — quiz ka final page aur technical improvements...',
    points: [
      { title: 'Quiz Ka Last Page Ban Gaya 🏆📊', detail: 'Aaj quiz ka aakhri page mukammal kar diya hai jahan aap apna score dekh sakte hain, use share kar sakte hain aur save bhi kar sakte hain. Isi page se pata chalega ke aap humare baare mein kitna jaante hain.' },
      { title: 'Score Local Storage Mein Save Hone Laga 💾✅', detail: 'Ab aap ka score local storage mein save ho jata hai, taake wapas aane par bhi aap apna pichla result dekh sakein. Isse data hamesha mehfooz rehta hai.' },
      { title: 'Quiz Mein Kai Technical Improvements Hui 🛠️⚙️', detail: 'Aaj quiz ke kaafi technical hisso par bhi kaam kiya jis se pages aur behtar aur smooth ho gaye. Overall performance aur experience pehle se zyada behtar ho gaya hai.' },
      { title: 'Aap Ke Jawab Ab Yaad Rehte Hain 🧠❤️', detail: 'Ab quiz mein diye gaye aap ke jawab ek memory ki tarah save ho jate hain, taake wo humesha mehfooz rahein aur humein yaad rahe ke aap ne humare baare mein kya bataya tha. 😊' }
    ]
  },
  {
    date: '16-Jul-26',
    hours: '5:00',
    title: 'Aaj Quiz Ke Sabhi Sawal Ban Gaye! 📝🎉',
    subtitle: 'Aaj 5 ghante lagaye — quiz ke tamam sawal banaye aur yaadon wale questions add kiye...',
    points: [
      { title: 'Quiz Ke Sabhi Questions Taiyar Ho Gaye ✅📋', detail: 'Aaj quiz ke sab sawal ban gaye jo aap se poochhe jayenge aur jinka aap jawab denge. Ab quiz mukammal set of questions ke sath ready hai.' },
      { title: 'Section Ko Mazedaar Banane Ke Liye Kaam Kiya 🎯✨', detail: 'Sawalon ko is tarah design kiya gaya hai ke yeh section pehle se zyada mazedaar aur interesting bane, taake jawab dete waqt aap enjoy karein.' },
      { title: 'Yaadon Ke Mutalliq Sawaal Add Kiye 💭❤️', detail: 'Aaj khaas taur par kuch sawaal aisay add kiye jo humari yaadon se related hain, taake quiz mein ek personal aur khaas touch aa sake. 😊' }
    ]
  },
  {
    date: '17-Jul-26',
    hours: '5:00',
    title: 'Aaj 3 Naye Sections Ban Gaye! 🎁📸💭',
    subtitle: 'Aaj 5 ghante lagaye — ek hidden secret page, photo gallery aur memory section banaya...',
    points: [
      { title: 'Naya Hidden Secret Page Banaya 🔒🎁', detail: 'Aaj ek naya page banaya hai jis mein ek chhota sa hidden secret rakha hai. Yeh page khaas taur par surprise ke liye design kiya gaya hai.' },
      { title: 'Photos Ki Gallery Ban Gayi 📸🖼️', detail: 'Aaj ek photo gallery bhi banai hai jahan tasveerein khoobsurat andaz mein dekhi ja sakti hain. Isse website mein visual aur yaadon ka ek naya section shamil ho gaya.' },
      { title: 'Memory Ka Section Add Kiya 💭❤️', detail: 'Aaj ek memory section bhi banaya hai jahan khaas yaadein mehfooz ki ja sakti hain. Yeh section website ko aur bhi personal aur khaas bana raha hai. 😊' }
    ]
  },
  {
    date: '18-Jul-26',
    hours: '5:00',
    title: 'Aaj Quiz Ke Sabhi Sawal Ban Gaye! 📝🎉',
    subtitle: 'Aaj 5 ghante lagaye — quiz ke tamam sawal banaye aur yaadon wale questions add kiye...',
    points: [
      { title: 'Quiz Ke Sabhi Questions Taiyar Ho Gaye ✅📋', detail: 'Aaj quiz ke sab sawal ban gaye jo aap se poochhe jayenge aur jinka aap jawab denge. Ab quiz mukammal set of questions ke sath ready hai.' },
      { title: 'Section Ko Mazedaar Banane Ke Liye Kaam Kiya 🎯✨', detail: 'Sawalon ko is tarah design kiya gaya hai ke yeh section pehle se zyada mazedaar aur interesting bane, taake jawab dete waqt aap enjoy karein.' },
      { title: 'Yaadon Ke Mutalliq Sawaal Add Kiye 💭❤️', detail: 'Aaj khaas taur par kuch sawaal aisay add kiye jo humari yaadon se related hain, taake quiz mein ek personal aur khaas touch aa sake. 😊' }
    ]
  },
  {
    date: '19-Jul-26',
    hours: '5:00',
    title: 'Aaj Quiz Ke Sabhi Sawal Ban Gaye! 📝🎉',
    subtitle: 'Aaj 5 ghante lagaye — quiz ke tamam sawal banaye aur yaadon wale questions add kiye...',
    points: [
      { title: 'Quiz Ke Sabhi Questions Taiyar Ho Gaye ✅📋', detail: 'Aaj quiz ke sab sawal ban gaye jo aap se poochhe jayenge aur jinka aap jawab denge. Ab quiz mukammal set of questions ke sath ready hai.' },
      { title: 'Section Ko Mazedaar Banane Ke Liye Kaam Kiya 🎯✨', detail: 'Sawalon ko is tarah design kiya gaya hai ke yeh section pehle se zyada mazedaar aur interesting bane, taake jawab dete waqt aap enjoy karein.' },
      { title: 'Yaadon Ke Mutalliq Sawaal Add Kiye 💭❤️', detail: 'Aaj khaas taur par kuch sawaal aisay add kiye jo humari yaadon se related hain, taake quiz mein ek personal aur khaas touch aa sake. 😊' }
    ]
  },
  {
    date: '20-Jul-26',
    hours: '5:00',
    title: 'Aaj Quiz Ke Sabhi Sawal Ban Gaye! 📝🎉',
    subtitle: 'Aaj 5 ghante lagaye — quiz ke tamam sawal banaye aur yaadon wale questions add kiye...',
    points: [
      { title: 'Quiz Ke Sabhi Questions Taiyar Ho Gaye ✅📋', detail: 'Aaj quiz ke sab sawal ban gaye jo aap se poochhe jayenge aur jinka aap jawab denge. Ab quiz mukammal set of questions ke sath ready hai.' },
      { title: 'Section Ko Mazedaar Banane Ke Liye Kaam Kiya 🎯✨', detail: 'Sawalon ko is tarah design kiya gaya hai ke yeh section pehle se zyada mazedaar aur interesting bane, taake jawab dete waqt aap enjoy karein.' },
      { title: 'Yaadon Ke Mutalliq Sawaal Add Kiye 💭❤️', detail: 'Aaj khaas taur par kuch sawaal aisay add kiye jo humari yaadon se related hain, taake quiz mein ek personal aur khaas touch aa sake. 😊' }
    ]
  },
  {
    date: '21-Jul-26',
    hours: '5:00',
    title: 'Aaj Quiz Ke Sabhi Sawal Ban Gaye! 📝🎉',
    subtitle: 'Aaj 5 ghante lagaye — quiz ke tamam sawal banaye aur yaadon wale questions add kiye...',
    points: [
      { title: 'Quiz Ke Sabhi Questions Taiyar Ho Gaye ✅📋', detail: 'Aaj quiz ke sab sawal ban gaye jo aap se poochhe jayenge aur jinka aap jawab denge. Ab quiz mukammal set of questions ke sath ready hai.' },
      { title: 'Section Ko Mazedaar Banane Ke Liye Kaam Kiya 🎯✨', detail: 'Sawalon ko is tarah design kiya gaya hai ke yeh section pehle se zyada mazedaar aur interesting bane, taake jawab dete waqt aap enjoy karein.' },
      { title: 'Yaadon Ke Mutalliq Sawaal Add Kiye 💭❤️', detail: 'Aaj khaas taur par kuch sawaal aisay add kiye jo humari yaadon se related hain, taake quiz mein ek personal aur khaas touch aa sake. 😊' }
    ]
  },
  {
    date: '22-Jul-26',
    hours: '5:00',
    title: 'Aaj Quiz Ke Sabhi Sawal Ban Gaye! 📝🎉',
    subtitle: 'Aaj 5 ghante lagaye — quiz ke tamam sawal banaye aur yaadon wale questions add kiye...',
    points: [
      { title: 'Quiz Ke Sabhi Questions Taiyar Ho Gaye ✅📋', detail: 'Aaj quiz ke sab sawal ban gaye jo aap se poochhe jayenge aur jinka aap jawab denge. Ab quiz mukammal set of questions ke sath ready hai.' },
      { title: 'Section Ko Mazedaar Banane Ke Liye Kaam Kiya 🎯✨', detail: 'Sawalon ko is tarah design kiya gaya hai ke yeh section pehle se zyada mazedaar aur interesting bane, taake jawab dete waqt aap enjoy karein.' },
      { title: 'Yaadon Ke Mutalliq Sawaal Add Kiye 💭❤️', detail: 'Aaj khaas taur par kuch sawaal aisay add kiye jo humari yaadon se related hain, taake quiz mein ek personal aur khaas touch aa sake. 😊' }
    ]
  },
  {
    date: '23-Jul-26',
    hours: '6:00',
    title: 'Aaj Pictures Ki Selection Aur Editing Hui! 📸✨',
    subtitle: 'Aaj 6 ghante lagaye — kaafi sari pictures ko chun kar unki ek achi collection banai...',
    points: [
      { title: 'Pictures Ki Selection Ki Aur Collection Banai 🖼️📂', detail: 'Aaj kaafi sari pictures mein se select karke unhein jama kiya aur ek achi collection tayar ki, jo ab website ke gallery section mein use hogi.' },
      { title: 'Pictures Ko Edit Kiya Website Ke Liye 🎨🛠️', detail: 'Selected pictures ko edit kiya taake wo website page par lagane ke liye theek tarah taiyar ho sakein — sizing, quality aur look sab set kiya.' },
      { title: 'Kaafi Maza Aaya Aur Purani Yaadein Taza Hui 💭❤️', detail: 'Ye kaam karte hue kaafi maza aaya. Kaafi sari pictures pehchani gayi aur unhein dekh kar purani yaadein bhi taza ho gayi. Ek pyara aur nostalgic experience raha. 😊' }
    ]
  },
  {
    date: '24-Jul-26',
    hours: '4:00',
    title: 'Aaj Bhi Pictures Par Kaam Jaari Raha! 📸🔄',
    subtitle: 'Aaj kuch memories edit ki aur kuch nayi pictures select ki...',
    points: [
      { title: 'Kuch Memories Edit Ki 💭🎨', detail: 'Aaj humari kuch pehle wali memories ko dobara edit kiya taake wo aur behtar aur presentable lagein.' },
      { title: 'Nayi Pictures Ki Selection Ki 🖼️✅', detail: 'Aaj kuch nayi pictures bhi select ki gayi jo aane wale collection mein shamil ki jayengi. Selection process continue raha. 😊' }
    ]
  },
  {
    date: '25-Jul-26',
    hours: '0:00',
    title: 'Aaj Kaam Nahi Ho Saka — Off Day 🌧️😔',
    subtitle: 'Aaj dil nahi kiya kaam karne ka, is liye aaj koi kaam nahi ho saka...',
    points: [
      { title: 'Aaj Dil Nahi Kiya Kaam Karne Ka 😔', detail: 'Aaj kaam karne ka mann nahi tha, is wajah se koi kaam continue nahi ho saka. Kabhi kabhi aisa hona normal hai.' },
      { title: 'Kaam Kal Continue Hoga 📅💪', detail: 'Aaj ka baaki kaam ab kal kiya jayega. Thodi delay ho gayi hai lekin project pura hoga, bas ek din aage shift ho gaya. 😊' }
    ]
  },
  {
    date: '26-Jul-26',
    hours: '0:00',
    title: 'Aaj Office Ka Din Raha — Website Ka Kaam Nahi Ho Saka 🏢😔',
    subtitle: 'Aaj office mein busy raha, waqt nahi mil saka website ke kaam ke liye...',
    points: [
      { title: 'Aaj Office Mein Din Guzra 🏢⏰', detail: 'Aaj poora din office ke kaam mein guzar gaya, is wajah se website par kaam karne ka waqt nahi mil saka.' },
      { title: 'Digestive System Ki Presentation Banai 🧠📊', detail: 'Aaj office ke kaam ke silsile mein digestive system ki presentation banai. Ye kaam karne mein maza bhi aaya aur thodi mehnat bhi lagi.' },
      { title: 'Ghar Aa Kar So Gaya 🛌😴', detail: 'Ghar aane ke baad thakaan ki wajah se so gaya aur website ka koi kaam nahi ho saka. Kaam kal se dobara continue hoga. 😊' }
    ]
  },
  {
    date: '27-Jul-26',
    hours: '5:00',
    title: 'Aaj Pictures Ke Liye Naye Templates Dekhe! 🎨📸',
    subtitle: 'Aaj naye page templates aur designs explore kiye pictures ko behtar show karne ke liye...',
    points: [
      { title: 'Naye Page Templates Aur Designs Dekhe 🖼️✨', detail: 'Aaj pictures lagane ke liye kuch naye page templates aur alag-alag designs dekhe, taake best option choose kiya ja sake.' },
      { title: 'Creative Ideas Pe Socha 💡🎯', detail: 'Is page ko aur behtar banane ke liye kuch creative ideas par socha, jo pictures ko aur bhi acha aur attractive tareeqe se show karwane mein madad karenge.' },
      { title: 'Jald Hi Sab Kuch Dekhne Ko Milega 🚀😊', detail: 'In naye ideas aur designs par kaam jaari hai, aur bahut jald aap ko ye sab website par dekhne ko milega. 😊' }
    ]
  },
  {
    date: '28-Jul-26',
    hours: '6:00',
    title: 'Aaj Pictures Ka Kaam Mukammal Ho Gaya! 🎉📸',
    subtitle: 'Aaj pictures ki selection aur upload dono kaam mukammal kar diye...',
    points: [
      { title: 'Pictures Ki Selection Mukammal Hui ✅🖼️', detail: 'Aaj pictures ki selection ka kaam mukammal kar diya gaya hai. Sabhi zaroori pictures ko finalize kar liya gaya hai.' },
      { title: 'Pictures Ka Upload Bhi Mukammal Hua ⬆️✅', detail: 'Selected pictures ka upload karne ka kaam bhi mukammal ho gaya hai. Ab sab pictures website par lag chuki hain.' },
      { title: 'Khaas Khaas Yaadon Wali Pictures Lagayi 💭❤️', detail: 'Kuch bohot khaas pictures lagayi gayi hain jo aap ki aur humari yaadon se bhari hui hain — ye pictures dekh kar ek pyara sa past yaad aa jayega. 😊' }
    ]
  },
  {
    date: '29-Jul-26',
    hours: '5:30',
    title: 'Aaj Birthday Celebration Page Pe Kaam Kiya! 🎂🎉',
    subtitle: 'Aaj ek naya attractive page banaya jo Birthday Celebration page kehlayega...',
    points: [
      { title: 'Naya Attractive Page Banaya 🎨✨', detail: 'Aaj ek naya page banaya jo dekhne mein kaafi attractive hai. Is page ko Birthday Celebration Page ka naam diya gaya hai.' },
      { title: 'Ghar Jaisi Decoration Ka Feel Add Kiya 🏠🎈', detail: 'Page mein ek ghar ki tarah decoration ka ahsaas add kiya gaya hai — chhoti chhoti details is tarah se rakhi hain jo ek pyara sa ghar-jaisa mahol create karti hain.' },
      { title: 'Celebration Ka Ahsaas Delane Wala Design 🎊❤️', detail: 'Poore page ko is tarah design kiya gaya hai ke wo ek celebration ka pura ahsaas dilaye — jaise koi khaas mauqa manaya ja raha ho. 😊' }
    ]
  },
  {
    date: '30-Jul-26',
    hours: '0:00',
    title: 'Aaj Office Ki Wajah Se Kaam Nahi Ho Saka 🏢😔',
    subtitle: 'Aaj poora din office ke kaam mein lag gaya, kaafi thakaan bhi ho gayi...',
    points: [
      { title: 'Poora Din Office Mein Lag Gaya 🏢⏰', detail: 'Aaj office ke kaam ki wajah se poora din busy raha, is liye website par time nahi mil saka.' },
      { title: 'Kaafi Zyada Thakaan Ho Gayi 😴💤', detail: 'Din khatam hote hote kaafi zyada thak gaya tha, is wajah se koi naya kaam continue nahi ho saka. Kaam kal se dobara shuru hoga. 😊' }
    ]
  },
  {
    date: '31-Jul-26',
    hours: '6:30',
    title: 'Aaj Pages Link Hue Aur Naya Pictures Section Bana! 🔗📸',
    subtitle: 'Aaj kuch pages ek dusre se link kiye, text animation par kaam kiya aur naya pictures section add kiya...',
    points: [
      { title: 'Pages Ko Ek Dusre Se Link Kiya 🔗📄', detail: 'Aaj kuch pages ko aapas mein link kiya taake user ek page se dusre page tak asani se navigate kar sake. Naye creative ideas bhi is dauran soche gaye.' },
      { title: 'Text Animation Par Kaam Kiya ✨🔤', detail: 'Page ko aur behtar banane ke liye text animation par kaam kiya, jis se content dekhne mein aur bhi attractive aur lively lagega.' },
      { title: 'Naya Pictures Section Add Kiya 🖼️➕', detail: 'Ek naya pictures section bana kar website mein add kiya gaya hai, jahan pictures ko behtar tareeqe se show kiya ja sakega.' },
      { title: 'Video Section Ka Aghaz Hua 🎥⏳', detail: 'Ek video section bhi banana shuru kiya hai, abhi is par zyada kaam nahi hua lekin bahut jald is par kaam shuru ho jayega aur ye bhi jald mukammal ho jayega. 😊' }
    ]
  },
  {
    date: '01-Aug-26',
    hours: '08:30',
    title: 'Aaj Font, Design Aur Code Checking Par Kaam Hua! 🔍🎨',
    subtitle: 'Aaj pages ke font aur design par kaam kiya aur sabhi codes ko dobara check kiya...',
    points: [
      { title: 'Font Aur Design Par Kaam Kiya 🎨🔤', detail: 'Aaj website ke pages ke font aur design par kaam kiya, taake sab kuch aur behtar aur polished lage.' },
      { title: 'Sabhi Codes Ko Dobara Check Kiya ✅🔍', detail: 'Aaj sab codes ko ghor se dekha aur check kiya taake aap ke birthday wale din par deploy karte waqt koi masla na aaye. Har cheez ko carefully verify kiya gaya.' },
      { title: 'Kaafi Sara Kaam Mukammal Hua 💪✅', detail: 'Aaj kaafi sara kaam mukammal kar liya gaya, halanke is dauran kaafi thakaan bhi ho gayi. Phir bhi zaroori kaam poora karne ki koshish jaari rakhi.' },
      { title: 'Baaki Font Style Aur Design Par Kaam Jaari Rahega 🖌️⏳', detail: 'Kuch font style aur design ka kaam abhi baaki hai jo aane wale din mein continue kiya jayega. 😊' }
    ]
  },
  {
    date: '02-Aug-26',
    hours: '10:00',
    title: 'Aaj Birthday Se Pehle Aakhri Bhaag Daud! 🎂💚',
    subtitle: 'Aaj kal se bhi zyada mehnat ki — kyunke bas kuch hi ghante reh gaye hain ap ke khaas din mein...',
    points: [
      {
        title: 'Sara Data Dobara Download Kiya 📥🔄',
        detail: 'Pichle data mein kuch error aa rahe the, is liye aaj sara data dobara download kiya. Isi dauran ap ki bohot si achi pictures aur videos nikali gayi.'
      },
      {
        title: 'Kuch Nayi Videos Aur Pictures Set Ki 🎥📸',
        detail: 'Aaj kuch nayi videos banayi gayi aur kuch pictures ko set kiya gaya, taake sab kuch birthday ke din tak taiyar ho.'
      },
      {
        title: 'Haath Mein Dard Ke Bawajood Kaam Jaari Rakha ✋💪',
        detail: 'Haath mein kaafi zyada dard tha lekin phir bhi typing continue ki, kyunke rukna ap ke liye sadness ki wajah ban sakta tha — is liye har mushkil ke bawajood kaam nahi roka.'
      },
      {
        title: 'Pages, Codes Aur Pictures Ko Fix Kiya 🛠️✅',
        detail: 'Aaj pages aur codes par kaam kiya aur pictures ko fix kiya taake sab kuch acha lage. Code ko bhi accurate aur error-free banaya gaya. 😊'
      },
      {
        title: 'Pages Ko Ek Dusre Se Link Kiya 🔗📄',
        detail: 'Pages ko aapas mein smoothly link kiya taake navigation aasan ho sake. Is ke sath naye creative ideas par bhi kaam kiya gaya.'
      },
      {
        title: 'Text Animation Par Kaam Kiya ✨🔤',
        detail: 'Text ko aur zyada attractive aur lively banane ke liye animations ko refine aur accurate kiya gaya.'
      },
      {
        title: 'Naya Pictures Section Add Kiya 🖼️➕',
        detail: 'Pichle data mein error aane par saara data dobara download kiya, best pictures select karke ek naya picture section design kiya.'
      },
      {
        title: 'Video Section Ka Aghaz & Media Setup 🎥⏳',
        detail: 'Nayi videos banayi aur video section par kaam shuru kar diya hai. Bohot jald yeh section bhi poori tarah ready ho jayega! 😊'
      }
    ]
  },
  {
    date: '03-Aug-26',
    hours: '12:30',
    title: 'Aaj Sabhi Pictures Add Aur Mukhtalif Issues Fix Kiye! 📸🛠️',
    subtitle: 'Aaj poora din pictures, data aur responsive design par mehnat ki — birthday se pehle aakhri koshish...',
    points: [
      { title: 'Sabhi Pictures Add Ki Aur Data Manage Kiya 📸📂', detail: 'Aaj sab pictures ko website mein add kiya aur sara data theek tareeqe se manage kiya, taake har cheez apni sahi jagah par nazar aaye.' },
      { title: 'Kuch Pages Ko Dobara Responsive Banaya 📱✅', detail: 'Kuch pages ke steps ko dobara se responsive banaya taake wo mobile aur different screens par bhi behtareen dikhein.' },
      { title: 'Mixed Issues Ko Theek Kiya 🔧✨', detail: 'Kaafi cheezein aisi thi jo mix ho gayi thi ya masla kar rahi thi — un sabko dhoond kar sahi kiya gaya.' },
      { title: 'Poora Din Isi Kaam Mein Guzra ⏳💪', detail: 'Aaj sara din ismein guzar gaya. Abhi bhi kuch cheezein baaki hain jo umeed hai birthday khatam hone se pehle add kar di jayengi.' }
    ]
  }
];

const worklogBody = document.getElementById('worklogBody');
if (worklogBody) {
  worklogData.forEach((day, i) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${day.date}</td>
      <td class="worklog-hours">${day.hours}</td>
      <td><button class="worklog-view-btn" data-index="${i}">view</button></td>
    `;
    worklogBody.appendChild(row);
  });
}

const daylogModal = document.getElementById('daylogModal');
const daylogTitle = document.getElementById('daylogTitle');
const daylogSubtitle = document.getElementById('daylogSubtitle');
const daylogPoints = document.getElementById('daylogPoints');

if (worklogBody) {
  worklogBody.addEventListener('click', (e) => {
    if (!e.target.classList.contains('worklog-view-btn')) return;
    const day = worklogData[e.target.dataset.index];
    if (!day) return;

    daylogTitle.textContent = day.title;
    daylogSubtitle.textContent = day.subtitle;
    daylogPoints.innerHTML = '';

    day.points.forEach((p, i) => {
      const el = document.createElement('div');
      el.className = 'daylog-point';
      el.style.animationDelay = (i * 0.1) + 's';
      el.innerHTML = `
        <div class="daylog-dot"></div>
        <div>
          <div class="daylog-point-title">${p.title}</div>
          <div class="daylog-point-detail">${p.detail}</div>
        </div>
      `;
      daylogPoints.appendChild(el);
    });

    daylogModal?.classList.add('open');
  });
}

document.getElementById('daylogClose')?.addEventListener('click', () => {
  daylogModal?.classList.remove('open');
});
daylogModal?.addEventListener('click', (e) => {
  if (e.target === daylogModal) {
    daylogModal.classList.remove('open');
  }
});

const worklogPanel = document.getElementById('worklogPanel');
if (worklogPanel && 'IntersectionObserver' in window) {
  const worklogObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      } else {
        entry.target.classList.remove('in-view');
      }
    });
  }, { threshold: 0.15 });
  worklogObserver.observe(worklogPanel);
} else if (worklogPanel) {
  worklogPanel.classList.add('in-view');
}

// ===== Scroll reveal for points rows (IntersectionObserver) =====
if ('IntersectionObserver' in window) {
  const pointRows = document.querySelectorAll('.point-row');
  if (pointRows.length) {
    const rowObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
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
(function () {
  const spotlight = document.createElement('div');
  spotlight.id = 'cursorSpot';
  document.body.appendChild(spotlight);

  const state = { tx: window.innerWidth / 2, ty: window.innerHeight / 2, cx: window.innerWidth / 2, cy: window.innerHeight / 2 };
  let rafId = null;

  function rafLoop() {
    state.cx += (state.tx - state.cx) * 0.16;
    state.cy += (state.ty - state.cy) * 0.16;
    spotlight.style.left = state.cx + 'px';
    spotlight.style.top = state.cy + 'px';
    rafId = requestAnimationFrame(rafLoop);
  }

  function startLoop() { if (!rafId) rafLoop(); }
  function stopLoop() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } }

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
    if (!t) return;
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
