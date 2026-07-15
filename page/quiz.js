window.QUIZ_DATA = {
    "quizTitle": "🎂 Birthday Quiz Challenge",
    "quizDescription": "Test your knowledge with these fun birthday-themed questions!",
    "questions": [
        {
            "id": 1,
            "question": "What is the most popular birthday song in the world?",
            "options": ["Happy Birthday to You", "For He's a Jolly Good Fellow", "Birthday by The Beatles", "Celebration by Kool & the Gang"],
            "correct": 0,
            "explanation": "\"Happy Birthday to You\" is recognized as the most popular song in the English language!"
        },
        {
            "id": 2,
            "question": "In which country did the tradition of birthday cakes originate?",
            "options": ["United States", "France", "Germany", "England"],
            "correct": 2,
            "explanation": "The tradition of birthday cakes originated in Germany during the Middle Ages, known as Kinderfeste."
        },
        {
            "id": 3,
            "question": "What does blowing out birthday candles symbolize?",
            "options": ["Making a wish come true", "Sending wishes to the gods via smoke", "Celebrating another year of life", "Warding off evil spirits"],
            "correct": 1,
            "explanation": "Ancient Greeks believed smoke carried wishes up to their gods on Mount Olympus!"
        },
        {
            "id": 4,
            "question": "How many candles are traditionally placed on a birthday cake?",
            "options": ["Always exactly 10", "One for each year of the person's age", "Always an even number", "One for good luck"],
            "correct": 1,
            "explanation": "Traditionally, one candle is placed for each year of the birthday person's age."
        },
        {
            "id": 5,
            "question": "Which gemstone is associated with July birthdays?",
            "options": ["Emerald", "Sapphire", "Ruby", "Diamond"],
            "correct": 2,
            "explanation": "Ruby is the birthstone for July — symbolizing passion, love, and courage!"
        },
        {
            "id": 6,
            "question": "What is the world record for the most birthday candles on a cake?",
            "options": ["72,585 candles", "25,000 candles", "100,000 candles", "50,000 candles"],
            "correct": 0,
            "explanation": "The record is 72,585 candles on a single cake, set in India in 2016!"
        },
        {
            "id": 7,
            "question": "What color are birthday balloons most commonly associated with?",
            "options": ["Blue and white", "Red and yellow", "Multi-colored / Rainbow", "Gold and silver"],
            "correct": 2,
            "explanation": "Birthday balloons are most commonly multi-colored or rainbow to represent joy and celebration!"
        },
        {
            "id": 8,
            "question": "In which decade was 'Happy Birthday to You' composed?",
            "options": ["1860s", "1890s", "1920s", "1940s"],
            "correct": 1,
            "explanation": "The melody was composed in the 1890s by sisters Mildred and Patty Hill as 'Good Morning to All'."
        },
        {
            "id": 9,
            "question": "What is a 'quinceañera'?",
            "options": ["A Spanish birthday song", "A celebration of a girl's 15th birthday", "A type of birthday cake", "A Latin birthday dance"],
            "correct": 1,
            "explanation": "Quinceañera is a Latin American celebration marking a girl's 15th birthday — a major cultural milestone!"
        },
        {
            "id": 10,
            "question": "Which planet takes the longest to complete one orbit around the Sun (one 'birthday')?",
            "options": ["Saturn", "Uranus", "Jupiter", "Neptune"],
            "correct": 3,
            "explanation": "Neptune takes about 165 Earth years to orbit the Sun — so it's had very few 'birthdays'!"
        },
        {
            "id": 11,
            "question": "In Japan, what color is associated with birthdays and celebrations?",
            "options": ["White", "Black", "Red", "Purple"],
            "correct": 2,
            "explanation": "Red is the color of celebration in Japan, often used in birthday decorations and traditional attire."
        },
        {
            "id": 12,
            "question": "What is the traditional gift for a 50th birthday celebration?",
            "options": ["Silver", "Gold", "Ruby", "Diamond"],
            "correct": 1,
            "explanation": "Gold is the traditional gift for a 50th birthday — often called the 'Golden Anniversary'!"
        }
    ]
};
        /* ════════════════════════════════════════════════════════
           QUIZ ENGINE
        ════════════════════════════════════════════════════════ */
        const STORAGE_KEY = 'birthdayQuizResults';
        const SESSION_KEY = 'birthdayQuizState';
        const LETTERS = ['A', 'B', 'C', 'D'];

        let quizData = null;
        let questions = [];
        let current = 0;
        let answers = {};   // { qIndex: selectedOptionIndex | null }
        let submitted = {};   // { qIndex: true }  (question answered & locked)
        let score = 0;
        let timerInterval = null;
        let timeLeft = 60;
        let quizStarted = false; // tracks whether user clicked "Start Quiz"

        // ── Session State Persistence ────────────────────────────
        function saveState() {
            const state = { current, answers, submitted, score, timeLeft, quizStarted };
            try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(state)); } catch (e) { }
            try { localStorage.setItem(SESSION_KEY, JSON.stringify(state)); } catch (e) { }
        }

        function loadState() {
            try {
                let raw = sessionStorage.getItem(SESSION_KEY);
                if (!raw) {
                    raw = localStorage.getItem(SESSION_KEY);
                }
                if (!raw) return null;
                return JSON.parse(raw);
            } catch (e) { return null; }
        }

        function clearState() {
            try { sessionStorage.removeItem(SESSION_KEY); } catch (e) { }
            try { localStorage.removeItem(SESSION_KEY); } catch (e) { }
        }

        // ── Sparkles ────────────────────────────────────────────
        (function createSparkles() {
            const c = document.getElementById('sparklesContainer');
            for (let i = 0; i < 30; i++) {
                const s = document.createElement('div');
                s.className = 'sparkle';
                s.style.cssText = `
          left:${Math.random() * 100}%;
          top:${Math.random() * 100}%;
          --t:${2 + Math.random() * 4}s;
          --td:${Math.random() * 6}s;
          width:${2 + Math.random() * 4}px;
          height:${2 + Math.random() * 4}px;
        `;
                c.appendChild(s);
            }
        })();

        // ── Load Quiz Data (imported inline from quiz.json) ─────
        function loadQuiz() {
            if (window.QUIZ_DATA && window.QUIZ_DATA.questions) {
                quizData = window.QUIZ_DATA;
                questions = quizData.questions;

                // Check if there is a completed quiz state in localStorage
                let completedSaved = null;
                try {
                    const rawCompleted = localStorage.getItem('birthdayQuizCompletedState');
                    if (rawCompleted) {
                        completedSaved = JSON.parse(rawCompleted);
                    }
                } catch (e) { }

                if (completedSaved && completedSaved.completed) {
                    answers = completedSaved.answers || {};
                    submitted = completedSaved.submitted || {};
                    score = completedSaved.score || 0;
                    quizStarted = true;

                    // Immediately show results (with isRestore = true)
                    showResults(true);
                    return;
                }

                // Try to restore in-progress state from sessionStorage
                const saved = loadState();
                if (saved && saved.quizStarted) {
                    current = saved.current || 0;
                    answers = saved.answers || {};
                    submitted = saved.submitted || {};
                    score = saved.score || 0;
                    timeLeft = saved.timeLeft || 60;
                    quizStarted = true;

                    // Show progress bar & timer pill
                    document.getElementById('progressWrap').style.display = '';
                    document.getElementById('timerDisplay').style.display = '';

                    updateScorePill();
                    renderQuestion(current);
                } else {
                    showStartScreen();
                }
            } else {
                document.getElementById('quizContainer').innerHTML =
                    `<div class="loading-state">⚠️ Quiz data not found. Check the QUIZ_DATA import in &lt;head&gt;.</div>`;
            }
        }

        // ── Show Start Screen ────────────────────────────────────
        function showStartScreen() {
            const total = (questions && questions.length) || 12;
            const container = document.getElementById('quizContainer');
            container.innerHTML = '';
            container.style.display = '';

            const card = document.createElement('div');
            card.className = 'start-screen-card slide-in';
            card.innerHTML = `
                <div class="start-screen-icon">🎂</div>
                <h2 class="start-screen-title">Kia Ap Tiyaar Han Ak Mazay Quiz Challenge Kay Liyh Dakhtay Han Ap Koh Kitna Patah Hai Ais Relationship Kay Baray May</h2>
                <div class="start-instructions">
                    <h3 class="start-instructions-heading">📋 How to Play</h3>
                    <ol class="start-instructions-list">
                        <li><span>Quiz mein Total <strong>${total} questions</strong> hain.</span></li>
                        <li><span>Har question ke liye aapke paas <strong>60 seconds</strong> hain.</span></li>
                        <li><span>Apna jawab chunein, phir <strong>Check Answer</strong> pe click karein.</span></li>
                        <li><span>Timer khatam hone par question automatically <strong>skip</strong> ho jayega.</span></li>
                        <li><span>Saare questions ke baad apna <strong>score & review</strong> dekhein.</span></li>
                        <li><span>Jb Sab questions complete ho jayein, to apna <strong>score & review Share kray whatsapp par </strong> ja kay bina kisi cheating Kay.</span></li>
                    </ol>
                </div>
                <button class="btn btn-start-quiz" id="startQuizBtn" onclick="startQuiz()">
                    🚀 Aapki pariksha Shuru ki jaati hai
                </button>
                <p class="start-screen-hint">Answer jald se jald dena hai 60 second ka waqt hai aur yah time kam hoga jhsay aap quiz karoge aur jeetoge gay!</p>
            `;
            container.appendChild(card);
        }

        // ── Start Quiz (called by Start button) ──────────────────
        function startQuiz() {
            // Check if there is an in-progress state in localStorage
            let saved = null;
            try {
                const raw = localStorage.getItem(SESSION_KEY);
                if (raw) {
                    saved = JSON.parse(raw);
                }
            } catch (e) { }

            if (saved && saved.quizStarted) {
                // Restore state
                answers = saved.answers || {};
                submitted = saved.submitted || {};
                score = saved.score || 0;
                timeLeft = saved.timeLeft !== undefined ? saved.timeLeft : 60;
                quizStarted = true;

                // Find the next unanswered question
                let nextUnanswered = 0;
                for (let i = 0; i < questions.length; i++) {
                    if (!submitted[i]) {
                        nextUnanswered = i;
                        break;
                    }
                }
                current = nextUnanswered;

                // Show progress bar & timer pill
                document.getElementById('progressWrap').style.display = '';
                document.getElementById('timerDisplay').style.display = '';

                updateScorePill();
                saveState();
                renderQuestion(current);
                return;
            }

            // Normal start
            quizStarted = true;
            // Show progress bar & timer pill now
            document.getElementById('progressWrap').style.display = '';
            document.getElementById('timerDisplay').style.display = '';
            saveState();
            renderQuestion(0);
        }

        // ── Render Question ──────────────────────────────────────
        function renderQuestion(idx) {
            const q = questions[idx];
            const total = questions.length;
            const pct = Math.round(((idx) / total) * 100);
            const locked = submitted[idx] === true;

            // Update progress
            document.getElementById('progressLabel').textContent = `Question ${idx + 1} of ${total}`;
            document.getElementById('progressPct').textContent = pct + '%';
            document.getElementById('progressFill').style.width = pct + '%';

            // Build options HTML
            const optionsHTML = q.options.map((opt, i) => {
                let extraClass = '';
                let icon = '';
                if (locked) {
                    if (i === q.correct) { extraClass = 'correct'; icon = '✅'; }
                    else if (answers[idx] === i) { extraClass = 'wrong'; icon = '❌'; }
                    else { extraClass = 'dim'; }
                } else {
                    if (answers[idx] === i) extraClass = 'selected';
                }
                return `
          <button class="option-btn ${extraClass}"
                  id="opt-${idx}-${i}"
                  onclick="selectOption(${idx}, ${i})"
                  ${locked ? 'disabled' : ''}
                  aria-label="Option ${LETTERS[i]}: ${opt}">
            <span class="option-letter">${LETTERS[i]}</span>
            <span class="option-text">${opt}</span>
            ${icon ? `<span class="option-icon">${icon}</span>` : ''}
          </button>`;
            }).join('');

            const hasPrev = idx > 0;
            const hasNext = idx < total - 1;
            const isLastQ = idx === total - 1;
            const allAnswered = Object.keys(submitted).length === total;

            const card = document.createElement('div');
            card.className = 'question-card slide-in';
            card.id = 'currentCard';
            card.innerHTML = `
        <div class="q-number-badge">${idx + 1}</div>
        <p class="question-text">${q.question}</p>
        <div class="options-grid">${optionsHTML}</div>
        <div class="explanation-box ${locked ? 'show' : ''}" id="explanBox-${idx}">
          <span class="icon">💡</span>
          <span>${q.explanation}</span>
        </div>
        <div class="card-actions">
          ${hasPrev ? `<button class="btn btn-ghost" onclick="goTo(${idx - 1})">← Prev</button>` : ''}
          ${!locked
                    ? `<button class="btn btn-primary" id="submitBtn-${idx}"
                       onclick="submitAnswer(${idx})"
                       ${answers[idx] === undefined ? 'disabled' : ''}>
                 Check Answer ✓
               </button>`
                    : ''}
          ${locked && hasNext
                    ? `<button class="btn btn-primary" onclick="goTo(${idx + 1})">Next →</button>`
                    : ''}
          ${locked && isLastQ && !allAnswered
                    ? `<button class="btn btn-gold" onclick="showResults()">See Results 🏆</button>`
                    : ''}
          ${allAnswered
                    ? `<button class="btn btn-gold" onclick="showResults()">See Results 🏆</button>`
                    : ''}
        </div>
      `;

            const container = document.getElementById('quizContainer');
            container.innerHTML = '';
            container.appendChild(card);

            updateScorePill();
            startTimer(idx);
        }

        // ── Select Option ────────────────────────────────────────
        function selectOption(qIdx, optIdx) {
            if (submitted[qIdx]) return;
            answers[qIdx] = optIdx;
            saveState();

            // Re-highlight options
            const q = questions[qIdx];
            q.options.forEach((_, i) => {
                const btn = document.getElementById(`opt-${qIdx}-${i}`);
                if (!btn) return;
                btn.className = 'option-btn' + (i === optIdx ? ' selected' : '');
            });

            // Enable submit button
            const sb = document.getElementById(`submitBtn-${qIdx}`);
            if (sb) sb.removeAttribute('disabled');
        }

        // ── Timer Logic ──────────────────────────────────────────
        function startTimer(qIdx) {
            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = null;
            }

            const timerDisplay = document.getElementById('timerDisplay');
            const timerCountdown = document.getElementById('timerCountdown');
            if (!timerDisplay || !timerCountdown) return;

            // If this question is already submitted/locked, freeze timer
            if (submitted[qIdx]) {
                timerDisplay.style.opacity = '0.5';
                timerCountdown.textContent = '--';
                timerDisplay.classList.remove('warning');
                return;
            }

            timerDisplay.style.opacity = '1';
            // Restore timeLeft from session if on the same question we left off
            if (current === qIdx && timeLeft > 0 && timeLeft < 60) {
                // already set from loadState; keep it
            } else {
                timeLeft = 60;
            }
            timerCountdown.textContent = timeLeft;
            timerDisplay.classList.remove('warning');

            timerInterval = setInterval(() => {
                timeLeft--;
                timerCountdown.textContent = timeLeft;
                saveState();

                if (timeLeft <= 15) {
                    timerDisplay.classList.add('warning');
                } else {
                    timerDisplay.classList.remove('warning');
                }

                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    timerInterval = null;
                    handleTimeOut(qIdx);
                }
            }, 1000);
        }

        function handleTimeOut(qIdx) {
            if (submitted[qIdx]) return;

            // If an option is selected but not checked, submit it. Otherwise count as skipped
            const sel = answers[qIdx];
            submitted[qIdx] = true;

            const q = questions[qIdx];
            if (sel !== undefined && sel !== null) {
                if (sel === q.correct) score++;
            }
            updateScorePill();
            saveState();

            // Re-render locked state to show correct answer & explanation
            renderQuestion(qIdx);

            // Add timeout notice
            const explanBox = document.getElementById(`explanBox-${qIdx}`);
            if (explanBox) {
                const notice = document.createElement('div');
                notice.className = 'timeout-notice';
                notice.innerHTML = '⏱️ <b>Time\'s up!</b> Moving to the next question...';
                explanBox.parentNode.insertBefore(notice, explanBox);
            }

            // Auto-advance after 2 seconds
            setTimeout(() => {
                const total = questions.length;
                const isLastQ = qIdx === total - 1;
                const allAnswered = Object.keys(submitted).length === total;

                if (qIdx < total - 1) {
                    goTo(qIdx + 1);
                } else if (isLastQ || allAnswered) {
                    showResults();
                }
            }, 2000);
        }

        // ── Submit Answer ────────────────────────────────────────
        function submitAnswer(qIdx) {
            if (submitted[qIdx] || answers[qIdx] === undefined) return;

            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = null;
            }

            const q = questions[qIdx];
            const sel = answers[qIdx];
            submitted[qIdx] = true;

            // Update score
            if (sel === q.correct) score++;
            updateScorePill();
            saveState();

            // Re-render locked state
            renderQuestion(qIdx);
        }

        // ── Navigate ─────────────────────────────────────────────
        function goTo(idx) {
            current = idx;
            timeLeft = 60; // reset timer for the new question
            saveState();
            renderQuestion(idx);
        }

        // ── Score Pill ───────────────────────────────────────────
        function updateScorePill() {
            document.getElementById('liveScore').textContent = score;
            document.getElementById('liveTotalSoFar').textContent = Object.keys(submitted).length;
        }

        // ── Show Results ─────────────────────────────────────────
        function showResults(isRestore = false) {
            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = null;
            }

            // Clear persisted in-progress state — quiz is done
            clearState();

            const total = questions.length;
            const correct = score;
            const answered = Object.keys(submitted).length;
            const wrong = answered - correct;
            const skipped = total - answered;
            const pct = Math.round((correct / total) * 100);

            // Hide quiz, show results
            document.getElementById('quizContainer').style.display = 'none';
            document.getElementById('progressWrap').style.display = 'none';
            document.getElementById('resultsScreen').classList.add('show');

            // Animate ring
            const circumference = 408.41;
            const offset = circumference - (circumference * correct / total);
            setTimeout(() => {
                document.getElementById('ringCircle').style.strokeDashoffset = offset;
            }, 200);

            document.getElementById('ringScoreNum').textContent = correct;
            document.getElementById('ringScoreTotal').textContent = `/ ${total}`;
            document.getElementById('statCorrect').textContent = correct;
            document.getElementById('statWrong').textContent = wrong;
            document.getElementById('statSkipped').textContent = skipped;

            // Grade
            let grade, msg;
            if (pct === 100) { grade = '🏆 Perfect Score!'; msg = 'Incredible! You answered every single question correctly. You\'re a birthday trivia genius!'; }
            else if (pct >= 80) { grade = '🌟 Outstanding!'; msg = 'Fantastic performance! You really know your birthday facts. Keep it up!'; }
            else if (pct >= 60) { grade = '🎉 Well Done!'; msg = 'Good job! You got most of them right. A little more practice and you\'ll be perfect!'; }
            else if (pct >= 40) { grade = '🎈 Not Bad!'; msg = 'A decent effort! There\'s room to grow — try retaking the quiz to improve your score.'; }
            else { grade = '🎂 Keep Trying!'; msg = 'Don\'t give up! Every birthday genius starts somewhere. Retake the quiz and aim higher!'; }

            document.getElementById('resultGrade').textContent = grade;
            document.getElementById('resultMessage').textContent = msg;

            // Review cards
            renderReview();

            if (!isRestore) {
                // Save to localStorage
                saveResults(correct, total, wrong, skipped, pct);

                // Save completed state to localStorage so it survives page load/refresh
                const completedState = { answers, submitted, score, completed: true };
                try { localStorage.setItem('birthdayQuizCompletedState', JSON.stringify(completedState)); } catch (e) { }
            }

            // Confetti if good score
            if (pct >= 60) launchConfetti();
        }

        // ── Render Review ────────────────────────────────────────
        function renderReview() {
            const html = questions.map((q, idx) => {
                const userAns = answers[idx];
                const wasSubmit = submitted[idx];
                const isCorrect = wasSubmit && userAns === q.correct;
                const isWrong = wasSubmit && userAns !== q.correct;
                const isSkipped = !wasSubmit;

                let cardClass = isCorrect ? 'correct-card' : isWrong ? 'wrong-card' : 'skipped-card';
                let qNumLabel = isCorrect ? '✅ Correct' : isWrong ? '❌ Incorrect' : '⏭️ Skipped';

                let answerTags = '';
                if (isSkipped) {
                    answerTags = `<span class="answer-tag skipped-tag">⏭️ Not answered</span>
                        <span class="answer-tag correct-answer">✅ Correct: ${q.options[q.correct]}</span>`;
                } else if (isCorrect) {
                    answerTags = `<span class="answer-tag your-answer-correct">✅ Your answer: ${q.options[userAns]}</span>`;
                } else {
                    answerTags = `<span class="answer-tag your-answer-wrong">❌ Your answer: ${q.options[userAns]}</span>
                        <span class="answer-tag correct-answer">✅ Correct: ${q.options[q.correct]}</span>`;
                }

                return `
          <div class="review-card ${cardClass}">
            <div class="review-q-num">Q${idx + 1} · ${qNumLabel}</div>
            <div class="review-q-text">${q.question}</div>
            <div class="review-answers">${answerTags}</div>
            <div class="review-explanation">💡 ${q.explanation}</div>
          </div>`;
            }).join('');

            document.getElementById('reviewCards').innerHTML = html;
        }

        // ── Save Results to localStorage ─────────────────────────
        function saveResults(correct, total, wrong, skipped, pct) {
            const record = {
                date: new Date().toISOString(),
                score: correct,
                total: total,
                wrong: wrong,
                skipped: skipped,
                percentage: pct,
                answers: answers,
                questions: questions.map((q, i) => ({
                    question: q.question,
                    your_answer: answers[i] !== undefined ? q.options[answers[i]] : 'Skipped',
                    correct_answer: q.options[q.correct],
                    is_correct: submitted[i] && answers[i] === q.correct
                }))
            };

            // Load history and prepend
            let history = [];
            try { history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch (e) { }
            history.unshift(record);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(history));

            // Show toast
            const toast = document.getElementById('savedToast');
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }

        // ── Save to file (download JSON) ─────────────────────────
        function saveToPDF() {
            let history = [];
            try { history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch (e) { }
            const latest = history[0] || {};

            const blob = new Blob([JSON.stringify(latest, null, 2)], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `quiz-results-${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            URL.revokeObjectURL(a.href);
        }

        // ── Share Score ──────────────────────────────────────────
        async function shareScore() {
            const total = questions.length;
            const pct = Math.round((score / total) * 100);
            let text = `🎂 I scored ${score}/${total} (${pct}%) on the Birthday Quiz Challenge! 🏆 Try it yourself!\n\n📋 DETAILED REVIEW:\n`;

            questions.forEach((q, idx) => {
                const userAns = answers[idx];
                const wasSubmit = submitted[idx];
                const isCorrect = wasSubmit && userAns === q.correct;
                const isWrong = wasSubmit && userAns !== q.correct;
                const isSkipped = !wasSubmit;

                let status = isCorrect ? 'Correct ✅' : isWrong ? 'Incorrect ❌' : 'Skipped ⏭️';

                text += `\nQ${idx + 1} · ${status}\n`;
                text += `Question: ${q.question}\n`;

                if (isSkipped) {
                    text += `Your Answer: [Skipped]\n`;
                    text += `Correct Answer: ${q.options[q.correct]}\n`;
                } else if (isCorrect) {
                    text += `Your Answer: ${q.options[userAns]}\n`;
                } else {
                    text += `Your Answer: ${q.options[userAns]}\n`;
                    text += `Correct Answer: ${q.options[q.correct]}\n`;
                }

                text += `💡 Fun Fact: ${q.explanation}\n`;
            });

            if (navigator.share) {
                try { await navigator.share({ title: 'Birthday Quiz', text }); } catch (e) { }
            } else {
                navigator.clipboard.writeText(text).then(() => {
                    const btn = document.getElementById('shareBtn');
                    btn.textContent = '✅ Copied!';
                    setTimeout(() => btn.textContent = '🔗 Share Score', 2000);
                });
            }
        }

        // ── Retake Quiz ──────────────────────────────────────────
        function retakeQuiz() {
            // TODO: Retake Quiz temporarily disabled — reactivate this logic when ready
            
            // Clear persisted state so next attempt starts fresh
            clearState();
            try { localStorage.removeItem('birthdayQuizCompletedState'); } catch (e) { }

            answers = {};
            submitted = {};
            score = 0;
            current = 0;
            timeLeft = 60;
            quizStarted = false;

            document.getElementById('resultsScreen').classList.remove('show');
            document.getElementById('quizContainer').style.display = '';
            document.getElementById('progressWrap').style.display = 'none';
            document.getElementById('timerDisplay').style.display = 'none';

            updateScorePill();
            showStartScreen();
            
        }

        // ── Confetti ─────────────────────────────────────────────
        function launchConfetti() {
            const canvas = document.getElementById('confetti-canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            const colors = ['#F4B942', '#FF6F61', '#7c3aed', '#10b981', '#a855f7', '#f43f5e', '#FDF6E9'];
            const pieces = Array.from({ length: 160 }, () => ({
                x: Math.random() * canvas.width,
                y: -20 - Math.random() * 200,
                w: 8 + Math.random() * 8,
                h: 4 + Math.random() * 4,
                r: Math.random() * Math.PI * 2,
                dr: (Math.random() - 0.5) * 0.15,
                vx: (Math.random() - 0.5) * 4,
                vy: 3 + Math.random() * 4,
                col: colors[Math.floor(Math.random() * colors.length)],
                op: 1,
            }));

            let frame = 0;
            function drawConfetti() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                pieces.forEach(p => {
                    p.x += p.vx;
                    p.y += p.vy;
                    p.r += p.dr;
                    p.vy += 0.04;
                    if (frame > 120) p.op -= 0.008;
                    p.op = Math.max(0, p.op);

                    ctx.save();
                    ctx.globalAlpha = p.op;
                    ctx.fillStyle = p.col;
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.r);
                    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                    ctx.restore();
                });
                frame++;
                if (frame < 200) requestAnimationFrame(drawConfetti);
                else ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
            drawConfetti();
        }

        // ── Keyboard Shortcuts ───────────────────────────────────
        document.addEventListener('keydown', e => {
            if (!quizStarted) return;
            const num = parseInt(e.key);
            if (num >= 1 && num <= 4) selectOption(current, num - 1);
            if (e.key === 'Enter') {
                const btn = document.getElementById(`submitBtn-${current}`);
                if (btn && !btn.disabled) submitAnswer(current);
            }
        });

        // ── Init ─────────────────────────────────────────────────
        // Hide timer pill on initial page load (shown when quiz starts)
        document.getElementById('timerDisplay').style.display = 'none';
        loadQuiz();
