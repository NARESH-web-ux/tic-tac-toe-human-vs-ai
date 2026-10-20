
const boardElement = document.getElementById("board");
const statusElement = document.getElementById("status");
const restartButton = document.getElementById("restart");

const playerScoreElement = document.getElementById("playerScore");
const aiScoreElement = document.getElementById("aiScore");
const drawScoreElement = document.getElementById("drawScore");

let board = "---------";
let gameOver = false;
let waiting = false;
let winningCells = [];

// Load saved scores, or start at zero.
function loadScores() {
    try {
        const saved = JSON.parse(
            localStorage.getItem("ticTacToeScores")
        );

        if (
            saved &&
            Number.isSafeInteger(saved.player) &&
            saved.player >= 0 &&
            Number.isSafeInteger(saved.ai) &&
            saved.ai >= 0 &&
            Number.isSafeInteger(saved.draws) &&
            saved.draws >= 0
        ) {
            return saved;
        }
    } catch (error) {
        console.warn("Could not load saved scores.");
    }

    return { player: 0, ai: 0, draws: 0 };
}

let scores = loadScores();

// Update the scoreboard and save it in the browser.
function updateScores() {
    playerScoreElement.textContent = scores.player;
    aiScoreElement.textContent = scores.ai;
    drawScoreElement.textContent = scores.draws;

    try {
        localStorage.setItem(
            "ticTacToeScores",
            JSON.stringify(scores)
        );
    } catch (error) {
        console.warn("Could not save scores in this browser.");
    }
}

// Find the three cells forming a winning line.
function findWinningCells() {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    for (const [a, b, c] of lines) {
        if (
            board[a] !== "-" &&
            board[a] === board[b] &&
            board[b] === board[c]
        ) {
            return { mark: board[a], cells: [a, b, c] };
        }
    }

    return null;
}

// Count a finished game only once.
function recordResult() {
    const result = findWinningCells();

    if (result) {
        winningCells = result.cells;

        if (result.mark === "X") {
            scores.player++;
        } else {
            scores.ai++;
        }

        updateScores();
        return;
    }

    if (!board.includes("-")) {
        scores.draws++;
        updateScores();
    }
}

async function newGame() {
    waiting = true;
    renderBoard();

    try {
        const response = await fetch(
            const API_URL = "https://tic-tac-toe-human-vs-ai.onrender.com/api/game";
        );

        if (!response.ok) {
            throw new Error("Could not start a new game.");
        }

        const data = await response.json();

        board = data.board;
        gameOver = data.gameOver;
        winningCells = [];

        statusElement.textContent = data.message;
    } catch (error) {
        statusElement.textContent =
            "Cannot connect to backend! Check that Spring Boot is running.";
    } finally {
        waiting = false;
        renderBoard();
    }
}

function renderBoard() {
    boardElement.innerHTML = "";

    for (let i = 0; i < 9; i++) {
        const cell = document.createElement("button");
        cell.classList.add("cell");
        cell.setAttribute("aria-label", `Square ${i + 1}`);

        const mark = board[i] === "-" ? "" : board[i];
        cell.textContent = mark;

        if (mark === "X") {
            cell.classList.add("mark-x");
        } else if (mark === "O") {
            cell.classList.add("mark-o");
        }

        if (winningCells.includes(i)) {
            cell.classList.add("winner");
        }

        cell.disabled =
            gameOver || waiting || board[i] !== "-";

        cell.addEventListener("click", () => makeMove(i));
        boardElement.appendChild(cell);
    }
}

async function makeMove(position) {
    if (gameOver || waiting || board[position] !== "-") {
        return;
    }

    waiting = true;
    renderBoard();

    try {
        const response = await fetch(
            "http://localhost:8080/api/game/move",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ position: position })
            }
        );

        if (!response.ok) {
            throw new Error("Move request failed.");
        }

        const data = await response.json();

        board = data.board;
        gameOver = data.gameOver;
        statusElement.textContent = data.message;

        // Record the result only when a game ends.
        if (gameOver) {
            recordResult();
        } else {
            const result = findWinningCells();

            if (result) {
                winningCells = result.cells;
            }
        }
    } catch (error) {
        statusElement.textContent =
            "Move failed. Check that the backend is running.";
    } finally {
        waiting = false;
        renderBoard();
    }
}

restartButton.addEventListener("click", newGame);

updateScores();
newGame();
