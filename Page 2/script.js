/**
 * Happy Birthday — Interactive 5-Stage Experience
 * Flow: Bow → Arrow Hit → Reveal → Tree Grow → Full Bloom
 * Transitions: auto-advance after each stage completes (no scroll needed)
 */

(function () {
    'use strict';

    /* ─────────────────────────────────────────────
       DOM References
       ───────────────────────────────────────────── */
    const stages = {
        1: document.getElementById('stage-1'),
        2: document.getElementById('stage-2'),
        3: document.getElementById('stage-3'),
        4: document.getElementById('stage-4'),
        5: document.getElementById('stage-5'),
    };

    const bowWrapper = document.getElementById('bow-wrapper');
    const bowSvg = document.getElementById('bow-svg');
    const stringTop = document.getElementById('string-top');
    const stringBottom = document.getElementById('string-bottom');
    const stringPullPoint = document.getElementById('string-pull-point');
    const flyingArrow = document.getElementById('flying-arrow');
    const targetHeart = document.getElementById('target-heart');
    const soundToggle = document.getElementById('sound-toggle');

    const treeParts = document.querySelectorAll('#stage-4 .tree-part');
    const floatLayer4 = document.getElementById('hearts-float-layer');
    const bloomLayer4 = document.getElementById('hearts-bloom-layer');
    const floatLayer5 = document.getElementById('hearts-float-layer-5');
    const bloomLayer5 = document.getElementById('hearts-bloom-layer-5');

    /* ─────────────────────────────────────────────
       State
       ───────────────────────────────────────────── */
    let currentStage = 1;
    let isDragging = false;
    let hasFired = false;
    let soundEnabled = false;
    let audioCtx = null;

    // Bow string geometry (SVG viewBox coords mapped via getScreenCTM)
    const BOW = {
        tipLeft: { x: 70, y: 30 },
        tipRight: { x: 150, y: 30 },
        rest: { x: 110, y: 30 },  // string straight between tips at rest
        maxPull: { x: 110, y: 175 },  // fullest draw position
        maxDist: 150,                  // max pull distance in SVG units
    };

    let pullX = BOW.rest.x;
    let pullY = BOW.rest.y;

    // Rose-tone bloom palette
    const BLOOM_COLORS = [
        '#ff6b9d', '#ff8fab', '#ffb3c6', '#e63980',
        '#f4a261', '#e9c46a', '#f5c518', '#d4a574',
        '#c9184a', '#ff758f', '#ffc8dd', '#ffafcc',
    ];

    /* ─────────────────────────────────────────────
       Sound (Web Audio — no external files)
       ───────────────────────────────────────────── */
    function getAudioCtx() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        return audioCtx;
    }

    function playTone(freq, duration, type = 'sine', volume = 0.15) {
        if (!soundEnabled) return;
        const ctx = getAudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
    }

    function playBowRelease() {
        if (!soundEnabled) return;
        const ctx = getAudioCtx();
        const bufferSize = ctx.sampleRate * 0.08;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        const gain = ctx.createGain();
        gain.gain.value = 0.12;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 800;
        src.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        src.start();
    }

    function playArrowHit() {
        playTone(120, 0.25, 'triangle', 0.2);
        setTimeout(() => playTone(80, 0.3, 'sine', 0.15), 60);
    }

    function playCelebration() {
        [523, 659, 784, 1047].forEach((f, i) => {
            setTimeout(() => playTone(f, 0.4, 'sine', 0.1), i * 120);
        });
    }

    function playBloomPop() {
        playTone(600 + Math.random() * 400, 0.06, 'sine', 0.04);
    }

    soundToggle.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        soundToggle.setAttribute('aria-pressed', String(soundEnabled));
        soundToggle.querySelector('.icon-speaker-off').classList.toggle('hidden', soundEnabled);
        soundToggle.querySelector('.icon-speaker-on').classList.toggle('hidden', !soundEnabled);
        if (soundEnabled) getAudioCtx();
    });

    /* ─────────────────────────────────────────────
       Stage Transitions (auto-advance)
       ───────────────────────────────────────────── */
    function goToStage(next) {
        if (next === currentStage) return;

        const from = stages[currentStage];
        const to = stages[next];

        const tl = gsap.timeline({
            onComplete: () => {
                from.classList.remove('stage-active');
                currentStage = next;
                onStageEnter(next);
            },
        });

        tl.to(from, { opacity: 0, duration: 0.7, ease: 'power2.inOut' });
        tl.set(to, { opacity: 0, visibility: 'visible' });
        tl.add(() => {
            to.classList.add('stage-active');
        });
        tl.to(to, { opacity: 1, duration: 0.9, ease: 'power2.out' }, '-=0.2');

        // Stage 3 gets a zoom-in feel
        if (next === 3) {
            tl.fromTo(to.querySelector('.birthday-heading'),
                { scale: 0.85, opacity: 0 },
                { scale: 1, opacity: 1, duration: 1.1, ease: 'power3.out' },
                '-=0.5'
            );
        }
    }

    function onStageEnter(stage) {
        switch (stage) {
            case 2: animateStage2(); schedule(() => goToStage(3), 2200); break;
            case 3: animateStage3(); schedule(() => goToStage(4), 3800); break;
            case 4: animateStage4(); schedule(() => goToStage(5), 4500); break;
            case 5: animateStage5(); break;
        }
    }

    function schedule(fn, ms) {
        return setTimeout(fn, ms);
    }

    /* ─────────────────────────────────────────────
       Bow — String Pull Interaction
       ───────────────────────────────────────────── */
    function svgPointFromEvent(svg, clientX, clientY) {
        const pt = svg.createSVGPoint();
        pt.x = clientX;
        pt.y = clientY;
        const ctm = svg.getScreenCTM().inverse();
        return pt.matrixTransform(ctm);
    }

    function updateString(x, y) {
        // Clamp pull along the draw line (rest → maxPull)
        const dx = x - BOW.rest.x;
        const dy = y - BOW.rest.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const clamped = Math.min(dist, BOW.maxDist);
        const angle = Math.atan2(dy, dx);
        pullX = BOW.rest.x + Math.cos(angle) * clamped;
        pullY = BOW.rest.y + Math.sin(angle) * clamped;

        // String forms triangle: tip-left → pull → tip-right
        stringTop.setAttribute('x2', pullX);
        stringTop.setAttribute('y2', pullY);
        stringBottom.setAttribute('x2', pullX);
        stringBottom.setAttribute('y2', pullY);
        stringPullPoint.setAttribute('cx', pullX);
        stringPullPoint.setAttribute('cy', pullY);
    }

    function resetString(animate = true) {
        if (animate) {
            gsap.to({ x: pullX, y: pullY }, {
                x: BOW.rest.x,
                y: BOW.rest.y,
                duration: 0.9,
                ease: 'elastic.out(1, 0.45)',
                onUpdate: function () {
                    updateString(this.targets()[0].x, this.targets()[0].y);
                },
            });
        } else {
            pullX = BOW.rest.x;
            pullY = BOW.rest.y;
            stringTop.setAttribute('x2', BOW.rest.x);
            stringTop.setAttribute('y2', BOW.rest.y);
            stringBottom.setAttribute('x2', BOW.rest.x);
            stringBottom.setAttribute('y2', BOW.rest.y);
            stringPullPoint.setAttribute('cx', BOW.rest.x);
            stringPullPoint.setAttribute('cy', BOW.rest.y);
        }
    }

    function getPullAmount() {
        const dx = pullX - BOW.rest.x;
        const dy = pullY - BOW.rest.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    function onDragStart(e) {
        if (hasFired || currentStage !== 1) return;
        isDragging = true;
        e.preventDefault();
    }

    function onDragMove(e) {
        if (!isDragging || hasFired) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const pt = svgPointFromEvent(bowSvg, clientX, clientY);
        updateString(pt.x, pt.y);
    }

    function onDragEnd() {
        if (!isDragging || hasFired) return;
        isDragging = false;

        const pull = getPullAmount();
        if (pull < 12) {
            resetString(true);
            return;
        }

        fireArrow();
    }

    // Bind drag events on bow wrapper + string handle
    stringPullPoint.addEventListener('mousedown', onDragStart);
    stringPullPoint.addEventListener('touchstart', onDragStart, { passive: false });
    window.addEventListener('mousemove', onDragMove);
    window.addEventListener('touchmove', onDragMove, { passive: false });
    window.addEventListener('mouseup', onDragEnd);
    window.addEventListener('touchend', onDragEnd);

    /* ─────────────────────────────────────────────
       Arrow Fire Animation
       ───────────────────────────────────────────── */
    function fireArrow() {
        hasFired = true;
        playBowRelease();

        // Get screen positions for arrow flight path
        const bowRect = bowWrapper.getBoundingClientRect();
        const heartRect = targetHeart.getBoundingClientRect();

        const startX = bowRect.left + bowRect.width * 0.5;
        const startY = bowRect.top + bowRect.height * 0.15;
        const endX = heartRect.left + heartRect.width * 0.5;
        const endY = heartRect.top + heartRect.height * 0.45;

        flyingArrow.classList.remove('hidden');
        gsap.set(flyingArrow, {
            left: startX,
            top: startY,
            rotation: -55,
            opacity: 1,
            scale: 1,
        });

        // String snaps back with elastic twang
        resetString(true);

        const flightTl = gsap.timeline({
            onComplete: () => {
                playArrowHit();
                // Heart hit reaction
                gsap.fromTo(targetHeart,
                    { scale: 1 },
                    { scale: 1.08, duration: 0.12, yoyo: true, repeat: 1, ease: 'power2.out' }
                );
                flyingArrow.classList.add('hidden');
                schedule(() => goToStage(2), 600);
            },
        });

        flightTl.to(flyingArrow, {
            left: endX,
            top: endY,
            rotation: -55,
            duration: 0.55,
            ease: 'power2.in',
        });
    }

    /* ─────────────────────────────────────────────
       Stage 2 — Pierced heart + bow string twang
       ───────────────────────────────────────────── */
    function animateStage2() {
        const strings = document.querySelectorAll('#stage-2 .bow-string-relaxed');
        strings.forEach((line) => {
            const y2 = parseFloat(line.getAttribute('y2'));
            gsap.fromTo(line,
                { attr: { y2: y2 + 40 } },
                { attr: { y2: y2 }, duration: 0.9, ease: 'elastic.out(1, 0.4)', delay: 0.15 }
            );
        });

        gsap.from('#stage-2 .heart-pierced', {
            scale: 0.95, duration: 0.5, ease: 'power2.out',
        });
    }

    /* ─────────────────────────────────────────────
       Stage 3 — Birthday Reveal Animations
       ───────────────────────────────────────────── */
    function animateStage3() {
        playCelebration();

        gsap.from('#stage-3 .wish-text', {
            y: -20, opacity: 0, duration: 0.8, ease: 'power2.out', delay: 0.2,
        });

        gsap.from('#stage-3 .heading-line', {
            y: 40, opacity: 0, duration: 0.9, stagger: 0.15, ease: 'power3.out', delay: 0.4,
        });

        gsap.from('#stage-3 .gold-squiggle', {
            scaleX: 0, opacity: 0, duration: 0.7, ease: 'power2.out', delay: 0.9,
            transformOrigin: 'left center',
        });

        gsap.from('#stage-3 .celebrating-text', {
            y: 15, opacity: 0, duration: 0.7, ease: 'power2.out', delay: 1.1,
        });
    }

    /* ─────────────────────────────────────────────
       Stage 4 — Tree Growth + Floating Hearts
       ───────────────────────────────────────────── */
    function animateStage4() {
        // Grow trunk first, then branches
        const tl = gsap.timeline();

        tl.to('#tree-trunk', { opacity: 1, duration: 0.5, ease: 'power2.out' });

        ['#branch-left-main', '#branch-right-main', '#branch-center'].forEach((sel, i) => {
            tl.to(sel, {
                opacity: 1,
                strokeDashoffset: 0,
                duration: 1.0,
                ease: 'power2.inOut',
            }, 0.3 + i * 0.15);
        });

        ['#branch-left-upper', '#branch-right-upper'].forEach((sel, i) => {
            tl.to(sel, {
                opacity: 1,
                strokeDashoffset: 0,
                duration: 0.9,
                ease: 'power2.inOut',
            }, 1.0 + i * 0.12);
        });

        ['#branch-left-curve', '#branch-right-curve'].forEach((sel, i) => {
            tl.to(sel, {
                opacity: 1,
                strokeDashoffset: 0,
                duration: 0.8,
                ease: 'power2.inOut',
            }, 1.4 + i * 0.1);
        });

        gsap.from('#stage-4 .tree-text-block', {
            y: 30, opacity: 0, duration: 0.9, ease: 'power2.out', delay: 0.8,
        });

        // Start floating hearts + a few base blooms
        startFloatingHearts(floatLayer4);
        bloomPartial(floatLayer4, bloomLayer4, 40);
    }

    /* ─────────────────────────────────────────────
       Stage 5 — Full Heart-Shaped Bloom (~340 hearts)
       ───────────────────────────────────────────── */
    function animateStage5() {
        gsap.from('#stage-5 .tree-final-line', {
            y: 20, opacity: 0, duration: 0.9, ease: 'power2.out', delay: 0.3,
        });

        startFloatingHearts(floatLayer5);
        // Continue bloom from stage 4 count up to ~340
        fullBloom(bloomLayer5, 340);
    }

    /* ─────────────────────────────────────────────
       Floating Hearts (Stages 4 & 5)
       ───────────────────────────────────────────── */
    function startFloatingHearts(layer) {
        const colors = ['#ff6b9d', '#f4a261', '#e9c46a', '#ff8fab'];

        function spawnHeart() {
            if (!layer.isConnected) return;

            const el = document.createElement('span');
            el.className = 'float-heart';
            el.textContent = '♥';
            el.style.color = colors[Math.floor(Math.random() * colors.length)];

            const x = 10 + Math.random() * 80;
            el.style.left = x + '%';
            el.style.top = (20 + Math.random() * 30) + '%';

            layer.appendChild(el);

            gsap.fromTo(el,
                { y: 0, opacity: 0.9, scale: 0.5 + Math.random() * 0.5 },
                {
                    y: 80 + Math.random() * 60,
                    x: (Math.random() - 0.5) * 40,
                    opacity: 0,
                    duration: 2.5 + Math.random() * 2,
                    ease: 'power1.in',
                    onComplete: () => el.remove(),
                }
            );

            schedule(spawnHeart, 300 + Math.random() * 500);
        }

        spawnHeart();
    }

    /* ─────────────────────────────────────────────
       Parametric Heart Equation — Point-in-Heart Test
       Uses implicit heart curve: (x²+y²−1)³ − x²y³ ≤ 0
       ───────────────────────────────────────────── */
    function isInsideHeart(nx, ny) {
        const a = nx * nx + ny * ny - 1;
        return a * a * a - nx * nx * ny * ny * ny <= 0;
    }

    /**
     * Sample a random point inside the heart crown region.
     * u,v ∈ [0,1] mapped to heart bounding box, rejection-sampled.
     */
    function sampleHeartPoint() {
        for (let attempt = 0; attempt < 50; attempt++) {
            const u = Math.random();
            const v = Math.random();
            // Map to normalized heart space [-1.2, 1.2] x [-1, 1]
            const nx = (u * 2.4) - 1.2;
            const ny = -((v * 2) - 0.3); // flip Y so lobes are at top
            if (isInsideHeart(nx, ny)) {
                return { nx, ny };
            }
        }
        return null;
    }

    /**
     * Convert normalized heart coords to % position within bloom layer.
     * Crown sits in upper portion of tree scene.
     */
    function heartToPercent(nx, ny) {
        return {
            left: ((nx + 1.2) / 2.4) * 70 + 15 + '%',
            top: ((1 - ny) / 2) * 45 + 5 + '%',
        };
    }

    function createBloomHeart(layer) {
        const pt = sampleHeartPoint();
        if (!pt) return false;

        const pos = heartToPercent(pt.nx, pt.ny);
        const el = document.createElement('span');
        el.className = 'bloom-heart';
        el.textContent = '♥';
        el.style.color = BLOOM_COLORS[Math.floor(Math.random() * BLOOM_COLORS.length)];
        el.style.left = pos.left;
        el.style.top = pos.top;

        layer.appendChild(el);

        gsap.to(el, {
            scale: 0.6 + Math.random() * 0.6,
            duration: 0.35 + Math.random() * 0.25,
            ease: 'back.out(2)',
        });

        return true;
    }

    /** Partial bloom for stage 4 (quick burst at base of crown) */
    function bloomPartial(floatLayer, bloomLayer, count) {
        let placed = 0;
        const interval = setInterval(() => {
            if (placed >= count || currentStage !== 4) {
                clearInterval(interval);
                return;
            }
            if (createBloomHeart(bloomLayer)) {
                placed++;
                if (placed % 8 === 0) playBloomPop();
            }
        }, 60);
    }

    /** Full bloom loop until ~340 hearts (Stage 5) */
    function fullBloom(layer, target) {
        let total = layer.querySelectorAll('.bloom-heart').length;

        // Copy existing blooms from stage 4 into stage 5 layer
        const existing = bloomLayer4.querySelectorAll('.bloom-heart');
        existing.forEach((h) => {
            const clone = h.cloneNode(true);
            clone.style.transform = h.style.transform || 'scale(1)';
            gsap.set(clone, { scale: parseFloat(h.style.transform.replace(/[^0-9.]/g, '')) || 1 });
            layer.appendChild(clone);
            total++;
        });

        const tick = () => {
            if (currentStage !== 5 || total >= target) return;

            // Batch a few per frame for speed
            const batch = Math.min(6, target - total);
            for (let i = 0; i < batch; i++) {
                if (createBloomHeart(layer)) total++;
            }

            if (total % 30 === 0) playBloomPop();

            if (total < target) {
                requestAnimationFrame(tick);
            }
        };

        requestAnimationFrame(tick);
    }

    /* ─────────────────────────────────────────────
       Init — Stage 1 entrance animation
       ───────────────────────────────────────────── */
    function init() {
        gsap.from('.intro-tagline', {
            y: -15, opacity: 0, duration: 1, ease: 'power2.out', delay: 0.3,
        });

        gsap.from('#target-heart', {
            scale: 0.6, opacity: 0, duration: 1.2, ease: 'elastic.out(1, 0.5)', delay: 0.5,
        });

        gsap.from('.bow-wrapper', {
            x: -30, opacity: 0, duration: 0.9, ease: 'power2.out', delay: 0.8,
        });

        gsap.from('.instruction-block', {
            y: 20, opacity: 0, duration: 0.8, ease: 'power2.out', delay: 1,
        });

        // Initialize string at rest (straight between limb tips)
        stringTop.setAttribute('x1', BOW.tipLeft.x);
        stringTop.setAttribute('y1', BOW.tipLeft.y);
        stringBottom.setAttribute('x1', BOW.tipRight.x);
        stringBottom.setAttribute('y1', BOW.tipRight.y);
        updateString(BOW.rest.x, BOW.rest.y);
    }

    // Boot
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
