const gridContainer = document.getElementById('grid');
const restartButton = document.getElementById('restart');
const rows = 10;
const cols = 16;
let grid = [];
let catPosition = { x: Math.floor(cols / 2), y: Math.floor(rows / 2) };
let blockedFields = [];
let isPlayerTurn = true;

window.onload = () => {
  // Play music when user clicks anywhere on the body (with some additional check for interaction)
  const audio = document.getElementById('bg-music');
  document.body.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().catch(err => console.warn('Audio play failed:', err));
    }
  }, { once: true }); // Ensures this runs only once when the user clicks on the page

  const toggleMusicButton = document.getElementById('toggleMusic');
  toggleMusicButton.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().catch(err => console.warn('Audio play failed:', err));
      toggleMusicButton.textContent = "Pause Music";
    } else {
      audio.pause();
      toggleMusicButton.textContent = "Play Music";
    }
  });
};




// Initialize grid
function createGrid() {
  gridContainer.innerHTML = '';
  grid = [];
  blockedFields = [];
  
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const cell = document.createElement('div');
      cell.classList.add('grid-cell');
      cell.setAttribute('data-x', j);
      cell.setAttribute('data-y', i);
      
      cell.addEventListener('click', handleCellClick);
      gridContainer.appendChild(cell);
      grid.push(cell);
    }
  }

  // Add initial random blocks
  addRandomBlocks();

  // Place the cat
  placeCat(catPosition.x, catPosition.y);
}

// Add random blocks to the grid
function addRandomBlocks() {
  const numBlocks = Math.floor(Math.random() * 6) + 5; // 5-10 blocks
  for (let i = 0; i < numBlocks; i++) {
    let x, y, index;
    do {
      x = Math.floor(Math.random() * cols);
      y = Math.floor(Math.random() * rows);
      index = y * cols + x;
    } while (
      blockedFields.some(field => field.x === x && field.y === y) || // Avoid duplicate blocks
      (x === catPosition.x && y === catPosition.y) // Avoid the cat's initial position
    );

    grid[index].classList.add('blocked');
    blockedFields.push({ x, y });
  }
}

// Place cat at a specific position
function placeCat(x, y) {
  const index = y * cols + x;
  grid[index].classList.add('cat');
}

// Handle player blocking a field
function handleCellClick(event) {
  if (!isPlayerTurn) return;

  const x = parseInt(event.target.getAttribute('data-x'));
  const y = parseInt(event.target.getAttribute('data-y'));
  
  if (!event.target.classList.contains('blocked') && !event.target.classList.contains('cat')) {
    event.target.classList.add('blocked');
    blockedFields.push({ x, y });
    isPlayerTurn = false; // End player's turn

    const brickSound = document.getElementById('brick-sound');
  if (brickSound) {
    brickSound.currentTime = 0;
    brickSound.play().catch(err => console.warn('Failed to play brick:', err));
  }

    moveCat(); // Cat's turn
  }
}

function moveCat() {
  const queue = [{ x: catPosition.x, y: catPosition.y, path: [] }];
  const visited = new Set();
  visited.add(`${catPosition.x},${catPosition.y}`);

  let foundExit = false;
  let shortestPath = null;

  while (queue.length > 0) {
    const { x, y, path } = queue.shift();

    if (x === 0 || x === cols - 1 || y === 0 || y === rows - 1) {
      foundExit = true;
      shortestPath = path.concat({ x, y });
      break;
    }

    const directions = [
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 0 },
      { dx: 1, dy: 0 },
    ];

    for (const dir of directions) {
      const newX = x + dir.dx;
      const newY = y + dir.dy;
      const key = `${newX},${newY}`;

      if (
        newX >= 0 &&
        newX < cols &&
        newY >= 0 &&
        newY < rows &&
        !visited.has(key) &&
        !grid[newY * cols + newX].classList.contains('blocked')
      ) {
        visited.add(key);
        queue.push({ x: newX, y: newY, path: path.concat({ x, y }) });
      }
    }
  }

  if (foundExit && shortestPath.length > 1) {
    const nextMove = shortestPath[1];
    catPosition = { x: nextMove.x, y: nextMove.y };
    updateGrid();

    if (catPosition.x === 0 || catPosition.x === cols - 1 || catPosition.y === 0 || catPosition.y === rows - 1) {
      showModal('Cat wins!');
    }
  } else {
    showModal('Player wins!');
  }
}

// Update grid after the cat moves
function updateGrid() {
  grid.forEach(cell => cell.classList.remove('cat'));
  placeCat(catPosition.x, catPosition.y);
  isPlayerTurn = true; // Player's turn
}

// Reset the game
function resetGame() {
  catPosition = { x: Math.floor(cols / 2), y: Math.floor(rows / 2) };
  blockedFields = [];
  isPlayerTurn = true;
  createGrid();
}

// Display a modal for win/loss
// Display a modal for win/loss
function showModal(message) {
  const modal = document.createElement('div');
  modal.classList.add('modal');
  modal.innerHTML = `
    <div class="modal-content">
      <p>${message}</p>
      <button id="closeModal">Close</button>
    </div>
  `;

  // Ensure the sound plays when the modal appears
  const meowSound = document.getElementById('meow-sound');
  if (meowSound) {
    meowSound.currentTime = 0;
    meowSound.play().catch(err => console.warn('Failed to play meow:', err));
  }

  // Append the modal to the body
  document.body.appendChild(modal);

  // Close the modal when the button is clicked
  document.getElementById('closeModal').addEventListener('click', () => {
    modal.remove();
    resetGame();
  });
}


// Set up event listeners
restartButton.addEventListener('click', resetGame);

// Initial game setup
createGrid();
