const words = [
    { word: "APPLE", par: 4 },
    { word: "BRICK", par: 5 },
    { word: "CRANE", par: 4 },
    { word: "DOUBT", par: 4 },
    { word: "EAGLE", par: 3 },
    { word: "FAITH", par: 4 },
    { word: "GLOBE", par: 4 },
    { word: "HOUSE", par: 4 },
    { word: "INDEX", par: 5 },
    { word: "JUICE", par: 4 },
    { word: "KNIFE", par: 5 },
    { word: "LEMON", par: 4 },
    { word: "MANGO", par: 4 },
    { word: "NIGHT", par: 4 },
    { word: "OCEAN", par: 4 },
    { word: "PIZZA", par: 4 },
    { word: "QUICK", par: 5 },
    { word: "ROBOT", par: 4 }
];
let currentHole = 0;
let WORD = words[currentHole].word;
let PAR = words[currentHole].par;

const board = document.getElementById("board");
const keyboard = document.getElementById("keyboard");
const parDisplay = document.getElementById("par-value");
const resultDisplay = document.getElementById("result");
const scorecardBody = document.getElementById("scorecard-body");
const totalScoreDisplay = document.getElementById("total-score-value");
const scoreToParDisplay = document.getElementById("score-to-par-value");
const commentsDisplay = document.getElementById("comments");
const ball = document.getElementById("ball");

let currentRow = 0;
let currentTile = 0;
let gameState = Array(6).fill(null).map(() => Array(5).fill(""));
let totalScore = 0;
let totalPar = words.reduce((acc, word) => acc + word.par, 0);

// Set the initial par display
parDisplay.textContent = PAR;

// Initialize the scorecard with holes and pars
const initializeScorecard = () => {
    words.forEach((word, index) => {
        const row = document.createElement("tr");
        const holeCell = document.createElement("td");
        const parCell = document.createElement("td");
        const scoreCell = document.createElement("td");
        holeCell.textContent = index + 1;
        parCell.textContent = word.par;
        scoreCell.textContent = '-';
        scoreCell.id = `score-${index}`;
        row.appendChild(holeCell);
        row.appendChild(parCell);
        row.appendChild(scoreCell);
        scorecardBody.appendChild(row);
    });
    totalScoreDisplay.textContent = totalScore;
    scoreToParDisplay.textContent = totalScore - totalPar;
};

const createBoard = () => {
    board.innerHTML = ''; // Clear previous board
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 5; j++) {
            const tile = document.createElement("div");
            tile.classList.add("tile");
            tile.id = `tile-${i}-${j}`;
            board.appendChild(tile);
        }
    }
};

const createKeyboard = () => {
    keyboard.innerHTML = ''; // Clear previous keyboard
    const keys = "QWERTYUIOPASDFGHJKLZXCVBNM".split("");
    keys.forEach(key => {
        const keyElement = document.createElement("div");
        keyElement.classList.add("key");
        keyElement.id = `key-${key}`;
        keyElement.textContent = key;
        keyElement.addEventListener("click", () => handleKeyPress(key));
        keyboard.appendChild(keyElement);
    });
    const enterKey = document.createElement("div");
    enterKey.classList.add("key");
    enterKey.textContent = "ENTER";
    enterKey.addEventListener("click", () => handleEnter());
    keyboard.appendChild(enterKey);
    const deleteKey = document.createElement("div");
    deleteKey.classList.add("key");
    deleteKey.textContent = "DELETE";
    deleteKey.addEventListener("click", () => handleDelete());
    keyboard.appendChild(deleteKey);
};

const handleKeyPress = (key) => {
    if (currentTile < 5) {
        gameState[currentRow][currentTile] = key;
        document.getElementById(`tile-${currentRow}-${currentTile}`).textContent = key;
        currentTile++;
    }
};

const handleEnter = () => {
    if (currentTile === 5) {
        const guess = gameState[currentRow].join("");
        const score = checkGuess(guess);
        displayComment(score);
        if (guess === WORD) {
            showResult(true);
        } else if (currentRow === 5) {
            showResult(false);
        } else {
            currentRow++;
            currentTile = 0;
        }
    }
};

