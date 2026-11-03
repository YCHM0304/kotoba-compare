document.querySelectorAll('[data-card]').forEach((card) => {
  const button = card.querySelector('button');
  const answer = document.getElementById(button.getAttribute('aria-controls'));
  button.addEventListener('click', () => {
    const open = card.classList.toggle('is-open');
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? '翻回卡片正面' : `翻開${card.querySelector('.question').textContent.replace(/\s+/g, ' ').trim()}的比較`);
    answer.hidden = !open;
  });
});

const filters = document.querySelectorAll('[data-filter]');
const cards = document.querySelectorAll('[data-card]');
filters.forEach((filter) => {
  filter.addEventListener('click', () => {
    filters.forEach((item) => {
      const active = item === filter;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    cards.forEach((card) => {
      card.hidden = filter.dataset.filter !== 'all' && card.dataset.category !== filter.dataset.filter;
    });
  });
});

// 從首頁的卡片取得題目，供這次練習使用。
document.getElementById('quiz-entry').addEventListener('click', (event) => {
  const questions = Array.from(cards, (card) => Array.from(card.querySelectorAll('.answer-row'), (row) => ({
    word: row.querySelector('strong').textContent.trim(),
    meaning: row.querySelector('span').textContent.trim(),
  }))).filter((pairs) => pairs.length >= 2);
  try {
    sessionStorage.setItem('word-card-quiz', JSON.stringify(questions));
  } catch (error) {
    event.preventDefault();
    alert('無法開始練習，請確認瀏覽器允許儲存網站資料。');
  }
});
