/**
АНТИ-ИИ ВИЗОМЕТР | v6.3 — ПОЛНОСТЬЮ ИСПРАВЛЕНА
✅ Работает через file:// без серверов
✅ Исправлена ошибка "Unexpected token '<'"
✅ Валидный SVG в data-URL
*/
// ========== КОНФИГУРАЦИЯ ==========
const CATEGORIES = [
    { id: 'animals', name: 'Животные', emoji: '🐶', hint: 'Смотрите на шерсть, глаза, лапы' },
    { id: 'nature',  name: 'Природа',   emoji: '🌲', hint: 'Смотрите на листву, воду, облака' },
    { id: 'cities',  name: 'Города',    emoji: '🏙️', hint: 'Смотрите на окна, тени, перспективу' },
    { id: 'food',    name: 'Еда',       emoji: '🍕', hint: 'Смотрите на текстуру, блеск, цвета' }
];
const DIFFICULTIES = {
    easy:   { id: 'easy',   label: '🟢 Лёгкий',   files: [1, 2, 3] },
    medium: { id: 'medium', label: '🟡 Средний',  files: [4, 5, 6] },
    hard:   { id: 'hard',   label: '🔴 Сложный',  files: [7, 8, 9, 10] }
};

// ========== СОСТОЯНИЕ ==========
let round = 0, score = 0, difficulty = 'easy', totalRounds = 10;
let questions = [], realPos = 0;

// ========== DOM ==========
let $start, $game, $fb, $res, $prog, $scr, $badge, $i0, $i1, $fbIcon, $fbTitle, $fbText, $fRank, $fPct, $fScr, $fDesc;

document.addEventListener('DOMContentLoaded', () => {
    $start = document.getElementById('start-screen');
    $game  = document.getElementById('game-screen');
    $fb    = document.getElementById('feedback-screen');
    $res   = document.getElementById('result-screen');
    $prog  = document.getElementById('progress');
    $scr   = document.getElementById('score');
    $badge = document.getElementById('difficulty-badge');
    $i0    = document.getElementById('img0');
    $i1    = document.getElementById('img1');
    $fbIcon= document.getElementById('feedback-icon');
    $fbTitle = document.getElementById('feedback-title');
    $fbText  = document.getElementById('feedback-text');
    $fRank   = document.getElementById('final-rank');
    $fPct    = document.getElementById('final-percent');
    $fScr    = document.getElementById('final-score');
    $fDesc   = document.getElementById('final-desc');

    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            difficulty = btn.dataset.diff;
            $badge.textContent = DIFFICULTIES[difficulty].label;
        };
    });

    document.getElementById('startBtn').onclick = startGame;
    document.querySelectorAll('.img-card').forEach(c => {
        c.onclick = () => {
            const ch = parseInt(c.dataset.choice);
            if (!isNaN(ch)) makeChoice(ch);
        };
    });
    document.getElementById('nextBtn').onclick = nextRound;
    document.getElementById('restartBtn').onclick = () => location.reload();
    document.getElementById('shareBtn').onclick = shareResult;

    console.log('🚀 Автономный Визометр v6.3 успешно запущен!');
});

// ========== БЕЗОПАСНАЯ УСТАНОВКА ИЗОБРАЖЕНИЙ ==========
function setImgSrc(imgElement, path) {
    const absolutePath = new URL(path, window.location.href).href;
    imgElement.onerror = null;

    imgElement.onerror = function() {
        if (this.src.endsWith('.jpeg')) {
            console.log(`🔄 Замена расширения: ${path} -> .jpg`);
            this.src = this.src.replace('.jpeg', '.jpg');
        } else {
            console.error(`❌ Файл не найден: ${this.src}`);
            // ✅ ВАЛИДНЫЙ SVG: без пробелов, правильный xmlns, компактный
            this.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23222'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23ff4b4b' font-family='sans-serif' font-size='10'>Файл не найден</text></svg>";
        }
        this.onerror = null;
    };
    imgElement.src = absolutePath;
}