const handleDelete = () => {
    if (currentTile > 0) {
        currentTile--;
        gameState[currentRow][currentTile] = "";
        document.getElementById(`tile-${currentRow}-${currentTile}`).textContent = "";
    }
};

const checkGuess = (guess) => {
    const wordArray = WORD.split("");
    const guessArray = guess.split("");
    const rowTiles = Array.from(document.querySelectorAll(`#board .tile[id^="tile-${currentRow}-"]`));
    let score = 0;

    // Check for correct letters
    guessArray.forEach((letter, index) => {
        if (letter === WORD[index]) {
            rowTiles[index].classList.add("correct");
            document.getElementById(`key-${letter}`).classList.add("correct");
            wordArray[index] = null;
            guessArray[index] = null;
            score += 2;
        }
    });

    // Check for misplaced letters
    guessArray.forEach((letter, index) => {
        if (letter && wordArray.includes(letter)) {
            rowTiles[index].classList.add("misplaced");
            document.getElementById(`key-${letter}`).classList.add("misplaced");
            wordArray[wordArray.indexOf(letter)] = null;
            score += 1;
        } else if (letter) {
            rowTiles[index].classList.add("incorrect");
            document.getElementById(`key-${letter}`).classList.add("grayed-out");
        }
    });

    moveBall(score);
    return score;
};

const moveBall = (score) => {
    if (score >= 4) {
        ball.className = 'green';
        ball.style.left = "50%";
        ball.style.bottom = "90%";
    } else if (score >= 1) {
        ball.className = 'fairway';
        ball.style.left = "50%";
        ball.style.bottom = "70%";
    } else {
        ball.className = 'rough';
        ball.style.left = "50%";
        ball.style.bottom = "50%";
    }
};

const displayComment = (score) => {
    if (score >= 4) {
        commentsDisplay.textContent = "Nice shot!";
    } else if (score >= 1) {
        commentsDisplay.textContent = "That's a hack there.";
    } else {
        commentsDisplay.textContent = "OB! Reload!";
    }
};

const showResult = (won) => {
    const strokes = currentRow + 1;
    if (won) {
        let resultMessage = `You guessed the word in ${strokes} ${strokes === 1 ? 'guess' : 'guesses'}.`;
        if (strokes < PAR) {
            resultMessage += " Excellent! You scored under par!";
        } else if (strokes === PAR) {
            resultMessage += " Well done! You scored par!";
        } else {
            resultMessage += " Good try! You scored over par.";
        }
        resultDisplay.textContent = resultMessage;
    } else {
        resultDisplay.textContent = `Game over! The word was ${WORD}.`;
    }
    
    // Update the scorecard
    document.getElementById(`score-${currentHole}`).textContent = strokes;

    totalScore += strokes;
    totalScoreDisplay.textContent = totalScore;
    scoreToParDisplay.textContent = totalScore - totalPar;

    // Move to the next hole
    currentHole++;
    if (currentHole < words.length) {
        WORD = words[currentHole].word;
        PAR = words[currentHole].par;
        parDisplay.textContent = PAR;
        currentRow = 0;
        currentTile = 0;
        gameState = Array(6).fill(null).map(() => Array(5).fill(""));
        createBoard();
        resetKeyboard();
        commentsDisplay.textContent = ''; // Clear comments for the next hole
        resetGolfHole(); // Reset the golf hole for the next word
    } else {
        resultDisplay.textContent += " Congratulations! You've completed all holes.";
    }
};

const resetGolfHole = () => {
    ball.className = '';
    ball.style.left = "50%";
    ball.style.bottom = "10%";
};

const resetKeyboard = () => {
    const keys = document.querySelectorAll(".key");
    keys.forEach(key => {
        key.classList.remove("grayed-out", "correct", "misplaced");
    });
};

const handlePhysicalKeyboard = (event) => {
    const key = event.key.toUpperCase();
    if (key === "ENTER") {
        handleEnter();
    } else if (key === "BACKSPACE" || key === "DELETE") {
        handleDelete();
    } else if (/^[A-Z]$/.test(key)) {
        handleKeyPress(key);
    }
};

createBoard();
createKeyboard();
initializeScorecard();
document.addEventListener("keydown", handlePhysicalKeyboard);

