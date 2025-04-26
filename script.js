// Word Search Game with Multiple Puzzles, Progress Bar, and Scoring
const gridSize = 10;
const puzzles = [
  { 
    name: "Tech Terms", 
    words: ["JAVASCRIPT", "HTML", "CSS", "PUZZLE", "GAME", "CODE", "WEB", "ALGORITHM"],
    theme: "#4CAF50" // Green
  },
  { 
    name: "Animals", 
    words: ["ELEPHANT", "TIGER", "GIRAFFE", "LION", "ZEBRA", "PANDA", "KOALA"],
    theme: "#FF9800" // Orange
  },
  { 
    name: "Countries", 
    words: ["CANADA", "BRAZIL", "JAPAN", "ITALY", "EGYPT", "FRANCE", "GERMANY"],
    theme: "#2196F3" // Blue
  }
];

// Game State
let grid = [];
let selectedCells = [];
let foundWords = [];
let time = 0;
let timerInterval;
let currentPuzzleIndex = 0;
let gameActive = false;

// DOM Elements
const wordGridElement = document.getElementById('word-grid');
const wordListElement = document.getElementById('words');
const timerElement = document.getElementById('timer');
const progressBarElement = document.getElementById('progress-bar');
const progressTextElement = document.getElementById('progress-text');
const scoreDisplayElement = document.getElementById('score-display');
const newGameButton = document.getElementById('new-game');
const puzzleSelectElement = document.getElementById('puzzle-select');
const submitButton = document.getElementById('submit-btn');

// Initialize Game
function initGame() {
  // Reset game state
  clearInterval(timerInterval);
  time = 0;
  foundWords = [];
  selectedCells = [];
  gameActive = true;
  
  // Update UI
  timerElement.textContent = `Time: ${time}s`;
  scoreDisplayElement.textContent = '';
  wordGridElement.innerHTML = '';
  wordListElement.innerHTML = '';
  
  // Set theme color
  document.documentElement.style.setProperty('--theme-color', puzzles[currentPuzzleIndex].theme);
  
  // Generate and render
  generateGrid();
  renderWordList();
  updateProgress();
  
  // Start timer
  timerInterval = setInterval(updateTimer, 1000);
}

// Generate the word grid
function generateGrid() {
  // Initialize empty grid
  grid = Array(gridSize).fill().map(() => Array(gridSize).fill(''));
  
  // Place words
  placeWords();
  
  // Fill remaining spaces with random letters
  fillGridWithRandomLetters();
  
  // Render to DOM
  renderGrid();
}

function placeWords() {
  puzzles[currentPuzzleIndex].words.forEach(word => {
    let placed = false;
    let attempts = 0;
    const maxAttempts = 50;
    
    while (!placed && attempts < maxAttempts) {
      const direction = Math.floor(Math.random() * 3); // 0=horizontal, 1=vertical, 2=diagonal
      const row = Math.floor(Math.random() * gridSize);
      const col = Math.floor(Math.random() * gridSize);
      
      if (canPlaceWord(word, row, col, direction)) {
        placeWordInGrid(word, row, col, direction);
        placed = true;
      }
      attempts++;
    }
  });
}

function canPlaceWord(word, row, col, direction) {
  const wordLength = word.length;
  
  // Check boundaries
  if (direction === 0 && col + wordLength > gridSize) return false; // Horizontal
  if (direction === 1 && row + wordLength > gridSize) return false; // Vertical
  if (direction === 2 && (row + wordLength > gridSize || col + wordLength > gridSize)) return false; // Diagonal
  
  // Check for conflicts
  for (let i = 0; i < wordLength; i++) {
    const r = row + (direction === 1 || direction === 2 ? i : 0);
    const c = col + (direction === 0 || direction === 2 ? i : 0);
    
    if (grid[r][c] !== '' && grid[r][c] !== word[i]) {
      return false;
    }
  }
  
  return true;
}

function placeWordInGrid(word, row, col, direction) {
  for (let i = 0; i < word.length; i++) {
    const r = row + (direction === 1 || direction === 2 ? i : 0);
    const c = col + (direction === 0 || direction === 2 ? i : 0);
    grid[r][c] = word[i];
  }
}

