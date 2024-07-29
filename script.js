const grid = document.getElementById('grid');
const hintsContainer = document.getElementById('hints');
const movesLeftElement = document.getElementById('moves-left');
let selectedCell = null;
let movesLeft = 5;
let cells = [];
let originalGrid = [];
let currentGrid = [];
const words = ["APPLE", "BREAD", "CANDY", "DATES"]; // Example words
let history = []; // History of moves for undo functionality

// Initialize the game
function initializeGame() {
    cells = [];
    history = [];
    movesLeft = 5;
    movesLeftElement.textContent = movesLeft;

    generateNewWords();
    createGrid();
    displayHints();
    checkForCompletedRows(); // Check for completed rows right after creating the grid
}

// Generate new words and fill the grid
function generateNewWords() {
    originalGrid = [];
    currentGrid = [];
    for (const word of words) {
        originalGrid.push(word.split(''));
        currentGrid.push(word.split(''));
    }
    shuffleGrid(); // Apply the valid moves after generating the new words
}

// Create grid and append cells
function createGrid() {
    grid.innerHTML = '';
    cells = [];
    currentGrid.forEach((row, rIndex) => {
        row.forEach((letter, cIndex) => {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.textContent = letter;
            cell.dataset.row = rIndex;
            cell.dataset.col = cIndex;
            cell.addEventListener('click', () => handleCellClick(cell));
            grid.appendChild(cell);
            cells.push(cell);
        });
    });
}

// Shuffle letters to simulate the jumbled grid with valid moves
function shuffleGrid() {
    // Generate a list of valid swaps
    const swaps = [];

    // Create swaps horizontally
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            swaps.push({ r1: r, c1: c, r2: r, c2: c + 1 });
        }
    }

    // Create swaps vertically
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 5; c++) {
            swaps.push({ r1: r, c1: c, r2: r + 1, c2: c });
        }
    }

    // Perform exactly 5 random swaps
    const validSwaps = [];
    for (let i = 0; i < 5; i++) {
        const swap = swaps.splice(Math.floor(Math.random() * swaps.length), 1)[0];
        validSwaps.push(swap);

        // Swap in the currentGrid
        const { r1, c1, r2, c2 } = swap;
        [currentGrid[r1][c1], currentGrid[r2][c2]] = [currentGrid[r2][c2], currentGrid[r1][c1]];

        // Add swap to history for potential undo functionality
        // history.push(swap);
    }

    updateGridDisplay();
}

// Update grid display to reflect the current state
function updateGridDisplay() {
    cells.forEach(cell => {
        const rIndex = parseInt(cell.dataset.row);
        const cIndex = parseInt(cell.dataset.col);
        cell.textContent = currentGrid[rIndex][cIndex];
        cell.classList.remove('selected', 'correct');
    });
    checkForCompletedRows(); // Re-check completed rows after each move
}

// Handle cell click event
function handleCellClick(cell) {
    if (selectedCell) {
        const r1 = parseInt(selectedCell.dataset.row);
        const c1 = parseInt(selectedCell.dataset.col);
        const r2 = parseInt(cell.dataset.row);
        const c2 = parseInt(cell.dataset.col);

        // Swap the letters
        [currentGrid[r1][c1], currentGrid[r2][c2]] = [currentGrid[r2][c2], currentGrid[r1][c1]];
        updateGridDisplay();
        selectedCell.classList.remove('selected');
        selectedCell = null;

        movesLeft--;
        movesLeftElement.textContent = movesLeft;

        console.log("Move:" + r1, c1, r2, c2);
        const move = [r1, c1, r2, c2]; 
        history.push(move);

        // Check if the grid is solved
        checkForSolution();
    } else {
        // Highlight selected cell
        selectedCell = cell;
        selectedCell.classList.add('selected');
    }
}

// Check if the grid matches the original
function checkForSolution() {
    let isSolved = true;
    currentGrid.forEach((row, rIndex) => {
        row.forEach((letter, cIndex) => {
            if (letter !== originalGrid[rIndex][cIndex]) {
                isSolved = false;
            }
        });
    });

    if (isSolved) {
        cells.forEach(cell => {
            const rIndex = parseInt(cell.dataset.row);
            const cIndex = parseInt(cell.dataset.col);
            if (currentGrid[rIndex][cIndex] === originalGrid[rIndex][cIndex]) {
                cell.classList.add('correct');
            }
        });
        alert('Congratulations, you solved the puzzle!');
    }
}

// Check for completed rows and apply the appropriate styles
function checkForCompletedRows() {
    // Iterate over each row and check if it is correct
    for (let rIndex = 0; rIndex < 4; rIndex++) {
        const rowCells = cells.filter(cell => parseInt(cell.dataset.row) === rIndex);
        const originalRow = originalGrid[rIndex];
        const currentRow = currentGrid[rIndex];
        
        // Check if the row matches the original
        const allCorrect = currentRow.every((letter, cIndex) => letter === originalRow[cIndex]);

        // Update row styling based on completion
        rowCells.forEach(cell => {
            cell.classList.toggle('row-complete', allCorrect);
            if (allCorrect) {
                cell.classList.add('correct'); // Add 'correct' class for individual cells
            } else {
                cell.classList.remove('correct'); // Remove 'correct' class if the row is not complete
            }
        });
    }
}

// Reset the game to the initial state
function resetGame() {
    initializeGame();
}

// Undo the last move
function undoMove() {
    console.log("undoMove - history.length:" + history.length);
    if (history.length === 0) return;

    const lastSwap = history.pop();
    const { r1, c1, r2, c2 } = lastSwap;

    // Reverse the swap
    [currentGrid[r1][c1], currentGrid[r2][c2]] = [currentGrid[r2][c2], currentGrid[r1][c1]];

    updateGridDisplay();
    movesLeft++;
    movesLeftElement.textContent = movesLeft;
}

// Display hints next to the grid
function displayHints() {
    hintsContainer.innerHTML = '';
    words.forEach((word, index) => {
        const hint = document.createElement('div');
        hint.className = 'hint';
        hint.textContent = `Row ${index + 1}: ${word}`;
        hintsContainer.appendChild(hint);
    });
}

// Initialize the game on page load
initializeGame();