// ========== ГЕНЕРАЦИЯ ВОПРОСОВ ==========
function genQuestions() {
    const qs = [];
    const lvl = DIFFICULTIES[difficulty];
    for (let i = 0; i < totalRounds; i++) {
        const cat = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
        const num = lvl.files[Math.floor(Math.random() * lvl.files.length)];
        qs.push({
            real: `images/${cat.id}/real/${num}_${lvl.id}.jpeg`,
            ai:   `images/${cat.id}/ai/${num}_${lvl.id}.jpeg`,
            cat,
            hint: `${cat.emoji} ${cat.hint}`
        });
    }
    return qs;
}

// ========== ЗАГРУЗКА РАУНДА ==========
function loadRound() {
    if (round >= totalRounds) { showResults(); return; }
    const q = questions[round];
    realPos = Math.random() < 0.5 ? 0 : 1;

    if (realPos === 0) {
        setImgSrc($i0, q.real);
        setImgSrc($i1, q.ai);
    } else {
        setImgSrc($i0, q.ai);
        setImgSrc($i1, q.real);
    }

    $prog.textContent = `Раунд ${round + 1}/${totalRounds}`;
    document.querySelectorAll('.img-card').forEach(c => {
        c.style.borderColor = 'transparent';
        c.style.boxShadow = '';
    });
    $game.classList.remove('hidden');
    $fb.classList.add('hidden');
}

function startGame() {
    questions = genQuestions();
    round = 0; score = 0;
    $start.classList.add('hidden');
    $game.classList.remove('hidden');
    $scr.textContent = `🎯 Счёт: ${score}`;
    loadRound();
}

function makeChoice(choice) {
    const correct = (choice === realPos);
    if (correct) {
        score++;
        $scr.textContent = `🎯 Счёт: ${score}`;
        $fbIcon.textContent = '✅';
        $fbTitle.textContent = 'ПРАВИЛЬНО!';
        $fbTitle.style.color = '#00ff88';
    } else {
        $fbIcon.textContent = '❌';
        $fbTitle.textContent = 'ОШИБКА!';
        $fbTitle.style.color = '#ff4b4b';
    }
    const q = questions[round];
    $fbText.innerHTML = `<strong>📖 Категория:</strong> ${q.cat.emoji} ${q.cat.name}<br><br><strong>🔍 Подсказка:</strong> ${q.hint}`;

    // ✅ ИСПРАВЛЕНО: без пробелов в селекторе
    const card = document.querySelector(`.img-card[data-choice="${choice}"]`);
    if (card) {
        card.style.borderColor = correct ? '#00ff88' : '#ff4b4b';
        card.style.boxShadow = `0 0 24px ${correct ? '#00ff88' : '#ff4b4b'}`;
    }

    // ✅ ИСПРАВЛЕНО: 'hidden' вместо 'hi dden'
    $game.classList.add('hidden');
    $fb.classList.remove('hidden');
}

function nextRound() {
    round++;
    loadRound();
}

function showResults() {
    const p = Math.round(score / totalRounds * 100);
    let icon = '', rank = '', desc = '';
    if (p >= 90) { icon = '🏆'; rank = 'Эксперт'; desc = 'Ваш глаз тренирован. Вы отлично видите артефакты ИИ.'; }
    else if (p >= 70) { icon = '👍'; rank = 'Продвинутый'; desc = 'Хороший результат! Продолжайте замечать мелкие детали.'; }
    else if (p >= 50) { icon = '📚'; rank = 'Ученик'; desc = 'Вы на правильном пути. Изучайте текстуры и свет.'; }
    else { icon = '⚠️'; rank = 'В группе риска'; desc = 'Тренируйте внимательность: глаза, пальцы, тени, текст.'; }
    $fRank.innerHTML = `${icon} ${rank}`;
    $fPct.textContent = `${p}%`;
    $fScr.textContent = `${score} из ${totalRounds}`;
    $fDesc.textContent = desc;
    $fb.classList.add('hidden');
    $res.classList.remove('hidden');
}

function shareResult() {
    const p = Math.round(score / totalRounds * 100);
    const text = `Я прошёл "Анти-ИИ Визометр": ${score}/${totalRounds} (${p}%)!`;
    navigator.clipboard.writeText(text).then(() => alert('✅ Результат скопирован!'));
}