function fillGridWithRandomLetters() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (grid[i][j] === '') {
        grid[i][j] = letters[Math.floor(Math.random() * letters.length)];
      }
    }
  }
}

function renderGrid() {
  wordGridElement.style.gridTemplateColumns = `repeat(${gridSize}, 40px)`;
  
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.textContent = grid[i][j];
      cell.dataset.row = i;
      cell.dataset.col = j;
      cell.addEventListener('click', () => handleCellClick(cell));
      wordGridElement.appendChild(cell);
    }
  }
}

function renderWordList() {
  puzzles[currentPuzzleIndex].words.forEach(word => {
    const li = document.createElement('li');
    li.textContent = word;
    li.id = `word-${word}`;
    wordListElement.appendChild(li);
  });
}

function handleCellClick(cell) {
  if (!gameActive) return;
  
  const row = parseInt(cell.dataset.row);
  const col = parseInt(cell.dataset.col);
  
  // Toggle selection
  if (cell.classList.contains('selected')) {
    cell.classList.remove('selected');
    selectedCells = selectedCells.filter(c => !(c.row === row && c.col === col));
    return;
  }
  
  // Add to selection
  cell.classList.add('selected');
  selectedCells.push({ row, col, letter: cell.textContent });
  
  // Check for word if enough letters selected
  if (selectedCells.length >= 3) {
    checkForWord();
  }
}

function checkForWord() {
  const selectedWord = selectedCells.map(c => c.letter).join('');
  const currentWords = puzzles[currentPuzzleIndex].words;
  
  if (currentWords.includes(selectedWord) && !foundWords.includes(selectedWord)) {
    // Valid word found
    foundWords.push(selectedWord);
    
    // Update word list
    document.getElementById(`word-${selectedWord}`).classList.add('found');
    
    // Highlight cells
    selectedCells.forEach(c => {
      document.querySelector(`.cell[data-row="${c.row}"][data-col="${c.col}"]`)
        .classList.add('found');
    });
    
    selectedCells = [];
    updateProgress();
    checkWin();
  }
}

function updateProgress() {
  const progress = Math.round((foundWords.length / puzzles[currentPuzzleIndex].words.length) * 100);
  progressBarElement.style.width = `${progress}%`;
  progressTextElement.textContent = `${progress}%`;
}

function checkWin() {
  if (foundWords.length === puzzles[currentPuzzleIndex].words.length) {
    gameActive = false;
    clearInterval(timerInterval);
    setTimeout(() => {
      alert(`🎉 Congratulations! You solved the ${puzzles[currentPuzzleIndex].name} puzzle in ${time} seconds!`);
    }, 100);
  }
}

function updateTimer() {
  time++;
  timerElement.textContent = `Time: ${time}s`;
}

function calculateScore() {
  const accuracy = (foundWords.length / puzzles[currentPuzzleIndex].words.length) * 100;
  const timePenalty = time * 2; // Higher penalty for longer times
  const baseScore = 1000;
  const score = Math.max(0, baseScore - timePenalty + (accuracy * 10));
  return Math.round(score);
}

function submitScore() {
  if (!gameActive) return;
  
  const score = calculateScore();
  const accuracy = Math.round((foundWords.length / puzzles[currentPuzzleIndex].words.length) * 100);
  
  scoreDisplayElement.innerHTML = `
    <p>Your Score: <strong>${score}</strong></p>
    <p>Words Found: ${foundWords.length}/${puzzles[currentPuzzleIndex].words.length}</p>
    <p>Accuracy: ${accuracy}%</p>
    <p>Time: ${time} seconds</p>
  `;
}

function nextPuzzle() {
  currentPuzzleIndex = (currentPuzzleIndex + 1) % puzzles.length;
  puzzleSelectElement.value = currentPuzzleIndex;
  initGame();
}

function setupPuzzleSelector() {
  puzzleSelectElement.innerHTML = '';
  puzzles.forEach((puzzle, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = puzzle.name;
    puzzleSelectElement.appendChild(option);
  });
}

// Event Listeners
newGameButton.addEventListener('click', nextPuzzle);
puzzleSelectElement.addEventListener('change', (e) => {
  currentPuzzleIndex = parseInt(e.target.value);
  initGame();
});
submitButton.addEventListener('click', submitScore);

// Initialize Game
setupPuzzleSelector();
initGame();