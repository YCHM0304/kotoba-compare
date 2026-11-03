// 題目由首頁卡片傳入，新增卡片即可加入題庫。
const quizStart = document.getElementById('quiz-start');
const quizArea = document.getElementById('quiz-area');
const quizWords = document.getElementById('quiz-words');
const quizTargets = document.getElementById('quiz-targets');
const quizProgress = document.getElementById('quiz-progress');
const quizFeedback = document.getElementById('quiz-feedback');
const quizCheck = document.getElementById('quiz-check');
const quizNext = document.getElementById('quiz-next');
const shuffle = (items) => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};
let questions = [];
let questionIndex = 0;
let selected = null;
let assignments = [];
let checked = false;
let correctCount = 0;

function renderQuiz() {
  const question = questions[questionIndex];
  quizProgress.textContent = `第 ${questionIndex + 1} 題／共 ${questions.length} 題`;
  quizWords.replaceChildren();
  quizTargets.replaceChildren();
  question.wordOrder.forEach((id) => {
    if (assignments.includes(id)) return;
    const word = document.createElement('button');
    word.type = 'button';
    word.className = 'quiz-word';
    word.dataset.wordId = id;
    word.lang = 'ja';
    word.textContent = question.pairs[id].word;
    word.draggable = true;
    word.setAttribute('aria-pressed', String(selected === id));
    word.addEventListener('click', () => {
      if (checked) return;
      selected = selected === id ? null : id;
      renderQuiz();
      quizWords.querySelector(`[data-word-id="${id}"]`).focus();
    });
    word.addEventListener('dragstart', (event) => {
      if (checked) { event.preventDefault(); return; }
      event.dataTransfer.setData('text/plain', String(id));
      event.dataTransfer.effectAllowed = 'move';
    });
    quizWords.append(word);
  });
  question.meaningOrder.forEach((id) => {
    const target = document.createElement('button');
    target.type = 'button';
    target.className = 'quiz-target';
    target.dataset.targetId = id;
    if (checked) target.classList.add(assignments[id] === id ? 'is-correct' : 'is-wrong');
    const meaning = document.createElement('span');
    meaning.textContent = question.pairs[id].meaning;
    const slot = document.createElement('span');
    slot.className = 'slot';
    slot.textContent = assignments[id] === null ? '放在這裡' : question.pairs[assignments[id]].word;
    if (checked && assignments[id] !== id) slot.textContent += `（正解：${question.pairs[id].word}）`;
    if (!checked && assignments[id] !== null) {
      const wordId = assignments[id];
      slot.draggable = true;
      slot.classList.add('slot-draggable');
      if (selected === wordId) slot.classList.add('is-selected');
      slot.addEventListener('dragstart', (event) => {
        event.dataTransfer.setData('text/plain', String(wordId));
        event.dataTransfer.effectAllowed = 'move';
      });
    }
    target.append(meaning, slot);
    target.setAttribute('aria-label', `${question.pairs[id].meaning}：${slot.textContent}`);
    target.addEventListener('click', () => {
      if (checked) return;
      if (selected !== null && selected !== assignments[id]) {
        assignWord(selected, id);
      } else if (assignments[id] !== null) {
        selected = selected === assignments[id] ? null : assignments[id];
        renderQuiz();
        quizTargets.querySelector(`[data-target-id="${id}"]`).focus();
      }
    });
    target.addEventListener('dragover', (event) => { if (!checked) event.preventDefault(); });
    target.addEventListener('drop', (event) => {
      event.preventDefault();
      if (checked) return;
      const data = event.dataTransfer.getData('text/plain');
      if (!/^\d+$/.test(data)) return;
      const wordId = Number(data);
      if (wordId < question.pairs.length) assignWord(wordId, id);
    });
    quizTargets.append(target);
  });
}
function assignWord(wordId, targetId) {
  const oldTarget = assignments.indexOf(wordId);
  const displaced = assignments[targetId];
  if (oldTarget !== -1) assignments[oldTarget] = displaced;
  assignments[targetId] = wordId;
  selected = null;
  quizFeedback.textContent = '';
  renderQuiz();
  quizTargets.querySelector(`[data-target-id="${targetId}"]`).focus();
}
function startQuestion() {
  const question = questions[questionIndex];
  assignments = Array(question.pairs.length).fill(null);
  selected = null;
  checked = false;
  quizFeedback.textContent = '';
  quizCheck.hidden = false;
  quizNext.hidden = true;
  renderQuiz();
}
quizStart.addEventListener('click', () => {
  let pairsList = [];
  try { pairsList = JSON.parse(sessionStorage.getItem('word-card-quiz') || '[]'); } catch (error) { pairsList = []; }
  questions = shuffle(pairsList.map((pairs) => ({
    pairs, wordOrder: shuffle(pairs.map((_, i) => i)), meaningOrder: shuffle(pairs.map((_, i) => i)),
  })).filter((question) => question.pairs.length >= 2));
  if (!questions.length) { quizFeedback.textContent = '請回到首頁，點選「開始練習」載入題目。'; quizArea.hidden = false; quizCheck.hidden = true; return; }
  questionIndex = 0;
  correctCount = 0;
  quizStart.hidden = true;
  quizArea.hidden = false;
  startQuestion();
});
quizCheck.addEventListener('click', () => {
  if (assignments.includes(null)) { quizFeedback.textContent = '請先將每個意思都配上詞語。'; return; }
  checked = true;
  const correct = assignments.every((word, index) => word === index);
  if (correct) correctCount++;
  quizFeedback.textContent = correct ? '答對了！' : '這題有答錯，方框中顯示了正確答案。';
  quizCheck.hidden = true;
  quizNext.textContent = questionIndex === questions.length - 1 ? '查看結果' : '下一題';
  quizNext.hidden = false;
  renderQuiz();
});
quizNext.addEventListener('click', () => {
  questionIndex++;
  if (questionIndex < questions.length) { startQuestion(); return; }
  quizWords.replaceChildren();
  quizTargets.replaceChildren();
  quizProgress.textContent = '練習完成';
  quizFeedback.textContent = `答對 ${correctCount}／${questions.length} 題。`;
  quizNext.hidden = true;
  quizStart.textContent = '再練習一次';
  quizStart.hidden = false;
});

// 從首頁進入後立即開始；直接造訪時顯示回首頁的提示。
quizStart.click();
